using System;
using System.Windows;
using System.Windows.Navigation;
using Microsoft.Xbox.Controls;
using Microsoft.Xbox.Security.XAuth;

namespace SmoothStreamingPlayerApplication
{
    public partial class App : Application
    {
        public XboxApplicationFrame RootFrame { get; private set; }
        public Uri HomePage { get; private set; }

        public bool RootLicenseAcquired = false;

        public App()
        {
            // Global handler for uncaught exceptions. 
            this.UnhandledException += this.Application_UnhandledException;
            this.Startup += this.Application_Startup;
            this.Exit += this.Application_Exit;

            InitializeComponent();
            InitializeXboxApplication();
        }

        /// <summary>
        /// Override of Application.Current that returns this subclass
        /// </summary>
        public static App Current
        {
            get
            {
                return Application.Current as App;
            }

        }

        private void Application_Startup(object sender, StartupEventArgs e)
        {
            // Start the XAuthService to allow getting tokens. This is necessary
            // for PlayReady to function properly.
            XAuthService.Start();
            RootVisual = RootFrame;
        }

        private void Application_Exit(object sender, EventArgs e)
        {

        }

        private void RootFrame_NavigationFailed(object sender, NavigationFailedEventArgs e)
        {
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // A navigation has failed; break into the debugger
                System.Diagnostics.Debugger.Break();
            }
        }

        // Code to execute on Unhandled Exceptions
        private void Application_UnhandledException(object sender, ApplicationUnhandledExceptionEventArgs e)
        {
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // An unhandled exception has occurred; break into the debugger
                System.Diagnostics.Debugger.Break();
            }
        }

        #region Xbox Application Initialization

        private bool xboxApplicationInitialized = false;

        private void InitializeXboxApplication()
        {
            if (xboxApplicationInitialized)
                return;

            RootFrame = new XboxApplicationFrame();
            RootFrame.NavigationFailed += RootFrame_NavigationFailed;

            HomePage = new Uri("/MainPage.xaml", UriKind.Relative);
            RootFrame.Source = HomePage;

            xboxApplicationInitialized = true;
        }

        #endregion

    }
}
