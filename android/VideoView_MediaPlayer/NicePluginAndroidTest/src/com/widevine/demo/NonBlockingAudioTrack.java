/*
 * Copyright (C) 2012 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.widevine.demo;

import java.util.LinkedList;

import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.os.Handler;
import android.os.Message;

class NonBlockingAudioTrack {

    private AudioTrack mAudioTrack;
    private int mSampleRate;
    private int mFrameSize;
    private int mBufferSizeInFrames;
    private int mNumFramesSubmitted = 0;

    class QueueElem {
        byte[] data;
        int offset;
        int size;
    }
    private LinkedList<QueueElem> mQueue = new LinkedList<QueueElem>();

    private Handler mHandler;
    private boolean mWriteMorePending = false;
    private static final int EVENT_WRITE_MORE = 1;

    public NonBlockingAudioTrack(int sampleRate, int channelCount) {
        int channelConfig;
        switch (channelCount) {
            case 1:
                channelConfig = AudioFormat.CHANNEL_OUT_MONO;
                break;
            case 2:
                channelConfig = AudioFormat.CHANNEL_OUT_STEREO;
                break;
            case 6:
                channelConfig = AudioFormat.CHANNEL_OUT_5POINT1;
                break;
            default:
                throw new IllegalArgumentException();
        }

        int minBufferSize =
            AudioTrack.getMinBufferSize(
                    sampleRate,
                    channelConfig,
                    AudioFormat.ENCODING_PCM_16BIT);

        int bufferSize = 2 * minBufferSize;

        mAudioTrack = new AudioTrack(
                AudioManager.STREAM_MUSIC,
                sampleRate,
                channelConfig,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize,
                AudioTrack.MODE_STREAM);

        mSampleRate = sampleRate;
        mFrameSize = 2 * channelCount;
        mBufferSizeInFrames = bufferSize / mFrameSize;

        mHandler = new Handler() {
            public void handleMessage(Message msg) {
                switch (msg.what) {
                    case EVENT_WRITE_MORE:
                        mWriteMorePending = false;
                        writeMore();
                        break;

                    default:
                        break;
                }
            }
        };
    }

    public long getAudioTimeUs() {
        int numFramesPlayed = mAudioTrack.getPlaybackHeadPosition();

        return (numFramesPlayed * 1000000L) / mSampleRate;
    }

    public void play() {
        mAudioTrack.play();
    }

    public void stop() {
        cancelWriteMore();

        mAudioTrack.stop();

        mNumFramesSubmitted = 0;
    }

    public void pause() {
        cancelWriteMore();

        mAudioTrack.pause();
    }

    public void release() {
        cancelWriteMore();

        mAudioTrack.release();
        mAudioTrack = null;
    }

    public int getPlayState() {
        return mAudioTrack.getPlayState();
    }

    private void writeMore() {
        if (mQueue.isEmpty()) {
            return;
        }

        int numFramesPlayed = mAudioTrack.getPlaybackHeadPosition();
        int numFramesPending = mNumFramesSubmitted - numFramesPlayed;
        int numFramesAvailableToWrite = mBufferSizeInFrames - numFramesPending;
        int numBytesAvailableToWrite = numFramesAvailableToWrite * mFrameSize;

        while (numBytesAvailableToWrite > 0) {
            QueueElem elem = mQueue.peekFirst();

            int numBytes = elem.size;
            if (numBytes > numBytesAvailableToWrite) {
                numBytes = numBytesAvailableToWrite;
            }

            int written = mAudioTrack.write(elem.data, elem.offset, numBytes);
            assert(written == numBytes);

            mNumFramesSubmitted += written / mFrameSize;

            elem.size -= numBytes;
            if (elem.size == 0) {
                mQueue.removeFirst();

                if (mQueue.isEmpty()) {
                    break;
                }
            } else {
                elem.offset += numBytes;
                break;
            }

            numBytesAvailableToWrite -= numBytes;
        }

        if (!mQueue.isEmpty()) {
            scheduleWriteMore();
        }
    }

    private void scheduleWriteMore() {
        if (mWriteMorePending) {
            return;
        }

        int numFramesPlayed = mAudioTrack.getPlaybackHeadPosition();
        int numFramesPending = mNumFramesSubmitted - numFramesPlayed;
        int pendingDurationMs = 1000 * numFramesPending / mSampleRate;

        mWriteMorePending = true;
        mHandler.sendMessageDelayed(
                mHandler.obtainMessage(EVENT_WRITE_MORE),
                pendingDurationMs / 3);
    }

    private void cancelWriteMore() {
        mHandler.removeMessages(EVENT_WRITE_MORE);
        mWriteMorePending = false;
    }

    public void write(byte[] data, int size) {
        QueueElem elem = new QueueElem();
        elem.data = data;
        elem.offset = 0;
        elem.size = size;

        mQueue.add(elem);

        scheduleWriteMore();
    }
}
