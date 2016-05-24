namespace Youbora.Analytics.Models.Log
{
    using System;

    public class LogInfo
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public LogType LogType { get; set; }
        public DateTime Date { get; set; }
    }
}
