namespace Youbora.Analytics.Providers.API.Pin
{
    using System;
    using System.Text;
    using Models.Common;
    using Providers.Common;

    public class PinApi
    {
        /// <summary>
        /// Informs when the user has restarted the playback        
        /// Launched every pingTime seconds
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/ping?time=37.953&pingTime=5&bitrate=1198000&code=fD75sCuum8VK2G98&diffTime=5231
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="pingTime">Elapsed ping time in seconds from the previous ping</param>
        /// <param name="bitrate">Current bitrate in bps (bits per second)</param>
        /// <param name="time">Video's current time in seconds.</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support</returns>
        public static string Pin(string host, string code, string pingTime, double bitrate, double time, string nodeHost, string nodeType)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");
            var optionalParamsQuery = GetOptionalParamsQueryString(nodeHost, nodeType);

            queryUrl.AppendFormat("ping" +
                                  "?time={0}" +
                                  "&pingTime={1}" +
                                  "&bitrate={2}" +
                                  "&code={3}" +
                                  "&timemark={4}" +
                                   optionalParamsQuery,
                                   time,
                                   pingTime,
                                   bitrate,
                                   code,
                                   DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Informs when the user has restarted the playback        
        /// Launched every pingTime seconds
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/ping?time=37.953&pingTime=5&bitrate=1198000&code=fD75sCuum8VK2G98&diffTime=5231
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="pingTime">Elapsed ping time in seconds from the previous ping</param>
        /// <param name="bitrate">Current bitrate in bps (bits per second)</param>
        /// <param name="time">Video's current time in seconds.</param>
        /// <param name="diffTime">Elapsed ping time in miliseconds from the previous ping</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support</returns>
        public static string Pin(string host, string code, string pingTime, double bitrate, double time, double diffTime, string nodeHost, string nodeType)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");
            var optionalParamsQuery = GetOptionalParamsQueryString(nodeHost, nodeType);

            queryUrl.AppendFormat("ping" +
                                  "?time={0}" +
                                  "&pingTime={1}" +
                                  "&bitrate={2}" +
                                  "&code={3}" + 
                                  "&diffTime={4}" +
                                  "&timemark={5}" +
                                   optionalParamsQuery,
                                   time,
                                   pingTime,
                                   bitrate,
                                   code,
                                   diffTime,
                                   DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        private static string GetOptionalParamsQueryString(string nodeHost, string nodeType)
        {
            var queryString = string.Empty;

            if (!string.IsNullOrEmpty(nodeHost))
                queryString += "&nodeHost=" + nodeHost;

            if (!string.IsNullOrEmpty(nodeType))
                queryString += "&nodeType=" + nodeType;

            return queryString;
        }
    }
}