/**
	_moon.Item_ is a focusable Moonstone-styled control that can display simple
	text.
*/
enyo.kind({
	name: "moon.Item",
	//* @protected
	classes: "moon-item",
	mixins: ["moon.MarqueeSupport", "moon.MarqueeItem"],
	spotlight: true,
	handlers: {
		onSpotlightFocused: "spotlightFocused"
	},
	//* @public
	published: {
		/**
			When true, the control is shown as disabled and does not generate tap
			events
		*/
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		if (this.children.length) {
			this.addClass("allow-wrap");
		}
	},
	disabledChanged: function(inOld) {
		this.addRemoveClass("disabled", this.disabled);
	},
	spotlightFocused: function(inSender, inEvent) {
		if (inEvent.originator === this) {
			this.bubble("onRequestScrollIntoView");
		}
	}
});
