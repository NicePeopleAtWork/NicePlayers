using System;

namespace Youbora.Analytics.Providers.Common
{
    public static class BytesUtil
    {
        public static double ConvertBytesToMegabytes(long bytes)
        {
            return Math.Round((bytes / 1024f) / 1024f, 2);
        }

        public static double ConvertKilobytesToMegabytes(long kilobytes)
        {
            return Math.Round(kilobytes / 1024f, 2);
        }
    }
}