// This is the container for the release list

package com.theplatform.pdk.views
{
	import com.theplatform.pdk.component.ComponentContainer;
	import com.theplatform.pdk.component.ReleaseListTemplate;
	
	import flash.display.Sprite;

	public class ReleaseListTemplateContainer extends Sprite
	{
		private var _releaseList:ReleaseListTemplate;
		
		public function ReleaseListTemplateContainer()
		{
			// create the release list
			_releaseList = new ReleaseListTemplate(this);
			
			// load any FlashVars for the component
			_releaseList.loadFlashVars();
			
			// add it to the container
			var cc:ComponentContainer = ComponentContainer.getInstance();
			cc.addComponent(_releaseList);
			cc.commit(this.stage);
		}
	}
}