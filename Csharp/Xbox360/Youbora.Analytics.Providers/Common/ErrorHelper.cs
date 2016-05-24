namespace Youbora.Analytics.Providers.Common
{
    public class ErrorHelper
    {
        /// <summary>
        /// Known error and the codes that must be sent to Youbora Analytics.
        /// </summary>
        /// <param name="errorCode">Error Code</param>
        /// <returns>Error Message</returns>
        public static string GertErrorDescription(string errorCode)
        {
            switch (errorCode)
            {
                case "9000":
                    return "UNKNOWN_ERROR";
                case "9001":
                    return "SECURITY_EXPIRED_TIME";
                case "9002":
                    return "SECUIRTY_INVALID_GEOIP";
                case "9003":
                    return "SECURITY_INVALID_IP";
                case "9004":
                    return "SECURITY_INVALID_TOKEN";
                case "9005":
                    return "SECURITY_CONCURRENT";
                case "9006":
                    return "SECURITY_INVALID_DEVICE";
                case "9007":
                    return "SECURITY_INVALID_HOSTNAME";
                case "9008":
                    return "SECURITY_DRM_UNDEFINED";
                case "9101":
                    return "DRM_ERROR_PROVIDER";
                case "9102":
                    return "DRM_SECURITY_TOKEN";
                case "9103":
                    return "DRM_SECURITY_EXPIRED_TIME";
                case "9104":
                    return "DRM_SECURITY_INVALID_TOKEN";
                case "9105":
                    return "DRM_SECURITY_INVALID_GEOIP";
                case "9106":
                    return "DRM_SECURITY_INVALID_IP";
                case "9107":
                    return "DRM_SECURITY_INVALID_DEVICE";
                case "9108":
                    return "DRM_INVALID_PARAMETERS";
            }

            return "UNKNOWN_ERROR";
        }
    }
}
