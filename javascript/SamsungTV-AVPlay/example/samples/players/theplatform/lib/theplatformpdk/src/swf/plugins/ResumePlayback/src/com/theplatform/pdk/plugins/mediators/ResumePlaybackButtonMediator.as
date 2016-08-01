/**
 * Created by IntelliJ IDEA.
 * User: andre.desroches
 * Date: 9/28/11
 * Time: 8:49 AM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.mediators
{
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.controls.Item;
import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.events.ButtonEvent;
import com.theplatform.pdk.mediators.PlayerButtonControlMediator;
import com.theplatform.pdk.metadata.ItemMetaData;

import flash.events.Event;

public class ResumePlaybackButtonMediator extends PlayerButtonControlMediator
{

    private var labelString:String = null;

    public function ResumePlaybackButtonMediator(id:String, controller:IViewController, metadata:ItemMetaData, resources:Object)
    {
        super(id, controller, metadata, resources);

        if (resources.label!=null)
            labelString = resources.label as String;
    }

    override protected function setItem(item:Item):void
    {
        super.setItem(item);

        _buttonControl.addEventListener(ButtonEvent.OnButtonClick,onButtonClick);

    }

    override protected function setCard(card:Card):void
    {
        super.setCard(card);

        if (labelString!=null)
            _buttonControl.label = labelString;

    }

    private function onButtonClick(e:ButtonEvent):void
    {
        dispatchEvent(new Event("buttonClicked"));
    }


}
}
