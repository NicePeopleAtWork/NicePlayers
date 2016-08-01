using System;
using System.Collections.Generic;
using Windows.Media.Streaming.Adaptive;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Media;

namespace YouboraUWP
{
    public class Youbora
    {
        public static string version = "2.0.0_uwp";
        private HttpManager httpManager = new HttpManager();
        private PCYouboraManager pcYouboraManager = new PCYouboraManager();
        private Windows.UI.Xaml.Controls.MediaElement player;
        private DispatcherTimer _timer;
        private long firstPlayTime = 0;
        private MediaElementState lastState = MediaElementState.Opening;
        private String resource;
        private int duration;
        private AdaptiveMediaSource ams;
        private long bufferStart;
        private long seekDetectionThresSeconds = 2;
        private long lastSeek = 0;

        private YouboraResumeConfiguration resumeConf;
        private YouboraConcurrencyConfiguration concurrencyConf;

        public static String YOUBORA_RESUME_CONF = "YOUBORA_RESUME_CONF";
        public static String YOUBORA_CONCURRENCY_CONF = "YOUBORA_CONCURRENCY_CONF";

        public void SetAdaptativeMediaSource(AdaptiveMediaSource ams, Uri resourceUri)
        {
            this.ams = ams;
            if (this.ams != null)
            {
                this.ams.PlaybackBitrateChanged += Youbora_PlaybackBitrateChange;
                this.httpManager.Bitrate = this.ams.InitialBitrate;
            }
            this.resource = resourceUri.ToString();
        }

        public void Init(string systemCode, Dictionary<string, object> pluginConfiguration)
        {
            System.Diagnostics.Debug.WriteLine("Youbora init!");
            System.Diagnostics.Debug.WriteLine("parameters: " + systemCode + " configuration: " + pluginConfiguration);
            //will call /data
            httpManager.GetData(systemCode);
            if (pluginConfiguration != null)
            {
                object ro = null;
                object co = null;
                bool resultResume = pluginConfiguration.TryGetValue(YOUBORA_RESUME_CONF, out ro);
                if (resultResume)
                {
                    resumeConf = (YouboraResumeConfiguration)ro;
                    pcYouboraManager.StartResume(resumeConf, httpManager);
                }
                bool resultConcurrency = pluginConfiguration.TryGetValue(YOUBORA_CONCURRENCY_CONF, out co);
                if (resultConcurrency)
                {
                    concurrencyConf = (YouboraConcurrencyConfiguration)co;
                    pcYouboraManager.StartConcurrency(concurrencyConf, httpManager);
                }
            }
        }

        public void Init(string systemCode)
        {
            Init(systemCode, null);
        }

        public void CreateSession(Windows.UI.Xaml.Controls.MediaElement me, YouboraMetadata metadata)
        {
            this.player = me;
            //setup listeners
            me.MediaOpened += Youbora_MediaOpened;
            me.MediaEnded += Youbora_MediaEnded;
            me.CurrentStateChanged += Youbora_CurrentStateChange;
            me.MediaFailed += Youbora_MediaFailed;

            //send start directly
            httpManager.Metadata = metadata;
            if (me.Source != null)
            {
                this.resource = me.Source.ToString();
            }

            this.duration = (int)me.NaturalDuration.TimeSpan.TotalSeconds;
            httpManager.SendStart(resource, duration);
            pcYouboraManager.StartPlayTimeTimer();
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromSeconds(0.25);
            StartTimer();

            firstPlayTime = YouboraUtils.now();
        }

        public void Error(YouboraMetadata metadata, String errorCode, String errorMessage)
        {
            httpManager.Metadata = metadata;
            httpManager.SendError(this.resource, this.duration, errorCode, errorMessage);

        }

        public void Stop()
        {
            StopTimer();
            httpManager.StopPingTimer();
            pcYouboraManager.StopConcurrency();
            pcYouboraManager.StopResume();
        }

        /*
        Internal methods
        */
        private void _positionDurationTick(object sender, object e)
        {
            if (Math.Abs(player.Position.TotalSeconds - httpManager.CurrentPosition) > seekDetectionThresSeconds)
            {
                lastSeek = YouboraUtils.now();
                System.Diagnostics.Debug.WriteLine("Seek detected @ " + lastSeek);
            }
            httpManager.Duration = player.NaturalDuration.TimeSpan.TotalSeconds;
            httpManager.CurrentPosition = player.Position.TotalSeconds;
        }

        private void StartTimer()
        {
            _timer.Tick += _positionDurationTick;
            _timer.Start();
        }

        private void StopTimer()
        {
            _timer.Stop();
            _timer.Tick -= _positionDurationTick;
        }

        private void Youbora_MediaOpened(object sender, RoutedEventArgs e)
        {

            // Handle open media event
            _positionDurationTick(null, null);
            long joinTime = YouboraUtils.now() - firstPlayTime;
            System.Diagnostics.Debug.WriteLine("Media Opened time" + YouboraUtils.now());
            System.Diagnostics.Debug.WriteLine("inner youbora media opened join time= " + joinTime);

            httpManager.SendJoinTime(joinTime);
        }


        private void Youbora_MediaEnded(object sender, RoutedEventArgs e)
        {
            httpManager.SendStop();
            StopTimer();
            pcYouboraManager.StopResume();
            pcYouboraManager.StopConcurrency();
        }

        private void Youbora_CurrentStateChange(object sender, RoutedEventArgs e)
        {
            if (this.player.CurrentState == MediaElementState.Paused && this.lastState == MediaElementState.Playing)
            {
                //Send pause
                httpManager.SendPause();
            }
            if (this.player.CurrentState == MediaElementState.Playing && this.lastState == MediaElementState.Paused)
            {
                //Send pause
                httpManager.SendResume();
            }
            if (this.player.CurrentState == MediaElementState.Buffering)
            {
                //Start buffering
                System.Diagnostics.Debug.WriteLine("START BUFFERING");
                bufferStart = YouboraUtils.now();

            }
            if (this.lastState == MediaElementState.Buffering && this.player.CurrentState == MediaElementState.Playing)
            {
                //end buffering
                long now = YouboraUtils.now();
                long bufferTime = now - bufferStart;

                System.Diagnostics.Debug.WriteLine("END BUFFERING. BUFFER TIME => " + bufferTime + "\nLAST SEEK: " + lastSeek + "\nINIT BUFFER: " + bufferStart + "\nINIT BUFFER - LAST SEEK:" + (bufferStart - lastSeek));

                if (bufferStart - lastSeek > 2000)
                {
                    httpManager.SendBuffer(bufferTime, false);
                    /*System.Diagnostics.Debug.WriteLine("END BUFFERING. BUFFER TIME => " + bufferTime);*/
                }
                else
                {
                    httpManager.SendBuffer(bufferTime, true);
                    /*System.Diagnostics.Debug.WriteLine("END SEEK. BUFFER TIME => " + bufferTime);*/
                }

            }

            this.lastState = this.player.CurrentState;
        }

        private void Youbora_MediaFailed(object sender, RoutedEventArgs e)
        {
            ExceptionRoutedEventArgs ere = (ExceptionRoutedEventArgs)e;
            System.Diagnostics.Debug.WriteLine(ere.ErrorMessage);
            string errorMessageOriginal = ere.ErrorMessage;
            bool sentParsed = false;
            try
            {
                string[] splitError = errorMessageOriginal.Split(':');
                string parsedErrorMessage = splitError[0];
                string[] parsedErrorCodeArr = splitError[1].Split('-');
                string parsedErrorCode = parsedErrorCodeArr[1].Trim();
                sentParsed = true;
                httpManager.SendError(this.resource, this.duration, parsedErrorCode, parsedErrorMessage);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }
            if (sentParsed == false)
            {
                httpManager.SendError(this.resource, this.duration, errorMessageOriginal, errorMessageOriginal);
            }
            StopTimer();
        }

        private void Youbora_PlaybackBitrateChange(AdaptiveMediaSource sender, AdaptiveMediaSourcePlaybackBitrateChangedEventArgs args)
        {
            httpManager.Bitrate = args.NewValue;
        }

    }
}
