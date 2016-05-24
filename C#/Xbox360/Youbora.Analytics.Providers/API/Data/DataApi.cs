namespace Youbora.Analytics.Providers.API.Data
{
    using System.Text;
    using Models.Common;

    public class DataApi
    {
        /// <summary>
        /// Initializes the plugin parameters.    
        /// On player load
        /// 
        /// Usage Example:
        /// http://nqs.nice264.com/data?system=npawplug&pluginVersion=5.1.0_Xbox-360
        /// 
        /// </summary>
        /// <param name="system">Your Nice PeopleAtWork account code that indicates Youbora Analytics 
        /// which customer account you are sending the data to. This parameter will be provided by 
        /// NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support 
        /// Agent</param>
        /// <param name="pluginVersion">The version of the plugin in the format described below this table.
        /// This parameter lets you to have a version control of new deployed plugins and see which 
        /// users are using an older version (cached in the system), so you can force them to clean 
        /// their cache and download the new version</param>
        /// <returns>Query String</returns>
        public static string PlayerData(string system, string pluginVersion)
        {
            var queryUrl = new StringBuilder(GlobalSettings.DATA_URL);

            queryUrl.AppendFormat("system={0}&pluginVersion={1}&outputformat=jsonp", system, pluginVersion);

            return queryUrl.ToString();
        }
    }
}