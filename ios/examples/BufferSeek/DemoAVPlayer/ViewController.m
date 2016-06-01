//
//  ViewController.m
//  demoavplayer
//
//  Created by Joan on 26/05/16.
//  Copyright © 2016 Nice People At Work. All rights reserved.
//

#import "ViewController.h"
#import "CustomAVPlayerPlugin.h"

#define VIDEO_URL @"http://media.w3.org/2010/05/sintel/trailer.mp4"

@import AVKit;
@import AVFoundation;
@import Foundation;

@interface ViewController ()

// This view will serve us as a guide to set player controller's frame
@property (weak, nonatomic) IBOutlet UIView *playerView;

@property (nonatomic, strong) AVPlayer * player;
@property (nonatomic, strong) AVPlayerViewController * playerController;

@property (nonatomic, strong) CustomAVPlayerPlugin * myPlugin;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Video player
    self.player = [AVPlayer new];
    
    // Video player controller
    self.playerController = [[AVPlayerViewController alloc] init];
    self.playerController.player = self.player;
    
    // Set this property to NO to avoid layout constraint warnings
    self.playerController.showsPlaybackControls = NO;
    
    // Set plugin debug level
    [YBLog setDebugLevel:YBLogLevelHTTPRequests];
    
    // Plugin creation
    self.myPlugin = [[CustomAVPlayerPlugin alloc] init];
    
    // We can start monitoring the player at any time (but before playback starts).
    // The plugin will wait for the player to do something
    [self.myPlugin startMonitoringWithPlayer:self.player];
}

-(void)viewDidAppear:(BOOL)animated{
    [super viewDidAppear:animated];
    
    // Set it to use the playerView frame
    self.playerController.view.frame = self.playerView.frame;

    // Add view to the current screen
    [self addChildViewController:self.playerController];
    [self.view addSubview:self.playerController.view];
    
}

- (IBAction)play:(id)sender {
    
    // Load resource and start playback
    [self.player replaceCurrentItemWithPlayerItem:[AVPlayerItem playerItemWithURL:[NSURL URLWithString:VIDEO_URL]]];
    
    // Show player controls
    if (self.playerController.showsPlaybackControls == NO) {
        self.playerController.showsPlaybackControls = YES;
    }
    
    [self.player play];
}

- (IBAction)stop:(id)sender {
    // Pause player and remove item
    [self.player pause];
    [self.player replaceCurrentItemWithPlayerItem:nil];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
