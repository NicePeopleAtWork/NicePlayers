using System.Collections.Generic;
using Youbora.Analytics.Models.Common;
namespace Youbora.Analytics.Models.Content
{
    public class ContentMetadata : IJsonConvertible
    {
        #region Properties

        /// <summary>
        /// Media title.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Media genre.
        /// </summary>
        public string Genre { get; set; }

        /// <summary>
        /// Media language.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// Media year.
        /// </summary>
        public string Year { get; set; }

        /// <summary>
        /// Media cast. Separate each name with commas.
        /// </summary>
        public string Cast { get; set; }

        /// <summary>
        /// Media director or directors. Separate each name with commas.
        /// </summary>
        public string Director { get; set; }

        /// <summary>
        /// Media's content owner.
        /// </summary>
        public string Owner { get; set; }

        /// <summary>
        /// Length of the media in seconds.
        /// </summary>
        public long? Duration { get; set; }

        /// <summary>
        /// Recommended viewing age (All, +13, +18, Adult)
        /// </summary>
        public string Parental { get; set; }

        /// <summary>
        /// Purchase price on the website.
        /// </summary>
        public string Price { get; set; }

        /// <summary>
        /// Average value on your user's perception on the content quality, performance...
        /// </summary>
        public string Rating { get; set; }

        /// <summary>
        /// Media file type of audio (Mono, Stereo, Dolby...).
        /// </summary>
        public string AudioType { get; set; }

        /// <summary>
        /// Number of media file channels (1, 5.1 ...).
        /// </summary>
        public string AudioChannels { get; set; }

        #endregion

        #region Method

        public string ConvertToJson()
        {
            var propertyValue = new Dictionary<string, object>()
            {
                {"title", Title},
                {"genre", Genre},
                {"year", Year},
                {"language", Language},
                {"cast", Cast},
                {"director", Director},
                {"owner", Owner},
                {"duration", (Duration == null) ? string.Empty : Duration.ToString()},
                {"parental", Parental},
                {"price", Price},
                {"rating", Rating},
                {"audioType", AudioType},
                {"audioChannels", AudioChannels}
            };

            return JsonHelper.ConvertToJson(propertyValue);
        }

        #endregion        
    }
}
