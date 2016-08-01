using System;
using System.Collections.Generic;

namespace YouboraUWP
{
    public class YouboraMetadata
    {
        private String resource="";
        private String resourceError="";
        private Boolean live=false;
        private String streamerType="";
        private String user="";
        private String transaction="";
        private Dictionary<String, Object> properties = new Dictionary<string, object>();
        private Dictionary<String, String> mediaMetadata = new Dictionary<string, string>();
        private Boolean isHashTitle = true;
        private String isp="";
        private String cdn="";
        private String ip="";
        private Boolean playHeadSeekDetection = true;
        private String param1 = "";
        private String param2 = "";
        private String param3 = "";
        private String param4 = ""; 
        private String param5 = "";
        private String param6 = "";
        private String param7 = "";
        private String param8 = "";
        private String param9 = "";
        private String param10 = "";
        private bool https=false;

        public string Resource
        {
            get
            {
                return resource;
            }

            set
            {
                resource = value;
            }
        }

        public string ResourceError
        {
            get
            {
                return resourceError;
            }

            set
            {
                resourceError = value;
            }
        }

        public bool Live
        {
            get
            {
                return live;
            }

            set
            {
                live = value;
            }
        }

        public string StreamerType
        {
            get
            {
                return streamerType;
            }

            set
            {
                streamerType = value;
            }
        }

        public string User
        {
            get
            {
                return user;
            }

            set
            {
                user = value;
            }
        }

        public string Transaction
        {
            get
            {
                return transaction;
            }

            set
            {
                transaction = value;
            }
        }

        public Dictionary<string, object> Properties
        {
            get
            {
                return properties;
            }

            set
            {
                properties = value;
            }
        }

        public Dictionary<string, string> MediaMetadata
        {
            get
            {
                return mediaMetadata;
            }

            set
            {
                mediaMetadata = value;
            }
        }

        public bool IsHashTitle
        {
            get
            {
                return isHashTitle;
            }

            set
            {
                isHashTitle = value;
            }
        }

        public string Isp
        {
            get
            {
                return isp;
            }

            set
            {
                isp = value;
            }
        }

        public string Cdn
        {
            get
            {
                return cdn;
            }

            set
            {
                cdn = value;
            }
        }

        public string Ip
        {
            get
            {
                return ip;
            }

            set
            {
                ip = value;
            }
        }

        public bool PlayHeadSeekDetection
        {
            get
            {
                return playHeadSeekDetection;
            }

            set
            {
                playHeadSeekDetection = value;
            }
        }

        public string Param1
        {
            get
            {
                return param1;
            }

            set
            {
                param1 = value;
            }
        }

        public string Param2
        {
            get
            {
                return param2;
            }

            set
            {
                param2 = value;
            }
        }

        public string Param3
        {
            get
            {
                return param3;
            }

            set
            {
                param3 = value;
            }
        }

        public string Param4
        {
            get
            {
                return param4;
            }

            set
            {
                param4 = value;
            }
        }

        public string Param5
        {
            get
            {
                return param5;
            }

            set
            {
                param5 = value;
            }
        }

        public string Param6
        {
            get
            {
                return param6;
            }

            set
            {
                param6 = value;
            }
        }

        public string Param7
        {
            get
            {
                return param7;
            }

            set
            {
                param7 = value;
            }
        }

        public string Param8
        {
            get
            {
                return param8;
            }

            set
            {
                param8 = value;
            }
        }

        public string Param9
        {
            get
            {
                return param9;
            }

            set
            {
                param9 = value;
            }
        }

        public string Param10
        {
            get
            {
                return param10;
            }

            set
            {
                param10 = value;
            }
        }

        public bool Https
        {
            get
            {
                return https;
            }

            set
            {
                https = value;
            }
        }
    }
}
