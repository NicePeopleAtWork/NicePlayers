package com.theplatform.pdk.plugins
{
import com.theplatform.pdk.containers.ComponentArea;
import com.theplatform.pdk.containers.Container;
import com.theplatform.pdk.controllers.IPlayerController;
import com.theplatform.pdk.controls.*;
import com.theplatform.pdk.data.CardPriority;
import com.theplatform.pdk.data.Clip;
import com.theplatform.pdk.data.LoadObject;
import com.theplatform.pdk.data.ReleaseState;
import com.theplatform.pdk.factory.ViewFactory;
import com.theplatform.pdk.mediators.*;
import com.theplatform.pdk.metadata.ItemMetaData;
import com.theplatform.pdk.views.RelatedItemsView;
import com.theplatform.pdk.views.SiteListView;


import flash.display.Sprite;

public class DefaultFormControls extends Sprite implements IInternalControlPlugIn, IDestroyablePlugIn
{
    private var _controller:IPlayerController;

    public function DefaultFormControls()
    {

    }

    public function initialize(lo:LoadObject):void
    {
        _controller = lo.controller as IPlayerController;

        _controller.registerControlPlugIn(this, lo.priority);

        registerValidControls();

        var headerCard:XML =

                <card id="tpHeaderCard">

                    <container direction="horizontal"
                    width="100%"
                    height="26"
                    verticalAlign="middle"
                    paddingLeft="4"
                    paddingRight="4">

                        <control id="tpHeaderIcon"/>

                        <control id="tpHeaderTitle"
                        textStyle="PlayerFormTitleFont"/>

                        <container id="tpLinkContainer"
                        direction="horizontal"
                        width="100%"
                        height="100%"
                        horizontalAlign="center"
                        verticalAlign="bottom"
                        paddingTop="4"/>

                        <control id="tpHeaderClose"
                        label="Close"/>

                    </container>

                    <placeholder id="tpHeaderPH"
                    skin="FormsCardSkin"/>

                </card>;

        _controller.addCard("forms", "tpHeaderCard", headerCard, CardPriority.DEFAULT);

        var excerptCard:XML =

                <card id="tpExcerptCard"
                parentCardId="tpHeaderCard"
                paddingTop="6"
                paddingBottom="6"
                paddingLeft="4"
                paddingRight="4">

                    <container direction="horizontal"
                    width="100%"
                    height="100%"
                    horizontalGap="4">

                        <control id="tpExcerptVideo"
                        width="100%"
                        height="100%"/>

                        <placeholder id="ExcerptFormPH"
                        width="100%"
                        height="100%"/>

                    </container>

                    <container direction="vertical"
                    height="100%"
                    width="100%"
                    horizontalAlign="center">

                        <spacer height="100%"/>

                        <control id="tpExcerptInstructions"
                        text="Drag the handles or use your arrow keys to adjust times."/>

                        <spacer percentHeight="50"/>

                        <container direction="horizontal" autoSkin="true"
                        width="100%"
                        paddingLeft="50"
                        paddingRight="50"
                        verticalAlign="absolute:3">

                            <control id="tpExcerptPlay" skin="ButtonSkinLeft"/>

                            <control id="tpExcerptSlider"/>

                        </container>

                        <spacer height="100%"/>


                    </container>
                </card>

        _controller.addCard("forms", "tpExcerptCard", excerptCard, CardPriority.DEFAULT);

        var singleShareCard:XML =

                <card id="tpSingleShareCard" parentCardId="tpExcerptCard" paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="4" verticalGap="2">
                    <group direction="horizontal" skin="none" width="100%" horizontalAlign="left" horizontalGap="4">
                        <control id="tpSingleShareId" />
                        <control id="tpSingleShareTitleText" />
                    </group>
                    <control id="tpSingleShareClipText" />
                    <control id="tpSingleShareInstructions" />
                    <spacer percentHeight="10"/>
                    <control id="tpSingleSharePost" showLabel="true" width="60" direction="horizontal"/>
                </card>;

        _controller.addCard("forms", "tpSingleShareCard", singleShareCard, CardPriority.DEFAULT);

        var shareCard:XML =

                <card id="tpShareCard"
                paddingTop="6"
                paddingBottom="4"
                paddingLeft="4"
                paddingRight="4"
                parentCardId="tpExcerptCard">

                    <link linkto="tpPostCard"
                    width="30"
                    height="22"
                    skin="FormsNavButtonSkin"
                    tooltip="Post"
                    icon="IconPost_big"
                    isDefault="true"/>

                    <link linkto="tpEmailCard"
                    width="30"
                    height="22"
                    icon="IconMail_big"
                    skin="FormsNavButtonSkin"
                    tooltip="Email"/>

                    <link linkto="tpLinkCard"
                    width="30"
                    height="22"
                    skin="FormsNavButtonSkin"
                    tooltip="Link"
                    icon="IconLink_big"/>

                    <link linkto="tpEmbedCard"
                    width="30"
                    height="22"
                    skin="FormsNavButtonSkin"
                    tooltip="Embed"
                    icon="IconEmbed_big"/> 

                    <placeholder id="tpLinkFormPH"/>

                </card>

        _controller.addCard("forms", "tpShareCard", shareCard, CardPriority.DEFAULT);

        /////////// menu card ///////////////
        var menuCard:XML =
                <card
                id="tpMenuCard">

                    <region
                    id="tpMenuRegion">

                        <container
                        width="100%"
                        height="100%">

                            <spacer
                            height="100%"/>

                            <container
                            id="tpMenuButtonsContainer"
                            width="100%"
                            direction="horizontal"
                            horizontalGap="14">

                                <spacer
                                width="100%"/>

                                <control
                                id="tpShare"
                                height="50"
                                width="50"
                                autoSkin="false"
                                skin="FormsButtonSkin"
                                direction="vertical"
                                label="Share"
                                icon="IconShare_big"/>

                                <control
                                id="tpRSS"
                                height="50"
                                width="50"
                                autoSkin="false"
                                skin="FormsButtonSkin"
                                direction="vertical"
                                label="RSS"
                                icon="IconRSS_big"/>

                                <control
                                id="tpInfo"
                                height="50"
                                width="50"
                                autoSkin="false"
                                skin="FormsButtonSkin"
                                direction="vertical"
                                label="Info"
                                icon="IconInfo_big"/>

                                <spacer
                                width="100%"/>

                            </container>

                            <spacer
                            height="100%"/>

                        </container>


                        <!-- related items group-->

                        <container
                        id="tpRelatedItemsControlGroup"
                        width="100%"
                        height="120">

                            <container
                            width="100%"
                            direction="horizontal"
                            skin="RelatedItemsHeaderBackgroundSkin"
                            paddingLeft="32"
                            paddingRight="32"
                            paddingTop="6"
                            paddingBottom="4">

                                <control
                                id="tpRelatedItemsTitle"
                                textStyle="PlayerFormRelatedItemsTitleFont"/>

                                <spacer
                                width="100%"/>

                                <control
                                id="tpRelatedItemsRange"
                                skin="none"
                                textStyle="PlayerFormRelatedItemsFont"/>

                            </container>


                            <!-- related items control-->

                            <container
                            width="100%"
                            height="100%"
                            skin="RelatedItemsBackgroundSkin"
                            paddingTop="10"
                            paddingBottom="5"
                            paddingLeft="5"
                            paddingRight="5"
                            verticalGap="5">

                                <control
                                id="tpRelatedItems"
                                relatedItemsPerPage="6"/>

                                <container
                                width="100%"
                                paddingLeft="27">

                                    <control
                                    id="tpRelatedItemsClipTitle"
                                    hintText=""/>

                                </container>
                            </container>

                        </container>

                    </region>
                </card>;
        _controller.addCard("forms", "tpMenuCard", menuCard, CardPriority.DEFAULT);

        /////////// email card ////////////////
        var emailCard:XML =
                <card id="tpEmailCard" parentCardId="tpExcerptCard" paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="0" verticalGap="4">

                    <control id="tpEmailSendTo" skin="TextAreaSkin" hint="Send to" input="true" />
                    <control id="tpEmailSender" skin="TextAreaSkin" hint="Your Email" input="true" />
                    <control id="tpEmailMessage" skin="TextAreaSkin" hint="Message" input="true" multiline="true" showScrollBar="auto"/>

                    <container direction="horizontal" skin="none" horizontalAlign="right" width="100%" horizontalGap="4">
                        <control id="tpEmailSend" label="Send" />
                        <control id="tpEmailCancel" label="Cancel"/>
                    </container>

                </card>;
        _controller.addCard("forms", "tpEmailCard", emailCard, CardPriority.DEFAULT);

        /////////// embed card ////////////////
        var embedCard:XML =
                <card id="tpEmbedCard" parentCardId="tpExcerptCard" paddingTop="6" paddingRight="4" paddingBottom="6"  verticalGap="4" paddingLeft="4" >
                    <label text="Copy the embed code:" textStyle="PlayerFormLabelFont" />
                    <control id="tpEmbedText" textStyle="PlayerFormMessageFont" />
                    <group direction="horizontal" horizontalAlign="right" width="100%" horizontalGap="4">
                        <control id="tpEmbedCheckbox"  />
                        <control id="tpEmbedCopyToClipboard" label="Copy to Clipboard" />
                    </group>
                </card>
        _controller.addCard("forms", "tpEmbedCard", embedCard, CardPriority.DEFAULT);

        /////////// link card ////////////////
        var linkCard:XML =
                <card id="tpLinkCard" parentCardId="tpExcerptCard" paddingTop="6" paddingRight="4" paddingBottom="6"  verticalGap="4" paddingLeft="4" >
                    <label text="Copy the player link:" textStyle="PlayerFormLabelFont" />
                    <control id="tpLinkText" textStyle="PlayerFormMessageFont" />
                    <group direction="horizontal" horizontalAlign="right" width="100%" horizontalGap="4">
                        <spacer width="100%"/>
                        <control id="tpLinkCheckbox" />
                        <control id="tpLinkCopyToClipboard" label="Copy to Clipboard" />
                    </group>
                </card>
        _controller.addCard("forms", "tpLinkCard", linkCard, CardPriority.DEFAULT);

        /////////// RSS card ////////////////
        var rssCard:XML =
                <card id="tpRssCard" parentCardId="tpHeaderCard" paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="4" verticalGap="4" >
                    <label text="Copy the RSS link:" textStyle="PlayerFormLabelFont" />
                    <control id="tpRssText" multiline="true" />
                    <group direction="horizontal" skin="none" width="100%" horizontalAlign="right" horizontalGap="4">
                        <control id="tpRssCheckbox" />
                        <control id="tpRssCopyToClipboard" label="Copy to Clipboard" />
                    </group>
                </card>
        _controller.addCard("forms", "tpRssCard", rssCard, CardPriority.DEFAULT);

        /////////// Info card ////////////////
        var infoCard:XML =
                <card id="tpInfoCard" parentCardId="tpHeaderCard" paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="4" >
                    <control id="tpInfoTitle" textStyle="PlayerFormTitleFont" multiline="false" isHtml="true" />
                    <control id="tpInfoAuthor" textStyle="PlayerFormLabelFont"  multiline="false" isHtml="true" />
                    <control id="tpInfoDescription" multiline="true" isHtml="true" />
                    <control id="tpInfoCopyright" textStyle="PlayerFormLabelFont"  multiline="false" isHtml="true" />
                </card>
        _controller.addCard("forms", "tpInfoCard", infoCard, CardPriority.DEFAULT);

        /////////// Post card ////////////////
        var postCard:XML =
                <card id="tpPostCard" parentCardId="tpExcerptCard" paddingTop="6" paddingRight="4" paddingBottom="6" paddingLeft="4" verticalGap="4">

                    <label text="Post to a site:" textStyle="PlayerFormLabelFont" />

                    <control id="tpSiteList"
                    textStyle="PlayerFormLabelFont"
                    columns="2"
                    showText="true"
                    rowHeight="25"
                    showScrollBar="auto"
                    />

                </card>
        _controller.addCard("forms", "tpPostCard", postCard, CardPriority.DEFAULT);


        var loginCard:XML =

                <card id="tpLoginCard" 
                parentCardId="tpHeaderCard"
				percentWidth="100" 
				percentHeight="100" 
				verticalGap="2">
					<container direction="vertical" percentHeight="100" percentWidth="100" verticalAlign="top" paddingLeft="4" paddingRight="4" verticalGap="4">
						<control id="tpLoginInstructions" textStyle="PlayerFormLabelFont" label="Please Enter your username and password to continue." width="100%"/>
						<spacer height="6"/>
						<control id="tpLoginUsername" hint="Username" input="true" width="100%"/>
						<control id="tpLoginPassword" hint="Password" displayAsPassword="true" input="true" width="100%"/>
						<container direction="horizontal" skin="none" horizontalAlign="right" width="100%" horizontalGap="4">
							<control id="tpLoginSubmit" label="Login"/>
							<spacer width="4"/>
							<control id="tpLoginCancel" label="Cancel"/>
						</container>
					</container>
				</card>;

        _controller.addCard("forms", "tpLoginCard", loginCard, CardPriority.DEFAULT);


        //register any views that are unique to the forms
        ViewFactory.registerViewWithControl(SiteListControl, SiteListView, _controller.id, 1);
        ViewFactory.registerViewWithControl(RelatedItemsControl, RelatedItemsView, _controller.id, 1);

    }

    public function destroy():void
    {


        _controller = null;


    }

    public function getControlIds():Array
    {
        return [];
    }

    public function getControl(metadata:ItemMetaData):Control
    {
        var id:String = metadata.id;
        var c:Control;
        switch (id)
        {
            // button controls
            case "tpMenu":
            case "tpInfo":
            case "tpSiteListShower":
            //case "tpSkinAndIconTester":
            case "tpEmailCancel":
            case "tpEmailSend":
            case "tpLinkCopyToClipboard":
            case "tpLinkClose":
            case "tpEmbedCopyToClipboard":
            case "tpEmbedClose":
            case "tpRssCopyToClipboard":
            case "tpRssClose":
            case "tpInfoClose":
            case "tpPostClose":
            case "tpShare":
            case "tpInfo":
            case "tpHeaderClose":
            case "tpSharingSite":
            case "tpExcerptPlay":
            case "tpSingleSharePost":
            case "tpLoginSubmit":
            case "tpLoginCancel":
                c = new ButtonControl(id, metadata, _controller);
                break;
            case "tpEmail":
                if (!showEmail())
                    return null;
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
            case "tpLink":
                if (!showLink())
                    return null;
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
            case "tpEmbed":
                if (!showEmbed())
                    return null;
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
            case "tpRss":
            case "tpRSS":
                if (!showRss())
                    return null;
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;
            case "tpPost":
                if (!showPost())
                    return null;
                c = new ButtonControl(metadata.id, metadata, _controller);
                break;

            // TextArea controls
            case "tpEmailSender":
            case "tpEmailSendTo":
            case "tpEmailMessage":
            case "tpInfoTitle":
            case "tpInfoAuthor":
            case "tpInfoDescription":
            case "tpInfoCopyright":
            case "tpLinkText":
            case "tpEmbedText":
            case "tpRssText":
            case "tpLoginUsername":
            case "tpLoginPassword":
                c = new TextAreaControl(id, metadata, _controller);
                break;

            // Text controls
            //case "tpEmbedLabel":
            //case "tpLinkLabel":
            case "tpHeaderTitle":
            case "tpExcerptInstructions":
            case "tpSingleShareTitleText":
            case "tpSingleShareClipText":
            case "tpSingleShareInstructions":
            case "tpLoginError":
            case "tpLoginInstructions":
                c = new TextControl(id, metadata, _controller);
                break;

            // image controls
            case "tpLinkCheckbox":
            case "tpEmbedCheckbox":
            case "tpRssCheckbox":
            case "tpHeaderIcon":
            case "tpSingleShareId":
                c = new ImageControl(id, metadata, _controller);
                break

            //misc controls
            case "tpSiteList":
                c = new SiteListControl(id, metadata, _controller);
                break;
            case "tpExcerptVideo":
                c = new VideoControl(id, metadata, _controller);
                break;
            case "tpExcerptSlider":
                c = new ExcerptSliderControl(id, metadata, _controller); //temporary, switch to excerpt scrubber when it's ready
                break;
            case "tpRelatedItems":
                if (!showRelatedItems())
                    return null;
                c = new RelatedItemsControl(id, metadata, _controller);
                break;
            case "tpRelatedItemsTitle":
                if (!showRelatedItems())
                    return null;
                c = new TextControl(id, metadata, _controller);
                break;
            case "tpRelatedItemsRange":
                if (!showRelatedItems())
                    return null;
                c = new TextControl(id, metadata, _controller);
                break;
            case "tpRelatedItemsClipTitle":
                if (!showRelatedItems())
                    return null;
                c = new TextControl(id, metadata, _controller);
                break;

            default:
                break;
        }
        return c;
    }

    public function getControlMediator(metadata:ItemMetaData):Mediator
    {
        var id:String = metadata.id;
        var m:Mediator;
        switch (id)
        {
            case "tpLinkContainer":
                m = new CardLinkContainerMediator(id, _controller, metadata);
                break;
            case "tpMenu":
                m = new DefaultMenuMediator(id, _controller, metadata);
                break;
            case "tpMenuRegion":
                m = new MenuRegionMediator(id, _controller, metadata);
                break;
            case "tpMenuCard":
                m = new MenuCardMediator(id, _controller, metadata);
                break;
            case "tpShare":
                m = new DefaultShareMediator(id, _controller, metadata);
                break;

            //header card
            case "tpHeaderCard":
                m = new HeaderCardMediator(id, _controller, metadata);
                break;
            case "tpHeaderIcon":
                m = new HeaderIconMediator(id, _controller, metadata);
                break;
            case "tpHeaderTitle":
                m = new HeaderTitleMediator(id, _controller, metadata);
                break;
            case "tpHeaderClose":
                m = new HeaderCloseMediator(id, _controller, metadata);
                break;

            //excerpt card
            case "tpExcerptCard":
                m = new ExcerptCardMediator(id, _controller, metadata);
                break;
            case "tpExcerptVideo":
                m = new ExcerptVideoMediator(id, _controller, metadata);
                break;
            case "tpExcerptInstructions":
                m = new ExcerptInstructionsMediator(id, _controller, metadata);
                break;
            case "tpExcerptPlay":
                m = new ExcerptPlayMediator(id, _controller, metadata);
                break;
            case "tpExcerptSlider":
                m = new ExcerptExcerptSliderMediator(id, _controller, metadata);
                break;

            //form holder card
            case "tpShareCard":
                m = new ShareCardMediator(id, _controller, metadata);
                break;

            //single sharing button
            case "tpSharingSite":
                m = new DefaultSharingSiteMediator(id, _controller, metadata);
                break;

            //single sharing card
            case "tpSingleShareCard":
                m = new DefaultSingleShareCardMediator(id, _controller, metadata);
                break;
            case "tpSingleShareId":
                m = new SingleShareIdMediator(id, _controller, metadata);
                break;
            case "tpSingleShareTitleText":
                m = new SingleShareTitleMediator(id, _controller, metadata);
                break;
            case "tpSingleShareClipText":
                m = new SingleShareClipTitleMediator(id, _controller, metadata);
                break;
            case "tpSingleShareInstructions":
                m = new SingleShareInstructionsMediator(id, _controller, metadata);
                break;
            case "tpSingleSharePost":
                m = new SingleSharePostMediator(id, _controller, metadata);
                break;

            // email card mediators
            case "tpEmail":
                if (!showEmail())
                    return null;
                m = new DefaultEmailMediator(metadata.id, _controller, metadata);
                break;
            case "tpEmailCard":
                m = new EmailCardMediator(id, _controller, metadata);
                break;
            case "tpEmailSender":
                m = new EmailSenderMediator(id, _controller, metadata);
                break;
            case "tpEmailSendTo":
                m = new EmailSendToMediator(id, _controller, metadata);
                break;
            case "tpEmailMessage":
                m = new EmailMessageMediator(id, _controller, metadata);
                break
            case "tpEmailSend":
                m = new EmailSendMediator(id, _controller, metadata);
                break;
            case "tpEmailCancel":
                m = new EmailCancelMediator(id, _controller, metadata);
                break;

            // info card mediators
            case "tpInfo":
                m = new DefaultInfoMediator(metadata.id, _controller, metadata);
                break;
            case "tpInfoCard":
                m = new InfoCardMediator(id, _controller, metadata);
                break;
            case "tpInfoTitle":
                m = new InfoTitleMediator(id, _controller, metadata);
                break;
            case "tpInfoAuthor":
                m = new InfoAuthorMediator(id, _controller, metadata);
                break;
            case "tpInfoDescription":
                m = new InfoDescriptionMediator(id, _controller, metadata);
                break;
            case "tpInfoCopyright":
                m = new InfoCopyrightMediator(id, _controller, metadata);
                break;

            // Embed Form
            case "tpEmbed":
                if (!showEmbed())
                    return null;
                m = new DefaultEmbedMediator(metadata.id, _controller, metadata);
                break;
            case "tpEmbedCard":
                m = new EmbedCardMediator(id, _controller, metadata);
                break;
            case "tpEmbedText":
                m = new EmbedTextMediator(id, _controller, metadata);
                break;
            case "tpEmbedCopyToClipboard":
                m = new EmbedCopyToClipboardMediator(id, _controller, metadata);
                break;
            case "tpEmbedCheckbox":
                m = new EmbedCheckboxMediator(id, _controller, metadata);
                break;
            case "tpEmbedClose":
                m = new EmbedCloseMediator(id, _controller, metadata);
                break;

            // Link Form
            case "tpLink":
                if (!showLink())
                    return null;
                m = new DefaultLinkMediator(metadata.id, _controller, metadata);
                break;
            case "tpLinkCard":
                m = new LinkCardMediator(id, _controller, metadata);
                break;
            case "tpLinkText":
                m = new LinkTextMediator(id, _controller, metadata);
                break;
            case "tpLinkCopyToClipboard":
                m = new LinkCopyToClipboardMediator(id, _controller, metadata);
                break;
            case "tpLinkCheckbox":
                m = new LinkCheckboxMediator(id, _controller, metadata);
                break;
            case "tpLinkClose":
                m = new LinkCloseMediator(id, _controller, metadata);
                break;

            // RSS Form
            case "tpRss":
            case "tpRSS":
                if (!showRss())
                    return null;
                m = new DefaultRssMediator(metadata.id, _controller, metadata);
                break;
            case "tpRssCard":
                m = new RssCardMediator(id, _controller, metadata);
                break;
            case "tpRssText":
                m = new RssTextMediator(id, _controller, metadata);
                break;
            case "tpRssCopyToClipboard":
                m = new RssCopyToClipboardMediator(id, _controller, metadata);
                break;
            case "tpRssCheckbox":
                m = new RssCheckboxMediator(id, _controller, metadata);
                break;
            case "tpRssClose":
                m = new RssCloseMediator(id, _controller, metadata);
                break;


            // Post Form
            case "tpPost":
                if (!showPost())
                    return null;
                m = new DefaultPostMediator(metadata.id, _controller, metadata);
                break;
            case "tpPostCard":
                m = new PostCardMediator(id, _controller, metadata);
                break;
            case "tpPostText":
                //m = new PostTextMediator(id, _controller, metadata);
                break;
            case "tpPostClose":
                m = new PostCloseMediator(id, _controller, metadata);
                break;
            case "tpSiteList":
                m = new PostSiteListMediator(id, _controller, metadata);
                break;

            case "tpRelatedItemsControlGroup":
                m = new RelatedItemsGroupMediator(id, _controller, metadata);
                break;
            // menu
            case "tpRelatedItems":
                if (!showRelatedItems())
                    return null;
                m = new RelatedItemsMediator(id, _controller, metadata);
                break;
            case "tpRelatedItemsTitle":
                if (!showRelatedItems())
                    return null;
                m = new RelatedItemsTitleMediator(id, _controller, metadata);
                break;
            case "tpRelatedItemsRange":
                if (!showRelatedItems())
                    return null;
                m = new RelatedItemsRangeMediator(id, _controller, metadata);
                break;
            case "tpRelatedItemsClipTitle":
                if (!showRelatedItems())
                    return null;
                m = new RelatedItemsClipTitleMediator(id, _controller, metadata);
                break;

            //Login form
            case "tpLoginCard":
                m = new DefaultLoginCardMediator(id, _controller, metadata);
                break;
            case "tpLoginCancel":
                m = new LoginCloseMediator(id, _controller, metadata);
                break;
            case "tpLoginSubmit":
                m = new LoginSubmitMediator(id, _controller, metadata);
                break;
            case "tpLoginUsername":
                m = new LoginUserNameMediator(id, _controller, metadata);
                break;
            case "tpLoginPassword":
                m = new LoginPasswordMediator(id, _controller, metadata);
                break;
            case "tpLoginInstructions":
                m = new LoginInstructionsMediator(id, _controller, metadata);
                break;
            case "tpLoginError":
                m = new LoginErrorMediator(id, _controller, metadata);
                break;
            default:
                break;
        }
        return m;
    }

    //we're selecting on type here rather than id
    public function getNonLoadableItem(metadata:ItemMetaData):Item
    {
        var item:Item;
        switch (metadata.type)
        {
            case "link":
                //TO DO: we may want to create a special link control
                item = new ButtonControl(metadata.id, metadata);
                break;
        }
        return item;
    }

    //we're selecting on type here rather than id
    public function getNonLoadableMediator(domItem:ItemMetaData):Mediator
    {
        var m:Mediator;
        switch (domItem.type)
        {
            case "link":
                m = new CardLinkMediator(domItem.id, _controller, domItem);
                break;
        }
        return m;
    }

    public function finalize(componentArea:ComponentArea):void
    {

    }

    private function registerValidControls():void
    {
        var controllerId:String = _controller.id;
        ViewFactory.registerControlValidFunction("tpEmail", showEmail, controllerId);
        ViewFactory.registerControlValidFunction("tpLink", showLink, controllerId);
        ViewFactory.registerControlValidFunction("tpEmbed", showEmbed, controllerId);
        ViewFactory.registerControlValidFunction("tpRss", showRss, controllerId);
        ViewFactory.registerControlValidFunction("tpRSS", showRss, controllerId);
        ViewFactory.registerControlValidFunction("tpPost", showPost, controllerId);
        ViewFactory.registerControlValidFunction("tpRelatedItems", showRelatedItems, controllerId);
        ViewFactory.registerControlValidFunction("tpRelatedItemsTitle", showRelatedItems, controllerId);
        ViewFactory.registerControlValidFunction("tpRelatedItemsRange", showRelatedItems, controllerId);
        ViewFactory.registerControlValidFunction("tpRelatedItemsControlGroup", showRelatedItems, controllerId);
        ViewFactory.registerControlValidFunction("tpEmailCard", "tpEmail", controllerId);
        ViewFactory.registerControlValidFunction("tpLinkCard", "tpLink", controllerId);
        ViewFactory.registerControlValidFunction("tpEmbedCard", "tpEmbed", controllerId);
        ViewFactory.registerControlValidFunction("tpRssCard", "tpRss", controllerId);
        ViewFactory.registerControlValidFunction("tpPostCard", "tpPost", controllerId);


        ViewFactory.registerControlFullScreenInValid("tpEmail", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpLink", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpEmbed", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpRss", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpRSS", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpEmailCard", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpLinkCard", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpEmbedCard", controllerId);
        ViewFactory.registerControlFullScreenInValid("tpRssCard", controllerId);
        //ViewFactory.registerControlFullScreenInValid("tpShare", controllerId);
        //ViewFactory.registerControlFullScreenInValid("tpShareCard", controllerId);
    }

    private function showEmail():Boolean
    {
        return _controller.getProperty("emailServiceUrl") && _controller.getProperty("playerUrl");
    }

    private function showLink():Boolean
    {
        return (_controller.getProperty("playerUrl") && _controller.getProperty("allowLink") != "false");
    }

    private function showEmbed():Boolean
    {
        return Boolean(_controller.getProperty("embeddedPlayerHtml"));
    }

    private function showRss():Boolean
    {
        return Boolean(_controller.getProperty("rssUrl")) && Boolean(_controller.getProperty("allowRss") != "false");
    }

    private function showPost():Boolean
    {
        var sharingSites:Array = _controller.getSharingSite();

        return (sharingSites.length > 0 && Boolean(_controller.getProperty("playerUrl")) && _controller.getProperty("allowLink") != "false");
    }

    private function showRelatedItems():Boolean
    {
        var showRI:Boolean = Boolean(_controller.getProperty("relatedItemsURL"));
        return showRI;
    }


}
}
