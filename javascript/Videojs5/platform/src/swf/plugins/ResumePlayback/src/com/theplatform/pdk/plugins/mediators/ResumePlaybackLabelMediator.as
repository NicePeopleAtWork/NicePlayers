/**
 * Created by IntelliJ IDEA.
 * User: andre.desroches
 * Date: 9/28/11
 * Time: 11:53 AM
 * To change this template use File | Settings | File Templates.
 */
package com.theplatform.pdk.plugins.mediators
{
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controllers.IViewController;
import com.theplatform.pdk.data.Card;
import com.theplatform.pdk.mediators.DefaultTextMediator;
import com.theplatform.pdk.metadata.ItemMetaData;

public class ResumePlaybackLabelMediator extends DefaultTextMediator
{

    public function ResumePlaybackLabelMediator(id:String, controller:IViewController, metadata:ItemMetaData, resources:Object)
    {
        super(id, controller as IPlayerController, metadata, resources);

    }


    override protected function setCard(card:Card):void
    {
        super.setCard(card);

        if (_label)
        {
            _label.text = card.initVars ? card.initVars.title : "";
        }
    }
}
}
