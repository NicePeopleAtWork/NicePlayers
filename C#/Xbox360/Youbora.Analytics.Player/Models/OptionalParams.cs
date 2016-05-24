using System.Collections.Generic;
using System.Linq;
using System;

namespace Youbora.Analytics.Player.Models
{
    public class OptionalParams
    {
        #region Fields

        private Random _randomGenerator;

        #endregion

        public OptionalParams()
        {
            _randomGenerator = new Random();
        }

        #region Properties

        /// <summary>
        /// Indicates the CDN’s Node Host.
        /// </summary>
        public string NodeHost { get; set; }

        /// <summary>
        /// Indicates the CDN’s Node Type.
        /// </summary>
        public string NodeType { get; set; }

        /// <summary>
        /// Indicates if a resource has been balanced (0 = not balanced, 1 = balanced).
        /// </summary>
        public bool? IsBalanced { get; set; }

        /// <summary>
        /// Indicates if a view has been resumed (0 = not resumed, 1 = resumed).
        /// </summary>
        public bool? IsResumed { get; set; }

        /// <summary>
        /// View transaction code. This code has the meaning the customer wants to give it in order to identify this view inside the Youbora web portal.
        /// </summary>
        public string Transcode { get; set; }

        /// <summary>
        /// Code that indicates what CDN’s name must be shown for a view.
        /// </summary>
        public string Cdn { get; set; }

        /// <summary>
        /// Indicates the name of the user’s ISP.
        /// </summary>
        public string Isp { get; set; }

        /// <summary>
        /// Defines the user’s IP.
        /// </summary>
        public string Ip { get; set; }

        /// <summary>
        /// Custom Data. To apply custom real time filters to your set of analytics
        /// </summary>
        public Dictionary<string, string> CustomParams { get; set; }

        #endregion

        #region Methods

        public string GetQueryString()
        {
            var queryString = string.Empty;

            if (!string.IsNullOrEmpty(NodeHost))
                queryString += "&nodeHost=" + NodeHost;

            if (!string.IsNullOrEmpty(NodeType))
                queryString += "&nodeType=" + NodeType;

            if (IsBalanced != null)
                queryString += "&isBalanced=" + (IsBalanced.Value ? "1" : "0");

            if (IsResumed != null)
                queryString += "&isResumed=" + (IsResumed.Value ? "1" : "0");

            // Used to prevent request caching. This can be any random number (5-digit recommended)            
            queryString += "&randomNumber=" + _randomGenerator.Next(0,99999).ToString("D5");

            // This boolean parameter is an anti-resource collision system.             
            queryString += "&hashTitle=true";

            if (!string.IsNullOrEmpty(Transcode))
                queryString += "&transcode=" + Transcode;

            if (!string.IsNullOrEmpty(Cdn))
                queryString += "&cdn=" + Cdn;

            if (!string.IsNullOrEmpty(Isp))
                queryString += "&isp=" + Isp;

            if (!string.IsNullOrEmpty(Ip))
                queryString += "&ip=" + Ip;

            if (CustomParams != null)
                queryString = CustomParams.Aggregate(queryString,
                    (current, extraParam) => current + "&" + extraParam.Key + "=" + extraParam.Value);

            return queryString;
        }

        #endregion
    }
}
