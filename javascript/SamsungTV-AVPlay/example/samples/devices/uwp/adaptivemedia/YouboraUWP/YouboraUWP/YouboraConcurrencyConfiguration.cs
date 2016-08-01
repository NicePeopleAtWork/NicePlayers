using System;

namespace YouboraUWP
{
    public class YouboraConcurrencyConfiguration
    {
        //CONCURRENCY
        // A delegate type for hooking up resume notification
        public delegate void ConcurrencyHandler();
        private event ConcurrencyHandler concurrencyDelegate;
        private String concurrencyCode;
        private int concurrencyMaxCount;
        private bool ipMode;
        private String accountCode;

        public ConcurrencyHandler ConcurrencyDelegate
        {
            get
            {
                return concurrencyDelegate;
            }
            set
            {
                concurrencyDelegate = value;
            }
        }

        public string ConcurrencyCode
        {
            get
            {
                return concurrencyCode;
            }

            set
            {
                concurrencyCode = value;
            }
        }

        public int ConcurrencyMaxCount
        {
            get
            {
                return concurrencyMaxCount;
            }

            set
            {
                concurrencyMaxCount = value;
            }
        }

        public bool IpMode
        {
            get
            {
                return ipMode;
            }

            set
            {
                ipMode = value;
            }
        }

        public string AccountCode
        {
            get
            {
                return accountCode;
            }

            set
            {
                accountCode = value;
            }
        }
    }
}
