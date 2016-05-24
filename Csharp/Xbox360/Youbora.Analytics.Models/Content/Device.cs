
using System;
using System.Collections.Generic;
using Youbora.Analytics.Models.Common;

namespace Youbora.Analytics.Models.Content
{
    public class Device : IJsonConvertible
    {
        #region Constants

        public const string DefaultManufacturer = "Microsoft";
        public const string DefaultType = "Xbox360";
        public const string DefaultYear = "2005";

        #endregion

        #region Constructor

        public Device()
        {
            Manufacturer = DefaultManufacturer;
            Type = DefaultType;
            Year = DefaultYear;
        }

        #endregion

        #region Properties

        /// <summary>
        /// Manufacturer of the device (LG, Sony, Microsoft...).
        /// </summary>
        public string Manufacturer { get; set; }

        /// <summary>
        /// Type of device (TV, Blu-Ray, Set-Top Box)
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Fabrication year.
        /// </summary>
        public string Year { get; set; }

        /// <summary>
        /// Firmware version.
        /// </summary>
        public string Firmware { get; set; }

        #endregion

        #region Method

        public string ConvertToJson()
        {
            var propertyValue = new Dictionary<string, object>()
            {
                {"manufacturer", Manufacturer},
                {"type", Type},
                {"year", Year},
                {"firmware", Firmware}
            };

            return JsonHelper.ConvertToJson(propertyValue);            
        } 
  
     
        #endregion
    }
}
