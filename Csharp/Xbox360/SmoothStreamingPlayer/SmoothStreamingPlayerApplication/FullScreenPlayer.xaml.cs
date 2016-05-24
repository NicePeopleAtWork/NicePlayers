using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.SilverlightMediaFramework.Core.Media;
using Youbora.Analytics.Player;
using Youbora.Analytics.Models;
using Youbora.Analytics.Player.Models;
using Youbora.Analytics.Models.Content;

namespace SmoothStreamingPlayerApplication
{
    public partial class FullScreenPlayer : Page
    {
        #region Fields

        private YouboraAvPlayer youboraAVPlayer = new YouboraAvPlayer();

        private DispatcherTimer m_timer;

        private double m_minBitrate = double.MaxValue;
        private double m_maxBitrate = 0.0;

        #endregion

        #region Constructor, Loaded and OnNavigatedTo event handlers

        public FullScreenPlayer()
        {
            InitializeComponent();

            Player.MediaEnded += new EventHandler(Player_MediaEnded);

            this.Loaded += new RoutedEventHandler(FullScreenPlayer_Loaded);           

            // Initialize Youbora
            youboraAVPlayer.Tracking("plainconcepts", "", Player);   
         
            // Set all Optional Parameters at once
            youboraAVPlayer.OptionalParams = new OptionalParams()
            {
                NodeHost = "NODE_HOST",
                NodeType = "NODE_TYPE",
                IsBalanced = true,
                IsResumed = false,
                Transcode = "TRANSCODE",
                Cdn = "CONTENT_DELIVERY_NETWORK",
                Isp = "INTERNET_SERVICE_PROVIDER",
                Ip = "10.0.0.1",
                CustomParams = new Dictionary<string,string>() {
                    {"param1", "true"},
                    {"param2", "param2Value"},
                    {"param3", "param3Value"},
                    {"param4", "param4Value"},
                    {"param5", "param5Value"},
                    {"param6", "param6Value"},
                    {"param7", "param7Value"},
                    {"param8", "param8Value"},
                    {"param9", "param9Value"},
                    {"param10", "param10Value"}
                }
            };

            //youboraAVPlayer.IsLive = true;

            // Set Optional Parameters individually
            youboraAVPlayer.OptionalParams.Cdn = "ANOTHER_CONTENT_DELIVERY_NETWORK";

            // Set all Content Properties at once
            youboraAVPlayer.ContentProperties = new ContentProperties()
            {
                Filename = "Batman_Dark_Knight.mp4",
                ContentId = "CONTENT_ID",
                ContentMetadata = new ContentMetadata()
                {
                    Title = "The Dark Knight",
                    Genre = "Adventure",
                    Language = "English",
                    Year = "2008",
                    Cast = "Christian Bale, Heath Ledget, Aaron Eckhart",
                    Director = "Christopher Nolan",
                    Owner = "OWNER",
                    Duration = 324000, // In seconds
                    Parental = "All",
                    Price = "2.99$",
                    Rating = "9/10",
                    AudioType = "Dolby",
                    AudioChannels = "5.1"
                },
                TransactionType = TransactionType.Rent,
                Quality = "HD",
                ContentType = ContentType.Movie                
            };

            // Set Content Propertries individually
            youboraAVPlayer.ContentProperties.Quality = "SD";
            youboraAVPlayer.ContentProperties.Device.Firmware = "FIRMWARE";
            
        }

        void FullScreenPlayer_Loaded(object sender, RoutedEventArgs e)
        {
            this.GamePadButtonDown += new EventHandler<GamePadButtonEventArgs>(FullScreenPlayer_GamePadButtonDown);

            // This will allow the Page control to receive the button events. 
            this.IsTabStop = true;

            // This will set the focus to the MediaTransport control so that it receives the gamepad and remote control events. Any button 
            // not handled by MediaTransport control will be routed to the Page control. 
            Player.MediaTransport.Focus();

            // Disable skip forward button
            Player.MediaTransport.IsSkipForwardEnabled = false;
            Player.MediaTransport.IsSkipForwardVisible = false;

            // Disable closed captions
            Player.CaptionToggleButton.Visibility = System.Windows.Visibility.Collapsed;
            Player.CaptionToggleButton.IsEnabled = false;
        }

        protected override void OnNavigatedTo(System.Windows.Navigation.NavigationEventArgs e)
        {
            IDictionary<string, string> queryString = this.NavigationContext.QueryString;
            var playlist = new ObservableCollection<PlaylistItem>();
            PlaylistItem playlistItem = new PlaylistItem()
            {
                DeliveryMethod = Microsoft.SilverlightMediaFramework.Plugins.Primitives.DeliveryMethods.AdaptiveStreaming,
                MediaAssetId = "SSMESampleContent",
            };

            if (queryString.ContainsKey("LicenseServerURI"))
            {
                var licenseAcquirer = new Uri(queryString["LicenseServerURI"], UriKind.RelativeOrAbsolute);
            }

            if (queryString.ContainsKey("SourceURI"))
            {
                var source = new Uri(queryString["SourceURI"], UriKind.RelativeOrAbsolute);
                playlistItem.MediaSource = source;
                playlist.Add(playlistItem);
                Player.Playlist = playlist;
            }
            else
            {
                System.Diagnostics.Debug.Assert(false, "FullScreenPlayer.OnNavigatedTo: SourceURI is not set.");
                NavigationService.GoBack();
            }

            base.OnNavigatedTo(e);
        }

        #endregion

        #region Event Handlers

        private void Player_MediaEnded(object sender, EventArgs e)
        {
            if (NavigationService.CanGoBack)
            {
                NavigationService.GoBack();
            }
        }

        private void FullScreenPlayer_GamePadButtonDown(object sender, GamePadButtonEventArgs e)
        {
            if (e.Button == GamePadButton.X)
            {
                if (NavigationService.CanGoBack)
                {
                    NavigationService.GoBack();
                }
            }
        }

        #endregion        

    }
}
