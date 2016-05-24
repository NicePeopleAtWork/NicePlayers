namespace Youbora.Analytics.Providers.Common
{
    using System;
    using System.Net;    
    using Models.Common;
    using Newtonsoft.Json;    

    /// <summary>
    /// Methods used by other classes
    /// </summary>
    public class ApiClient
    {
        /// <summary>
        /// Sanitize a Youbora Json.
        /// </summary>
        /// <param name="json">string</param>
        /// <returns></returns>
        public static string SanitizeJson(string json)
        {
            return json.Substring(7, json.Length - 8);
        }

        /// <summary>
        /// Deserialized a json string into the indicated type.
        /// </summary>
        /// <typeparam name="T">object type to deserialize</typeparam>
        /// <param name="content">string</param>
        /// <returns>The deserialized object</returns>
        public static T ProcessJson<T>(string content)
        {
            try
            {
                if (string.IsNullOrEmpty(content))
                    return default(T);

                var sanitizeContent = content.Substring(7, content.Length - 8);
                var deserializedData = JsonConvert.DeserializeObject<T>(sanitizeContent);

                return deserializedData;
            }
            catch
            {
                return default(T);
            }
        }

        /// <summary>
        /// Execute the current query. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryUrl">Query</param>
        /// <param name="complete">Complete action</param>
        public static void GetContent<T>(string queryUrl, Action<T> complete)
        {
            WebClient client = new WebClient();

            client.DownloadStringCompleted += (sender, e) =>
            {
                if (e.Error == null)
                    complete(ProcessJson<T>(e.Result));
            };

            client.DownloadStringAsync(new Uri(queryUrl));
        }

        /// <summary>
        /// Execute the current query. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryUrl">Query</param>
        /// <param name="complete">Complete action</param>
        /// <param name="failure">Exception</param>
        public static void GetContent<T>(string queryUrl, Action<T> complete, Action<Exception> failure)
        {
            WebClient client = new WebClient();

            client.DownloadStringCompleted += (sender, e) =>
            {
                if (e.Error != null)
                    failure(e.Error);
                else
                    complete(ProcessJson<T>(e.Result));
            };

            client.DownloadStringAsync(new Uri(queryUrl));
        }

        /// <summary>
        /// Post query
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryUrl">Query</param>
        /// <param name="complete">Complete action</param>
        public static void Post(string queryUrl, Action<string> complete)
        {
            WebClient client = new WebClient();

            client.UploadStringCompleted += (sender, e) =>
            {
                if (e.Error == null)
                    complete(e.Result);
            };

            client.UploadStringAsync(new Uri(queryUrl), "POST");
        }

        /// <summary>
        /// Post query
        /// </summary>
        /// <param name="queryUrl">Query</param>
        /// <param name="failure">Failure action</param>
        public static void Post(string queryUrl, Action<Exception> failure)
        {
            WebClient client = new WebClient();

            client.UploadStringCompleted += (sender, e) =>
            {
                if (e.Error != null)
                    failure(e.Error);
            };

            client.UploadStringAsync(new Uri(queryUrl), "POST");
        }

        /// <summary>
        /// Post query
        /// </summary>
        /// <param name="queryUrl">Query</param>
        /// <param name="complete">Complete action</param>
        /// <param name="failure">Failure action</param>
        public static void Post(string queryUrl, Action<string> complete, Action<Exception> failure)
        {
            WebClient client = new WebClient();

            client.UploadStringCompleted += (sender, e) =>
            {
                if (e.Error != null)
                    failure(e.Error);
                else if (complete != null)
                    complete.Invoke(e.Result);
            };

            client.UploadStringAsync(new Uri(queryUrl), "POST");
        }

        /// <summary>
        /// Execute the current query. 
        /// </summary>
        /// <typeparam name="T">Type</typeparam>
        /// <param name="url">Url</param>
        /// <returns></returns>
        public static T GetSynchronousContent<T>(string url)
        {
            SilverlightWebClient swc = new SilverlightWebClient();
            var content = swc.DownloadData(new Uri(url));
            var result = ProcessJson<T>(content);
            
            return result;
        }        
    }
}