$pdk.ns("$pdk.plugin.uplynk");
$pdk.plugin.uplynk.UpLynk = $pdk.extend(function(){},
{
    version:"VERSION_UNKNOWN",

    constructor: function ()
    {

    },

    initialize:function (loadObj)
    {

    }

});

$pdk.plugin.uplynk._instance = new $pdk.plugin.uplynk.UpLynk();
$pdk.controller.plugInLoaded($pdk.plugin.uplynk._instance, null);
