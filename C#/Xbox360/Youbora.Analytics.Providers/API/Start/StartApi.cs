namespace Youbora.Analytics.Providers.API.Start
{
    using System;
    using System.Globalization;    
    using System.Text;
    using Models.Common;
    using Common;
    using Providers.Common;
    using System.Net;

    public class StartApi
    {
        /// <summary>
        /// Start event information       
        /// On player start event
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/start?system=npawplug&user=pilot&pluginVersion=2.0.1_brightcove&pingTime=5&live=false&totalBytes=0&resource=rtmpe%3A//bt.fcod.llnwd.net/a800/o10/%26mp4%3Avideos/1958254344001/1958254344001_27052ewwewfefe67742001_C5163543323280013A-1200k-channel5.mp4&referer=http%3A//www.channel5.com/shows/csi-new-york/episodes/episode-13-247&properties={%22id%22:2704858977001,%22title%22:%22CSI:%20New%20York:%20Season%209%20-%20Nine%20Thirteen%22}&code=1LeMK8i7d6Su7L2i&hashTitle=true
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics which customer account you are sending the data to. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent</param>
        /// <param name="user">User identifier. If the user is unknown, send the parameter blank or with a default username</param>
        /// <param name="pluginVersion"></param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="resource"></param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method to set this property</param>
        /// <param name="properties">JSON media properties (see them defined below in a sub-section)</param>
        /// <param name="referer">Browser's URL where the player is being loaded (or window.location for Smart TV applications). This field can be empty but must be declared.</param>
        /// <param name="pingTime">The version of the plugin in the x.x.x_pluginCode format. This parameter lets you to have a version control of new deployed plugins and see which users are using an older version (cached in the system), so you can force them to clean their cache and download the new version</param>
        /// <param name="duration">Video length in seconds</param>
        /// <param name="bitrate">Video bitrate</param>
        /// <returns></returns>
        public static string Start(string host, string system, string user, string pluginVersion, 
            string code, string resource, bool live, string properties, string referer, int pingTime, 
            long duration, double bitrate)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("start" +
                                  "?system={0}" +
                                  "&user={1}" +
                                  "&pluginVersion={2}" +
                                  "&pingTime={3}" +
                                  "&code={4}" +
                                  "&resource={5}" +
                                  "&live={6}" +
                                  "&properties={7}" +
                                  "&referer={8}" +
                                  "&duration={9}" +
                                  "&bitrate={10}" +
                                  "&timemark={11}" +
                                  "&deviceId=12",
                                  system,
                                  user,
                                  pluginVersion,
                                  pingTime,
                                  code,
                                  HttpUtility.UrlEncode(resource),
                                  live,
                                  HttpUtility.UrlEncode(properties),
                                  referer,
                                  duration,
                                  bitrate,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Start event information       
        /// On player start event
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com:8080/start?system=npawplug&user=pilot&pluginVersion=2.0.1_brightcove&pingTime=5&live=false&totalBytes=0&resource=rtmpe%3A//bt.fcod.llnwd.net/a800/o10/%26mp4%3Avideos/1958254344001/1958254344001_27052ewwewfefe67742001_C5163543323280013A-1200k-channel5.mp4&referer=http%3A//www.channel5.com/shows/csi-new-york/episodes/episode-13-247&properties={%22id%22:2704858977001,%22title%22:%22CSI:%20New%20York:%20Season%209%20-%20Nine%20Thirteen%22}&code=1LeMK8i7d6Su7L2i&hashTitle=true
        /// 
        /// </summary>
        /// <param name="host">Service host URL from data call</param>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics which customer account you are sending the data to. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent</param>
        /// <param name="user">User identifier. If the user is unknown, send the parameter blank or with a default username</param>
        /// <param name="pluginVersion"></param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="resource"></param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method to set this property</param>
        /// <param name="properties">JSON media properties (see them defined below in a sub-section)</param>
        /// <param name="referer">Browser's URL where the player is being loaded (or window.location for Smart TV applications). This field can be empty but must be declared.</param>
        /// <param name="pingTime">The version of the plugin in the x.x.x_pluginCode format. This parameter lets you to have a version control of new deployed plugins and see which users are using an older version (cached in the system), so you can force them to clean their cache and download the new version</param>
        /// <param name="duration">Video length in seconds</param>
        /// <param name="isp">String that indicates the name of the user’s ISP</param>
        /// <param name="ip">String that defines the user’s IP</param>
        /// <param name="cdn">Code that indicates what CDN’s name must be shown for a view</param>
        /// <param name="extraParams"></param>
        /// <returns>Query String</returns>
        public static string Start(string host, string system, string user, string pluginVersion, 
            string code, string resource, bool live, string properties, string referer, int pingTime,
            long duration, string extraParams)
        {
            var queryUrl = new StringBuilder((UrlHelper.ValidateUrl(host) ?? GlobalSettings.API_URL) + "/");

            queryUrl.AppendFormat("start" +
                                  "?system={0}" +
                                  "&user={1}" +
                                  "&pluginVersion={2}" +
                                  "&pingTime={3}" +
                                  "&code={4}" +
                                  "&resource={5}" +
                                  "&live={6}" +
                                  "&properties={7}" +
                                  "&referer={8}" +
                                  "&pingTime={9}" +
                                  "&duration={10}" +                                  
                                  "{11}" +
                                  "&timemark={12}" +
                                  "&deviceId=12",
                                  system,
                                  user,
                                  pluginVersion,
                                  pingTime,
                                  code,
                                  HttpUtility.UrlEncode(resource),
                                  live,
                                  HttpUtility.UrlEncode(properties),
                                  referer,
                                  pingTime,
                                  duration,                                  
                                  extraParams,
                                  DateTime.Now.Ticks);

            return queryUrl.ToString();
        }

        /// <summary>
        /// Create Properties Json.
        /// </summary>
        /// <param name="fileName">File name of the current media content </param>
        /// <returns>Json</returns>
        public static string CreateJsonProperties(
            string fileName)
        {
            return String.Format(
                @"{{""filename"":""{0}""}}",
                fileName);
        }

        /// <summary>
        /// Create Properties Json.
        /// </summary>
        /// <param name="fileName">File name of the current media content </param>
        /// <param name="title">Media title </param>
        /// <param name="duration">Length of the media in seconds </param>
        /// <returns>Json</returns>
        public static string CreateJsonProperties(
            string fileName,
            string title,
            long duration)
        {
            return String.Format(
                @"{{""filename"":""{0}"",""content_metadata"":{{""title"":""{1}"",""duration"":""{2}""}}}}",
                fileName, title, duration);
        }

        /// <summary>
        /// Create Properties Json.
        /// </summary>
        /// <param name="fileName">File name of the current media content </param>
        /// <param name="title">Media title </param>
        /// <param name="genre">Media genre </param>
        /// <param name="language">Media language </param>
        /// <param name="year">Media year </param>
        /// <param name="cast">Media cast. Separate each name with commas </param>
        /// <param name="director">Media director or directors. Separate each value with commas </param>
        /// <param name="owner">Media's content owner </param>
        /// <param name="duration">Length of the media in seconds </param>
        /// <param name="parental">Recommended viewing age (All,+13,+18,Adult) </param>
        /// <param name="price">Purchase price on the website </param>
        /// <param name="rating">Average value on your user's perception on the content quality, performance... </param>
        /// <param name="audioType">Media file type of audio (Mono, Stereo, Dolby,…) </param>
        /// <param name="audioChannels">Number of media file channels (1, 5.1, …) </param>
        /// <param name="contentId">Internal ID for the media </param>
        /// <param name="transactionType">Rent: Media for rental Subscription: Media which has been acquired as part of a subscription EST (Electronic Sell Through): Media purchased Free: Media which has no economical transaction </param>
        /// <param name="quality">HD or SD </param>
        /// <param name="contentType">Trailer, Episode, Movie </param>
        /// <param name="manufacturer">Manufacturer of the device</param>
        /// <param name="deviceType">TV, Blu-Ray, Set-Top Box </param>
        /// <param name="deviceYear">Fabrication year </param>
        /// <param name="firmware">Firmware version</param>
        /// <returns>Json</returns>
        public static string CreateJsonProperties(
            string fileName,
            string title,
            string genre,
            string language,
            string year,
            string cast,
            string director,
            string owner,
            long duration,
            Parental parental,
            double price,
            string rating,
            AudioType audioType,
            double audioChannels,
            string contentId,
            TransactionType transactionType,
            Quality quality,
            ContentType contentType,
            string manufacturer,
            string deviceType,
            string deviceYear,
            string firmware)
        {
            return String.Format(
                @"{{""filename"":""{0}"",""content_metadata"":{{""title"":""{1}"",""genre"":""{2}"",""language"":""{3}"",""year"":""{4}"",""cast"":""{5}"",""director"":""{6}"",""owner"":""{7}"",""duration"":""{8}"",""parental"":""{9}"",""price"":""{10}"",""rating"":""{11}"",""audioType"":""{12}"",""audioChannels"":""{13}"",""duration"":""{14}""}},""quality"":""{15}"",""content_type"":""{16}"",""transaction_type"":""{17}"",""device"":{{""manufacturer"":""{18}"",""type"":""{19}"",""year"":""{20}"",""firmware"":""{21}""}},}}",
                       fileName, title, genre, language, year, cast, director, owner, duration, parental, price, rating, audioType, audioChannels, duration, quality, contentType, transactionType, manufacturer, deviceType, deviceYear, firmware);
        }
    }
}