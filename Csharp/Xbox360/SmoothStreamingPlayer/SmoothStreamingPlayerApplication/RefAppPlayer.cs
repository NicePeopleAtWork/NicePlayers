using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using Microsoft.SilverlightMediaFramework.Core;
using Microsoft.Web.Media.SmoothStreaming;

namespace Microsoft.Xbox.Samples.Video.PlayerUI
{
    /// <summary>
    /// In the Lakeview ADK some Fullscreen and Native display modes cause video to be misaligned by 
    /// default instead of properly center aligned.  This issue is most prevalent and noticeable when in 480p mode.
    /// To address this issue, applications must explicitly set the HorizontalAlignment and VeritcalAlignment
    /// to Center on the MediaElement that is playing the video.
    /// </summary>
    public class RefAppPlayer : SMFPlayer
    {
        //
        // Summary:
        //     Called before the System.Windows.UIElement.GotFocus event occurs.
        //
        // Parameters:
        //   e:
        //     The data for the event.
        protected override void OnGotFocus(RoutedEventArgs e)
        {
            this.GamePadButtonDown += RefAppPlayer_GamePadButtonDown;
            base.OnGotFocus(e);
        }

        //
        // Summary:
        //     Called before the System.Windows.UIElement.LostFocus event occurs.
        //
        // Parameters:
        //   e:
        //     The data for the event.
        protected override void OnLostFocus(RoutedEventArgs e)
        {
            this.GamePadButtonDown -= RefAppPlayer_GamePadButtonDown;
            base.OnLostFocus(e);
        }

        /// <summary>
        /// GamePadButton down event handler -- added solely to work-around problem in "Back" button handling
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void RefAppPlayer_GamePadButtonDown(object sender, GamePadButtonEventArgs e)
        {
            if (GamePadButton.Back == e.Button)
            {
                // Work-around problem in MediaTransport.cs in the ADK Platform that neglects to set this.
                e.Handled = true;
            }
        }
        
        /// <summary>Override of Player Media Plugin Loaded event to address ADK issue.
        /// </summary>
        protected override void OnMediaPluginLoaded()
        {
            base.OnMediaPluginLoaded();

            if (MediaPresenterElement != null && MediaPresenterElement.Content != null)
            {
                if (MediaPresenterElement.Content is MediaElement)
                {
                    MediaElement me = MediaPresenterElement.Content as MediaElement;
                    me.HorizontalAlignment = HorizontalAlignment.Center;
                    me.VerticalAlignment = VerticalAlignment.Center;
                }
                else if (MediaPresenterElement.Content is SmoothStreamingMediaElement)
                {
                    SmoothStreamingMediaElement ssme = MediaPresenterElement.Content as SmoothStreamingMediaElement;

                    Grid grid = VisualTreeHelper.GetChild(ssme, 0) as Grid;
                    if (grid != null)
                    {
                        MediaElement me = grid.Children[0] as MediaElement;
                        if (me != null)
                        {
                            me.VerticalAlignment = VerticalAlignment.Center;
                            me.HorizontalAlignment = HorizontalAlignment.Center;
                        }
                        else
                        {
                            //RefAppLogging.Logger.Log("Failed to find MediaElement. Possible change in SSME Template");
                        }
                    }
                    else
                    {
                        //RefAppLogging.Logger.Log("Failed to find Grid. Possible change in SSME Template");    
                    }
                }
                else
                {
                    //RefAppLogging.Logger.Log("Failed to get references to MediaPresenterElement and Content.  Possible change in Player.");
                }
            }
        }

    }
}
