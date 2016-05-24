namespace Youbora.Analytics.Providers.Common
{
    using System;

    public class UrlHelper
    {
        public static bool IsWellFormedUrl(string uri)
        {
            Uri uriResult;
            bool result = Uri.TryCreate(uri, UriKind.Absolute, out uriResult)
                          && (uriResult.Scheme == Uri.UriSchemeHttp
                              || uriResult.Scheme == Uri.UriSchemeHttps);

            return result;
        }

        public static string ValidateUrl(string url)
        {
            if (url == null)
                return null;

            if (IsWellFormedUrl(url))
                return url;

            return "http://" + url;
        }
    }
}
