namespace Youbora.Analytics.Player
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.ComponentModel;
    using System.Diagnostics;
    using System.Globalization;
    using System.IO;
    using System.Text.RegularExpressions;
    using System.Windows.Media;
    using System.Windows.Threading;
    using Microsoft.SilverlightMediaFramework.Core;
    using Microsoft.SilverlightMediaFramework.Plugins.Primitives;
    using Providers.API;
    using Providers.Common;
    using Youbora.Analytics.Models.Content;
    using Youbora.Analytics.Models.Data;
    using Youbora.Analytics.Models.Log;
    using Youbora.Analytics.Player.Models;

    /// <summary>
    /// The Youbora player plugin is a piece of software that is integrated within the customer player and it's 
    /// the responsible of listening  and reporting to Youbora Analytics all the different player states in the 
    /// current video session. 
    /// By taking all the data from inside the player, Youbora Analytics is capable to measure the best 
    /// quality of video experience from its source, the end user, and analyze the whole route from where the 
    /// video is being delivered until the end user's player, passing through all the different path nodes from the network.
    /// </summary>
    public class YouboraAvPlayer : INotifyPropertyChanged
    {
        #region Fields

        // Consts
        public const string DefaultPluginVersion = @"5.1.1_Xbox-360";
        private const int DefaultPingTime = 5;
        private const string DefaultUndefinedValue = "undefined";

        // Variables
        private int _playListItemCounter;   // Different items from a same playlist
        private string _previousCode;
        private bool _hasJoin;
        private bool _paused;
        private bool _hasStarted;
        private DateTime? _initTime;
        private DateTime? _startTime;
        private DateTime? _initBuffer;
        private DateTime? _endBuffer;
        private DateTime? _initSeek;
        private DateTime? _endSeek;
        private DateTime? _lastPingTime;
        private SMFPlayer _smfPlayer;   // Player instance
        private DispatcherTimer _dispatcherTimer;   // Used for do Ping
        private bool _changePlaylist; // Detect if a playlist changed.
        private bool _isMuted;
        private bool? _isLive;
        private string _code;
        private string _userId;
        private int _pingTime;
        private string _host;
        private string _referer;
        private ObservableCollection<LogInfo> _log;
        private double? _eventTime;

        #endregion

        public YouboraAvPlayer()
        {
            OptionalParams = new OptionalParams();
            ContentProperties = new ContentProperties();
        }

        #region Properties

        /// <summary>
        /// Enable or disable Analytics
        /// </summary>
        public bool IsAnalyticsActive { get; set; }

        /// <summary>
        /// Determines if video is live or not
        /// </summary>
        public bool IsLive 
        { 
            get 
            {
                return (_isLive != null) 
                    ? (bool)_isLive 
                    : (_smfPlayer != null) ? _smfPlayer.IsMediaLive : false;
            }
            set 
            {
                _isLive = value;
            } 
        }

        /// <summary>
        /// Enable or disable Smartswitch
        /// </summary>
        public bool SmartSwitch { get; set; }

        public string System { get; set; }

        public string PluginVersion { get; set; }

        public string UserId
        {
            get { return _userId; }
            set
            {
                _userId = value;
                RaisePropertyChanged("UserId");
            }
        }

        public string Host
        {
            get { return _host; }
            set
            {
                _host = value;
                RaisePropertyChanged("Host");
            }
        }

        public string Url { get; set; }

        public string Referer 
        { 
            get 
            {
                return string.IsNullOrEmpty(_referer) ? string.Empty : _referer;
            } 
            set 
            {
                _referer = value;
            } 
        }

        public string Code
        {
            get { return _code; }
            set
            {
                _code = value;
                RaisePropertyChanged("Code");
            }
        }        

        public int PingTime
        {
            get { return _pingTime; }
            set
            {
                _pingTime = value;
                RaisePropertyChanged("PingTime");
            }
        }
        
        public ObservableCollection<LogInfo> Log
        {
            get { return _log; }
            set
            {
                _log = value;
                RaisePropertyChanged("Log");
            }
        }        

        public OptionalParams OptionalParams { get; set; }

        public ContentProperties ContentProperties { get; set; }

        public double EventTime 
        {
            get 
            {
                return (_eventTime != null) 
                ? (double) _eventTime
                : (_smfPlayer == null || _smfPlayer.PlaybackPosition == null) ? 0 : _smfPlayer.PlaybackPosition.TotalSeconds;
            }
            set 
            { 
                _eventTime = (double) value; 
            }
        }
                
        #endregion

        #region Tracking

        /// <summary>
        /// Initialize the playback and the plugin
        /// </summary>
        public void Init(string userId)
        {
            // Init
            _initTime = null;
            _startTime = null;
            _initBuffer = null;
            _endBuffer = null;
            _initSeek = null;
            _endSeek = null;
            _lastPingTime = null;
            _hasJoin = false;
            _paused = false;
            _changePlaylist = false;
            _isMuted = false;
            _hasStarted = false;
            _playListItemCounter = 1;
            _previousCode = string.Empty;

            _dispatcherTimer = new DispatcherTimer();
            _log = new ObservableCollection<LogInfo>
            {
                new LogInfo
                {
                    Title = "Init Log",
                    Description = "Initialize Logger",
                    LogType = LogType.Generic,
                    Date = DateTime.Now
                }
            };

            _dispatcherTimer.Tick += PingTick;

            UserId = userId;
            IsAnalyticsActive = true;
        }

        /// <summary>
        /// Reset basic playback parameters
        /// </summary>
        public void Reset()
        {
            _initTime = null;
            _startTime = null;
            _initBuffer = null;
            _initSeek = null;
            _endSeek = null;
            _endBuffer = null;
            _hasJoin = false;
            _hasStarted = false;
            _paused = false;
            _changePlaylist = false;
        }

        /// <summary>
        /// Reset all playback parameters
        /// </summary>
        public void Close()
        {
            _initTime = null;
            _startTime = null;
            _initBuffer = null;
            _endBuffer = null;
            _initSeek = null;
            _endSeek = null;
            _hasJoin = false;
            _hasStarted = false;
            _paused = false;
            _changePlaylist = false;
            _dispatcherTimer.Stop();
        }

        /// <summary>
        /// Initialize the playback and the plugin
        /// </summary>
        /// <param name="systemId">your NicePeopleAtWork account code that indicates Youbora Analytics which 
        /// customer account the data is sent to.This will be provided by NicePeopleAtWork, if you don’t have it yet, 
        /// please ask it to your Customer Engineering Manager or Support Agent.</param>
        /// <param name="userId">user ID value inside your system. Leave it blank if you don't want to use it. 
        /// This will help you to easily identify your users inside Youbora Analytics and filter all that user's views.</param>
        /// <param name="playerInstance">it is an instance of SMFPlayer initialized with a resource.</param>
        public void Tracking(string systemId,
            string userId,
            SMFPlayer playerInstance)
        {
            // Init
            Init(userId);

            _smfPlayer = playerInstance;

            YouboraAvPlayerLog("Init", "YouboraAvPlayer Init - User: " + userId, LogType.Generic);

            Data(systemId);

            // Register events
            if (_smfPlayer != null)
            {
                _smfPlayer.Loaded += _smfPlayer_Loaded;
                _smfPlayer.MediaOpened += _smfPlayer_MediaOpened;
                _smfPlayer.MediaFailed += _smfPlayer_MediaFailed;
                _smfPlayer.PlayStateChanged += _smfPlayer_PlayStateChanged;
                _smfPlayer.ScrubbingStarted += _smfPlayer_ScrubbingStarted;
                _smfPlayer.ScrubbingCompleted += _smfPlayer_ScrubbingCompleted;
                _smfPlayer.PlaylistItemChanged += _smfPlayer_PlaylistItemChanged;
                _smfPlayer.PlaylistReachedEnd += _smfPlayer_PlaylistReachedEnd;
                _smfPlayer.PlaybackPositionChanged += _smfPlayer_PlaybackPositionChanged;
                _smfPlayer.PlaylistChanged += _smfPlayer_PlaylistChanged;
                _smfPlayer.Unloaded += _smfPlayer_Unloaded;
                _smfPlayer.VolumeLevelChanged += _smfPlayer_VolumeLevelChanged;
                _smfPlayer.PlaybackBitrateChanged += _smfPlayer_PlaybackBitrateChanged;
                _smfPlayer.IsMutedChanged += _smfPlayer_IsMutedChanged;
                _smfPlayer.BufferingProgressChanged += _smfPlayer_BufferingProgressChanged;
                _smfPlayer.DownloadProgressChanged += _smfPlayer_DownloadProgressChanged;
                _smfPlayer.RetryStateChanged += _smfPlayer_RetryStateChanged;
                _smfPlayer.MediaCommand += _smfPlayer_MediaCommand;

                if (_smfPlayer.Playlist != null)
                    _smfPlayer.Playlist.CollectionChanged += Playlist_CollectionChanged;
            }
        }

        /// <summary>
        /// Initialize the playback and the plugin
        /// </summary>
        /// <param name="systemId">your NicePeopleAtWork account code that indicates Youbora Analytics which 
        /// customer account the data is sent to.This will be provided by NicePeopleAtWork, if you don’t have it yet, 
        /// please ask it to your Customer Engineering Manager or Support Agent.</param>
        /// <param name="userId">user ID value inside your system. Leave it blank if you don't want to use it. 
        /// This will help you to easily identify your users inside Youbora Analytics and filter all that user's views.</param>
        /// <param name="playerInstance">it is an instance of SMFPlayer initialized with a resource.</param>
        /// <param name="smartswitch">Enable the use of smartswitch</param>
        /// <param name="analyticsActive">It enables or disables all the Analytics module features</param>
        /// <param name="liveFlag">lets analytics identify if the user is playing a Live or VoD content.</param>
        /// 
        /// NOTE: It is very important that the instance of MediaElement are correctly initialized when you call this method.
        public void Tracking(string systemId,
           string userId,
           SMFPlayer playerInstance,
           bool smartswitch,
           bool analyticsActive,
           bool liveFlag)
        {
            // Init
            Init(userId);

            _smfPlayer = playerInstance;
            SmartSwitch = smartswitch;
            IsAnalyticsActive = analyticsActive;
            IsLive = liveFlag;

            YouboraAvPlayerLog("Init", "YouboraAvPlayer Init - User:" + userId, LogType.Generic);

            Data(systemId);

            // Register events    
            _smfPlayer.Loaded += _smfPlayer_Loaded;
            _smfPlayer.MediaOpened += _smfPlayer_MediaOpened;
            _smfPlayer.MediaFailed += _smfPlayer_MediaFailed;
            _smfPlayer.PlayStateChanged += _smfPlayer_PlayStateChanged;
            _smfPlayer.ScrubbingStarted += _smfPlayer_ScrubbingStarted;
            _smfPlayer.ScrubbingCompleted += _smfPlayer_ScrubbingCompleted;
            _smfPlayer.PlaylistItemChanged += _smfPlayer_PlaylistItemChanged;
            _smfPlayer.PlaylistReachedEnd += _smfPlayer_PlaylistReachedEnd;
            _smfPlayer.PlaybackPositionChanged += _smfPlayer_PlaybackPositionChanged;
            _smfPlayer.PlaylistChanged += _smfPlayer_PlaylistChanged;
            _smfPlayer.Unloaded += _smfPlayer_Unloaded;
            _smfPlayer.VolumeLevelChanged += _smfPlayer_VolumeLevelChanged;
            _smfPlayer.PlaybackBitrateChanged += _smfPlayer_PlaybackBitrateChanged;
            _smfPlayer.IsMutedChanged += _smfPlayer_IsMutedChanged;
            _smfPlayer.BufferingProgressChanged += _smfPlayer_BufferingProgressChanged;
            _smfPlayer.DownloadProgressChanged += _smfPlayer_DownloadProgressChanged;
            _smfPlayer.RetryStateChanged += _smfPlayer_RetryStateChanged;
            _smfPlayer.MediaCommand += _smfPlayer_MediaCommand;

            _smfPlayer.Playlist.CollectionChanged += Playlist_CollectionChanged;
        }

        #endregion

        #region SMFPlayer Events

        /// <summary>
        /// Occurs when the media player is loeaded.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void _smfPlayer_Loaded(object sender, System.Windows.RoutedEventArgs e)
        {
            //Debug.WriteLine("Loaded: {0}", DateTime.Now);
        }
        
        /// <summary>
        /// Occurs when the media stream has been validated and opened, and the file headers have been read.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_MediaOpened(object sender, EventArgs e)
        {
            _initTime = DateTime.Now;

            // WORKAROUND. The "Opening" event doesn't seem to trigger properly so we check again on "MediaOpened"
            // if it has started. 
            if (IsAnalyticsActive && (_smfPlayer != null) && !_hasStarted)
            {
                MediaStarted();
                _hasStarted = true;                         
            }
        }

        /// <summary>
        /// Call Start API and initialize some parameters.
        /// </summary>
        internal void MediaStarted()
        {                
            var durationFromPlayer = GetDuration(_smfPlayer);
            var fileNameFromPlayer = GetFilename(_smfPlayer);
            var titleFromPlayer = GetTitle(_smfPlayer);
            if (string.IsNullOrEmpty(titleFromPlayer))
            {
                titleFromPlayer = fileNameFromPlayer;
            }                    

            // Add properties from Player.
            if (ContentProperties == null)
            {
                ContentProperties = new ContentProperties();
            }
            ContentProperties.SetDefaultFilename(fileNameFromPlayer);
            ContentProperties.SetDefaultContentTitle(titleFromPlayer);
            ContentProperties.SetDefaultContentDuration(durationFromPlayer);

            var properties = ContentProperties.ConvertToJson();


            // Update Url
            if (_smfPlayer != null && _smfPlayer.CurrentPlaylistItem != null)
            {
                SetUrl(_smfPlayer.CurrentPlaylistItem.MediaSourceText);
            }

            if (_changePlaylist)
            {
                YouboraApi.GetData(System, DefaultPluginVersion, dataRoot =>
                {
                    // New playlist - Renew code
                    Code = dataRoot.Data.Code;
                    _previousCode = Code;

                    YouboraAvPlayerLog("Data", "YouboraAvPlayer Data ChangePlayList - Host: " + Host + ", Code: " + Code, LogType.Data);
                    
                    // Start using new code
                    Start(System, UserId, DefaultPluginVersion, Code, Url, IsLive, properties, Referer, PingTime);
                });

                _changePlaylist = false;
            }
            else
            {
                var newCode = _playListItemCounter > 1 ? _previousCode + "_" + (_playListItemCounter - 1) : _previousCode;
                Code = newCode;

                //Debug.WriteLine("Renew code: {0}", newCode);                

                // Start
                Start(System, UserId, DefaultPluginVersion, newCode, Url, IsLive, properties, Referer, PingTime);
            }
        }

        /// <summary>
        /// Occurs when the value of the CurrentState property changes.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_MediaFailed(object sender, CustomEventArgs<Exception> e)
        {
            Debug.WriteLine("Media Failed: {0}", e.Value);

            if (IsAnalyticsActive)
            {
                Error(e.Value.Message);
            }

            // The plugin stops sending /ping events once the /error event has been sent and the 
            // view is immediately closed in Youbora
            _dispatcherTimer.Stop();
        }

        /// <summary>
        /// Occurs when the value of the CurrentState property changes.
        /// 
        /// The player buffering events (the first one is for the Join Time API call)  
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlayStateChanged(object sender, CustomEventArgs<MediaPluginState> e)
        {
            switch (e.Value)
            {
                case MediaPluginState.Buffering:
                    _initBuffer = DateTime.Now;                    

                    Debug.WriteLine("PlayStateChanged: Buffering: {0}", DateTime.Now);
                    break;
                case MediaPluginState.Opening:                    
                    if (_initTime == null)
                    {
                        _initTime = DateTime.Now;
                    }

                    if (!_hasStarted)
                    {
                        MediaStarted();
                        _hasStarted = true;
                    }

                    Debug.WriteLine("PlayStateChanged: Opening: {0}", DateTime.Now);
                    break;
                case MediaPluginState.Paused:
                    bool pause = true;

                    var player = sender as SMFPlayer;

                    if (player != null)
                    {
                        var playbackPosition = player.PlaybackPosition.Add(TimeSpan.FromSeconds(1));

                        if (player.EndPosition <= playbackPosition)
                        {
                            pause = false;
                        }
                    }

                    if (pause)
                    {
                        if (IsAnalyticsActive)
                        {
                            Pause();
                        }

                        _paused = true;
                    }

                    Debug.WriteLine("PlayStateChanged: Paused: {0}", DateTime.Now);
                    break;
                case MediaPluginState.Playing:
                    if (_startTime == null)
                    {
                        _startTime = DateTime.Now;

                        if (_initTime == null)
                        {
                            _initTime = DateTime.Now;
                        }

                        if (IsAnalyticsActive)
                        {                            
                            JoinTime();
                        }
                    }
                    else
                    {
                        if (_paused)
                        {
                            if (IsAnalyticsActive)
                            {
                                Resume();
                            }

                            _paused = false;
                        }
                    }

                    _dispatcherTimer.Start();

                    Debug.WriteLine("PlayStateChanged: Playing: {0}", DateTime.Now);
                    break;
                case MediaPluginState.Stopped:
                    if (IsAnalyticsActive)
                    {
                        Stop();
                    }
                    Reset();
                    _dispatcherTimer.Stop();

                    Debug.WriteLine("PlayStateChanged: Stopped: {0}", DateTime.Now);
                    break;
                case MediaPluginState.Individualizing:
                    Debug.WriteLine("PlayStateChanged: Individualizing: {0}", DateTime.Now);
                    break;
                case MediaPluginState.AcquiringLicense:
                    Debug.WriteLine("PlayStateChanged: AcquiringLicense: {0}", DateTime.Now);
                    break;
                case MediaPluginState.ClipPlaying:
                    Debug.WriteLine("PlayStateChanged: ClipPlaying: {0}", DateTime.Now);
                    break;
            }
        }

        /// <summary>
        /// Occurs when the percent of the media being buffered changes. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_BufferingProgressChanged(object sender, CustomEventArgs<double> e)
        {
            if (_smfPlayer == null)
                return;                            

            Debug.WriteLine("Buffering Progress Changed: {0} - {1}%", e.Value, _smfPlayer.BufferingProgress * 100);

            if (e.Value < 1.0)
                return;

            _endBuffer = DateTime.Now;

            if (_startTime.HasValue && _initTime.HasValue)
            {
                // Buffering duration in milliseconds.Difference between: buffering end time - buffering start time
                double bufferingDuration = 0;
                if (_endBuffer != null && _initBuffer != null)
                {
                    bufferingDuration = (_endBuffer.Value - _initBuffer.Value).TotalMilliseconds;
                }

                // Be careful! The first buffering event is reserved for the /joinTime. 
                if (_hasJoin)
                {
                    if (IsAnalyticsActive)
                    {
                        
                        Buffer(EventTime, bufferingDuration, Code);
                    }
                }
            }
        }

        /// <summary>
        /// Occurs when the percent of the media downloaded changes. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_DownloadProgressChanged(object sender, CustomEventArgs<double> e)
        {
            Debug.WriteLine("Download Progress Changed: {0}", e.Value);
        }

        /// <summary>
        /// Occurs when the user begin changing the timeline position.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void _smfPlayer_ScrubbingStarted(object sender, CustomEventArgs<TimeSpan> e)
        {
            _initSeek = DateTime.Now;
        }

        /// <summary>
        /// Occurs when the user finishes changing the timeline position.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_ScrubbingCompleted(object sender, CustomEventArgs<TimeSpan> e)
        {
            var player = sender as SMFPlayer;

            if (player != null)
            {
                _endSeek = DateTime.Now;
                // Video playhead in seconds.
                var time = player.PlaybackPosition.TotalSeconds;
                double duration = 0;
                if (_initSeek != null)
                {
                    // Seeking duration in miliseconds. This is the time difference between: seek end time and seek start time.
                    duration = (_endSeek.Value - _initSeek.Value).TotalMilliseconds;
                }

                if (IsAnalyticsActive)
                {
                    Seek(time, duration, Code);
                }
            }
        }

        /// <summary>
        /// Playlist item changed.
        /// 
        /// The session code identifier is returned in the data field Code. 
        /// If the player is being played in a loop or playlist mode, concatenating ads with video content for example, the code needs to be updated, for each new video, as shown: 
        /// code_x
        /// Where x is an integer that will increase on each new video in the playlist.For the previous given example:  
        /// - l9UVBka5k2m20Q56_1
        /// - l9UVBka5k2m20Q56_2
        /// - l9UVBka5k2m20Q56_3
        /// By doing this, only a single call to /data will be needed, when loading the player. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlaylistItemChanged(object sender,
            CustomEventArgs<Microsoft.SilverlightMediaFramework.Core.Media.PlaylistItem> e)
        {
            if (!string.IsNullOrEmpty(Code))
            {
                _playListItemCounter = _playListItemCounter + 1;
                _initTime = null;
                _startTime = null;
            }
        }

        /// <summary>
        /// No more items in Playlist.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlaylistReachedEnd(object sender, EventArgs e)
        {
            // Reset counter
            _playListItemCounter = 1;
        }

        /// <summary>
        /// Player playback position changed.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlaybackPositionChanged(object sender, CustomEventArgs<TimeSpan> e)
        {
            if (e.Value.TotalSeconds.Equals(0))
            {
                var player = sender as SMFPlayer;

                if (player != null)
                {
                    // If the player does not provide with the bitrate information, make sure that the plugin sends bitrate = -1.
                    Ping(PingTime.ToString(), player.PlaybackBitrate != 0 ? player.PlaybackBitrate : -1, player.PlaybackPosition.TotalSeconds);

                    _lastPingTime = DateTime.Now;
                }
            }
        }

        /// <summary>
        /// Occurs when the Playlist changes.
        ///  When the player change the playlist, renew the Code.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlaylistChanged(object sender, CustomEventArgs<IList<Microsoft.SilverlightMediaFramework.Core.Media.PlaylistItem>> e)
        {
            // Renew Code
            //_changePlaylist = true;
            _playListItemCounter = 1;
        }

        /// <summary>
        /// Occurs when the Playlist changes.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void Playlist_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            // Renew Code
            _changePlaylist = true;
            _playListItemCounter = 0;
        }

        /// <summary>
        /// Player volumen level changed.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_VolumeLevelChanged(object sender, CustomEventArgs<double> e)
        {
            if (_isMuted)
                return;

            YouboraAvPlayerLog("Volume", "Volume level changed: " + Math.Round(e.Value * 100, 2) + "%. NOTE: No registered in Youbora API.",
                LogType.Generic);
        }

        /// <summary>
        /// Muted Audio.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_IsMutedChanged(object sender, CustomEventArgs<bool> e)
        {
            _isMuted = e.Value;

            YouboraAvPlayerLog("Muted", "Player Muted: " + ((e.Value) ? "Yes" : "No") + ". NOTE: No registered in Youbora API.",
                   LogType.Generic);
        }

        /// <summary>
        /// Playback bitrate changed.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_PlaybackBitrateChanged(object sender, CustomEventArgs<long> e)
        {
            YouboraAvPlayerLog("Bitrate", "Bitrate changed: " + e.Value + ". NOTE: No registered in Youbora API.",
                LogType.Generic);
        }

        /// <summary>
        /// Unload Player-
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        internal void _smfPlayer_Unloaded(object sender, System.Windows.RoutedEventArgs e)
        {
            Reset();
            _dispatcherTimer.Stop();
        }

        /// <summary>
        /// Respond to remote controls and media keyboards
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void _smfPlayer_MediaCommand(object sender, MediaCommandEventArgs e)
        {
            switch (e.MediaCommand)
            {
                // Begin or continue playing the media.
                case MediaCommand.Play:
                    Debug.WriteLine("Play Button");
                    break;
                // Stop playing the media, and return to the menu or other appropriate state.
                case MediaCommand.Stop:
                    Debug.WriteLine("Stop Button");
                    break;
                case MediaCommand.ChannelDown:
                    Debug.WriteLine("ChannelDown Button");
                    break;
                case MediaCommand.ChannelUp:
                    Debug.WriteLine("ChannelUp Button");
                    break;
                case MediaCommand.DecreaseVolume:
                    Debug.WriteLine("DecreaseVolume Button");
                    break;
                case MediaCommand.Display:
                    Debug.WriteLine("Display Button");
                    break;
                case MediaCommand.FastForward:
                    Debug.WriteLine("FastForward Button");
                    break;
                case MediaCommand.Guide:
                    Debug.WriteLine("Guide Button");
                    break;
                case MediaCommand.IncreaseVolume:
                    Debug.WriteLine("IncreaseVolume Button");
                    break;
                case MediaCommand.Info:
                    Debug.WriteLine("Info Button");
                    break;
                case MediaCommand.Menu:
                    Debug.WriteLine("Menu Button");
                    break;
                case MediaCommand.TV:
                    Debug.WriteLine("TV Button");
                    break;
                case MediaCommand.MuteVolume:
                    Debug.WriteLine("MuteVolume Button");
                    break;
                // Temporarily pause the media.
                case MediaCommand.Pause:
                    Debug.WriteLine("Pause Button");
                    break;
            }
        }

        /// <summary>
        /// Indicates that the RetryState property has changed.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void _smfPlayer_RetryStateChanged(object sender, EventArgs e)
        {
            var player = sender as SMFPlayer;
            if (player != null)
            {
                switch (player.RetryState)
                {
                    case SMFPlayer.RetryStateEnum.NotRetrying:
                        Debug.WriteLine("Not Retrying");
                        break;
                    case SMFPlayer.RetryStateEnum.RetryFailed:
                        Debug.WriteLine("Retry Failed");
                        break;
                    case SMFPlayer.RetryStateEnum.Retrying:
                        Debug.WriteLine("Retrying");
                        break;
                }
            }
        }

        #endregion

        #region Timer

        /// <summary>
        /// Launched every PingTime seconds.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void PingTick(object sender, EventArgs e)
        {
            if (IsAnalyticsActive)
            {
                if (_smfPlayer != null)
                {
                    // If the player does not provide with the bitrate information, make sure that the plugin sends bitrate = -1.
                    Ping(PingTime.ToString(), _smfPlayer.PlaybackBitrate != 0 ? _smfPlayer.PlaybackBitrate : -1, _smfPlayer.PlaybackPosition.TotalSeconds);
                }
            }

            // Update last ping datetime. Used in /stop to calculate difftime.
            _lastPingTime = DateTime.Now;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Init Youbora Data.
        /// </summary> 
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics 
        /// which customer account you are sending the data to. This parameter will be provided by 
        /// NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support 
        /// Agent</param>
        /// <param name="pluginVersion">The version of the plugin in the format described below this table.
        /// This parameter lets you to have a version control of new deployed plugins and see which 
        /// users are using an older version (cached in the system), so you can force them to clean 
        /// their cache and download the new version</param>
        public void Data(string system, string pluginVersion = DefaultPluginVersion)
        {
            System = system;
            PluginVersion = pluginVersion;

            YouboraApi.GetData(system, pluginVersion, dataRoot =>
            {
                Host = dataRoot.Data.Host;
                YouboraApi.Host = Host;
                Code = dataRoot.Data.Code;
                _previousCode = Code;
                PingTime = (dataRoot.Data.PingTime != 0) ? dataRoot.Data.PingTime : DefaultPingTime;
                _dispatcherTimer.Interval = new TimeSpan(0, 0, 0, PingTime, 0);

                YouboraAvPlayerLog("Data", "YouboraAvPlayer Data - Host: " + Host + ", Code: " + Code, LogType.Data);
            });
        }

        public Data GetData(string system, string pluginVersion = DefaultPluginVersion)
        {
            return YouboraApi.GetData(system, pluginVersion);
        }

        /// <summary>
        /// Init Youbora Data.
        /// </summary> 
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics 
        /// which customer account you are sending the data to. This parameter will be provided by 
        /// NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support 
        /// Agent</param>
        /// <param name="pluginVersion">The version of the plugin in the format described below this table.
        /// This parameter lets you to have a version control of new deployed plugins and see which 
        /// users are using an older version (cached in the system), so you can force them to clean 
        /// their cache and download the new version</param>
        /// <param name="user">User identifier. If the user is unknown, send the parameter blank or with a 
        /// default username</param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. 
        /// Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method 
        /// to set this property</param>
        public void Data(
            string system,
            string pluginVersion,
            string user,
            bool live)
        {
            System = system;
            PluginVersion = pluginVersion;
            UserId = user;
            IsLive = live;

            YouboraApi.GetData(system, pluginVersion, dataRoot =>
            {
                Host = dataRoot.Data.Host;
                YouboraApi.Host = Host;
                Code = dataRoot.Data.Code;
                _previousCode = Code;
                PingTime = (dataRoot.Data.PingTime != 0) ? dataRoot.Data.PingTime : DefaultPingTime;
                _dispatcherTimer.Interval = new TimeSpan(0, 0, 0, PingTime, 0);

                YouboraAvPlayerLog("Data", "YouboraAvPlayer Data - Code: " + Code + ",  PingTime: " + PingTime,
                    LogType.Data);
            });
        }
        
        /// <summary>
        /// Determines the elapsed amount of time since the end user clicks/touches the player's play button 
        /// until the media starts to be played.    
        /// </summary>
        /// <param name="time">Time difference (in milliseconds) between the player goes from the start event 
        /// until it finishes buffering the required amount of video bytes to start the playback. Or the amount of time 
        /// it takes to start the playback since the user wants to watch it</param>
        /// <param name="code">View code retrieved from the data call</param>
        public void Join(string time, string code)
        {
            // Fix time
            time = time.Replace(".", ",");
           
            double duration = (_smfPlayer == null || _smfPlayer.EndPosition == null) ? 0 : _smfPlayer.EndPosition.TotalSeconds;

            YouboraApi.Join(time, EventTime, code, Convert.ToInt64(duration),
                result =>
                {
                    YouboraAvPlayerLog("Join",
                        "YouboraAvPlayer Join - Code: " + code + ", EventTime: " + EventTime + " seconds, Time: " + time + " milliseconds ("
                        + TimeSpanUtil.ConvertMillisecondsToSeconds(Convert.ToDouble(time)) + " seconds), MediaDuration: " + Convert.ToInt64(duration),
                        LogType.JoinTime);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }

        /// <summary>
        /// Set the used url resource.
        /// </summary>
        /// <param name="url">url</param>
        public void SetUrl(string url)
        {
            // If don´t use Smartswitch, directly use the original resource
            if (!SmartSwitch)
                Url = url;
            else
            {
                // Valid for 60 seconds
                var niceNvab = DateTime.UtcNow.AddMilliseconds(60 * 1000).ToUniversalTime().Subtract(
                    new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                    ).TotalMilliseconds;

                YouboraApi.GetSmartswitch(System, Code, url, niceNvab, niceNvab, string.Empty, result =>
                {
                    var data = YouboraApi.ParseSmartswitch(result);
                    Url = (data != null) ? data.Url : url;
                },
                error =>
                {
                    // Register error
                    Error(error.Message);

                    // Url set to the original resource
                    Url = url;
                });
            }
        }

        /// <summary>
        /// Start event information.      
        /// </summary>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics which customer account you are sending the data to. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent</param>
        /// <param name="user">User identifier. If the user is unknown, send the parameter blank or with a default username</param>
        /// <param name="pluginVersion"></param>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="resource">The resource parameter corresponds to the real content URL and therefore the CDN detection is correct.</param>
        /// <param name="live">Boolean variable to identify if the video is a live (true) or an on demand (false) stream. Many of our plugins have a method integrated that lets the customer, when integrating the plugin, use a method to set this property</param>
        /// <param name="properties">JSON media properties (see them defined below in a sub-section)</param>
        /// <param name="referer">Browser's URL where the player is being loaded (or window.location for Smart TV applications). This field can be empty but must be declared.</param>
        /// <param name="pingTime">The version of the plugin in the x.x.x_pluginCode format. This parameter lets you to have a version control of new deployed plugins and see which users are using an older version (cached in the system), so you can force them to clean their cache and download the new version</param>
        public void Start(string system, string user, string pluginVersion, string code, string resource,
            bool live, string properties, string referer, int pingTime)
        {
            if (string.IsNullOrEmpty(code))
                return;
            
            double duration = 0;
            double bitrate = -1;            
            string extra = string.Empty;

            if (string.IsNullOrEmpty(resource) && _smfPlayer != null)
            {
                SetUrl(_smfPlayer.CurrentPlaylistItem.MediaSourceText);
                resource = Url;
            }

            if (_smfPlayer != null)
            {
                bitrate =
                    BytesUtil.ConvertBytesToMegabytes(_smfPlayer.DownloadBitrate != 0
                        ? _smfPlayer.DownloadBitrate
                        : -1);
                duration = _smfPlayer.EndPosition.TotalSeconds;                
            }            
            var optionalParamQueryString = (OptionalParams != null )? OptionalParams.GetQueryString() : string.Empty;

            YouboraApi.Start(system, user, pluginVersion, code, resource, live, properties, referer, pingTime,
                Convert.ToInt64(duration), bitrate, optionalParamQueryString,
                    result =>
                    {
                        YouboraAvPlayerLog("Start",
                            "YouboraAvPlayer Start - Code: " + code + ", System: " + system + ", UserId: " + user + ", Plugin: " + pluginVersion + ", Url: " + resource,
                            LogType.Start);

                        Code = code;
                    },
                    error =>
                    {
                        YouboraAvPlayerError(error.Message);
                    });
        }

        /// <summary>
        ///  Informs when the user has paused the playback.
        /// </summary>
        public void Pause()
        {
            YouboraApi.Pause(Code,
                result =>
                {
                    YouboraAvPlayerLog("Pause", "YouboraAvPlayer Pause - Code: " + Code, LogType.Pause);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }
        
        /// <summary>
        ///  Informs when the current playback has ended.
        /// </summary>
        public void Stop()
        {
            var timeSpan = DateTime.Now - _lastPingTime;

            if (timeSpan != null)
            {
                // Should be more or less 5000ms if pingTime is 5s by default
                var diffTime = timeSpan.Value.TotalMilliseconds;

                YouboraApi.Stop(Code, Convert.ToInt32(diffTime),
                    result =>
                    {
                        YouboraAvPlayerLog("Stop",
                            "YouboraAvPlayer Stop - Code: " + Code + ", DiffTime: " + diffTime + " miliseconds (" + TimeSpanUtil.ConvertMillisecondsToSeconds(diffTime) + " seconds)",
                            LogType.Stop);
                    },
                    error =>
                    {
                        YouboraAvPlayerError(error.Message);
                    });
            }
            else
            {
                YouboraApi.Stop(Code,
                    result =>
                    {
                        YouboraAvPlayerLog("Stop", "YouboraAvPlayer Stop - Code: " + Code, LogType.Stop);
                    },
                    error =>
                    {
                        YouboraAvPlayerError(error.Message);
                    });
            }
        }

        /// <summary>
        ///  Informs when the current playback has ended.
        /// </summary>
        /// <param name="code">View code retrieved from the data call</param>
        /// <param name="diffTime">Should be more or less 5000ms if pingTime is 5s by default</param>
        public void Stop(string code, int diffTime)
        {
            YouboraApi.Stop(Code, Convert.ToInt32(diffTime),
                result =>
                {
                    YouboraAvPlayerLog("Stop",
                        "YouboraAvPlayer Stop - Code: " + code + ", DiffTime: " + diffTime + " miliseconds (" + TimeSpanUtil.ConvertMillisecondsToSeconds(diffTime) + " seconds)",
                        LogType.Stop);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }

        /// <summary>
        /// Informs when the user has paused the playback.     
        /// </summary>
        public void Resume()
        {
            YouboraApi.Resume(Code,
                result =>
                {
                    YouboraAvPlayerLog("Resume", "YouboraAvPlayer Resume - Code: " + Code, LogType.Resume);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }

        /// <summary>
        /// Informs when the user has restarted the playback.
        /// </summary>
        /// <param name="pingTime">Elapsed ping time in seconds from the previous ping</param>
        /// <param name="bitrate">Current bitrate in bps (bits per second)</param>
        /// <param name="time">Video's current time in seconds.</param>
        public void Ping(string pingTime, double bitrate, double time)
        {
            var nodeHost = (OptionalParams != null) ? OptionalParams.NodeHost : string.Empty;
            var nodeType = (OptionalParams != null) ? OptionalParams.NodeType : string.Empty;

            // Validate parameters
            if (time < 0)
                time = 0;

            // Calculate diffTime
            TimeSpan? diffTime = null;
            if (_lastPingTime != null)
            {
                diffTime = DateTime.Now - _lastPingTime.Value;
            }

            if (diffTime.HasValue)
            {
                YouboraApi.Pin(Code, pingTime, bitrate, time, diffTime.Value.TotalMilliseconds, nodeHost, nodeType,
                    result =>
                    {
                        YouboraAvPlayerLog("Pin",
                            "YouboraAvPlayer Pin - Code: " + Code + ", Ping Time: " + pingTime + ", Bitrate: " + bitrate + " bps, Time: " + time + ", " +
                            "DiffTime: " + diffTime.Value.TotalMilliseconds + " miliseconds (" + TimeSpanUtil.ConvertMillisecondsToSeconds(diffTime.Value.TotalMilliseconds) + " seconds)",
                            LogType.Pin);
                    },
                    error =>
                    {
                        YouboraAvPlayerError(error.Message);
                    });
            }
            else
            {
                YouboraApi.Pin(Code, pingTime, bitrate, time, nodeHost, nodeType,
                    result =>
                    {
                        YouboraAvPlayerLog("Pin",
                            "YouboraAvPlayer Pin - Code: " + Code + ", Ping Time: " + pingTime + ", Bitrate: " + bitrate + " bps, Time: " + time,
                            LogType.Pin);
                    },
                    error =>
                    {
                        YouboraAvPlayerError(error.Message);
                    });
            }
        }
        
        /// <summary>
        /// Detects when the end user is experiencing buffering issues.
        /// </summary>
        /// <param name="time">Video playhead in seconds. If this value is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Buffering duration in milliseconds. This is the time difference between: buffering end time - buffering start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        public void Buffer(double time, double duration, string code)
        {
            YouboraApi.Buffer(time, Convert.ToInt64(duration), code,
                result =>
                {
                    // Must use the same code as for the /start event
                    YouboraAvPlayerLog("Buffer",
                        "YouboraAvPlayer Buffer - Code: " + code + ", Time: " + time + " seconds, Duration: " + duration + " milliseconds (" + TimeSpanUtil.ConvertMillisecondsToSeconds(duration) + " seconds)",
                        LogType.Buffer);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }

        /// <summary>
        /// Detects the end user change the curren position of the video.
        /// </summary>
        /// <param name="time">Video playhead in seconds. If this is 0, no data is saved in Nice Analytics backend</param>
        /// <param name="duration">Seeking duration in miliseconds. This is the time difference between seek end time - seek start time</param>
        /// <param name="code">View code retrieved from the data call</param>
        public void Seek(double time, double duration, string code)
        {
            YouboraApi.Seek(time, Convert.ToInt64(duration), Code,
                result =>
                {
                    YouboraAvPlayerLog("Seek",
                        "YouboraAvPlayer Seek - Code: " + code + ", Time: " + time + " seconds (" + TimeSpanUtil.ConvertSecondsToMinutes(time) + " minutes), Duration: " + duration + " miliseconds (" + TimeSpanUtil.ConvertMillisecondsToSeconds(duration) + " seconds)",
                        LogType.Seek);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }
        
        /// <summary>
        /// Reports a player error.
        /// </summary>
        /// <param name="errorCode">Player's error numerical code</param>
        public void Error(string errorCode)
        {
            var codeNumber = Regex.Match(errorCode, @"\d+").Value;
            var bitrate = GetBitrate(_smfPlayer);
            var durationFromPlayer = GetDuration(_smfPlayer);
            var filenameFromPlayer = GetFilename(_smfPlayer);
            var titleFromPlayer = GetTitle(_smfPlayer);
            if (string.IsNullOrEmpty(titleFromPlayer))
            {
                titleFromPlayer = filenameFromPlayer;
            }

            // Add properties from Player.
            if (ContentProperties == null)
            {
                ContentProperties = new ContentProperties();
            }
            ContentProperties.SetDefaultFilename(filenameFromPlayer);
            ContentProperties.SetDefaultContentTitle(titleFromPlayer);
            ContentProperties.SetDefaultContentDuration(durationFromPlayer);

            // Create properties
            var properties = ContentProperties.ConvertToJson();            

            var optionalParamQueryString = (OptionalParams != null) ? OptionalParams.GetQueryString() : string.Empty;

            YouboraApi.Error(codeNumber, Code, errorCode, Url,
                    System, IsLive, properties, UserId, string.Empty, bitrate, PingTime, PluginVersion,
                    Convert.ToInt64(durationFromPlayer), optionalParamQueryString,
                    result =>
                    {
                        YouboraAvPlayerLog("Error", "YouboraAvPlayer Error - Exception Message: " + errorCode,
                            LogType.Error);
                    });
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
        public void Smartswitch(string systemCode, string originCode, string resource,
            double niceNva, double niceNvb, string secretKey)
        {
            YouboraApi.GetSmartswitch(systemCode, originCode, resource, niceNva, niceNvb, secretKey,
                result =>
                {
                    Debug.WriteLine(result);
                },
                error =>
                {
                    YouboraAvPlayerError(error.Message);
                });
        }

        /// <summary>
        /// Returns a JSON object with an array of different resource URLs sorted by the quality of experience they offer.
        /// </summary>
        /// <param name="systemCode">Your Nice PeopleAtWork account code that indicates Youbora Smartswitch which customer account rules are going to be applied. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent.</param>
        /// <param name="originCode">Origin code configured in Smartswitch's Account Settings</param>
        /// <param name="resource">Urlencoded resource path where the file can be found inside the configured bucket</param>
        /// <param name="niceNva">"not valid after" parameter. It defines the timestamp (in milliseconds) after the generated URL won't be valid. This is the current UTC time + the amount of time you want, in milliseconds</param>
        /// <param name="niceNvb">"not valid before" parameter. It defines the timestamp (in milliseconds) that it will take that URL to be valid and accessible. This is the current UTC time + the amount of time you want, in milliseconds.</param>
        /// <param name="secretKey"></param>
        /// <param name="complete">Complete Action</param>
        public void Smartswitch(string systemCode, string originCode, string resource,
            double niceNva, double niceNvb, string secretKey, Action<string> complete)
        {
            YouboraApi.GetSmartswitch(systemCode, originCode, resource, niceNva, niceNvb, secretKey,
                complete);
        }       

        #endregion

        #region Log

        internal string GetTitle(SMFPlayer player)
        {
            return (player != null && player.CurrentPlaylistItem != null) ? player.CurrentPlaylistItem.Title : string.Empty;           
        }

        internal string GetFilename(SMFPlayer player)
        {
            return (player != null && player.CurrentPlaylistItem != null && player.CurrentPlaylistItem.MediaSource != null) ? Path.GetFileName(player.CurrentPlaylistItem.MediaSource.AbsolutePath) : string.Empty;
        }

        internal long GetDuration(SMFPlayer player)
        {
            return (player == null || player.IsMediaLive || player.EndPosition == null) ? 0 : Convert.ToInt64(player.EndPosition.TotalSeconds);
        }

        internal double GetBitrate(SMFPlayer player)
        {
            return (player == null || player.PlaybackBitrate == 0) ? -1 : BytesUtil.ConvertBytesToMegabytes(player.PlaybackBitrate);
        }
       

        /// <summary>
        /// Register error in local Log. 
        /// </summary>
        /// <param name="message">Log messsage</param>
        internal void YouboraAvPlayerLog(string message)
        {
            try
            {
                Debug.WriteLine(message);
                Log.Add(new LogInfo
                {
                    Description = message,
                    Date = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        /// <summary>
        /// Register error in local Log. 
        /// </summary>   
        /// <param name="title">Log title</param>
        /// <param name="message">Log messsage</param>
        /// <param name="type">Log type</param>
        internal void YouboraAvPlayerLog(string title, string message, LogType type)
        {
            try
            {
                Debug.WriteLine(message);

                Log.Add(new LogInfo
                {
                    Title = title,
                    Description = message,
                    LogType = type,
                    Date = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        /// <summary>
        /// Register error in API and in local Log. 
        /// </summary>
        /// <param name="message">Log messsage</param>
        internal void YouboraAvPlayerError(string message)
        {
            try
            {
                Debug.WriteLine(message);
                Log.Add(new LogInfo
                {
                    Description = message,
                    Date = DateTime.Now
                });

                Error(message);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        internal void JoinTime()
        {
            if (_initTime != null && _startTime != null)
            {
                // Time difference (in milliseconds) between the player goes from the start
                // event until it finishes buffering the required amount of video bytes to
                // start the playback.Or the amount of time it takes to start the playback
                // since the user wants to watch it
                var diffTime = _startTime.Value - _initTime.Value;

                // Be careful! The first buffering event is reserved for the /joinTime. 
                if (!_hasJoin)
                {
                    if (IsAnalyticsActive)
                    {
                        Join(Math.Abs(diffTime.TotalMilliseconds).ToString(CultureInfo.InvariantCulture), Code);
                    }

                    _hasJoin = true;
                }
            }
        }

        #endregion

        #region RaisePropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        public void RaisePropertyChanged(string propertyName = "")
        {
            var handler = PropertyChanged;
            if (handler != null)
                handler.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }
}