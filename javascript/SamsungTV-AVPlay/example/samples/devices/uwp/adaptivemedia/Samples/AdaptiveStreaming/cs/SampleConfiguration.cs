//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

using System;
using System.Collections.Generic;
using Windows.UI.Xaml.Controls;
using AdaptiveStreaming;

namespace SDKTemplate
{
    public partial class MainPage : Page
    {
        public const string FEATURE_NAME = "AdaptiveStreaming";

        List<Scenario> scenarios = new List<Scenario>
        {
            new Scenario() { Title="Basic HLS/DASH Playback", ClassType=typeof(Scenario1)},
            new Scenario() { Title="Configuring HLS/DASH Playback", ClassType=typeof(Scenario2)},
            new Scenario() { Title="Customized Resource Acquisiton", ClassType=typeof(Scenario3)},
            new Scenario() { Title="HLS/DASH Playback with PlayReady", ClassType=typeof(Scenario4)}
        };
    }

    public class Scenario
    {
        public string Title { get; set; }
        public Type ClassType { get; set; }
    }
}
