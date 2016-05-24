namespace Youbora.Analytics.Providers.API.Error
{
    using System.Text;
    using Models.Common;
    using Providers.Common;
    using System.Net;

    public class ErrorApi
    {
        /// <summary>
        /// Reports a player error.
        /// When the player launches an error.
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/error?errorCode=9000&code=fD75sCuum8VK2G98
        /// 
        /// </summary>    
        /// <param name="host">Service host URL from data call</param>
        /// <param name="errorCode">Player's error numerical code</param>
        /// <param name="msg">Player’s error message. This parameter is a string and provides with more in detail information about the player’s error.</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="resource">Vídeo resource URL</param>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora which customer account you are sending the data to. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent</param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method to set this property</param>
        /// <param name="properties">JSON media properties (the same ones described in the start call)</param>
        /// <param name="user">User identifier. If the user is unknown, send a blank parameter or with a default username</param>
        /// <param name="referer">Browser's URL where the player is being loaded (window.location)</param>
        /// <param name="bitrate">Total amount of bytes loaded by the player (player + plugin + video content)</param>
        /// <param name="pingTime"><pt> tag from /data response</param>
        /// <param name="pluginVersion">The version of the plugin in the x.x.x_<pluginCode> format. This parameter lets you to have a version control of new deployed plugins and see which users are using an older version (cached in the system), so you can force them to clean their cache and download the new version</param>
        /// <param name="duration">It defines the video length in seconds</param>
        /// <param name="extraParams">Custom Data feature</param>
        /// <returns>200 - OK. The request has been processed properly or 404 - Not Found.The service is down.Contact NicePeopleAtWork support</returns>
        public static string Error(string host, string errorCode, string msg, string code, string resource, string system, bool live, string properties, 
            string user, string referer, double bitrate, int pingTime, string pluginVersion, long duration, string extraParams)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            if (string.IsNullOrEmpty(errorCode))
                errorCode = "9000"; // UNKNOWN_ERROR

            queryUrl.AppendFormat("error" +
                                  "?errorCode={0}" +
                                  "&code={1}" +
                                  "&resource={2}" +
                                  "&system={3}" +
                                  "&live={4}" +
                                  "&properties={5}" +
                                  "&user={6}" +
                                  "&referer={7}" +
                                  "&bitrate={8}" +
                                  "&pingTime={9}" +
                                  "&pluginVersion={10}" +
                                  "&duration={11}" +
                                  "&msg={12}" +
                                  "{13}" +  // Custom Data feature
                                  "&player=Xbox360" +
                                  "&deviceId=12",
                                   errorCode,
                                   code,
                                   resource,
                                   system,
                                   live,
                                   HttpUtility.UrlEncode(properties),
                                   user,
                                   referer,
                                   bitrate,
                                   pingTime,
                                   pluginVersion,
                                   duration,                                   
                                   msg,
                                   extraParams);

            return queryUrl.ToString();
        }
    }
}