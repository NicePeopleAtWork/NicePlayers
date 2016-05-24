namespace Youbora.Analytics.Providers.API.JoinTime
{
    using System;
    using System.Text;
    using Models.Common;
    using Providers.Common;

    public class JoinTimeApi
    {
        /// <summary>
        /// Determines the elapsed amount of time since the end user clicks/touches the player's play button until the media starts to be played       
        /// On the FIRST player buffering event
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/joinTime?eventTime=0&time=411&code=1LeMK8i7d6Su7L2i
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="time">Time difference (in milliseconds) between the player goes from the start event until it finishes buffering the required amount of video bytes to start the playback. Or the amount of time it takes to start the playback since the user wants to watch it</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <returns>Query String</returns>
        public static string JoinTime(string host, string time, string code)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("joinTime" +
                                  "?time={0}" +
                                  "&code={1}" + 
                                  "&timemark={2}",
                                  time,
                                  code,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Determines the elapsed amount of time since the end user clicks/touches the player's play button until the media starts to be played
        /// On the FIRST player buffering event
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/joinTime?eventTime=0&time=411&code=1LeMK8i7d6Su7L2i
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="time">Time difference (in milliseconds) between the player goes from the start event until it finishes buffering the required amount of video bytes to start the playback. Or the amount of time it takes to start the playback since the user wants to watch it</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="eventTime">It indicates the current instant of the video (video playhead) where the joinTime occurs in seconds (usually 0)</param>
        /// <returns>Query String</returns>
        public static string JoinTime(string host, string time, string code, double eventTime)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("joinTime" + 
                                  "?eventTime={0}" +
                                  "&time={1}" +
                                  "&code={2}" +
                                  "&timemark={3}",
                                  eventTime,
                                  time,
                                  code,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Determines the elapsed amount of time since the end user clicks/touches the player's play button until the media starts to be played
        /// On the FIRST player buffering event
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/joinTime?eventTime=0&time=411&code=1LeMK8i7d6Su7L2i
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="time">Time difference (in milliseconds) between the player goes from the start event until it finishes buffering the required amount of video bytes to start the playback. Or the amount of time it takes to start the playback since the user wants to watch it</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="eventTime">It indicates the current instant of the video (video playhead) where the joinTime occurs in seconds (usually 0)</param>
        /// <param name="mediaDuration">Expected video duration. This parameter will exist if the plugin can not get the duration from the player in the /start call</param>
        /// <returns>Query String</returns>
        public static string JoinTime(string host, string time, string code, double eventTime, long mediaDuration)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("joinTime" +
                                  "?eventTime={0}" +
                                  "&time={1}" +
                                  "&code={2}" +
                                  "&mediaDuration={3}" +
                                  "&timemark={4}",
                                  eventTime,
                                  time,
                                  code,
                                  mediaDuration,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }
    }
}