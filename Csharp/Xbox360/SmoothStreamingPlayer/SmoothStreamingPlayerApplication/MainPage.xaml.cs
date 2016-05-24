using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Navigation;
using Microsoft.Xbox.Input;

namespace SmoothStreamingPlayerApplication
{
    public partial class MainPage : Page
    {
        private GridFocusHelper m_gridFocusHelper;
        public MainPage()
        {
            InitializeComponent();

            // Use a Grid focus helper to allow setting the focus on the MainPage buttons 
            // using the gamepad left and right DPad buttons.
            m_gridFocusHelper = new GridFocusHelper( ButtonsGrid );

            this.Loaded += new RoutedEventHandler( MainPage_Loaded );
        }

        // Executes when the user navigates to this page.
        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            // Enable "To The Limit" video if we have already acquired the root license.
            Button_PlayReady_ToTheLimit.IsEnabled = App.Current.RootLicenseAcquired;
        }

        void MainPage_Loaded(object sender, RoutedEventArgs e)
        {
            Button_BigBuckBunny.Focus();
        }
        
        private void Button_BigBuckBunny_Click(object sender, RoutedEventArgs e)
        {
            string target = "/FullScreenPlayer.xaml";
            target += string.Format( "?SourceURI={0}", Uri.EscapeDataString( "http://mediadl.microsoft.com/mediadl/iisnet/smoothmedia/Experience/BigBuckBunny_720p.ism/Manifest" ) );

            NavigationService.Navigate( new Uri( target, UriKind.Relative ) );
        }


        private void Button_PlayReady_SuperSpeedway_Click(object sender, RoutedEventArgs e)
        {
            string target = "/FullScreenPlayer.xaml";
            target += string.Format( "?SourceURI={0}", Uri.EscapeDataString( "http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest" ) );

            // TCR 185 : VID PlayReady License Acquisition
            // The License Acquisition MUST be done over SSL
            // There must be a user connected to Xbox Live for SSL to work and the application should handle that.
            target += string.Format( "?LicenseServerURI={0}", Uri.EscapeDataString( "https://playready.directtaps.net/pr/svc/rightsmanager.asmx&PlayRight=1&UseSimpleNonPersistentLicense=1" ) );

            NavigationService.Navigate( new Uri( target, UriKind.Relative ) );
        }


        private void Button_PlayReady_ToTheLimit_Click(object sender, RoutedEventArgs e)
        {
            string target = "/FullScreenPlayer.xaml";
            target += string.Format("?SourceURI={0}", Uri.EscapeDataString("http://playready.directtaps.net/PR2_00/media/PIFF1.3/Ch00_KeyRotation_30seconds/To_The_Limit_720.ism/Manifest"));

            NavigationService.Navigate( new Uri( target, UriKind.Relative ) );
        }

        private void Button_PlayReady_LicenseAcquisition_Click(object sender, RoutedEventArgs e)
        {
            LicenseAcquirer licenseAcquirer = new LicenseAcquirer();

            // TCR 185 : VID PlayReady License Acquisition
            // The License Acquisition MUST be done over SSL
            // There must be a user connected to Xbox Live for SSL to work and the application should handle that.
            licenseAcquirer.LicenseServerUriOverride = new Uri("https://playready.directtaps.net/PR2_00/svc/LiveTVRootLicenses/rightsmanager.asmx");

            // ChallengeCustomData adds a string to the LicenseChallenge that
            // the business logic on the License Server uses to determine what license
            // to send to the client.
            licenseAcquirer.ChallengeCustomData = "UserAccount:0";
            licenseAcquirer.AcquireLicenseCompleted += new EventHandler<AcquireLicenseCompletedEventArgs>(licenseAcquirer_AcquireLicenseCompleted);

            // Asynchronously acquire the root license.
            // Use an Empty ServiceID since PlayReady Domains are not supported on Xbox.
            licenseAcquirer.AcquireLicenseAsync(Guid.Empty);
        }

        void licenseAcquirer_AcquireLicenseCompleted(object sender, AcquireLicenseCompletedEventArgs e)
        {
            if (e.Error != null)
            {
                Debug.WriteLine("License Acquisition Error: {0}", e.Error);
                TextRun_LicenseAcquisition_Result.Text = "Failed";
            }
            else
            {
                Debug.WriteLine("License Acquisition Success");
                TextRun_LicenseAcquisition_Result.Foreground = new SolidColorBrush(Colors.White);
                TextRun_LicenseAcquisition_Result.Text = "Success";
                App.Current.RootLicenseAcquired = true;
                Button_PlayReady_ToTheLimit.IsEnabled = true;
            }
        }
    }
}
