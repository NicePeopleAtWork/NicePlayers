namespace Youbora.Analytics.Providers.API.Seek
{
    using System;
    using System.Text;
    using Models.Common;
    using Providers.Common;
    
    public class SeekApi
    {
        /// <summary>
        /// Detects the end user change the curren position of the video.
        /// </summary>
        /// <param name="host">Host url</param>
        /// <param name="time">Video playhead in seconds. If this is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Seeking duration in miliseconds. This is the time difference between seek end time - seek start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <returns></returns>
        public static string Seek(string host, double time, long duration, string code)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("seek" +
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
