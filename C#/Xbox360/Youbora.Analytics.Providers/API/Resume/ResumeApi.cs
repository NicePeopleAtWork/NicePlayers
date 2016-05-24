using System;

namespace Youbora.Analytics.Providers.API.Resume
{
    using System.Text;
    using Models.Common;
    using Providers.Common;

    public class ResumeApi
    {
        ///  <summary>
        ///  Informs when the user has restarted the playback    
        ///  On player resume event
        ///  Usage Example:
        ///  http://nqs.nice264.com:8080/resume?code=fD75sCuum8VK2G98
        /// 
        ///  </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="code">View code retrieved from the data call</param>     
        ///  <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support.</returns>
        public static string Resume(string host, string code)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("resume" +
                                  "?code={0}" +
                                  "&timemark={1}",
                                  code,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }
    }
}