namespace Youbora.Analytics.Providers.API
{
    using System;
    using System.Collections.Generic;
    using Models.Data;
    using Data;
    using Start;
    using Stop;
    using Pause;
    using Resume;
    using JoinTime;
    using Pin;
    using Buffer;
    using Seek;
    using Error;
    using Smartswitch;
    using Newtonsoft.Json;
    using Providers.Common;
    using Models.Smartswitch;
    using Common;

    public class YouboraApi
    {
        /// <summary>
        /// Host URL needed to use in when sending API calls (start, stop, joinTime, bufferUnderrun, resume, pause, error and ping)
        /// </summary>
        public static string Host { get; set; }

        /// <summary>
        /// Get Youbora Data
        /// </summary> 
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics 
        /// which customer account you are sending the data to. This parameter will be provided by 
        /// NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support 
        /// Agent</param>
        /// <param name="pluginVersion">The version of the plugin in the format described below this table.
        /// This parameter lets you to have a version control of new deployed plugins and see which 
        /// users are using an older version (cached in the system), so you can force them to clean 
        /// their cache and download the new version</param>
        /// <param name="complete">Complete Action</param>
        public static void GetData(string system,
            string pluginVersion,
            Action<DataRoot> complete)
        {
            var url = DataApi.PlayerData(system, pluginVersion);

            ApiClient.GetContent(url, complete);
        }

        /// <summary>
        /// Get Youbora Data
        /// </summary>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics 
        /// which customer account you are sending the data to. This parameter will be provided by 
        /// NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support 
        /// Agent</param>
        /// <param name="pluginVersion">The version of the plugin in the format described below this table.
        /// This parameter lets you to have a version control of new deployed plugins and see which 
        /// users are using an older version (cached in the system), so you can force them to clean 
        /// their cache and download the new version</param>
        /// <returns>Data</returns>
        public static Models.Data.Data GetData(string system,
            string pluginVersion)
        {
            var url = DataApi.PlayerData(system, pluginVersion);

            var result = ApiClient.GetSynchronousContent<DataRoot>(url);

            return (result != null) ? result.Data : null;
        }

        /// <summary>
        /// Start event information       
        /// </summary>
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
        /// <param name="extraparams"></param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Start(
         string system,
         string user,
         string pluginVersion,
         string code,
         string resource,
         bool live,
         string properties,
         string referer,
         int pingTime,
         long duration,
         double bitrate,
         string extraparams,
         Action<string> complete,
         Action<Exception> error)
        {
            var url = StartApi.Start(Host, system, user, pluginVersion, code, resource, live, properties, referer,
                pingTime, duration, extraparams);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Create Properties Json.
        /// </summary>
        /// <param name="fileName">File name of the current media content</param>
        /// <returns>Json</returns>
        public static string CreateProperties(
            string fileName)
        {
            return StartApi.CreateJsonProperties(fileName);
        }

        /// <summary>
        /// Create Properties Json.
        /// </summary>
        /// <param name="fileName">File name of the current media content</param>
        /// <param name="title">Media title </param>
        /// <param name="duration">Expected video duration in seconds (Should be 0 if Live content) in Length column of Youbora. (Make sure
        /// that if a duration has been set manually, it overwrites the one get from the player)</param>
        /// <returns>Json</returns>
        public static string CreateProperties(
            string title,
            string fileName,
            long duration)
        {
            return StartApi.CreateJsonProperties(title, fileName, duration);
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
        public static string CreateProperties(
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
            return StartApi.CreateJsonProperties(
                fileName,
                title,
                genre,
                language,
                year,
                cast,
                director,
                owner,
                duration,
                parental,
                price,
                rating,
                audioType,
                audioChannels,
                contentId,
                transactionType,
                quality,
                contentType,
                manufacturer,
                deviceType,
                deviceYear,
                firmware);
        }

        /// <summary>
        /// Determines the elapsed amount of time since the end user clicks/touches the player's play button until the media starts to be played    
        /// </summary>
        /// <param name="time">Time difference (in milliseconds) between the player goes from the start event until it finishes buffering the required amount of video bytes to start the playback. Or the amount of time it takes to start the playback since the user wants to watch it</param>
        /// <param name="joinTime">Current instant of the video (video playhead) where the joinTime occurs in seconds(usually 0)</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="mediaDuration">Length of the media in seconds</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Join(
            string time,
            double joinTime,
            string code,
            long mediaDuration,
            Action<string> complete,
            Action<Exception> error)
        {
            var url = JoinTimeApi.JoinTime(Host, time, code, joinTime, mediaDuration);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the current playback has ended
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Stop(string code, Action<string> complete, Action<Exception> error)
        {
            var url = StopApi.Stop(Host, code);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the current playback has ended
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="diffTime">Should be more or less 5000ms if pingTime is 5s by default</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Stop(string code, int diffTime, Action<string> complete, Action<Exception> error)
        {
            var url = StopApi.Stop(Host, code, diffTime);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the user has paused the playback     
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Resume(string code, Action<string> complete, Action<Exception> error)
        {
            var url = ResumeApi.Resume(Host, code);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the user has paused the playback
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Pause(string code, Action<string> complete, Action<Exception> error)
        {
            var url = PauseApi.Pause(Host, code);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the user has restarted the playback  
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="pingTime">Elapsed ping time in seconds from the previous ping</param>
        /// <param name="bitrate">Current bitrate in bps (bits per second)</param>
        /// <param name="time">Video's current time in seconds.</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Pin(
          string code,
          string pingTime,
          double bitrate,
          double time,
          string nodeHost,
          string nodeType,
          Action<string> complete,
          Action<Exception> error)
        {
            var url = PinApi.Pin(Host, code, pingTime, bitrate, time, nodeHost, nodeType);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Informs when the user has restarted the playback  
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="pingTime">Elapsed ping time in seconds from the previous ping</param>
        /// <param name="bitrate">Current bitrate in bps (bits per second)</param>
        /// <param name="time">Video's current time in seconds.</param>
        /// <param name="diffTime">Elapsed ping time in miliseconds from the previous ping</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Pin(
            string code,
            string pingTime,
            double bitrate,
            double time,
            double diffTime,
            string nodeHost,
            string nodeType,
            Action<string> complete,
            Action<Exception> error)
        {
            var url = PinApi.Pin(Host, code, pingTime, bitrate, time, diffTime, nodeHost, nodeType);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Detects when the end user is experiencing buffering issues
        /// </summary>
        /// <param name="time">Video playhead in seconds. If this value is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Buffering duration in milliseconds. This is the time difference between: buffering end time - buffering start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Buffer(
            double time,
            long duration,
            string code,
            Action<string> complete,
            Action<Exception> error)
        {
            var url = BufferUnderrunApi.BufferUnderrun(Host, time, duration, code);

            ApiClient.Post(url, complete, error);
        }

        /// <summary>
        /// Detects the end user change the curren position of the video.
        /// </summary>
        /// <param name="time">Video playhead in seconds. If this is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Seeking duration in miliseconds. This is the time difference between seek end time - seek start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        public static void Seek(
          float time,
          int duration,
          string code,
          Action<string> complete)
        {
            var url = SeekApi.Seek(Host, time, duration, code);

            ApiClient.Post(url, complete);
        }

        /// <summary>
        /// Detects the end user change the curren position of the video.
        /// </summary>
        /// <param name="time">Video playhead in seconds. If this is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Seeking duration in miliseconds. This is the time difference between seek end time - seek start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void Seek(
         double time,
         long duration,
         string code,
         Action<string> complete,
         Action<Exception> error)
        {
            var url = SeekApi.Seek(Host, time, duration, code);

            ApiClient.Post(url, complete, error);
        }        
        
        /// <summary>
        /// Reports a player error.
        /// </summary>
        /// <param name="errorCode">Player's error numerical code</param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="msg">Player’s error message.</param>
        /// <param name="resource">Vídeo resource URL</param>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora which customer account you are sending the data to. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent</param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method to set this property</param>
        /// <param name="properties">JSON media properties (the same ones described in the start call)</param>
        /// <param name="user">User identifier. If the user is unknown, send a blank parameter or with a default username</param>
        /// <param name="referer">Browser's URL where the player is being loaded (window.location)</param>
        /// <param name="bitrate">bitrate (bps)</param>
        /// <param name="pingTime">pt tag from data response</param>
        /// <param name="pluginVersion">The version of the plugin in the x.x.x_pluginCode format. This parameter lets you to have a version control of new deployed plugins and see which users are using an older version (cached in the system), so you can force them to clean their cache and download the new version</param>
        /// <param name="extraParams">Custom Data feature</param>
        /// <param name="duration"></param>
        /// <param name="cdn">Code that indicates what CDN’s name must be shown for a view</param>
        /// <param name="isp">String that indicates the name of the user’s ISP</param>
        /// <param name="ip">String that defines the user’s IP</param>     
        /// <param name="complete">Complete Action</param>
        public static void Error(
            string errorCode,
            string code,
            string msg,
            string resource,
            string system,
            bool live,
            string properties,
            string user,
            string referer,
            double bitrate,
            int pingTime,
            string pluginVersion,
            long duration,           
            string extraParams,
            Action<string> complete)
        {
            var url = ErrorApi.Error(Host, errorCode, msg, code, resource, system, live, properties, user, referer,
                bitrate, pingTime,
                pluginVersion, duration, extraParams);

            ApiClient.Post(url, complete);
        }
        
        /// <summary>
        /// Returns a JSON object with an array of different resource URLs sorted by the quality of experience they offer. 
        /// </summary>
        /// <param name="systemCode">Your Nice PeopleAtWork account code that indicates Youbora Smartswitch which customer account rules are going to be applied. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent.</param>
        /// <param name="originCode">Origin code configured in Smartswitch's Account Settings</param>
        /// <param name="resource">Urlencoded resource path where the file can be found inside the configured bucket</param>
        /// <param name="niceNva">"not valid after" parameter. It defines the timestamp (in milliseconds) after the generated URL won't be valid. This is the current UTC time + the amount of time you want, in milliseconds</param>
        /// <param name="niceNvb">"not valid before" parameter. It defines the timestamp (in milliseconds) that it will take that URL to be valid and accessible. This is the current UTC time + the amount of time you want, in milliseconds.</param>
        /// <param name="secretKey">Secret key</param>
        /// <param name="complete">Complete Action</param>
        public static void GetSmartswitch(string systemCode, string originCode, string resource,
            double niceNva, double niceNvb, string secretKey, Action<string> complete)
        {
            var token = SmartswitchApi.GenerateToken(systemCode, originCode, resource, niceNva, niceNvb, secretKey);

            var url = SmartswitchApi.Smartswitch(
                systemCode,
                originCode,
                resource,
                niceNva,
                niceNvb,
                token);

            ApiClient.GetContent(url, complete);
        }

        /// <summary>
        /// Returns a JSON object with an array of different resource URLs sorted by the quality of experience they offer. 
        /// </summary>
        /// <param name="systemCode">Your Nice PeopleAtWork account code that indicates Youbora Smartswitch which customer account rules are going to be applied. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent.</param>
        /// <param name="originCode">Origin code configured in Smartswitch's Account Settings</param>
        /// <param name="resource">Urlencoded resource path where the file can be found inside the configured bucket</param>
        /// <param name="niceNva">"not valid after" parameter. It defines the timestamp (in milliseconds) after the generated URL won't be valid. This is the current UTC time + the amount of time you want, in milliseconds</param>
        /// <param name="niceNvb">"not valid before" parameter. It defines the timestamp (in milliseconds) that it will take that URL to be valid and accessible. This is the current UTC time + the amount of time you want, in milliseconds.</param>
        /// <param name="secretKey">Is a secret key shared by NicePeopleAtWork and the customer to authenticate all the calls against the Smartswitch</param>
        /// <param name="complete">Complete Action</param>
        /// <param name="error">Error Action</param>
        public static void GetSmartswitch(string systemCode, string originCode, string resource,
            double niceNva, double niceNvb, string secretKey, Action<string> complete, Action<Exception> error)
        {
            var token = SmartswitchApi.GenerateToken(systemCode, originCode, resource, niceNva, niceNvb, secretKey);

            var url = SmartswitchApi.Smartswitch(
                systemCode,
                originCode,
                resource,
                niceNva,
                niceNvb,
                token);

            ApiClient.GetContent(url, complete, error);
        }

        /// <summary>
        /// Return a Smartswitch object from a Json file.
        /// </summary>
        /// <param name="json">Json</param>
        /// <returns></returns>
        public static Models.Smartswitch.Smartswitch ParseSmartswitch(string json)
        {
            if (string.IsNullOrEmpty(json))
                return null;

            var smartswitchRoot = ApiClient.ProcessJson<SmartswitchRoot>(json);

            return smartswitchRoot.Smartswitch;
        }
    }
}