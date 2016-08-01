using System;

namespace YouboraUWP
{
    public class YouboraResumeConfiguration
    {
        //RESUME
        // A delegate type for hooking up resume notification
        public delegate void ResumeHandler(int duration);
        // An event that clients can use to be notified whenever the
        // elements of the list change.
        private event ResumeHandler resumeDelegate;
        private String contentId;
        private String userId;

        public ResumeHandler ResumeDelegate
        {
            get
            {
                return resumeDelegate;
            }
            set
            {
                resumeDelegate = value;
            }
        }

        public string ContentId
        {
            get
            {
                return contentId;
            }

            set
            {
                contentId = value;
            }
        }

        public string UserId
        {
            get
            {
                return userId;
            }

            set
            {
                userId = value;
            }
        }
    }
}
