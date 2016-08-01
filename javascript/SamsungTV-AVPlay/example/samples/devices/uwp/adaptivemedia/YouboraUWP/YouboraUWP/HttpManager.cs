using System;
using System.Collections.Generic;
using System.Net.Http;
using Windows.Data.Json;

namespace YouboraUWP
{
    class HttpManager
    {
        //The HTTP Client used to send request
        private HttpClient httpClient = new HttpClient();
        //Configuration object fill by the Fast Data call
        private ConfigurationBean configuration = null;
        //Youbora Metadata object
        private YouboraMetadata metadata;
        //list to store the request while there's no configuration
        private List<Request> pendingRequests = new List<Request>();
        //player variables:
        private double duration;
        private double currentPosition;
        private long bitrate = -1;
        private long lastPingSent = 0;
        //Timers:
        private System.Threading.Timer pingTimer;
        //Smartswitch variables
        private bool isBalanced = false;
        //static variables
        private String dataUrl = "http://nqs.nice264.com/data?pluginVersion=" + Youbora.version + "&outputformat=jsonp";
        private string CODE = "code";
        private string PINGTIME = "pingTime";
        private string SYSTEM = "system";
        //resume
        private bool resumed = false;

        //Getters & Setters
        public YouboraMetadata Metadata
        {
            get
            {
                return metadata;
            }

            set
            {
                metadata = value;
            }
        }
        public double Duration
        {
            get
            {
                return duration;
            }

            set
            {
                duration = value;
            }
        }
        public double CurrentPosition
        {
            get
            {
                return currentPosition;
            }

            set
            {
                currentPosition = value;
            }
        }
        public long Bitrate
        {
            get
            {
                return bitrate;
            }

            set
            {
                bitrate = value;
            }
        }

        public HttpClient HttpClient
        {
            get
            {
                return httpClient;
            }

            set
            {
                httpClient = value;
            }
        }

        public bool Resumed
        {
            get
            {
                return resumed;
            }

            set
            {
                resumed = value;
            }
        }

        //Analytics Calls:
        public async void GetData(String systemCode)
        {
            try
            {
                dataUrl += "&system=" + systemCode;
                System.Diagnostics.Debug.WriteLine("calling data @ " + dataUrl);

                var response = await HttpClient.GetAsync(dataUrl);
                //will throw an exception if not successful
                response.EnsureSuccessStatusCode();
                string content = await response.Content.ReadAsStringAsync();
                int startIndex = content.IndexOf("{");
                int lastIndex = content.Length - 1;
                content = content.Substring(startIndex, lastIndex - startIndex);
                JsonObject jsonObject = JsonObject.Parse(content);
                JsonObject conf = jsonObject.GetNamedObject("q");
                string host = conf.GetNamedString("h");

                //TODO: REMOVE
                /*host = "192.168.1.49:8080";*/

                string pingtime = conf.GetNamedString("pt");
                string code = conf.GetNamedString("c");
                System.Diagnostics.Debug.WriteLine("Current configuration => host = " + host + ", pt = " + pingtime + ", code=" + code);
                ConfigurationBean c = new ConfigurationBean();
                c.Code = code;
                c.Host = host;
                c.PingTime = Int32.Parse(pingtime);
                c.SystemCode = systemCode;
                this.configuration = c;

                //If there are some pending requests, send them!
                foreach (Request req in pendingRequests)
                {
                    req.Parameters[CODE] = c.Code;
                    req.Parameters[PINGTIME] = c.PingTime.ToString();
                    req.Parameters[SYSTEM] = c.SystemCode;
                    req.Host = c.Host;

                    SendRequest(req);
                }
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine("Exception: " + e);
                throw;
            }
        }
        public void SendStart(String resource, int duration)
        {
            //resource = Uri.EscapeDataString(resource);
            string transcode = Uri.EscapeDataString(metadata.Transaction != null ? metadata.Transaction : "");
            Boolean live = metadata.Live;
            Dictionary<String, Object> properties = metadata.Properties;
            string propertiesJson = YouboraUtils.toJson(properties).ToString();
            propertiesJson = Uri.EscapeDataString(propertiesJson);
            string user = Uri.EscapeDataString(metadata.User);

            string referer = "";//TODO: What to do with this?
            string totalBytes = "0"; //TODO: What to do with this?
            string nodeHost = "";  //TODO: What to do with this?
            string nodeType = "";  //TODO: What to do with this?

            string pluginVersion = Youbora.version;

            string p1 = Uri.EscapeDataString(metadata.Param1);
            string p2 = Uri.EscapeDataString(metadata.Param2);
            string p3 = Uri.EscapeDataString(metadata.Param3);
            string p4 = Uri.EscapeDataString(metadata.Param4);
            string p5 = Uri.EscapeDataString(metadata.Param5);
            string p6 = Uri.EscapeDataString(metadata.Param6);
            string p7 = Uri.EscapeDataString(metadata.Param7);
            string p8 = Uri.EscapeDataString(metadata.Param8);
            string p9 = Uri.EscapeDataString(metadata.Param9);
            string p10 = Uri.EscapeDataString(metadata.Param10);

            string cdn = Uri.EscapeDataString(metadata.Cdn);
            string isp = Uri.EscapeDataString(metadata.Isp);
            string ip = Uri.EscapeDataString(metadata.Ip);


            Request r = PrepareRequest("/start");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            r.Parameters.Add("resource", Uri.EscapeDataString(resource));
            r.Parameters.Add(SYSTEM, configuration != null ? configuration.SystemCode : "");
            r.Parameters.Add("transcode", transcode);
            r.Parameters.Add("live", live.ToString().ToLower());
            r.Parameters.Add("properties", "");
            r.Parameters.Add("user", user);
            r.Parameters.Add("referer", referer);
            r.Parameters.Add("totalBytes", totalBytes);
            r.Parameters.Add(PINGTIME, configuration != null ? configuration.PingTime.ToString() : "");
            r.Parameters.Add("pluginVersion", pluginVersion);
            r.Parameters.Add("duration", duration.ToString());
            r.Parameters.Add("nodeHost", nodeHost);
            r.Parameters.Add("nodeType", nodeType);
            r.Parameters.Add("param13", isBalanced.ToString().ToLower());
            r.Parameters.Add("isResumed", Resumed ? "1" : "0");
            r.Parameters.Add("hastitle", "true");


            //optional values
            if (p1 != null && p1.Equals("") == false)
            {
                r.Parameters.Add("param1", p1);
            }
            if (p2 != null && p2.Equals("") == false)
            {
                r.Parameters.Add("param2", p2);
            }
            if (p3 != null && p3.Equals("") == false)
            {
                r.Parameters.Add("param3", p3);
            }
            if (p4 != null && p4.Equals("") == false)
            {
                r.Parameters.Add("param4", p4);
            }
            if (p5 != null && p5.Equals("") == false)
            {
                r.Parameters.Add("param5", p5);
            }
            if (p6 != null && p6.Equals("") == false)
            {
                r.Parameters.Add("param6", p6);
            }
            if (p7 != null && p7.Equals("") == false)
            {
                r.Parameters.Add("param7", p7);
            }
            if (p8 != null && p8.Equals("") == false)
            {
                r.Parameters.Add("param8", p8);
            }
            if (p9 != null && p9.Equals("") == false)
            {
                r.Parameters.Add("param9", p9);
            }
            if (p10 != null && p10.Equals("") == false)
            {
                r.Parameters.Add("param10", p10);
            }

            if (cdn != null && cdn.Equals("") == false)
            {
                r.Parameters.Add("cdn", cdn);
            }
            if (isp != null && isp.Equals("") == false)
            {
                r.Parameters.Add("isp", isp);
            }
            if (ip != null && ip.Equals("") == false)
            {
                r.Parameters.Add("ip", ip);
            }

            SendRequest(r);

            //Start sending PINGS
            if (configuration != null)
            {
                StartPingTimer();
            }
        }
        public void SendJoinTime(long time)
        {
            Request r = PrepareRequest("/joinTime");


            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            r.Parameters.Add("time", time.ToString());

            int cur = (int)CurrentPosition;
            r.Parameters.Add("eventTime", cur.ToString());
            if (Duration > 0)
            {
                int dur = (int)Duration;
                r.Parameters.Add("mediaDuration", dur.ToString());
            }

            SendRequest(r);
        }
        public void SendPing(object state)
        {
            Request r = PrepareRequest("/ping");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            r.Parameters.Add(PINGTIME, configuration != null ? configuration.PingTime.ToString() : "");
            int c = (int)currentPosition;
            r.Parameters.Add("time", c.ToString());
            r.Parameters.Add("bitrate", Bitrate.ToString());

            long now = YouboraUtils.now();
            if (lastPingSent > 0)
            {

                long diffTime = now - lastPingSent;
                r.Parameters.Add("diffTime", diffTime.ToString());
            }
            else if (lastPingSent == 0)
            {
                long diffTime = now - lastPingSent;
                r.Parameters.Add("diffTime", "0");
            }
            lastPingSent = now;

            SendRequest(r);
        }
        public void StartPingTimer()
        {
            System.Threading.TimerCallback TimerDelegate = new System.Threading.TimerCallback(SendPing);
            pingTimer = new System.Threading.Timer(TimerDelegate, null, 0, configuration.PingTime * 1000);
        }
        public void StopPingTimer()
        {
            pingTimer.Dispose();
        }
        public void SendStop()
        {
            Request r = PrepareRequest("/stop");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");

            long now = YouboraUtils.now();
            if (lastPingSent > 0)
            {

                long diffTime = now - lastPingSent;
                r.Parameters.Add("diffTime", diffTime.ToString());
            }
            else if (lastPingSent == 0)
            {
                long diffTime = now - lastPingSent;
                r.Parameters.Add("diffTime", "0");
            }
            lastPingSent = now;

            SendRequest(r);

            //Stop sending PINGS
            if (pingTimer != null)
                pingTimer.Dispose();
        }
        public void SendPause()
        {
            Request r = PrepareRequest("/pause");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            SendRequest(r);
        }
        public void SendResume()
        {
            Request r = PrepareRequest("/resume");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            SendRequest(r);
        }
        public void SendError(String resource, int duration, String errorCode, String errorMsg)
        {
            //resource = Uri.EscapeDataString(resource);
            string transcode = Uri.EscapeDataString(metadata.Transaction != null ? metadata.Transaction : "");
            Boolean live = metadata.Live;
            Dictionary<String, Object> properties = metadata.Properties;
            string propertiesJson = YouboraUtils.toJson(properties).ToString();
            propertiesJson = Uri.EscapeDataString(propertiesJson);
            string user = Uri.EscapeDataString(metadata.User);

            string referer = "";//TODO: What to do with this?
            string totalBytes = "0"; //TODO: What to do with this?
            string nodeHost = "";  //TODO: What to do with this?
            string nodeType = "";  //TODO: What to do with this?

            string pluginVersion = Youbora.version;

            string p1 = Uri.EscapeDataString(metadata.Param1);
            string p2 = Uri.EscapeDataString(metadata.Param2);
            string p3 = Uri.EscapeDataString(metadata.Param3);
            string p4 = Uri.EscapeDataString(metadata.Param4);
            string p5 = Uri.EscapeDataString(metadata.Param5);
            string p6 = Uri.EscapeDataString(metadata.Param6);
            string p7 = Uri.EscapeDataString(metadata.Param7);
            string p8 = Uri.EscapeDataString(metadata.Param8);
            string p9 = Uri.EscapeDataString(metadata.Param9);
            string p10 = Uri.EscapeDataString(metadata.Param10);

            string cdn = Uri.EscapeDataString(metadata.Cdn);
            string isp = Uri.EscapeDataString(metadata.Isp);
            string ip = Uri.EscapeDataString(metadata.Ip);


            Request r = PrepareRequest("/error");

            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            r.Parameters.Add("resource", Uri.EscapeDataString(resource));
            r.Parameters.Add(SYSTEM, configuration != null ? configuration.SystemCode : "");
            r.Parameters.Add("transcode", transcode);
            r.Parameters.Add("live", live.ToString().ToLower());
            r.Parameters.Add("properties", "");
            r.Parameters.Add("user", user);
            r.Parameters.Add("referer", referer);
            r.Parameters.Add("totalBytes", totalBytes);
            r.Parameters.Add(PINGTIME, configuration != null ? configuration.PingTime.ToString() : "");
            r.Parameters.Add("pluginVersion", pluginVersion);
            r.Parameters.Add("duration", duration.ToString());
            r.Parameters.Add("nodeHost", nodeHost);
            r.Parameters.Add("nodeType", nodeType);
            r.Parameters.Add("param13", isBalanced.ToString().ToLower());
            r.Parameters.Add("isResumed", Resumed ? "1" : "0");
            r.Parameters.Add("hastitle", "true");

            r.Parameters.Add("errorCode", errorCode);
            r.Parameters.Add("msg", errorMsg);


            //optional values
            if (p1 != null && p1.Equals("") == false)
            {
                r.Parameters.Add("param1", p1);
            }
            if (p2 != null && p2.Equals("") == false)
            {
                r.Parameters.Add("param2", p2);
            }
            if (p3 != null && p3.Equals("") == false)
            {
                r.Parameters.Add("param3", p3);
            }
            if (p4 != null && p4.Equals("") == false)
            {
                r.Parameters.Add("param4", p4);
            }
            if (p5 != null && p5.Equals("") == false)
            {
                r.Parameters.Add("param5", p5);
            }
            if (p6 != null && p6.Equals("") == false)
            {
                r.Parameters.Add("param6", p6);
            }
            if (p7 != null && p7.Equals("") == false)
            {
                r.Parameters.Add("param7", p7);
            }
            if (p8 != null && p8.Equals("") == false)
            {
                r.Parameters.Add("param8", p8);
            }
            if (p9 != null && p9.Equals("") == false)
            {
                r.Parameters.Add("param9", p9);
            }
            if (p10 != null && p10.Equals("") == false)
            {
                r.Parameters.Add("param10", p10);
            }

            if (cdn != null && cdn.Equals("") == false)
            {
                r.Parameters.Add("cdn", cdn);
            }
            if (isp != null && isp.Equals("") == false)
            {
                r.Parameters.Add("isp", isp);
            }
            if (ip != null && ip.Equals("") == false)
            {
                r.Parameters.Add("ip", ip);
            }

            SendRequest(r);

            //Send STOP
            SendStop();
        }
        public void SendBuffer(long duration, bool seek)
        {
            Request r = null;
            if (seek == false)
            {
                r = PrepareRequest("/bufferUnderrun");
            }
            else
            {
                r = PrepareRequest("/seek");
            }
            r.Parameters.Add(CODE, configuration != null ? configuration.Code : "");
            int c = (int)currentPosition;
            r.Parameters.Add("time", c.ToString());
            r.Parameters.Add("duration", duration.ToString());
            SendRequest(r);
        }
        //UTILS
        private Request PrepareRequest(String operation)
        {
            Request r = new Request();
            r.Host = configuration != null ? configuration.Host : "";
            r.Path = operation;
            r.Parameters = new Dictionary<string, string>();
            return r;
        }
        private async void SendRequest(Request request)
        {


            request.Method = metadata.Https ? "https://" : "http://";

            Boolean sendNow = true;
            if (configuration == null)
            {
                sendNow = false;
            }
            if (sendNow == false)
            {
                //save in the pending list to send it as soon as code is available
                System.Diagnostics.Debug.WriteLine("Add " + request.Path + " to pending requests");
                pendingRequests.Add(request);
            }
            else
            {
                //construct URL and send it
                string url = request.Method + request.Host + request.Path;
                //string url = request.Method + "192.168.1.36:8080" + request.Path;
                bool first = true;
                foreach (KeyValuePair<String, String> parameter in request.Parameters)
                {
                    if (first)
                    {
                        first = false;
                        url += "?";
                    }
                    else
                    {
                        url += "&";
                    }
                    url += parameter.Key + "=" + parameter.Value;
                }
                System.Diagnostics.Debug.WriteLine("Sending GET " + url);
                try
                {
                    await HttpClient.GetAsync(url);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Exception: " + ex);
                }


                //if send /start, start sending PINGs
                if (request.Path == "/start" && pingTimer == null)
                {
                    StartPingTimer();
                }
            }

        }


    }

    class Request
    {
        private String method;
        private String host;
        private String path;
        private Dictionary<String, String> parameters;

        public string Method
        {
            get
            {
                return method;
            }

            set
            {
                method = value;
            }
        }

        public Dictionary<string, string> Parameters
        {
            get
            {
                return parameters;
            }

            set
            {
                parameters = value;
            }
        }

        public string Host
        {
            get
            {
                return host;
            }

            set
            {
                host = value;
            }
        }

        public string Path
        {
            get
            {
                return path;
            }

            set
            {
                path = value;
            }
        }
    }


    class ConfigurationBean
    {
        private string host;
        private int pingTime;
        private String code;
        private string systemCode;

        public string Host
        {
            get
            {
                return host;
            }

            set
            {
                host = value;
            }
        }

        public int PingTime
        {
            get
            {
                return pingTime;
            }

            set
            {
                pingTime = value;
            }
        }

        public string Code
        {
            get
            {
                return code;
            }

            set
            {
                code = value;
            }
        }

        public string SystemCode
        {
            get
            {
                return systemCode;
            }

            set
            {
                systemCode = value;
            }
        }
    }
}
