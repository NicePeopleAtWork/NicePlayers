/*
 * (c)Copyright 2011 Widevine Technologies, Inc
 */

package com.widevine.demo;

import java.util.HashMap;
import java.util.Map;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.MediaController;
import android.widget.ScrollView;
import android.widget.TextView;

import com.npaw.plugin.Youbora;
import com.npaw.plugin.YouboraMetadata;
import com.npaw.plugin.YouboraStdLog;
import com.npaw.plugin.utils.YouboraLog.YouboraLogLevel;
import com.npaw.test.R;
import com.npaw.test.Settings;

public class VideoViewWidevineActivity extends Activity {

	private final static float BUTTON_FONT_SIZE = 10;
	private final static String EXIT_FULLSCREEN = "Exit Full Screen";
	private final static String FULLSCREEN = "Enter Full Screen";
	private final static String PLAY = "Play";
	private final static int REFRESH = 1;
	private final String TAG = "VideoViewWidevineActivity";

	private WidevineDrm drm;
	private FullScreenVideoView videoView;
	private String assetUri;
	private TextView logs;
	private ScrollView scrollView;
	private Context context;
	private ClipImageView bgImage;
	private Button playButton;
	private Button fullScreen;
	private Handler hRefresh;
	private View contentView;
	private LinearLayout main;
	private LinearLayout sidePanel;
	private boolean enteringFullScreen;
	private int width, height;

	/* ******************************************************************* */
	private void initPlugin() {
		YouboraStdLog.setLogLevel(YouboraLogLevel.DEBUG);
		Youbora.init(Settings.NPAW_SYSTEM, Settings.NPAW_USER,
				getApplicationContext());
	}

	private void createPluginSession() {
		Map<String, Object> properties = new HashMap<String, Object>();
		properties.put("filename", "wakawaka");
		properties.put("content_id", "wakawaka");
		properties.put("title", "Widevine resource");
		Map<String, String> metadataMap = new HashMap<String, String>();
		metadataMap.put("title", "Widevine resource");
		metadataMap.put("genre", "");
		metadataMap.put("language", "");
		metadataMap.put("year", "");
		metadataMap.put("cast", "");
		metadataMap.put("director", "");
		metadataMap.put("owner", "");
		metadataMap.put("duration", "120");
		metadataMap.put("parental", "");
		metadataMap.put("price", "");
		metadataMap.put("rating", "");
		metadataMap.put("audioType", "");
		metadataMap.put("audioChannels", "");
		properties.put("content_metadata", metadataMap);
		properties.put("transaction_type", "value1");
		properties.put("quality", "value2");
		properties.put("content_type", "value2");
		Map<String, String> deviceMap = new HashMap<String, String>();
		deviceMap.put("manufacturer", "");
		deviceMap.put("type", "");
		deviceMap.put("year", "");
		deviceMap.put("firmware", "");
		properties.put("device", deviceMap);

		YouboraMetadata metadata = new YouboraMetadata(assetUri, false,
				properties);
		metadata.setTransaction("android_t");
		metadata.setParam1("extraParam1");
		metadata.setParam2("extraParam2");
		metadata.setContext(getApplicationContext());
		metadata.setTransaction("android_t");
		//metadata.setSecure(true);

		// create session to start tracking
		Youbora.createSession(videoView, metadata);
	}

	/* ******************************************************************* */

	@SuppressWarnings("deprecation")
	public void onCreate(Bundle savedInstanceState) {
		Log.v(TAG, "---------------- onCreate ----------------");

		/* ******************************************************************* */
		initPlugin();
		/* ******************************************************************* */

		super.onCreate(savedInstanceState);
		Display display = getWindowManager().getDefaultDisplay();
		height = display.getHeight();
		width = display.getWidth();
		context = this;
		contentView = createView();
		if (drm.isProvisionedDevice()) {
			setContentView(contentView);
		} else {
			setContentView(R.layout.notprovisioned);
		}
	}

	/* ******************************************************************* */
	@Override
	protected void onRestart() {
		Log.v(TAG, "---------------- onRestart ----------------");
		Youbora.restartSession();
		super.onRestart();
	}

	/* ******************************************************************* */

	@Override
	protected void onStop() {
		Log.v(TAG, "---------------- onStop ----------------");
		if (videoView != null) {
			if (videoView.isPlaying()) {
				stopPlayback(false);
			}
		}
		super.onStop();
	}

	@SuppressLint("HandlerLeak")
	@SuppressWarnings("deprecation")
	private View createView() {
		enteringFullScreen = false;

		// set URI and DRM server from the media asset
		Intent intent = getIntent();
		assetUri = intent.getStringExtra("uri").replaceAll("wvplay", "http");
		WidevineDrm.Settings.PORTAL_NAME = intent.getStringExtra("portalName");
		WidevineDrm.Settings.DRM_SERVER_URI = intent
				.getStringExtra("drmServerUri");

		drm = new WidevineDrm(this);
		drm.logBuffer.append("Asset Uri: " + assetUri + "\n");
		drm.logBuffer.append("Drm Server: "
				+ WidevineDrm.Settings.DRM_SERVER_URI + "\n");
		drm.logBuffer.append("Device Id: " + WidevineDrm.Settings.DEVICE_ID
				+ "\n");
		drm.logBuffer.append("Portal Name: " + WidevineDrm.Settings.PORTAL_NAME
				+ "\n");

		// Set log update listener
		WidevineDrm.WidevineDrmLogEventListener drmLogListener = new WidevineDrm.WidevineDrmLogEventListener() {

			public void logUpdated() {
				updateLogs();
			}
		};

		logs = new TextView(this);
		drm.setLogListener(drmLogListener);
		drm.registerPortal(WidevineDrm.Settings.PORTAL_NAME);

		scrollView = new ScrollView(this);
		scrollView.addView(logs);

		// Set message handler for log events
		hRefresh = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				switch (msg.what) {
				case REFRESH:
					/* Refresh UI */
					logs.setText(drm.logBuffer.toString());
					scrollView.fullScroll(ScrollView.FOCUS_DOWN);
					break;
				}
			}
		};

		updateLogs();

		sidePanel = new LinearLayout(this);
		sidePanel.setOrientation(LinearLayout.VERTICAL);

		sidePanel.addView(scrollView, new LinearLayout.LayoutParams(
				(int) (width * 0.35), (int) (height * 0.5)));

		LinearLayout.LayoutParams paramsSidePanel = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.WRAP_CONTENT,
				LinearLayout.LayoutParams.WRAP_CONTENT);
		paramsSidePanel.gravity = Gravity.CENTER;
		sidePanel.addView(createButtons(), paramsSidePanel);

		FrameLayout playerFrame = new FrameLayout(this);

		videoView = new FullScreenVideoView(this);

		playerFrame.addView(videoView, new FrameLayout.LayoutParams(
				LinearLayout.LayoutParams.WRAP_CONTENT,
				FrameLayout.LayoutParams.MATCH_PARENT));

		bgImage = new ClipImageView(this);
		bgImage.setBackgroundDrawable(getResources().getDrawable(
				R.drawable.play_shield));

		bgImage.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				startPlayback(false);

			}
		});

		fullScreen = new Button(this);
		fullScreen.setText(FULLSCREEN);

		fullScreen.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				int currentPosition = videoView.getCurrentPosition();
				videoView.setVisibility(View.INVISIBLE);
				if (fullScreen.getText().equals(FULLSCREEN)) {

					videoView.setFullScreen(true);
					fullScreen.setText(EXIT_FULLSCREEN);
					enteringFullScreen = true;
				} else {
					videoView.setFullScreen(false);
					fullScreen.setText(FULLSCREEN);
				}
				videoView.setVisibility(View.VISIBLE);

				stopPlayback(true);
				startPlayback(true);
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
				}
				videoView.seekTo(currentPosition);
			}
		});
		playerFrame.addView(fullScreen, new FrameLayout.LayoutParams(
				FrameLayout.LayoutParams.WRAP_CONTENT,
				FrameLayout.LayoutParams.WRAP_CONTENT));
		fullScreen.setVisibility(View.INVISIBLE);
		playerFrame.addView(bgImage, new FrameLayout.LayoutParams(
				FrameLayout.LayoutParams.WRAP_CONTENT,
				FrameLayout.LayoutParams.WRAP_CONTENT));

		main = new LinearLayout(this);
		main.addView(playerFrame,
				new LinearLayout.LayoutParams((int) (width * 0.65),
						LinearLayout.LayoutParams.MATCH_PARENT, 1));
		main.addView(sidePanel, new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.WRAP_CONTENT,
				LinearLayout.LayoutParams.MATCH_PARENT, 3));

		return main;
	}

	private void startPlayback(boolean fullscreenChange) {
		playButton.setText(R.string.stop);
		bgImage.setVisibility(View.GONE);

		videoView.setVideoPath(assetUri);
		videoView.setMediaController(new MediaController(context));

		videoView.setOnErrorListener(new OnErrorListener() {
			public boolean onError(MediaPlayer mp, int what, int extra) {
				String message = "Unknown error";
				switch (what) {
				case MediaPlayer.MEDIA_ERROR_UNKNOWN:
					message = "Unable to play media";
					break;
				case MediaPlayer.MEDIA_ERROR_SERVER_DIED:
					message = "Server failed";
					break;
				case MediaPlayer.MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK:
					message = "Invalid media";
					break;
				}
				drm.logBuffer.append(message + "\n");
				updateLogs();
				bgImage.setVisibility(View.VISIBLE);
				return false;
			}
		});
		videoView.setOnCompletionListener(new OnCompletionListener() {
			public void onCompletion(MediaPlayer mp) {
				stopPlayback(false);
			}
		});

		/* ******************************************************************* */
		if(fullscreenChange==false)
			createPluginSession();
		/* ******************************************************************* */

		videoView.requestFocus();

		videoView.start();

		if (videoView.getFullScreen()) {
			sidePanel.setVisibility(View.GONE);
		} else {
			sidePanel.setVisibility(View.VISIBLE);
		}

		fullScreen.setVisibility(View.VISIBLE);
		videoView.setFullScreenDimensions(
				contentView.getRight() - contentView.getLeft(),
				contentView.getBottom() - contentView.getTop());
	}

	private void stopPlayback(boolean fullscreenChange) {
		/* ******************************************************************* */
		Log.v(TAG, "---------------- stopPlayback ----------------");
		if(fullscreenChange==false)
			Youbora.stopSession();
		/* ******************************************************************* */

		playButton.setText(R.string.play);
		bgImage.setVisibility(View.VISIBLE);

		videoView.stopPlayback();

		fullScreen.setVisibility(View.INVISIBLE);
		if (videoView.getFullScreen() && !enteringFullScreen) {
			videoView.setVisibility(View.INVISIBLE);
			videoView.setFullScreen(false);
			videoView.setVisibility(View.VISIBLE);
			sidePanel.setVisibility(View.VISIBLE);
			fullScreen.setText(FULLSCREEN);
		}
		enteringFullScreen = false;
	}

	private View createButtons() {
		playButton = new Button(this);
		playButton.setText(R.string.play);
		playButton.setTextSize(BUTTON_FONT_SIZE);

		playButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				Button b = (Button) v;
				if (b.getText().equals(PLAY)) {
					startPlayback(false);
				} else {
					stopPlayback(false);
				}
			}
		});

		Button rightsButton = new Button(this);
		rightsButton.setText(R.string.acquire_rights);
		rightsButton.setTextSize(BUTTON_FONT_SIZE);

		rightsButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				drm.acquireRights(assetUri);
				updateLogs();
			}
		});

		Button removeButton = new Button(this);
		removeButton.setText(R.string.remove_rights);
		removeButton.setTextSize(BUTTON_FONT_SIZE);

		removeButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				drm.removeRights(assetUri);
				updateLogs();
			}
		});

		Button checkButton = new Button(this);
		checkButton.setText(R.string.show_rights);
		checkButton.setTextSize(BUTTON_FONT_SIZE);

		checkButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				drm.showRights(assetUri);
				updateLogs();
			}
		});

		Button checkConstraints = new Button(this);
		checkConstraints.setText(R.string.constraints);
		checkConstraints.setTextSize(BUTTON_FONT_SIZE);

		checkConstraints.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				drm.getConstraints(assetUri);
				updateLogs();

			}
		});

		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.MATCH_PARENT,
				LinearLayout.LayoutParams.WRAP_CONTENT, 1);

		params.setMargins(0, 0, 0, 5);
		LinearLayout buttonsLeft = new LinearLayout(this);

		buttonsLeft.setOrientation(LinearLayout.VERTICAL);
		buttonsLeft.addView(playButton, params);
		buttonsLeft.addView(rightsButton, params);
		buttonsLeft.addView(checkConstraints, params);

		LinearLayout buttonsRight = new LinearLayout(this);
		buttonsRight.setOrientation(LinearLayout.VERTICAL);
		buttonsRight.addView(checkButton, params);
		buttonsRight.addView(removeButton, params);

		LinearLayout.LayoutParams paramsSides = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.MATCH_PARENT,
				LinearLayout.LayoutParams.WRAP_CONTENT, 1);
		paramsSides.gravity = Gravity.BOTTOM;

		LinearLayout buttons = new LinearLayout(this);
		buttons.addView(buttonsLeft, paramsSides);
		buttons.addView(buttonsRight, paramsSides);

		return buttons;
	}

	private void updateLogs() {
		hRefresh.sendEmptyMessage(REFRESH);
	}

	@Override
	protected void onPause() {
		Log.v(TAG, "---------------- onPause ----------------");
		onStop();
	}
}
