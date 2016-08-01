package com.theplatform.pdk.factories
//========================================================================================
//  $File: //a3t/argon/dev/sdk/examples/flex/SimpleEditorWithCSS/src/CSSFormatResolver.as $
//  $DateTime: 2009/02/19 14:22:59 $
//  $Revision: #1 $
//  $Change: 676502 $
//  
//  ADOBE CONFIDENTIAL
//  
//  Copyright 2007-08 Adobe Systems Incorporated. All rights reserved.
//  
//  NOTICE:  All information contained herein is, and remains
//  the property of Adobe Systems Incorporated and its suppliers,
//  if any.  The intellectual and technical concepts contained
//  herein are proprietary to Adobe Systems Incorporated and its
//  suppliers and may be covered by U.S. and Foreign Patents,
//  patents in process, and are protected by trade secret or copyright law.
//  Dissemination of this information or reproduction of this material
//  is strictly forbidden unless prior written permission is obtained
//  from Adobe Systems Incorporated.
//  
//========================================================================================
//  
//  
//  Modified to work independetly of the Flex framework, by using an instance
//  of StyleSheet object. 19.8.2009 timo@timokoro.com
//  
//  
//========================================================================================
{	
	import flash.text.StyleSheet;
	import flash.utils.Dictionary;
	
	import flashx.textLayout.elements.FlowElement;
	import flashx.textLayout.elements.FlowGroupElement;
	import flashx.textLayout.elements.IFormatResolver;
	import flashx.textLayout.elements.LinkElement;
	import flashx.textLayout.elements.LinkState;
	import flashx.textLayout.elements.TextFlow;
	import flashx.textLayout.formats.ITextLayoutFormat;
	import flashx.textLayout.formats.TextLayoutFormat;
	import flashx.textLayout.formats.TextLayoutFormatValueHolder;
	import flashx.textLayout.property.Property;
	import flashx.textLayout.tlf_internal;

	use namespace tlf_internal;
		
//	import mx.styles.CSSStyleDeclaration;
//	import mx.styles.StyleManager;
	
	/** This version hands back a style on demand from the dictinoary.
	 * Another way to do it would be to "redo" the cascade top down.
	 */
	public class CSSFormatResolver implements IFormatResolver {
		
		protected var _styleSheet:StyleSheet;
		private var _textLayoutFormatCache:Dictionary;
				
		static public var classToNameDictionary:Object = { "SpanElement":"span", "ParagraphElement":"p", "TextFlow":"TextFlow", "DivElement":"div" }
		
		/** Create a flex style resolver.  */
//		public function CSSFormatResolver():void {
		public function CSSFormatResolver(styleSheet:StyleSheet):void {
			_styleSheet = styleSheet;
			// cache results
			_textLayoutFormatCache = new Dictionary(true);
		}
		
		private function addStyleAttributes(attr:TextLayoutFormatValueHolder, styleSelector:String):TextLayoutFormatValueHolder 
		{
//	 		var foundStyle:CSSStyleDeclaration = StyleManager.getStyleDeclaration(styleSelector);
	 		var foundStyle:Object = _styleSheet.getStyle(styleSelector);
	 		
	 		var foundStyleValid:Boolean = false;
	 		for(var s:String in foundStyle)
	 		{
	 			// PDK - getStyle on styleSheet will return an empty Object when no style.
	 			foundStyleValid = true;
	 			break;
	 		}
	 		
	 		if(foundStyle && foundStyleValid) 
	 		{
	 			for each(var prop:Property in TextLayoutFormat.description) {
//	 				var propStyle:Object = foundStyle.getStyle(prop.name);
	 				var propStyle:Object = foundStyle[prop.name];
	 				if(propStyle) {
	 					if(attr == null) {
	 						attr = new TextLayoutFormatValueHolder();
	 					}
	 					attr[prop.name] = propStyle;
	 				}
	 			}
	 		}
	 		return attr;
	 	}
	 
	  /** Calculate the TextLayoutFormat style for a particular element. */
	 	public function resolveFormat(elem:Object):ITextLayoutFormat 
	 	{
	 		// note usage of TextLayoutFormatValueHolder.  This is just like TextLayoutFormat but optimized
	 		// for the case where only a few stles are actually filled in.  Its naming and usage is subject to change and review.
	 		var attr:TextLayoutFormatValueHolder = _textLayoutFormatCache[elem];
	 		if(attr !== null) 
	 		{
	 			return attr;
	 		}
	 			
	 		if(elem is FlowElement) 
	 		{
		 		// maps ParagraphElement to p, SpanElement to span etc.  
		 		var elemClassName:String = flash.utils.getQualifiedClassName(elem);
		 		elemClassName = elemClassName.substr(elemClassName.lastIndexOf(":")+1)
				var dictionaryName:String = classToNameDictionary[elemClassName] ;

				attr = addStyleAttributes(attr, dictionaryName ? dictionaryName : elemClassName);
				
				if(elem.styleName != null)
					attr = addStyleAttributes(attr, "." + elem.styleName);
					
				if(elem.id != null)
					attr = addStyleAttributes(attr, "#" + elem.id);
					
				// PDK
				if(elem.userStyles != null && elem.userStyles["class"] != null)
					attr = addStyleAttributes(attr, "." + elem.userStyles["class"]);
				
				_textLayoutFormatCache[elem] = attr;
			}
			// else if elem is IContainerController inherit via the container?
	 		return attr;
	 	}
 		
 		/** Calculate the user style for a particular element. */
 		public function resolveUserFormat(elem:Object,userStyle:String):* 
 		{
 			var flowElem:FlowElement = elem as FlowElement;
// 			var cssStyle:CSSStyleDeclaration;
 			var cssStyle:Object;
 			var propStyle:*;
 			
 			// support non-tlf styles
 			if(flowElem) 
 			{
//	 			trace("resolveUserFormat", elem, userStyle, flowElem.styleName);
// 				if(flowElem.id) {
//// 					cssStyle = StyleManager.getStyleDeclaration("#"+flowElem.id);
// 					cssStyle = StyleManager.instance.styleSheet.getStyle("#"+flowElem.id);
// 					if(cssStyle) {
//// 						propStyle = cssStyle.getStyle(userStyle);
// 						propStyle = cssStyle[userStyle];
// 						if(propStyle !== undefined)
// 							return propStyle;
// 					}
// 				}
 				if(flowElem.styleName) 
 				{
// 					cssStyle = StyleManager.getStyleDeclaration("."+flowElem.styleName);
 					cssStyle = _styleSheet.getStyle("."+flowElem.styleName);
 					if(cssStyle) 
 					{
// 						propStyle = cssStyle.getStyle(userStyle);
 						propStyle = cssStyle[userStyle];
 						if(propStyle !== undefined)
 							return propStyle;
 					}
 				}
 				
 				// jg
 				if(flowElem.userStyles && flowElem.userStyles["class"])
 				{
 					cssStyle = _styleSheet.getStyle("."+flowElem.userStyles["class"]);
 					if(cssStyle) 
 					{
// 						propStyle = cssStyle.getStyle(userStyle);
 						propStyle = cssStyle[userStyle];
 						if(propStyle !== undefined)
 							return propStyle;
 					}
 				}
 				
 				var elemClassName:String = flash.utils.getQualifiedClassName(flowElem);
	 			elemClassName = elemClassName.substr(elemClassName.lastIndexOf(":")+1)
				var dictionaryName:String = classToNameDictionary[elemClassName];
// 				cssStyle = StyleManager.getStyleDeclaration(dictionaryName == null ? elemClassName : dictionaryName);
 				cssStyle = _styleSheet.getStyle(!dictionaryName ? elemClassName : dictionaryName);
 				if(cssStyle) 
 				{
// 					propStyle = cssStyle.getStyle(userStyle);
 					propStyle = cssStyle[userStyle];
 					if(propStyle)
 						return propStyle;
 				}
 				
 				// Custom script to find traditional anchor styles from css
 				if(flowElem is LinkElement) 
 				{
 					var hoverStyle:Object;
 					var activeStyle:Object;
 					var prop:String;
 					switch(userStyle) 
 					{
 						case LinkState.LINK:
 						case "linkNormalFormat":
 							cssStyle = _styleSheet.getStyle("a");
 							break;
 						case LinkState.HOVER:
 						case "linkHoverFormat":
 							cssStyle = _styleSheet.getStyle("a");
 							hoverStyle = _styleSheet.getStyle("a:hover");
 							for(prop in hoverStyle) 
 							{
 								cssStyle[prop] = hoverStyle[prop];
 							}
 							break;
 						case LinkState.ACTIVE:
 						case "linkActiveFormat":
 							cssStyle = _styleSheet.getStyle("a");
 							hoverStyle = _styleSheet.getStyle("a:hover");
 							for each(prop in hoverStyle) 
 							{
 								cssStyle[prop] = hoverStyle[prop];
 							}
 							activeStyle = _styleSheet.getStyle("a:active");
 							for each(prop in activeStyle) 
 							{
 								cssStyle[prop] = activeStyle[prop];
 							}
 							break;
 					}
 					if(cssStyle) 
 					{
 						return cssStyle;
 					}
 				}
 			}
 			return undefined;
 		}
 		
 		/** Completely clear the cache.  None of the results are valid. */
 		public function invalidateAll(tf:TextFlow):void {
 			_textLayoutFormatCache = new Dictionary(true);	// clears the cache
 		}
 		
 		/** The style of one element is invalidated.  */
 		public function invalidate(target:Object):void {
 			delete _textLayoutFormatCache[target];
 			var blockElem:FlowGroupElement = target as FlowGroupElement;
 			if(blockElem) {
	 			for(var idx:int = 0; idx < blockElem.numChildren; idx++)
	 				invalidate(blockElem.getChildAt(idx));// jg - .getChildAtIndex(idx));
	 		}
 		}
 		 	
	 	/** these are sharable between TextFlows */
		public function getResolverForNewFlow(oldFlow:TextFlow,newFlow:TextFlow):IFormatResolver {
			return this;
		}
		
	}
	
}