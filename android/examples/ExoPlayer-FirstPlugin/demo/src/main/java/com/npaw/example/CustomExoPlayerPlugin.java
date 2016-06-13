package com.npaw.example;


import com.google.android.exoplayer.ExoPlaybackException;
import com.google.android.exoplayer.ExoPlayer;
import com.google.android.exoplayer.ExoPlayerLibraryInfo;
import com.npaw.youbora.plugins.PluginGeneric;

import org.json.JSONException;

import java.util.Map;

public class CustomExoPlayerPlugin extends PluginGeneric implements ExoPlayer.Listener {

    // Constructors
    public CustomExoPlayerPlugin(String options) throws JSONException {
        super(options);
    }

    public CustomExoPlayerPlugin(Map<String, Object> options) {
        super(options);
    }

    @Override
    protected void init() {
        super.init();
        pluginName = "ExoPlayer";
        pluginVersion = "5.3.0-c1.0-ExoPlayer";
    }

    // Start monitoring and stop monitoring
    @Override
    public void startMonitoring(Object player) {
        super.startMonitoring(player);
        getPlayer().addListener(this);
    }
    @Override
    public void stopMonitoring() {
        // Cleanup
        ExoPlayer player = getPlayer();
        if (player != null) {
            player.removeListener(this);
        }

        // Super call will send stop, kill timers, etc. and set the plugin to null
        super.stopMonitoring();
    }

    // ExoPlayer.Listener interface methods
    @Override
    public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {

        switch (playbackState) {
            case ExoPlayer.STATE_ENDED:
                endedHandler(); // Stop event
                break;
            case ExoPlayer.STATE_PREPARING:
                playHandler(); // Start event
                break;
            case ExoPlayer.STATE_READY:
                joinHandler(); // Join event
                break;
            default:
                break;
        }

        if (playWhenReady) {
            resumeHandler(); // Resume event (after pause)
        } else {
            pauseHandler(); // Pause event
        }
    }

    @Override
    public void onPlayWhenReadyCommitted() {

    }

    @Override
    public void onPlayerError(ExoPlaybackException error) {

    }

    // Private methods
    private ExoPlayer getPlayer() {
        return (ExoPlayer) this.player;
    }
}
