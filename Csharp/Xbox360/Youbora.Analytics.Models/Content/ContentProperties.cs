
using System.Collections.Generic;
using Youbora.Analytics.Models.Common;
namespace Youbora.Analytics.Models.Content
{
    public class ContentProperties : IJsonConvertible
    {
        #region Constructor

        public ContentProperties()
        {
            ContentMetadata = new ContentMetadata();
            Device = new Device();
        }

        #endregion

        #region Properties

        /// <summary>
        /// Filename of the current media content.
        /// </summary>
        public string Filename { get; set; }

        /// <summary>
        /// Internal ID for the media.
        /// </summary>
        public string ContentId { get; set; }

        /// <summary>
        /// Metadata of the current media content.
        /// </summary>
        public ContentMetadata ContentMetadata { get; set; }

        /// <summary>
        /// Transaction type of the current media content (Rent, Subscription, EST, Free).
        /// </summary>
        public TransactionType TransactionType { get; set; }

        /// <summary>
        /// Quality of the Video (HD, SD).
        /// </summary>
        public string Quality { get; set; }

        /// <summary>
        /// Type of content (Trailer, Episode, Movie).
        /// </summary>
        public ContentType ContentType { get; set; }

        /// <summary>
        /// Device information.
        /// </summary>
        public Device Device { get; set; }

        #endregion       

        #region Methods

        public void SetDefaultFilename(string filename)
        {
            if (string.IsNullOrEmpty(Filename))
            {
                Filename = filename;
            }
        }

        public void SetDefaultContentTitle(string title)
        {
            if (string.IsNullOrEmpty(title))
                return;

            if (ContentMetadata == null)
            {
                ContentMetadata = new Content.ContentMetadata();
                ContentMetadata.Title = title;
            }
            else if (string.IsNullOrEmpty(ContentMetadata.Title))
            {
                ContentMetadata.Title = title;
            }
        }

        public void SetDefaultContentDuration(long duration)
        {            
            if (ContentMetadata == null)
            {
                ContentMetadata = new Content.ContentMetadata();
                ContentMetadata.Duration = duration;
            }
            else if (ContentMetadata.Duration == null)
            {
                ContentMetadata.Duration = duration;
            }
        }        

        public string ConvertToJson()
        {
            var properties = new Dictionary<string, object>()
            {
                {"filename", Filename},
                {"content_id", ContentId},
                {"content_metadata", ContentMetadata },
                {"transaction_type", TransactionType.ToString()},
                {"quality", Quality},
                {"content_type", ContentType.ToString()},
                {"device", Device}
            };

            return JsonHelper.ConvertToJson(properties);
        }

        #endregion
    }
}
