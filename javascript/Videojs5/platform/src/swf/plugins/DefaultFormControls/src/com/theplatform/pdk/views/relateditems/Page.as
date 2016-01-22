package com.theplatform.pdk.views.relateditems
{
	import com.theplatform.pdk.containers.SkinnedLayoutContainer;
	import com.theplatform.pdk.controllers.IViewController;
	import com.theplatform.pdk.events.RelatedItemInteractionEvent;
	import com.theplatform.pdk.views.RelatedItemRenderer;

	public class Page extends SkinnedLayoutContainer
	{
		public static var DEFAULT_HORIZONTAL_GAP:uint = 0;
		
		public var releases:Array;
		private var _relatedItemsPerPage:uint;
		
		public function Page(controller:IViewController, releases:Array, relatedItemsPerPage:uint)
		{
			super(controller, null);
			
			this.releases = releases;
			
			_relatedItemsPerPage = _relatedItemsPerPage;
			
		//	horizontalGap = DEFAULT_HORIZONTAL_GAP;
			
			for (var i:uint = 0; i < relatedItemsPerPage ; i ++)
			{
				var renderer:RelatedItemRenderer = new RelatedItemRenderer(_controller, null, releases[i]);
				addChild(renderer);
			}
		}
	}
}