package com.npaw.test;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnInfoListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.SurfaceHolder;
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

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class MediaPlayerActivity extends Activity implements
        SurfaceHolder.Callback {

    private MediaPlayer mediaPlayer;
    private boolean sessionCreated = false;
    private final String TAG = "MediaPlayerActivity";

    private int curPos;
    private long seekTo;
    private boolean prepared;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        boolean live = false;
        String uri = getIntent().getStringExtra("uri");
        String name = getIntent().getStringExtra("title");

        if (name.contains("live")) {
            live = true;
        }
        Log.v(TAG, "---------------- onCreate MEDIAPLAYER----------------");
        YouboraStdLog.setLogLevel(YouboraLogLevel.DEBUG);
        YouboraConcurrencyConfiguration ncc = new YouboraConcurrencyConfiguration();
        ncc.setCallback(new YouboraConcurrencyCallback() {

            @Override
            public void concurrencyDisconnect() {
                mediaPlayer.stop();
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

        Map<String, Object> conf = new HashMap<String, Object>();
        conf.put(Youbora.CONCURRENCY_CONF, ncc);
        conf.put(Youbora.RESUME_CONF, nrc);

        // plug-in initialization
        boolean enableAnalytics = true;
        if (name.contains("NOANALYTICS")) {
            enableAnalytics = false;
        }

        Youbora.init(Settings.NPAW_SYSTEM, Settings.NPAW_USER,
                getApplicationContext(), conf, enableAnalytics, false);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        getWindow().setFormat(PixelFormat.UNKNOWN);
        VideoView surfaceView = (VideoView) findViewById(R.id.videoview);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        surfaceHolder.addCallback(this);

        surfaceHolder.setFixedSize(600, 800);
        // retrieve selected video URI

        mediaPlayer = new MediaPlayer();
        mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
        // create session to start tracking

        try {

            mediaPlayer.setDataSource(getApplicationContext(), Uri.parse(uri));
            mediaPlayer.setOnInfoListener(onInfoListener);
            mediaPlayer.setOnCompletionListener(onCompletionListener);
            mediaPlayer.setOnErrorListener(onErrorListener);
            mediaPlayer.setOnPreparedListener(onPreparedListener);
            mediaPlayer.prepareAsync();

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

            if (sessionCreated == false) {
                YouboraMetadata metadata = new YouboraMetadata(uri, live,
                        properties);
                BitrateExtractor.getBitrate(uri, metadata);
                metadata.setParam1("extraParam1");
                metadata.setParam2("extraParam2");
                metadata.setTransaction("android_t");
                Youbora.createSession(mediaPlayer, metadata);
                sessionCreated = true;
            }

        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        } catch (SecurityException e) {
            e.printStackTrace();
        } catch (IllegalStateException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private OnPreparedListener onPreparedListener = new OnPreparedListener() {
        @Override
        public void onPrepared(MediaPlayer mp) {
            Log.v(TAG, "---------------- onPrepared ----------------");
            mediaPlayer.start();
            if (seekTo > 0) {
                mediaPlayer.seekTo((int) seekTo);
            }

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
            Toast.makeText(getApplicationContext(), "Play failed!",
                    Toast.LENGTH_SHORT).show();
            finish();
            return true;
        }
    };

    @Override
    protected void onStop() {
        Log.v(TAG, "---------------- onStop ----------------");
        mediaPlayer.stop();
        mediaPlayer.release();
        Youbora.stopSession();
        super.onStop();
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.v(TAG, "---------------- onPause ----------------");

        curPos = mediaPlayer.getCurrentPosition();
        mediaPlayer.pause();
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

        if (curPos > 0) {
            mediaPlayer.start();
            Youbora.restartSession();
        }

    }

    @Override
    protected void onDestroy() {
        Log.v(TAG, "---------------- onDestroy ----------------");
        super.onDestroy();
    }

    @Override
    public void surfaceChanged(SurfaceHolder arg0, int arg1, int arg2, int arg3) {

    }

    @Override
    public void surfaceCreated(SurfaceHolder arg0) {
        mediaPlayer.setDisplay(arg0);
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder arg0) {
        Youbora.stopSession();

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
                        seekTo = seconds;
                        Youbora.setResumed(true);
                        if (prepared == true) {
                            mediaPlayer.seekTo((int) seekTo);
                        }
                    }
                });
        // set negative button: No message
        alertDialogBuilder.setNegativeButton("No",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        // cancel the alert box and put a Toast to the user
                        dialog.cancel();
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
        try {
            alertDialog.show();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        Log.v(TAG, "---------------- onConfigurationChanged ----------------");
        super.onConfigurationChanged(newConfig);
    }
}