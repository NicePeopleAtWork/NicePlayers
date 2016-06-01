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
}

- (void) stopMonitoring {
    AVPlayer * avplayer = [self getPlayer];
    
    // Remove the "rate" KVO
    [avplayer removeObserver:self forKeyPath:@"rate" context:observationContext];
    
    // This will send /stop if necessary and set the player to nil
    [super stopMonitoring];
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
                
                // If rate is not 0, the player is playing
                if (![newRate isEqualToNumber:@0]) {
                    [self playHandler]; // Send youbora start event
                }
            }
        }
    }
}

- (AVPlayer *) getPlayer {
    return (AVPlayer *) self.player;
}
@end
