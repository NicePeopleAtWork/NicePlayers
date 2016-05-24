namespace Youbora.Analytics.Providers.Common
{
    using System;
    using System.IO;
    using System.Net;
    using Newtonsoft.Json;

    public class CustomRestClient
    {
        private readonly Uri _baseAddress;

        public CustomRestClient(string baseAddress)
        {
            _baseAddress = new Uri(baseAddress);
        }

        public void Get<T>(string commandPath, Action<Exception, T> callback)
        {
            // TODO: Downgraded to object initializer VS2010.
            //var client = new WebClient {Headers = {[HttpRequestHeader.Accept] = "application/json"}};            
            var client = new WebClient();
            client.Headers[HttpRequestHeader.Accept] = "application/json";
            DownloadStringCompletedEventHandler handler = null;
            handler = (s, e) =>
            {
                client.DownloadStringCompleted -= handler;
                if (e.Error != null)
                {
                    callback(e.Error, default(T));
                    return;
                }

                var result = Deserialize<T>(new StringReader(e.Result));
                callback(null, result);
            };
            client.DownloadStringCompleted += handler;
            client.DownloadStringAsync(new Uri(_baseAddress, commandPath));
        }

        public void Post<T>(string commandPath, object data, Action<Exception, T> callback)
        {
            var synchContext = System.Threading.SynchronizationContext.Current;

            var request = WebRequest.Create(new Uri(_baseAddress, commandPath));
            request.Method = "POST";
            request.ContentType = "application/json";
            request.BeginGetRequestStream(iar =>
            {
                var reqStr = request.EndGetRequestStream(iar);

                SerializeObject(data, reqStr);

                request.BeginGetResponse(iar2 =>
                {
                    WebResponse response;
                    try
                    {
                        response = request.EndGetResponse(iar2);
                    }
                    catch (Exception ex)
                    {
                        synchContext.Post(state => callback((Exception)state, default(T)), ex);
                        return;
                    }
                    var result = Deserialize<T>(new StreamReader(response.GetResponseStream()));
                    synchContext.Post(state => callback(null, (T)state), result);

                }, null);
            }, null);
        }

        private static void SerializeObject(object data, Stream stream)
        {
            var serializer = new JsonSerializer();
            var sw = new StreamWriter(stream);
            serializer.Serialize(sw, data);

            sw.Flush();
            sw.Close();
        }
        private static T Deserialize<T>(TextReader reader)
        {
            var serializer = new JsonSerializer();
            return serializer.Deserialize<T>(new JsonTextReader(reader));
        }
    }
}