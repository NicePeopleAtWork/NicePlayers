namespace Youbora.Analytics.Models.Common
{
    /// <summary>
    /// Global security settings.
    /// </summary>
    public class GlobalSettings
    {
        /// <summary>
        /// Define the server call timeout to apply to http petitions.
        /// </summary>
        public static int SERVER_TIMEOUT = 30000;

        /// <summary>
        /// URL for Youbora root domain.
        /// </summary>
        public static string BASE_URL = "http://nqs.nice264.com";

        /// <summary>
        /// URL for REST API.
        /// </summary>
        public static string DATA_URL = BASE_URL + "/data?";

        /// <summary>
        /// URL for REST API.
        /// </summary>
        public static string API_URL = "http://test-nqs.nice264.com";

        /// <summary>
        /// URL for Youbora Smartswitch domain.
        /// </summary>
        public static string SMARTSWITCH_URL = "http://smartswitch.youbora.com/?";
    }
}
