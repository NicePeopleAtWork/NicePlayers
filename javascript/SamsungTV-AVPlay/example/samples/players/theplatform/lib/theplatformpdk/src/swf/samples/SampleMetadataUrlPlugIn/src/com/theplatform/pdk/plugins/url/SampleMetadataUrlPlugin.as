package com.theplatform.pdk.plugins.url 
{
	import com.hurlant.crypto.Crypto;
	import com.hurlant.crypto.symmetric.ICipher;
	import com.hurlant.crypto.symmetric.IPad;
	import com.hurlant.crypto.symmetric.IVMode;
	import com.hurlant.crypto.symmetric.PKCS5;
	import com.hurlant.util.Base64;
	import com.hurlant.util.Hex;
	import com.theplatform.pdk.controllers.GlobalController;
	import com.theplatform.pdk.data.LoadObject;
	import com.theplatform.pdk.plugins.IMetadataUrlPlugIn;
	import com.theplatform.pdk.utils.Debug;
	
	import flash.display.Sprite;
	import flash.utils.ByteArray;


	public class SampleMetadataUrlPlugin extends Sprite implements IMetadataUrlPlugIn
	{
		private var _controller:GlobalController;
		private var _priority:Number;
		private var _key:String;

		public function SampleMetadataUrlPlugin()
		{
		}
		
		public function initialize(lo:LoadObject):void
		{
			// get the controller
			_controller = lo.controller as GlobalController;

			// load a "key" used to decrypt
			// the loaded release URL. 
			_key = lo.vars["key"];

			if (_key)
			{
				_controller.registerMetadataUrlPlugIn(this, lo.priority);
				_controller.trace("Initialized SampleMetadataUrl plug-in", "SampleMetadataUrlPlugIn", Debug.INFO);
			}
			else
			{
				_controller.trace("The \"key\" must be defined and non-blank.", "SampleMetadataUrlPlugIn", Debug.ERROR);
			}
		}

		// fixes any base-64 characters that weren't encoded in the FlashVars
		private function fixBase64(text:String):String
		{
			return text.split(" ").join("+");
		}
		
		public function rewriteMetadataUrl(url:String, isPreview:Boolean):Boolean 
		{
			_controller.trace("Received rewriteMetadataUrl call", "SampleMetadataUrlPlugIn", Debug.INFO);

			// Check for unencrypted URLs first, we don't want to try to decrypt anything already plaintext 
			if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
			{
				return false;
			}
			
			// Next, figure out which of these cipher variants we're dealing with:
			// 1. <iv + cipher text as base-64>
			// 2. <label>$<iv + cipher text as base-64>
			// 3. <label>$<iv as text>$<cipher text as base-64>
			// 3. <label>$<iv as hex>$<cipher text as base-64>
			var algorithm:String = "aes-cbc";
			var ivBytes:ByteArray;
			var cipherBytes:ByteArray;
			var parts:Array = url.split("$");
			if (parts.length == 1 || parts.length == 2)
			{
				cipherBytes = Base64.decodeToByteArray(fixBase64(parts[parts.length - 1]));
				algorithm = "simple-" + algorithm;
			}
			else
			{
				// if it's 16 characters, it's text
				if (parts[1].length == 16)
				{
					ivBytes = Hex.toArray(Hex.fromString(parts[1]));
				}
				// if it's 32 characters, it's hex
				else if (parts[1].length == 32)
				{
					ivBytes = Hex.toArray(parts[1]);
				}
				else
				{
					_controller.trace("iv length was " + parts[1].length + "; expected either 16 (for text) or 32 (for hex)", "SampleMetadataUrlPlugIn", Debug.ERROR);
					return false;
				}
				cipherBytes = Base64.decodeToByteArray(fixBase64(parts[2]));
			}

			// Set up the decryption objects from the as3crypto library
			var keyBytes:ByteArray = Hex.toArray(Hex.fromString(_key));
			var pad:IPad = new PKCS5;
			var mode:ICipher = Crypto.getCipher(algorithm, keyBytes, pad);
			pad.setBlockSize(mode.getBlockSize());
			if (mode is IVMode)
			{
				var ivmode:IVMode = mode as IVMode;
				ivmode.IV = ivBytes;
			}			 

			// Decrypt the URL string
			mode.decrypt(cipherBytes);
			
			// Deal with a URL that's been over-encoded
			var newUrl:String = cipherBytes.toString();
			if (newUrl.indexOf("http%3A") == 0 || newUrl.indexOf("https%3A") == 0)
			{
				newUrl = decodeURIComponent(newUrl);
			}
			
			// Set the URL to continue processing
			_controller.trace("Resolved URL to \"" + newUrl + "\"", "SampleMetadataUrlPlugIn", Debug.INFO);			
			_controller.setMetadataUrl(newUrl);
			return true;
		}
	}
}
