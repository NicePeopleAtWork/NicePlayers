namespace Youbora.Analytics.Providers.API.Smartswitch
{
    using System.Text;
    using Models.Common;
    using System.Security.Cryptography;

    public class SmartswitchApi
    {
        /// <summary>
        /// Returns a JSON object with an array of different resource URLs sorted by the quality of experience they offer. 
        /// The first item on that list is the best URL and the last one is the worst.
        /// 
        /// Usage Example:
        /// http://smartswitch.youbora.com/?type=balance&systemcode=npawplug&zonecode=default&origincode=plOrigin&resource=%2Fmy_series1%2F2012%2F09%2F10%2F00001.mp4&niceNva=1400765784000&niceNvb=1398173784000&token=343a069a52e8f4fb16988a7036312670
        ///
        /// </summary>
        /// <param name="systemCode">Your Nice PeopleAtWork account code that indicates Youbora Smartswitch which customer account rules are going to be applied. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent.</param>
        /// <param name="originCode">Origin code configured in Smartswitch's Account Settings</param>
        /// <param name="resource">Urlencoded resource path where the file can be found inside the configured bucket</param>
        /// <param name="niceNva">"not valid after" parameter. It defines the timestamp (in milliseconds) after the generated URL won't be valid. This is the current UTC time + the amount of time you want, in milliseconds</param>
        /// <param name="niceNvb">"not valid before" parameter. It defines the timestamp (in milliseconds) that it will take that URL to be valid and accessible. This is the current UTC time + the amount of time you want, in milliseconds.</param>
        /// <param name="token">Authentication token generated</param>
        /// <returns></returns>
        public static string Smartswitch(string systemCode, string originCode, string resource,
            double niceNva, double niceNvb, string token)
        {
            var queryUrl = new StringBuilder(GlobalSettings.SMARTSWITCH_URL);
            queryUrl.AppendFormat("type=balance" +
                                  "&systemcode={0}" +
                                  "&zonecode=default" +
                                  "&origincode={1}" + 
                                  "&resource={2}" + 
                                  "&niceNva={3}" + 
                                  "&niceNvb={4}" +
                                  "&token={5}" +
                                  "&outputformat=jsonp",
                                  systemCode,
                                  originCode,
                                  resource,
                                  niceNva,
                                  niceNvb,
                                  token);

            return queryUrl.ToString();
        }

        /// <summary>
        /// In order to generate an authentication token, an md5 hashing algorithm must be applied to the following concatenated string chain:
        /// md5(systemcode + zonecode + origincode + resource + niceNva + niceNvb + secretKey)
        /// 
        /// where, the secretKey is a secret key shared by NicePeopleAtWork and the customer to authenticate all the calls against the Smartswitch.
        /// 
        /// </summary>
        /// <param name="systemCode">Your Nice PeopleAtWork account code that indicates Youbora Smartswitch which customer account rules are going to be applied. This parameter will be provided by NicePeopleAtWork, if you don't have it yet, please contact your Customer Engineer or Support Agent.</param>
        /// <param name="originCode">Origin code configured in Smartswitch's Account Settings</param>
        /// <param name="resource">Urlencoded resource path where the file can be found inside the configured bucket</param>
        /// <param name="niceNva">"not valid after" parameter. It defines the timestamp (in milliseconds) after the generated URL won't be valid. This is the current UTC time + the amount of time you want, in milliseconds</param>
        /// <param name="niceNvb">"not valid before" parameter. It defines the timestamp (in milliseconds) that it will take that URL to be valid and accessible. This is the current UTC time + the amount of time you want, in milliseconds.</param>
        /// <param name="secretKey">secret key shared by NicePeopleAtWork and the customer to authenticate all the calls against the Smartswitch</param>
        /// <returns></returns>
        public static string GenerateToken(string systemCode, string originCode, 
            string resource, double niceNva, double niceNvb, string secretKey)
        {
            return (systemCode + "zonecode=default" + originCode + resource + niceNva + niceNvb + secretKey);
        }
    }
}
