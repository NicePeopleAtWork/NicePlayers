/**
 * Created with IntelliJ IDEA.
 * User: paul.rangel
 * Date: 10/11/13
 * Time: 3:44 PM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.ratings.verification {
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controllers.PlayerController;
import com.theplatform.pdk.data.BaseClip;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.Playlist;
import com.theplatform.pdk.data.Rating;
import com.theplatform.pdk.data.Release;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.events.PlaybackEvent;
import com.theplatform.pdk.processes.ReleaseSelectorProcess;
import com.theplatform.pdk.utils.Debug;

import flash.events.ErrorEvent;

import flash.events.Event;
import flash.events.TimerEvent;

import flash.external.ExternalInterface;
import flash.utils.Timer;
import flash.utils.setTimeout;

import mx.core.ByteArrayAsset;

public class AgeVerification
{

    [Bindable]
    [Embed(source="AgeVerificationFlashPluginJSBridge.js", mimeType="application/octet-stream")]
    private var ageVerificationSharedLogic:Class;

    private static const VERIFIED:String = "verified";
    private static const UNVERIFIED:String = "unverified";
    private static const VERIFICATION_NEEDED:String = "verificationNeeded";
    private static const DECK_ID:String = "forms";
    private static const AGE_VERIFY_CARD_ID:String = "tpAgeVerificationCard";
    private static const AGE_NOT_VERIFIED_CARD_ID:String = "tpAgeNotVerifiedCard";

    // If a media doesn't have a rating, this is rating we give it
    // for cookie storage and business logic purposes.
    // It is the least restrictive rating, so for instance, a 'TV-G' rating is considered
    // more explicit than 'no-rating'.
    // If this changes, make the same change in js plugin.
    private static const NO_RATING:String = "no-rating";

    private var _controller:IPlayerController;
    private var _swfId:String;
    private var _sharedLogicContextId:String;
    private var _currentRating:String;
    private var _scheme:String = "urn:v-chip";  // default set
    private var _minimumAge:String = "18";  // default set
    private var _showingAgeVerificationCard:Boolean = false;
    private var _skinLoaded:Boolean = false;
    private var _playerLoaded:Boolean = false;
    private var _ageVerCardUIReady:Boolean = false;
    private var _serviceReady:Boolean = false; // 'service' is the age verification shared js logic: loaded and initialization completed.
    private var _showCardWhenUIReady:Boolean = false; // this only matters to the first release when age verification is intializing.
    private var _delayedVerificationCheckContext:DelayedVerificationCheckContext;
    private var _currentReleaseUrl:String;
    private var _ageVerificationWorks:Boolean = true;
    private var _selectorProc:ReleaseSelectorProcess;
    private var _showCardTimer:Timer;
    private var _ageCardShowing:String;
    // store info while waiting for age ver lib to complete initialization.

    public function AgeVerification(playerController:IPlayerController, loadVars:Object)
    {
        _controller = playerController;
        _controller.addEventListener(PdkEvent.OnSkinComplete, handleSkinLoaded);
        _controller.addEventListener(PdkEvent.OnPlayerLoaded, handlePlayerLoaded);


        if(loadVars && loadVars.hasOwnProperty("scheme"))
            this._scheme = loadVars.scheme;

        if(loadVars && loadVars.hasOwnProperty("minimumAge"))
            this._minimumAge = loadVars.minimumAge;

        if (ExternalInterface.available)//if the externalInterface isn't available nothing here will work
        {
            _swfId = ExternalInterface.objectID;

            var sharedLogicBA:ByteArrayAsset = ByteArrayAsset(new ageVerificationSharedLogic());
            var sharedLogic:String = sharedLogicBA.readUTFBytes(sharedLogicBA.length);
            _sharedLogicContextId = ExternalInterface.call(sharedLogic, _swfId);

            var callbackName:String = "ageVerificationServiceReady";
            var verifiedCallbackName:String = "verifiedCallback";
            var unverifiedCallbackName:String = "unverifiedCallback";
            var ageVerCardUIReadyCallbackName:String = "ageVerCardUIReady";
            ExternalInterface.addCallback(callbackName, this.serviceReadyCallBack);
            ExternalInterface.addCallback(ageVerCardUIReadyCallbackName, this.ageVerCardUIReadyCallback);
            ExternalInterface.addCallback(verifiedCallbackName, this.verifiedCallBack);
            ExternalInterface.addCallback(unverifiedCallbackName, this.unverifiedCallBack);

            ExternalInterface.call("window." + _sharedLogicContextId + ".loadService", callbackName, ageVerCardUIReadyCallbackName, verifiedCallbackName, unverifiedCallbackName, loadVars, _controller.globalScope.asArray());
        }
        else
        {
            _controller.trace("ExternalInterface is not available: AgeVerification cannot access necessary logic", "AgeVerification", Debug.ERROR);
        }
    }

    /**
     * If the card shows before the skin is loaded, the string substitutions don't
     * take place. PDK-10020
     * @param e PdkEvent
     */
    private function handleSkinLoaded(e:PdkEvent):void
    {
        log("handleSkinLoaded");
        _skinLoaded = true;
        _controller.removeEventListener(PdkEvent.OnSkinComplete, handleSkinLoaded);
        doUIReadyCheck();
    }

    private function handlePlayerLoaded(e:PdkEvent):void
    {
        log("handlePlayerLoaded");
        _playerLoaded = true;
        _controller.removeEventListener(PdkEvent.OnPlayerLoaded, handlePlayerLoaded);
        doUIReadyCheck();
    }

    public function ageVerCardUIReadyCallback():void
    {
        log("ageVerCardUIReadyCallback");
        _ageVerCardUIReady = true;
        doUIReadyCheck();
    }

    private function doUIReadyCheck():void
    {
        if(uiReady() && _showCardWhenUIReady)
        {
            _showCardWhenUIReady = false;
            showAgeVerificationCard();
        }
    }

    private function uiReady():Boolean
    {
        return (_playerLoaded && _skinLoaded  && _ageVerCardUIReady);
    }

    /**
     * @param clip
     * @param delayed If rewrite call happens before age ver lib is ready, we need to store the
     * clip and call rewrite again when the age ver lib is ready.
     * @return  Boolean
     */
    public function rewriteMetadataUrl(url:String):Boolean
    {
        if (!_ageVerificationWorks) return false;//just forget it
        _currentReleaseUrl = url;
        //first, let's see if there is a rating
        var release:Release = _controller.getCurrentRelease();
        var rating:String = getRating(release, this._scheme);
        if (rating)
        {
            return checkRating(rating);
        }
        else
        {
            //now we have to go out and get a release from the selector service
            loadReleaseInfo(_currentReleaseUrl);
            return true;//we're going to have to wait for a bit
        }
    }

    private function checkRating(rating:String):Boolean
    {
        _currentRating = rating;
        if (!_currentRating || _currentRating == "none")
        {
            _currentRating = NO_RATING;
        }

        if(_serviceReady)
        {
            return doCheckVerification();
        }
        else
        {
            log("- service NOT ready, so storing data for delayed callback and return TRUE")
             _delayedVerificationCheckContext = new DelayedVerificationCheckContext(checkVerification);
            return true;
        }
    }


    private function checkVerification():void
    {
        if (!doCheckVerification())
        {
            returnControlToPlayer();
        }
    }

    private function doCheckVerification():Boolean
    {
        if(needsVerification())
        {
            showAgeVerificationCard();
            return true;
        }
        return false;
    }

    private function showAgeVerificationCard():void
    {
        if(uiReady())
        {
            log("- calling _controller.showCard for age verification card");
            _showingAgeVerificationCard = true;
            //ugh, we've got to put a timer in here since there is a timing hitch with the OnMediaEnd event.
            startShowCardTimer();
        }
        else
        {
            log("- ui not ready; set flag to show card when ready")
            _showCardWhenUIReady = true;
        }
    }

    private function startShowCardTimer():void
    {
        if (!_showCardTimer)
        {
            _showCardTimer = new Timer(20);
            _showCardTimer.addEventListener(TimerEvent.TIMER, showCardTick, false, 0, true);
            _showCardTimer.start();
        }
    }
    private function endShowCardTimer():void
    {
        if (_showCardTimer)
        {
            _showCardTimer.stop();
            _showCardTimer.removeEventListener(TimerEvent.TIMER, showCardTick);
            _showCardTimer = null;
        }
    }

    private function showCardTick(e:TimerEvent):void
    {
        endShowCardTimer();
        _controller.showCard(DECK_ID,AGE_VERIFY_CARD_ID,"disable",null,null,{age:this._minimumAge,rating:this._currentRating});
    }



    private function needsVerification():Boolean
    {
        var needsVerification:Boolean = false;
        if(this._currentRating)
        {
            var response:String = ExternalInterface.call("window." + _sharedLogicContextId + ".verifyRating", this._currentRating);
            needsVerification = (response == VERIFICATION_NEEDED);
        }

        return needsVerification;
    }

    private function loadReleaseInfo(url:String):void
    {
        _selectorProc = new ReleaseSelectorProcess(_controller as PlayerController, url);
        _selectorProc.addEventListener(Event.COMPLETE, onReleaseSelectorComplete, false, 0, true);
        _selectorProc.addEventListener(ErrorEvent.ERROR, onReleaseSelectorError, false, 0, true);
        _selectorProc.execute();
    }

    private function onReleaseSelectorComplete(e:PlaybackEvent):void
    {
        var release:Release = e.data as Release;
        removeSelectorProc();
        var rating:String = getRating(release, _scheme);

        //we've got a release back, let's check it and go on
        if (!checkRating(rating))
        {
            //we must be in an asynch state
            returnControlToPlayer();
        }
    }

    private function onReleaseSelectorError(e:Event):void
    {
        removeSelectorProc();
        //no release, just continue
        returnControlToPlayer();
    }

    private function removeSelectorProc():void
    {
       _selectorProc.removeEventListener(Event.COMPLETE, onReleaseSelectorComplete);
        _selectorProc.removeEventListener(ErrorEvent.ERROR, onReleaseSelectorError);
        _selectorProc.destroy();
        _selectorProc = null;
    }

    private function returnControlToPlayer():void
    {
        if (_currentReleaseUrl)
        {
            var url:String = _currentReleaseUrl;
            _currentReleaseUrl = null;
            _delayedVerificationCheckContext = null;
            _controller.setMetadataUrl(url);
        }
    }

    public function serviceReadyCallBack(status:Object):void
    {
        if(status.success)
        {
            log("$pdk.ageVerification is now ready")
            _serviceReady = true;
            if(_delayedVerificationCheckContext)
            {
                _delayedVerificationCheckContext.serviceReady();
            }
        }
        else
        {
            _ageVerificationWorks = false;
            returnControlToPlayer();
            _controller.trace("$pdk.ageVerification failed to load", "AgeVerification", Debug.ERROR);
        }
    }

    public function verifiedCallBack(ttl:* = null):void
    {
        log("verifiedCallback");
        ExternalInterface.call("window." + _sharedLogicContextId + ".setRatingVerified", this._currentRating, VERIFIED, ttl);
        log("- calling hidePlayerCard")
        _controller.hideCard(DECK_ID);
        returnControlToPlayer();
    }

    public function unverifiedCallBack():void
    {
        ExternalInterface.call("window." + _sharedLogicContextId + ".setRatingVerified", this._currentRating, UNVERIFIED);
        var minAge:String = this._minimumAge;
        var rating:String = this._currentRating;

        _controller.showCard(DECK_ID,AGE_NOT_VERIFIED_CARD_ID,"disable",null,null,{age:minAge,rating:rating});
    }

    private function getRating(release:Release, scheme:String):String
    {
        //TODO: check to see if this release is the same as a release that may have just warmed
        //if it is, and there are no ratings, then we should send in a "none" ratings so we don't call the data unnecessarily
        //we should probably handle this in a separate function that calls into this and only call that on rewriteMetadataUrl

        if (release && release.ratings)
        {
            var rating:Rating;
            for (var i:int = 0; i < release.ratings.length; i++)
            {
                rating = release.ratings[i];
                if(rating.scheme.toLowerCase() === scheme)
                {
                    return rating.rating ? rating.rating.toLowerCase() : rating.rating;
                }
            }
        }
        return null;
    }

    private function log(s:String, level:int = 4):void
    {
        _controller.trace(s, "AgeVerificationFlash", level);

    }
}
}

import com.theplatform.pdk.data.Clip;

// on startup we may need to delay verification while
// waiting for age verification parts to initialize
class DelayedVerificationCheckContext
{
    private var _serviceReady:Boolean = false;
    private var _triggerVerificationCallback:Function;

    public function DelayedVerificationCheckContext(triggerVerificationCallback:Function)
    {
        _triggerVerificationCallback = triggerVerificationCallback;
    }

    public function serviceReady():void
    {
        _serviceReady = true;
        triggerVerificationCheck();
    }

    private function triggerVerificationCheck():void
    {
        if(_serviceReady)
        {
            _triggerVerificationCallback();
        }
    }

}
