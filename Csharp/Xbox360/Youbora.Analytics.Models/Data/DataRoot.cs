namespace Youbora.Analytics.Models.Data
{
    using Newtonsoft.Json;

    [JsonObject("q")]
    public class DataRoot
    {
        [JsonProperty("q")]
        public Data Data { get; set; }
    }
}
