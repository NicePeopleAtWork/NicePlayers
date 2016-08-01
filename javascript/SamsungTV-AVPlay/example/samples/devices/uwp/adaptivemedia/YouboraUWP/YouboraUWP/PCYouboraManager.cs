using System;
using System.Net.Http;
using System.Threading;

namespace YouboraUWP
{
    class PCYouboraManager
    {
        //Resume
        private YouboraResumeConfiguration resume;
        private int resumePeriod = 6000;
        private System.Threading.Timer playTimeTimer;
        //Concurrency
        private YouboraConcurrencyConfiguration concurrency;
        private int cPingPeriod = 10000;
        private System.Threading.Timer cpingTimer;
        private long sessionId;

        //Util to get variables
        private HttpManager httpManager;
        internal YouboraResumeConfiguration Resume
        {
            get
            {
                return resume;
            }

            set
            {
                resume = value;
            }
        }
        internal YouboraConcurrencyConfiguration Concurrency
        {
            get
            {
                return concurrency;
            }

            set
            {
                concurrency = value;
            }
        }
        //RESUME SERVICE CALLS
        public void StartResume(YouboraResumeConfiguration yrc, HttpManager httpManager)
        {
            this.resume = yrc;
            this.httpManager = httpManager;
            SendPCResume();
        }
        public void StopResume()
        {
            StopPlayTimeTimer();
        }
        private async void SendPCPlayTime(object state)
        {
            int random = new Random().Next();
            String url = "http://pc.youbora.com/playTime?contentId=" + resume.ContentId + "&playTime=" + httpManager.CurrentPosition.ToString() + "&random=" + random + "&userId=" + resume.UserId;
            System.Diagnostics.Debug.WriteLine("Sending GET " + url);
            await httpManager.HttpClient.GetAsync(url);
        }
        private async void SendPCResume()
        {
            int random = new Random().Next();
            String url = "http://pc.youbora.com/resume?contentId=" + resume.ContentId + "&random=" + random + "&userId=" + resume.UserId;
            System.Diagnostics.Debug.WriteLine("Sending GET " + url);
            HttpResponseMessage response = await httpManager.HttpClient.GetAsync(url);
            HttpContent content = response.Content;
            string result = await content.ReadAsStringAsync();
            int duration = int.Parse(result);
            //CALL to delegate!
            if (resume.ResumeDelegate != null)
            {
                resume.ResumeDelegate(duration);
            }
        }
        public void StartPlayTimeTimer()
        {
            System.Threading.TimerCallback TimerDelegate = new System.Threading.TimerCallback(SendPCPlayTime);
            playTimeTimer = new System.Threading.Timer(TimerDelegate, null, 0, resumePeriod);
        }
        private void StopPlayTimeTimer()
        {
            if (playTimeTimer != null) { playTimeTimer.Dispose(); playTimeTimer = null; }
        }
        //CONCURRENCY SERVICE CALL
        private async void SendCPing(object state)
        {
            int random = new Random().Next();
            String url = "http://pc.youbora.com/cping?concurrencyCode=" + concurrency.ConcurrencyCode + "&concurrencyMaxCount=" + concurrency.ConcurrencyMaxCount.ToString() + "&ipMode=" + concurrency.IpMode.ToString() + "&accountCode=" + concurrency.AccountCode + "&random=" + random.ToString()+ "&concurrencySessionId="+this.sessionId.ToString();
            System.Diagnostics.Debug.WriteLine("Sending GET " + url);
            HttpResponseMessage response = await httpManager.HttpClient.GetAsync(url);
            HttpContent content = response.Content;
            string result = await content.ReadAsStringAsync();
            int resultInt = int.Parse(result);

            //CALL to delegate!
            if (concurrency.ConcurrencyDelegate != null && resultInt == 1)
            {
                concurrency.ConcurrencyDelegate();
            }
        }
        private void StartConcurrencyTimer()
        {
            System.Threading.TimerCallback TimerDelegate = new System.Threading.TimerCallback(SendCPing);
            cpingTimer = new System.Threading.Timer(TimerDelegate, null, 0, cPingPeriod);
        }
        private void StopConcurrencyTimer()
        {
            if (cpingTimer != null) { cpingTimer.Dispose(); cpingTimer = null; }

        }
        public void StartConcurrency(YouboraConcurrencyConfiguration ycc, HttpManager httpManager)
        {
            this.sessionId = YouboraUtils.getRandomSessionId();
            this.concurrency = ycc;
            this.httpManager = httpManager;
            StartConcurrencyTimer();
        }
        public void StopConcurrency()
        {
            StopConcurrencyTimer();
        }
    }
}
