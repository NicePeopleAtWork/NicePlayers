package com.theplatform.pdk.mediators
{
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.controllers.PlayerController;
import com.theplatform.pdk.controls.IconType;
import com.theplatform.pdk.controls.Item;
import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.data.CardActions;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.events.ButtonEvent;
import com.theplatform.pdk.events.PdkEvent;
import com.theplatform.pdk.metadata.ItemMetaData;

public class DefaultShareMediator extends PlayerButtonControlMediator
{
    public static const DEFAULT_TOOL_TIP:String = "Share with a Friend";
    protected var _clip:Clip;
    protected var _isFullScreen:Boolean;
    protected var _shareCardMediator:ShareCardMediator;

    public function DefaultShareMediator(id:String, controller:IViewController, metadata:ItemMetaData = null, resources:Object = null)
    {
        super(id, controller, metadata, resources);
        init();
    }

    private function init():void
    {
        //right now, we're not worrying about setting up media listeners,
        //the assumption is that the media is always paused when this control is visible

        _controller.addEventListener(PdkEvent.OnShowFullScreen, handleFullScreen);
    }


    override public function destroy():void
    {
        _controller.removeEventListener(PdkEvent.OnShowFullScreen, handleFullScreen);

        super.destroy();
    }

    override protected function setItem(item:Item):void
    {
        super.setItem(item);

        if (!_buttonControl.icon || _buttonControl.icon == IconType.NONE)
        {
            _buttonControl.icon = IconType.SHARE_BIG;
        }

        if (_buttonControl.tooltip == null)
        {
            _buttonControl.tooltip = DEFAULT_TOOL_TIP;
        }

        _buttonControl.addEventListener(ButtonEvent.OnButtonClick, buttonClicked, false, 0, true);

        _isFullScreen = (_controller as PlayerController).getFullScreenState();
        _clip = (_controller as PlayerController).getCurrentClip();
        setValidity();
    }

    override protected function setCard(card:Card):void
    {
        super.setCard(card);
    }

    protected function handleFullScreen(e:PdkEvent):void
    {
        _isFullScreen = e.data as Boolean;
        setValidity();
    }

    protected function setValidity():void
    {
        if (!_shareCardMediator)
        {
            _shareCardMediator = _controller.getMediator("tpShareCard", "forms", "tpShareCard") as ShareCardMediator;
        }

        var valid:Boolean = false;//if the shareCardMediator isn't there, then we shouldn't be opening up the share card
        if (_shareCardMediator)
        {
            valid = _shareCardMediator.checkAnyControlsValid();
        }

        //if the button is invalid, just make it not appear
        _buttonControl.visible = valid;
    }

    private function buttonClicked(e:ButtonEvent):void
    {
        if (card.initVars == null)
        {
            _pController.closeFullScreenThenShowCard("forms", "tpShareCard", CardActions.DISABLE);
        }
        else
        {
            _pController.closeFullScreenThenShowCard("forms", "tpShareCard", CardActions.DISABLE, null, null, card.initVars);
        }
    }

}
}
