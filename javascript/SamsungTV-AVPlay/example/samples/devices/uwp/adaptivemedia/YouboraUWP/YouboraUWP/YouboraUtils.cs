using System;
using System.Collections.Generic;
using Windows.Data.Json;

namespace YouboraUWP
{
    class YouboraUtils
    {
        public static Object toJson(Object o)
        {
            if (o is Dictionary<object,object>)
            {
                JsonObject jsonObject = new JsonObject();
                Dictionary<object, object> dict =(Dictionary<object, object>) o;
                foreach(KeyValuePair<object,object> entry in dict){
                    jsonObject.Add(entry.Key.ToString(), JsonValue.CreateStringValue(toJson(entry.Value).ToString()));
                }
                return jsonObject;
            }
            else if (o is IEnumerable<Object>)
            {
                JsonArray jsonArray = new JsonArray();
                IEnumerable<Object> iterable = (IEnumerable < Object > )o;
                foreach(Object obj in iterable)
                {
                    jsonArray.Add(JsonValue.CreateStringValue(obj.ToString()));
                }
                return jsonArray;
            }
            else
            {
                return o;
            }
        }

        public static long now()
        {
            return (long)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;

        }

        public static long getRandomSessionId()
        {
            long maxLong = long.MaxValue;
            double percentage = new Random().NextDouble();
            double result = maxLong * percentage;
            return (long)result;
        }
    }
}
