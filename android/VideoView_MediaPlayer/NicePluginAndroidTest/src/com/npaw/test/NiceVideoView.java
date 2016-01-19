package com.npaw.test;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.VideoView;

public class NiceVideoView extends VideoView {

	public NiceVideoView(Context context) {
		super(context);
	}

	public NiceVideoView(Context context, AttributeSet attributeSet) {
		super(context, attributeSet);
	}

	private final String foo = "foo";

	public String getFoo() {
		return foo;
	}

}
