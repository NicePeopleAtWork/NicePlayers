namespace Youbora.Analytics.Providers.Common
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Browser;
    using System.Text;
    using System.Threading;

    public class SilverlightWebClient
    {
        private Dictionary<string, string> RequestParameters { get; set; }
        public WebHeaderCollection Headers { get; set; }

        /// <summary>
        /// Downloads the resource as a string from the URI specified.
        /// </summary>
        /// <param name="address">The URI represented by the Uri object, from which to download data.</param>
        /// <returns></returns>
        public string DownloadData(Uri address)
        {
            var initRequest = (HttpWebRequest)WebRequest.Create(address);
            var result = String.Empty;
            var responseComplete = new ManualResetEvent(false);

            if (Headers != null) initRequest.Headers = Headers;

            initRequest.BeginGetResponse(ar =>
            {
                var signaled = false;
                try
                {
                    var response = GetResponse(ar);

                    result = ReadResponseToString(response);

                    responseComplete.Set();

                    signaled = true;
                }
                catch (Exception)
                {
                    if (!signaled)
                    {
                        responseComplete.Set();
                    }
                }
            }, initRequest);

            return result;
        }

        /// <summary>
        /// Uploads the specified name/value collection to the resource identified by the specified URI.
        /// </summary>
        /// <param name="address">Uploads the specified name/value collection to the resource identified by the specified URI.</param>
        /// <param name="data">The Dictionary to send to the resource..</param>
        /// <returns></returns>
        public string UploadValues(Uri address, Dictionary<string, string> data)
        {
            RequestParameters = data;

            var responseComplete = new ManualResetEvent(false);

            var initRequest = CreatePostRequest(address);
            if (initRequest == null) return null;

            var result = String.Empty;

            initRequest.BeginGetResponse(ar =>
            {
                var signaled = false;
                try
                {
                    var response = GetResponse(ar);

                    result = ReadResponseToString(response);

                    responseComplete.Set();

                    signaled = true;
                }
                catch (Exception)
                {
                    if (!signaled)
                    {
                        responseComplete.Set();
                    }
                }
            }, initRequest);

            responseComplete.WaitOne();

            return result;
        }

        private WebRequest CreatePostRequest(Uri uri)
        {
            var requestSetupComplete = new ManualResetEvent(false);

            WebRequest.RegisterPrefix(uri.AbsoluteUri, WebRequestCreator.ClientHttp);
            var initRequest = WebRequest.Create(uri) as HttpWebRequest;

            if (Headers != null) initRequest.Headers = Headers;

            initRequest.Headers = Headers;

            var postData = (RequestParameters == null) ? String.Empty : RequestParameters.Aggregate(
                String.Empty, (current, requestValue) =>
                    current + string.Format("{0}={1}&",
                        Uri.EscapeUriString(requestValue.Key),
                        Uri.EscapeUriString(requestValue.Value)
                        )
                ).TrimEnd('&');

            initRequest.Method = "POST";
            initRequest.ContentType = "application/x-www-form-urlencoded";
            // TODO: Changed, in Xbox 360 implementation ContentLength doesn't exist.
            //initRequest.ContentLength = postData.Length;

            initRequest.BeginGetRequestStream(ar =>
            {
                var request = (HttpWebRequest)ar.AsyncState;
                var postStream = request.EndGetRequestStream(ar);

                postStream.Write(Encoding.UTF8.GetBytes(postData), 0, postData.Length);
                postStream.Close();

                requestSetupComplete.Set();
            }, initRequest);

            requestSetupComplete.WaitOne();

            return initRequest;
        }

        private static WebResponse GetResponse(IAsyncResult asynchronousResult)
        {
            var request = asynchronousResult.AsyncState as HttpWebRequest;

            var response = (request != null)? request.EndGetResponse(asynchronousResult) as HttpWebResponse : null;
            return response;
        }

        private static string ReadResponseToString(WebResponse response)
        {
            var responseStream = (response != null) ? response.GetResponseStream() : null;
            if (responseStream == null) return null;

            string result;

            using (var reader = new StreamReader(responseStream))
            {
                result = reader.ReadToEnd();
            }

            return result;
        }
    }
}
