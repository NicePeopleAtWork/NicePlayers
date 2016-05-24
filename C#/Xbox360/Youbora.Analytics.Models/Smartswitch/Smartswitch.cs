namespace Youbora.Analytics.Models.Smartswitch
{
    using Newtonsoft.Json;

    [JsonObject("1")]
    public class Smartswitch
    {
        [JsonProperty("CDN_CODE")]
        public string CdnCode { get; set; }
        [JsonProperty("URL")]
        public string Url { get; set; }

    }
}