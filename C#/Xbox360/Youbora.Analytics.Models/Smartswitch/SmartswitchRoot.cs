namespace Youbora.Analytics.Models.Smartswitch
{
    using Newtonsoft.Json;

    [JsonObject("RootObject")]
    public class SmartswitchRoot
    {
        [JsonProperty("1")]
        public Smartswitch Smartswitch { get; set; }
    }
}
