//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using SDKTemplate;
using YouboraUWP;
using System.Collections.Generic;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace AdaptiveStreaming
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class Scenario1 : Page
    {
        private MainPage rootPage;
        private bool isMediaOpened = false;
        private int resumePosition = -1;

        public Scenario1()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            rootPage = MainPage.Current;
        }
        
        private void btnPlay_Click(object sender, RoutedEventArgs e)
        {
            System.Uri manifest = new System.Uri(txtInputURL.Text);
            mePlayer.Source = manifest;
            System.Diagnostics.Debug.WriteLine("clicked play!");


            mePlayer.MediaEnded += Media_MediaEnded;
            mePlayer.MediaOpened += Media_MediaOpened;
            mePlayer.MediaFailed += Media_MediaFailed;
            mePlayer.CurrentStateChanged += Callback_State_Changed;
            mePlayer.SeekCompleted += Callback_Seek_Completed;

            System.Diagnostics.Debug.WriteLine("registered callbacks!");

            Youbora y = new Youbora();

            Dictionary<string, object> configuration = new Dictionary<string, object>();

            YouboraResumeConfiguration yrc = new YouboraResumeConfiguration();
            yrc.ContentId = "contentId";
            yrc.ResumeDelegate += ResumeDelegate;
            yrc.UserId = "userID";

            YouboraConcurrencyConfiguration ycc = new YouboraConcurrencyConfiguration();
            ycc.AccountCode = "ooyalaHTEmpty";
            ycc.ConcurrencyCode = "concurrencyCode";
            ycc.ConcurrencyDelegate += ConcurrencyDelegate;
            ycc.ConcurrencyMaxCount = 1;
            ycc.IpMode = false;

            configuration.Add(Youbora.YOUBORA_CONCURRENCY_CONF, ycc);
            configuration.Add(Youbora.YOUBORA_RESUME_CONF, yrc);

            y.Init("ooyalaHTEmpty",configuration);
            YouboraMetadata metadata = new YouboraMetadata();
            metadata.Https = false;
            metadata.Live = false;
            y.CreateSession(mePlayer, metadata);
            
        }
        void ResumeDelegate(int resume)
        {
            System.Diagnostics.Debug.WriteLine("****** RESUME DELEGATE : "+resume+" ******");
            if (isMediaOpened)
            {
                mePlayer.Position = new System.TimeSpan(0, 0, resume);
            }
            else
            {
                resumePosition = resume;
            }
        }

        void ConcurrencyDelegate()
        {
            System.Diagnostics.Debug.WriteLine("****** RECEIVED CONCURRENCY DELEGATE. MUST DISCONNECT NOW ******");
            
        }

        void Media_MediaFailed(object sender, ExceptionRoutedEventArgs e)
        {
            // Handle failed media event
            System.Diagnostics.Debug.WriteLine("Media_MediaFailed!");
        }

        void Media_MediaOpened(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("Media_MediaOpened!");
            // Handle open media event
            isMediaOpened = true;
            if(resumePosition > -1)
            {
                mePlayer.Position = new System.TimeSpan(0,0,resumePosition);
            }
        }

        void Media_MediaEnded(object sender, RoutedEventArgs e)
        {
            // Handle media ended event
            System.Diagnostics.Debug.WriteLine("Media_MediaEnded!");
        }

        void Callback_State_Changed(object sender, RoutedEventArgs e)
        {
            // Handle open media event
            System.Diagnostics.Debug.WriteLine("Callback_State_Changed! Current state: "+ mePlayer.CurrentState);
        }
        void Callback_Seek_Completed(object sender, RoutedEventArgs e)
        {
            // Handle open media event
            System.Diagnostics.Debug.WriteLine("Callback_Seek_Completed!" );
        }

    }
}
