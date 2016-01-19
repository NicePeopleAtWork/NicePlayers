package com.npaw.test;

import android.app.Activity;
import android.content.res.Configuration;
import android.media.MediaMetadataRetriever;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnInfoListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaPlayer.OnSeekCompleteListener;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.MediaController;

import com.npaw.plugin.Youbora;
import com.npaw.plugin.YouboraMetadata;
import com.npaw.plugin.YouboraStdLog;
import com.npaw.plugin.utils.YouboraLog.YouboraLogLevel;

import java.util.HashMap;
import java.util.Map;

public class ExtendingVideoViewActivity extends Activity {

    private NiceVideoView view;
    private boolean live = false;
    private final String TAG = "ExtendingVV";
    private boolean enabled = true;
    private String originalUri = "";
    private boolean forceErrorRetry = false;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.v(TAG, "---------------- onCreate extends VIDEOVIEW ---------");

        String name = getIntent().getStringExtra("title");
        forceErrorRetry = getIntent().getBooleanExtra("force_error_retry", false);
        if (name.contains("live")) {
            live = true;
        }
        // plug-in initialization
        if (enabled) {
            YouboraStdLog.setLogLevel(YouboraLogLevel.DEBUG);
            Youbora.init(Settings.NPAW_SYSTEM, Settings.NPAW_USER, getApplicationContext());
        }

        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_ext);

        // retrieve selected video URI
        originalUri = getIntent().getStringExtra("uri");
        String uri = originalUri;
        if (forceErrorRetry) {
            uri = originalUri + "errormp4";
        }
        //String uri = originalUri;
        view = (NiceVideoView) findViewById(R.id.videoviewnice);
        view.setVideoURI(Uri.parse(uri));
        MediaController mc = new MediaController(this);
        view.setMediaController(mc);
        view.setOnPreparedListener(onPreparedListener);
        view.setOnErrorListener(onErrorListener);
        // source metadata
        if (enabled) {
            Map<String, Object> properties = new HashMap<String, Object>();
            properties.put("filename", name);
            properties.put("content_id", name);
            properties.put("title", name);
            Map<String, String> metadataMap = new HashMap<String, String>();
            metadataMap.put("title", name);
            metadataMap.put("genre", "");
            metadataMap.put("language", "");
            metadataMap.put("year", "");
            metadataMap.put("cast", "");
            metadataMap.put("director", "");
            metadataMap.put("owner", "");
            metadataMap.put("duration", "100");
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
            uri = uri + "?programId=" + live;
            YouboraMetadata metadata = new YouboraMetadata(uri, live, properties);
            BitrateExtractor.getBitrate(uri, metadata);
            metadata.setParam1("extraParam1");
            metadata.setParam2("extraParam2");
            metadata.setContext(getApplicationContext());
            metadata.setTransaction("android_t");
            metadata.setPluginResetOnError(false);
            //metadata.setSecure(true);
            // create session to start tracking
            Youbora.createSession(view, metadata);
        }

        Youbora.disableAnalytics();

        Youbora.enableAnalytics();

    }

    private OnPreparedListener onPreparedListener = new OnPreparedListener() {
        @Override
        public void onPrepared(MediaPlayer mp) {
            Log.v(TAG, "---------------- onPrepared ----------------");
            view.requestFocus();
            view.start();
            mp.setOnInfoListener(onInfoListener);
            mp.setOnCompletionListener(onCompletionListener);
            mp.setOnErrorListener(onErrorListener);
            mp.setOnSeekCompleteListener(onSeekComplete);
        }
    };

    private OnInfoListener onInfoListener = new OnInfoListener() {
        @Override
        public boolean onInfo(MediaPlayer mp, int what, int extra) {
            Log.v(TAG, "---------------- onInfo ----------------");
            return true;
        }
    };

    private OnSeekCompleteListener onSeekComplete = new OnSeekCompleteListener() {

        @Override
        public void onSeekComplete(MediaPlayer mp) {
            Log.v(TAG, "---------------- onSeek ----------------");

        }
    };

    private OnCompletionListener onCompletionListener = new OnCompletionListener() {
        @Override
        public void onCompletion(MediaPlayer mp) {
            Log.v(TAG, "---------------- onCompletion ----------------");
            //finish();
        }
    };

    private OnErrorListener onErrorListener = new OnErrorListener() {
        @Override
        public boolean onError(final MediaPlayer mp, int what, int extra) {
            Log.v(TAG, "---------------- onError ----------------");
            Log.v(TAG, "Retry with original url 5 seconds after");
            if (forceErrorRetry) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        final Handler handler = new Handler();
                        handler.postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                view.setVideoURI(Uri.parse(originalUri));
                                view.start();
                                Youbora.updateResource(originalUri);
                            }
                        }, 5000);
                    }
                });
            }
            return true;
        }
    };

    @Override
    protected void onStop() {
        Log.v(TAG, "---------------- onStop ----------------");
        Youbora.stopSession();
        super.onStop();
    }

    @Override
    protected void onRestart() {
        Log.v(TAG, "---------------- onRestart ----------------");
        Youbora.restartSession();
        super.onRestart();
    }

    @Override
    protected void onResume() {
        Log.v(TAG, "---------------- onResume ----------------");
        super.onResume();
    }

    @Override
    protected void onDestroy() {
        Log.v(TAG, "---------------- onDestroy ----------------");
        super.onDestroy();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.v(TAG, "---------------- onConfigurationChanged ----------------");
        super.onConfigurationChanged(newConfig);
    }
}