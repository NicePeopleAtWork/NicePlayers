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

@property (nonatomic, strong) id joinTimePeriodicTimeObserver;

@end


@implementation CustomAVPlayerPlugin

static void * const observationContext = @"YouboraContext";

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

- (void) startMonitoringWithPlayer:(NSObject *)player {
    [super startMonitoringWithPlayer:player];
    
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
}

- (void) stopMonitoring {
    AVPlayer * avplayer = [self getPlayer];
    
    // Remove the "rate" KVO
    [avplayer removeObserver:self forKeyPath:@"rate" context:observationContext];
    [avplayer removeObserver:self forKeyPath:@"currentItem" context:observationContext];
    
    // This will send /stop if necessary and set the player to nil
    [super stopMonitoring];
}

- (void) prepareForNewViewWithPlayerItem:(AVPlayerItem *) playerItem {
    
    // Weak-strong self to avoid retain cycles
    __weak typeof(self) weakSelf = self;

    if (self.joinTimePeriodicTimeObserver == nil) {
        // We want to be notified of the smallest possible change on the playhead
        CMTime interval = CMTimeMakeWithSeconds(.01, NSEC_PER_SEC); // .1 second
        self.joinTimePeriodicTimeObserver = [[self getPlayer] addPeriodicTimeObserverForInterval:interval queue:0 usingBlock:^(CMTime time) {
            __strong typeof(weakSelf) strongSelf = weakSelf;
            
            if (strongSelf) {
                // As long as we enter here, send /join event
                [strongSelf joinHandler];
                
                // Since we only want to report the join time once, remove the periodic time observer
                [[strongSelf getPlayer] removeTimeObserver:strongSelf.joinTimePeriodicTimeObserver];
                strongSelf.joinTimePeriodicTimeObserver = nil;
            }
        }];
    }
}

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
        }
    }
}

- (void) itemDidFinishPlaying:(NSNotification *) notification {
    if (notification.object == [self getPlayer].currentItem) {
        [self endedHandler]; // send stop
    }
}

- (AVPlayer *) getPlayer {
    return (AVPlayer *) self.player;
}
@end
