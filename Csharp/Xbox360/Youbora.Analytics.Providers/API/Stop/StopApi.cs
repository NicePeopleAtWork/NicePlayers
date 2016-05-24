namespace Youbora.Analytics.Providers.API.Stop
{
    using System;
    using System.Text;
    using Models.Common;
    using Providers.Common;
    
    public class StopApi
    {
        /// <summary>
        /// Informs when the current playback has ended
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/stop?code=fD75sCuum8VK2G98&diffTime=4873
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support</returns>
        public static string Stop(string host, string code)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("stop=" +
                                  "?code={0}" +
                                  "&timemark={1}",
                                   code,
                                   DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Informs when the current playback has ended
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/stop?code=fD75sCuum8VK2G98&diffTime=4873
        /// 
        /// </summary>   
        /// <param name="host">Service host URL from data call</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="diffTime">Elapsed ping time in miliseconds from the last ping before the stop is launched</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support</returns>
        public static string Stop(string host, string code, int diffTime)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("stop=" +
                                  "?code={0}" +
                                  "&diffTime={1}" + 
                                  "&timemark={2}",
                                   code,
                                   diffTime,
                                   DateTime.Now.Ticks);

            return queryUrl.ToString();
        }
    }
}