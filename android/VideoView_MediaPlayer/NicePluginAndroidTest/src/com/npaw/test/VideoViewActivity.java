package com.npaw.test;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.res.Configuration;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnInfoListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.widget.MediaController;
import android.widget.Toast;
import android.widget.VideoView;

import com.npaw.plugin.Youbora;
import com.npaw.plugin.YouboraMetadata;
import com.npaw.plugin.YouboraStdLog;
import com.npaw.plugin.concurrency.YouboraConcurrencyCallback;
import com.npaw.plugin.concurrency.YouboraConcurrencyConfiguration;
import com.npaw.plugin.resume.YouboraResumeCallback;
import com.npaw.plugin.resume.YouboraResumeConfiguration;
import com.npaw.plugin.utils.YouboraLog.YouboraLogLevel;

import java.util.HashMap;
import java.util.Map;

public class VideoViewActivity extends Activity {

    private VideoView view;
    private final String TAG = "VideoViewActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        boolean live = false;
        Log.v(TAG, "---------------- onCreate VIDEOVIEW----------------");
        // retrieve selected video URI
        String uri = getIntent().getStringExtra("uri");
        String name = getIntent().getStringExtra("title");

        if (name.contains("live")) {
            live = true;
        }
        YouboraStdLog.setLogLevel(YouboraLogLevel.DEBUG);
        YouboraConcurrencyConfiguration ncc = new YouboraConcurrencyConfiguration();
        ncc.setCallback(new YouboraConcurrencyCallback() {

            @Override
            public void concurrencyDisconnect() {
                view.stopPlayback();
                Toast.makeText(getApplicationContext(), "Received disconnect!",
                        Toast.LENGTH_LONG).show();
            }
        });
        ncc.setcIpMode(false);
        ncc.setcMaxCount(1);
        ncc.setConcurrencyCode(Settings.generateConcurrencyCode(uri, name));
        ncc.setcRedirectURL("");
        ncc.setSystemCode(Settings.NPAW_SYSTEM);

        YouboraResumeConfiguration nrc = new YouboraResumeConfiguration();
        nrc.setCallback(new YouboraResumeCallback() {

            @Override
            public void resume(int seconds) {
                openAlert(seconds);
            }
        });
        nrc.setContentId(Settings.generateResumeContentId(uri, name));
        nrc.setUserId("testuser1234");

        // plug-in initialization

        HashMap<String, Object> conf = new HashMap<String, Object>();
        conf.put(Youbora.CONCURRENCY_CONF, ncc);
        conf.put(Youbora.RESUME_CONF, nrc);

        boolean enableAnalytics = true;
        if (name.contains("NOANALYTICS")) {
            enableAnalytics = false;
        }
        Youbora.init(Settings.NPAW_SYSTEM, Settings.NPAW_USER,
                getApplicationContext(), conf, enableAnalytics, false);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        view = (VideoView) findViewById(R.id.videoview);

        // source metadata
        Map<String, Object> properties = new HashMap<String, Object>();
        properties.put("filename", name);
        properties.put("content_id", name);
        Map<String, String> metadataMap = new HashMap<String, String>();
        metadataMap.put("title", name);
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
        YouboraMetadata metadata = new YouboraMetadata(uri, live, properties);

        BitrateExtractor.getBitrate(uri, metadata);

        metadata.setParam1("extraParam1");
        metadata.setParam2("extraParam2");
        metadata.setTransaction("android_t");
        // create session to start tracking
        Log.d(TAG, "setting properties in metadata");
        view.setVideoURI(Uri.parse(uri));
        view.setMediaController(new MediaController(this));
        view.setOnErrorListener(onErrorListener);
        view.setOnPreparedListener(onPreparedListener);
        Youbora.createSession(view, metadata);

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
        }
    };

    private OnInfoListener onInfoListener = new OnInfoListener() {
        @Override
        public boolean onInfo(MediaPlayer mp, int what, int extra) {
            Log.v(TAG, "---------------- onInfo ----------------");
            return true;
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
        public boolean onError(MediaPlayer mp, int what, int extra) {
            Log.v(TAG, "---------------- onError ----------------");
            Toast.makeText(getApplicationContext(), "on Error!",
                    Toast.LENGTH_LONG).show();
            finish();
            return true;
        }
    };

    @Override
    protected void onStop() {
        view.stopPlayback();
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

    private void openAlert(final int seconds) {

        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this,
                AlertDialog.THEME_HOLO_LIGHT);
        alertDialogBuilder.setTitle("Seek to?");
        alertDialogBuilder.setMessage("Do you want to seek to second "
                + seconds);
        // set positive button: Yes message
        alertDialogBuilder.setPositiveButton("Yes",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        view.seekTo(seconds);
                        Youbora.setResumed(true);
                    }
                });
        // set negative button: No message
        alertDialogBuilder.setNegativeButton("No",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        // cancel the alert box and put a Toast to the user
                        dialog.cancel();
                        // view.seekTo(0);
                    }
                });
        // // set neutral button: Exit the app message
        // alertDialogBuilder.setNeutralButton("Cancel",
        // new DialogInterface.OnClickListener() {
        // public void onClick(DialogInterface dialog, int id) {
        // // exit the app and go to the HOME
        //
        // }
        // });

        AlertDialog alertDialog = alertDialogBuilder.create();
        // show alert
        Log.v(TAG, "isFinishing? " + this.isFinishing());
        alertDialog.show();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.v(TAG, "---------------- onConfigurationChanged ----------------");
        super.onConfigurationChanged(newConfig);
    }
}