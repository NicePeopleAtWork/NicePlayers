namespace Youbora.Analytics.Providers.API.Buffer
{
    using System;
    using System.Text;
    using Models.Common;
    using Providers.Common;

    public class BufferUnderrunApi
    {
        /// <summary>
        /// Detects when the end user is experiencing buffering issues
        /// On the subsequent player buffering events (the first one is for the Join Time API call)
        ///         
        /// Usage Example:
        /// http://nqs.nice264.com:8080/bufferUnderrun?time=5.038&duration=887&code=1LeMK8i7d6Su7L2i
        /// 
        /// IMPORTANT WARNING - Be careful! The first buffering event is reserved for the /joinTime.
        /// 
        /// </summary>        
        /// <param name="host">Service host URL from data call</param>
        /// <param name="time">Video playhead in seconds. If this value is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Buffering duration in milliseconds. This is the time difference between: buffering end time - buffering start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support.</returns>
        public static string BufferUnderrun(string host, double time, long duration, string code)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("bufferUnderrun" +
                                  "?time={0}" +
                                  "&duration={1}" +
                                  "&code={2}" + 
                                  "&timemark={3}",
                                  time,
                                  duration,
                                  code,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }
    }
}