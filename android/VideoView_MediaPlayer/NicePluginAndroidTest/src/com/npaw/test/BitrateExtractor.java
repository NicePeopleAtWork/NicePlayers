package com.npaw.test;

import android.app.Activity;
import android.content.Context;
import android.media.MediaMetadataRetriever;
import android.os.Build;
import android.util.Log;

import com.npaw.plugin.YouboraMetadata;
import com.npaw.plugin.YouboraStdLog;

import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Created by root on 21/10/15.
 */
public class BitrateExtractor {

    public static ExecutorService exec = Executors.newCachedThreadPool();

    public static void getBitrate( final String uri, final YouboraMetadata metadata) {

        exec.submit(new Runnable() {
            @Override
            public void run() {
                YouboraStdLog.d("Executing getBitrate from executor!");
                MediaMetadataRetriever mmr = null;
                try {
                    mmr = new MediaMetadataRetriever();
                    if (Build.VERSION.SDK_INT >= 14)
                        mmr.setDataSource(uri, new HashMap<String, String>());
                    else
                        mmr.setDataSource(uri);
                    String bitrate = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE);
                    YouboraStdLog.d("--- got bitrate: " + bitrate + " ---");
                    metadata.setBitrate(Double.parseDouble(bitrate));
                } catch (Exception ex) {
                    ex.printStackTrace();
                } finally {
                    if (mmr != null) {
                        mmr.release();
                        mmr = null;
                    }
                }
            }
        });
    }
}
