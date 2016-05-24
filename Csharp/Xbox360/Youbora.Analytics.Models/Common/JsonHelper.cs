using System;
using System.Collections.Generic;
using System.Linq;
using Youbora.Analytics.Models.Content;
using System.Collections;

namespace Youbora.Analytics.Models.Common
{
    public static class JsonHelper
    {
        public static string ConvertToJson(string propertyName, object propertyValue)
        {
            if (propertyValue == null)
                return string.Empty;

            var value = string.Empty;
            if (propertyValue.GetType() == typeof(string))
            {
                value = String.Format(@"""{0}""", propertyValue);
            }
            else if (propertyValue is IJsonConvertible)
            {
                value = (propertyValue as IJsonConvertible).ConvertToJson();
            }
            else if (propertyValue is IDictionary)
            {
                value = ConvertToJson(propertyValue as IDictionary<string, object>);
            }

            return string.IsNullOrEmpty(propertyName) ? value : String.Format(@"""{0}"":{1}", propertyName, value);
        }        

        public static string ConvertToJson(IDictionary<string, object> propertyValues)
        {
            if (propertyValues == null || propertyValues.Count <= 0)
                return string.Empty;

            List<string> propertyValuesList = new List<string>();
            foreach (var item in propertyValues)
            {
                if (string.IsNullOrEmpty(item.Key) || item.Value == null)
                    continue;

                var json = ConvertToJson(item.Key, item.Value);
                if (!string.IsNullOrEmpty(json))
                {
                    propertyValuesList.Add(json);
                }
            }
            
            return propertyValuesList.Count > 0 
                ? "{" + propertyValuesList.Aggregate((a, b) => a + "," + b) + "}"
                : string.Empty;
        }
    }
}
