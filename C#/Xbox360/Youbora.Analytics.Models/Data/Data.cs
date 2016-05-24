namespace Youbora.Analytics.Models.Data
{
    using Newtonsoft.Json;

    [JsonObject("q")]
    public class Data
    {
        [JsonProperty("h")]
        public string Host { get; set; }
        [JsonProperty("pt")]
        public int PingTime { get; set; }
        [JsonProperty("c")]
        public string Code { get; set; }
    }
}
