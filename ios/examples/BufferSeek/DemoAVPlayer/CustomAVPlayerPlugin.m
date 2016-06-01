//
//  CustomAVPlayerPlugin.m
//  DemoAVPlayer
//
//  Created by Joan on 26/05/16.
//  Copyright © 2016 Nice People At Work. All rights reserved.
//

#import "CustomAVPlayerPlugin.h"
@import AVFoundation;


@interface CustomAVPlayerPlugin()

@property (nonatomic, strong) id seekDetectionPeriodicTimeObserver;
@property (nonatomic, strong) id joinTimePeriodicTimeObserver;
@property (nonatomic, assign) long long bitrate;
@property (nonatomic, assign) double lastPlayhead;

@end


@implementation CustomAVPlayerPlugin

static void * const observationContext = @"YouboraContext";

#pragma mark - Init
- (instancetype)init
{
    self = [super init];
    if (self) {
        // Player-dependant values
        self.pluginName = @"AVPlayer";
        self.pluginVersion = @"5.3.0-c1.0-AVPlayer";
    }
    return self;
}

#pragma mark - Start and stop monitoring
- (void) startMonitoringWithPlayer:(NSObject *)player {
    [super startMonitoringWithPlayer:player];
    
    self.lastPlayhead = 0;
    self.bitrate = -1;
    
    AVPlayer * avplayer = [self getPlayer];
    
    // Observers for AVPlayer
    [avplayer addObserver:self forKeyPath:@"rate" options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld context:observationContext];
    [avplayer addObserver:self forKeyPath:@"currentItem" options:NSKeyValueObservingOptionNew|NSKeyValueObservingOptionOld context:observationContext];

    // Observers for currentItem
    if (avplayer.currentItem != nil) {
        [self prepareForNewViewWithPlayerItem:avplayer.currentItem];
    }
    
    // Notifications
    NSNotificationCenter * nc = [NSNotificationCenter defaultCenter];
    
    // Notification when the playback ends successfully
    [nc addObserver:self selector:@selector(itemDidFinishPlaying:) name:AVPlayerItemDidPlayToEndTimeNotification object:nil];
    
    [nc addObserver:self selector:@selector(accessLogEntry:) name:AVPlayerItemNewAccessLogEntryNotification object:nil];

}

- (void) stopMonitoring {
    AVPlayer * avplayer = [self getPlayer];
    
    // Remove the "rate" KVO
    [avplayer removeObserver:self forKeyPath:@"rate" context:observationContext];
    [avplayer removeObserver:self forKeyPath:@"currentItem" context:observationContext];
    
    [avplayer removeTimeObserver:self.seekDetectionPeriodicTimeObserver];
    
    if (avplayer.currentItem != nil) {
        [self removeObserversForAVPlayerItem:avplayer.currentItem];
    }
    
    // This will send /stop if necessary and set the player to nil
    [super stopMonitoring];
}

#pragma mark - Private methods
- (void) prepareForNewViewWithPlayerItem:(AVPlayerItem *) playerItem {
    
    [playerItem addObserver:self forKeyPath:@"playbackBufferEmpty" options:NSKeyValueObservingOptionNew context:observationContext];
    [playerItem addObserver:self forKeyPath:@"playbackLikelyToKeepUp" options:NSKeyValueObservingOptionNew context:observationContext];
    
    // Weak-strong self to avoid retain cycles
    __weak typeof(self) weakSelf = self;

    if (self.joinTimePeriodicTimeObserver == nil) {
        // We want to be notified of the smallest possible change on the playhead
        CMTime interval = CMTimeMakeWithSeconds(.01, NSEC_PER_SEC); // .1 second
        self.joinTimePeriodicTimeObserver = [[self getPlayer] addPeriodicTimeObserverForInterval:interval queue:0 usingBlock:^(CMTime time) {
            __strong typeof(weakSelf) strongSelf = weakSelf;
            
            if (strongSelf) {
                // As soon as we enter here, send /join event
                [strongSelf joinHandler];
                
                // Since we only want to report the join time once, remove the periodic time observer
                [[strongSelf getPlayer] removeTimeObserver:strongSelf.joinTimePeriodicTimeObserver];
                strongSelf.joinTimePeriodicTimeObserver = nil;
            }
        }];
    }
    
    double intervalSeek = .5;
    
    self.seekDetectionPeriodicTimeObserver = [[self getPlayer] addPeriodicTimeObserverForInterval:CMTimeMakeWithSeconds(intervalSeek, NSEC_PER_SEC) queue:0 usingBlock:^(CMTime time) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (strongSelf) {
            double currentPlayhead = CMTimeGetSeconds(time);
            if (strongSelf.lastPlayhead != 0) {
                double distance = ABS(strongSelf.lastPlayhead - currentPlayhead);
                if (distance > intervalSeek * 2) {
                    // Distance is very big -> seeking
                    [strongSelf seekingHandler];
                }
            }
            strongSelf.lastPlayhead = currentPlayhead;
        }
    }];
}

- (void) removeObserversForAVPlayerItem:(AVPlayerItem *) playerItem {
    
    if (playerItem != nil && [playerItem isKindOfClass:[AVPlayerItem class]]) {
        [playerItem removeObserver:self forKeyPath:@"playbackBufferEmpty" context:observationContext];
        [playerItem removeObserver:self forKeyPath:@"playbackLikelyToKeepUp" context:observationContext];
    }
}

- (AVPlayer *) getPlayer {
    return (AVPlayer *) self.player;
}

#pragma mark - Notifications and KVO
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSString *,id> *)change context:(void *)context {
    // Check that's our context
    if (context == observationContext) {
        AVPlayer * avplayer = [self getPlayer];

        // The "rate" property
        if ([keyPath isEqualToString:@"rate"]) {
            
            // Get the new rate value
            NSNumber * newRate = (NSNumber *) [change objectForKey:NSKeyValueChangeNewKey];
            
            // If the player is sent a "play" or "pause" message, but has no currentItem loaded
            // it will still change the rate, but we're not interested in those cases
            if (avplayer.currentItem != nil) {
                if ([newRate isEqualToNumber:@0]) {
                    [self pauseHandler]; // Pause
                } else {
                    [self resumeHandler]; // Resume
                    [self playHandler]; // Start
                }
            }
        } else if ([keyPath isEqualToString:@"currentItem"]) {
            
            id newItem = [change objectForKey:NSKeyValueChangeNewKey];
            id oldItem = [change objectForKey:NSKeyValueChangeOldKey];

            if (oldItem != nil && oldItem != [NSNull null]) {
                // Remove Observers from old item
                [self removeObserversForAVPlayerItem:oldItem];
                // Close view if any
                [self endedHandler]; // This sends the /stop event
            }
            
            if (newItem != nil && newItem != [NSNull null]) {
                
                // New item
                if (avplayer.rate != 0) {
                    // If rate is not 0 (it's playing), send start
                    [self playHandler];
                }
                
                // Prepare for new view
                [self prepareForNewViewWithPlayerItem:newItem];
            }
        } else if ([keyPath isEqualToString:@"playbackBufferEmpty"]) { // AVPlayerItem properties
            bool isEmpty = [((NSValue *)[change objectForKey:NSKeyValueChangeNewKey]) isEqual:@YES];
            if (isEmpty) { // We're only interested when the buffer changes non-empty -> empty
                // This starts buffering, this method doesn't send any event but
                // starts the buffer chrono to get its duration once it ends
                [self bufferingHandler];
            }
        } else if ([keyPath isEqualToString:@"playbackLikelyToKeepUp"]) {
            bool isLikely = [((NSValue *)[change objectForKey:NSKeyValueChangeNewKey]) isEqual:@YES];
            if (isLikely) {
                // This will close (send) the buffer (or seek) event previously opened
                [self bufferedHandler];
            }
        }
    }
}

- (void) itemDidFinishPlaying:(NSNotification *) notification {
    if (notification.object == [self getPlayer].currentItem) {
        [self endedHandler]; // send stop
    }
}

- (void) accessLogEntry:(NSNotification *) notification {
    if (notification.object == [self getPlayer].currentItem) {
        AVPlayerItemAccessLogEvent * logEvent = [self getPlayer].currentItem.accessLog.events.lastObject;
        
        if (logEvent.segmentsDownloadedDuration > 0) {
            self.bitrate = (logEvent.numberOfBytesTransferred * 8) / logEvent.segmentsDownloadedDuration;
        } else {
            self.bitrate = -1;
        }
    }
}

#pragma mark - Media info
- (NSNumber *) getMediaDuration {
    AVPlayerItem * item = [self getPlayer].currentItem;
    
    // Get default value
    NSNumber * duration = [super getMediaDuration];
    
    if (item != nil) {
        AVURLAsset * asset = (AVURLAsset *) item.asset;
        if (asset != nil) {
            duration = @(CMTimeGetSeconds(asset.duration));
        }
    }
    
    return duration;
}

- (NSString *)getResource {
    
    AVPlayerItem * item = [self getPlayer].currentItem;
    
    NSString * res = nil;
    
    if (item != nil) {
        AVURLAsset * asset = (AVURLAsset *) item.asset;
        if (asset != nil) {
            res = asset.URL.absoluteString;
        }
    }
    return res != nil? res : [super getResource];
}

- (NSNumber *)getPlayhead {
    double playhead = CMTimeGetSeconds([self getPlayer].currentTime);
    return [NSNumber numberWithDouble:playhead];
}

- (NSString *)getPlayerVersion {
    return @"AVPlayer"; // If you use a third party player you should include the version here ie. "ThirdPartyPlayer-v1.2.3"
}

- (NSNumber *)getBitrate {
    return @(self.bitrate);
}
@end
