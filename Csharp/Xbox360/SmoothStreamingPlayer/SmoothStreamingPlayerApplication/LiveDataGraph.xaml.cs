using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace SmoothStreamingPlayerApplication
{
    public partial class LiveDataGraph : UserControl
    {

        #region Private Fields

        private const int GRAPH_UPDATE_INTERVAL_MSEC = 1000;
        private const double GRAPH_TIME_LENGTH_MSEC = 30000;
        private const double GRAPH_X_MARGIN = 30.0;
        private const double GRAPH_Y_MARGIN = 20.0;

        private List<GraphDataItem> m_graphData = new List<GraphDataItem>();


        private DispatcherTimer m_timer;

        private string m_chartTitle = "";
        private List<double> m_yLabelsList = new List<double>();
        private ScaleTransform m_rootScaleTransform;
        
        private double m_yMax = Double.MaxValue;
        private double m_yMin = 0.0;
        
        private bool m_updateGraphBorder = true;

        private struct GraphDataItem
        {
            public GraphDataItem(double val, DateTime t)
            {
                _val = val;
                _time = t;
                
                _graphBar = new Rectangle();
                _graphBar.StrokeThickness = 0.30;
                _graphBar.Stroke = new SolidColorBrush(Colors.DarkGray);
                _graphBar.Fill = new SolidColorBrush(Color.FromArgb(255, 16, 50, 86));

            }

            public double val
            {
                get { return _val; }
                set { _val = value; }
            }
            
            public DateTime time
            {
                get { return _time; }
                set { _time = value; }
            }

            public Rectangle graphBar
            {
                get { return _graphBar; }
                set { _graphBar = value; }
            }

            private double _val;
            private DateTime _time;
            private Rectangle _graphBar;

        }

        #endregion

        #region constructor and loaded event handler

        public LiveDataGraph()
        {
            InitializeComponent();

            m_rootScaleTransform = new ScaleTransform();

            m_rootScaleTransform.ScaleX = 1.0;
            m_rootScaleTransform.ScaleY = 1.0;

            LayoutRoot.RenderTransform = m_rootScaleTransform;

            m_timer = new DispatcherTimer();
            m_timer.Tick += new EventHandler(OnTimerTick);
            m_timer.Interval = TimeSpan.FromMilliseconds(GRAPH_UPDATE_INTERVAL_MSEC);

            this.Loaded += new RoutedEventHandler(LiveDataGraph_Loaded);
            this.Unloaded += new RoutedEventHandler(LiveDataGraph_Unloaded);
        }

        void LiveDataGraph_Loaded(object sender, RoutedEventArgs e)
        {
            m_timer.Start();
        }

        void LiveDataGraph_Unloaded(object sender, RoutedEventArgs e)
        {
            m_timer.Stop();
        }

        #endregion

        #region public methods

        public void SetYAxisBounds(double min, double max)
        {
            m_yMin = min;
            m_yMax = max;
        }

        public void SetTitle(string title)
        {
            m_chartTitle = title;

            m_updateGraphBorder = true;
        }
        /// <summary>
        /// Updates the chart data, This method should be called whenever the chart data source 
        /// switches to a new value.
        /// </summary>
        /// <param name="newVal"> The new data value.</param>
        /// <param name="t"> Time stamp for when the data has changed.</param>
        public void Update(double newVal, DateTime t)
        {
            System.Diagnostics.Debug.Assert(newVal >= 0.0, "The LiveDataGraph control is meant to be used only for bitrate and fps values, therefore this implementation only handles positive data values.");

            UpdateGraphData(newVal, t);
        }

        /// <summary>
        /// Upates the charts Y labels. The control will plot a horizontal line and a legend for each 
        /// value in this list.
        /// </summary>
        /// <param name="yLabels"> Input list of all Y labels. </param>
        public void SetYLabels(List<double> yLabelsList)
        {
            System.Diagnostics.Debug.Assert((yLabelsList.Count > 0) && (yLabelsList.Min() >= 0.0), "The LiveDataGraph control is meant to be used only for bitrate and fps values, therefore this implementation only handles positive data values.");

            m_yLabelsList = yLabelsList.ToList();

            m_updateGraphBorder = true;
        }

        #endregion

        #region  private methods
        
        private void UpdateGraphData(double newVal, DateTime t)
        {
            m_graphData.Add(new GraphDataItem(newVal, t));
        }
        

        private void OnTimerTick(object sender, EventArgs e)
        {
            if (GraphCanvas.ActualWidth == 0 || GraphCanvas.ActualHeight == 0)
            {
                return;
            }

            if (m_updateGraphBorder)
            {
                UpdateGraphBorders();
                m_updateGraphBorder = false; 
            }

            DateTime now = DateTime.Now;

            List<GraphDataItem> tempList = new List<GraphDataItem>(m_graphData);
            foreach (GraphDataItem dataItem in tempList)
            {
                if (m_graphData.Count == 1)
                    break;

                TimeSpan timeElapsed = now - dataItem.time;
                if (timeElapsed.TotalMilliseconds > GRAPH_TIME_LENGTH_MSEC )
                {
                    GraphCanvas.Children.Remove(dataItem.graphBar);
                    m_graphData.Remove(dataItem);
                }
            }

            double xScale = (GraphCanvas.ActualWidth - GRAPH_X_MARGIN * 2.0) / GRAPH_TIME_LENGTH_MSEC;
            double yScale = (GraphCanvas.ActualHeight - GRAPH_Y_MARGIN * 2.0) / (m_yMax - m_yMin);
            double xOffset = GraphCanvas.ActualWidth - 2.0 * GRAPH_X_MARGIN;

            Debug.Assert(xScale > 0.0);
            Debug.Assert(yScale > 0.0);
            Debug.Assert(xOffset > 0.0);

            for (int i = m_graphData.Count-1; i >= 0 ; --i)
            {
                GraphDataItem graphDataItem = m_graphData[i];

                DateTime endTime = (i == m_graphData.Count-1) ? now : m_graphData[i + 1].time;
                double duration = (endTime - graphDataItem.time).TotalMilliseconds;

                graphDataItem.graphBar.Width = Math.Min(duration * xScale, GRAPH_TIME_LENGTH_MSEC * xScale);
                graphDataItem.graphBar.Width = Math.Min(graphDataItem.graphBar.Width, xOffset);
                graphDataItem.graphBar.Height = graphDataItem.val * yScale;
                graphDataItem.graphBar.SetValue(Canvas.LeftProperty, GRAPH_X_MARGIN + xOffset - graphDataItem.graphBar.Width);
                graphDataItem.graphBar.SetValue(Canvas.TopProperty, GraphCanvas.ActualHeight - GRAPH_Y_MARGIN - graphDataItem.graphBar.Height);

                if (! GraphCanvas.Children.Contains(graphDataItem.graphBar))
                {
                    GraphCanvas.Children.Insert(GraphCanvas.Children.Count-1, graphDataItem.graphBar); 
                }

                xOffset = xOffset - graphDataItem.graphBar.Width;

                if (xOffset < Double.Epsilon)
                    break;
            }

        }


        private void UpdateGraphBorders()
        {

            GraphCanvas.Children.Clear();

            double xScale = (GraphCanvas.ActualWidth - GRAPH_X_MARGIN * 2.0) / GRAPH_TIME_LENGTH_MSEC;
            double yScale = (GraphCanvas.ActualHeight - GRAPH_Y_MARGIN * 2.0) / (m_yMax - m_yMin);

            Rectangle chartBorder = new Rectangle();
            chartBorder.Width = GraphCanvas.ActualWidth - 2.0 * GRAPH_X_MARGIN;
            chartBorder.Height = GraphCanvas.ActualHeight - 2.0 * GRAPH_Y_MARGIN;
            chartBorder.SetValue(Canvas.LeftProperty, GRAPH_X_MARGIN);
            chartBorder.SetValue(Canvas.TopProperty, GRAPH_Y_MARGIN);
            chartBorder.StrokeThickness = 1.0;
            chartBorder.Stroke = new SolidColorBrush(Colors.LightGray);
            GraphCanvas.Children.Add(chartBorder);
            
            TextBox chartTitle = new TextBox();
            chartTitle.Text = m_chartTitle;
            chartTitle.Foreground = new SolidColorBrush(Colors.White);
            chartTitle.Background = new SolidColorBrush(Colors.Transparent);
            chartTitle.BorderThickness = new Thickness(0.0);
            chartTitle.TextAlignment = TextAlignment.Center;
            chartTitle.VerticalAlignment = VerticalAlignment.Center;
            chartTitle.HorizontalAlignment = HorizontalAlignment.Center;
            chartTitle.FontFamily = new FontFamily("Segoe UI");
            chartTitle.FontSize = 18;
            chartTitle.SetValue(Canvas.LeftProperty, GRAPH_X_MARGIN);
            chartTitle.SetValue(Canvas.TopProperty, 0.0);
            GraphCanvas.Children.Add(chartTitle);

            if (m_yLabelsList.Count != 0)
            {
                foreach (double label in m_yLabelsList)
                {
                    Line line = new Line();
                    line.X1 = GRAPH_X_MARGIN;
                    line.Y1 = GraphCanvas.ActualHeight - GRAPH_Y_MARGIN - label * yScale;
                    line.X2 = GRAPH_X_MARGIN + GRAPH_TIME_LENGTH_MSEC * xScale;
                    line.Y2 = line.Y1;

                    line.Stroke = new SolidColorBrush(Colors.LightGray);
                    line.StrokeThickness = 1.0;

                    GraphCanvas.Children.Add(line);

                    TextBox yLegend = new TextBox();
                    yLegend.Text = label > 1000.00 ? Math.Round(label / 1000.00).ToString() + "K" : Math.Round(label).ToString();
                    yLegend.Foreground = new SolidColorBrush(Colors.White);
                    yLegend.Background = new SolidColorBrush(Colors.Transparent);
                    yLegend.BorderThickness = new Thickness(0.0);
                    yLegend.TextAlignment = TextAlignment.Right;
                    yLegend.VerticalAlignment = VerticalAlignment.Center;
                    yLegend.FontFamily = new FontFamily("Segoe UI");
                    yLegend.FontSize = 14;
                    yLegend.SetValue(Canvas.LeftProperty, line.X1 - GRAPH_X_MARGIN);
                    yLegend.SetValue(Canvas.TopProperty, line.Y1 - 15.0);
                    GraphCanvas.Children.Add(yLegend);
                }
            }
        }

        #endregion

        #region  protected override methods for handling control resize 
        
        protected override Size MeasureOverride(Size availableSize)
        {
            LayoutRoot.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
            return availableSize;
        }

        protected override Size ArrangeOverride(Size finalSize)
        {
            Size desiredSize = LayoutRoot.DesiredSize;

            m_rootScaleTransform.ScaleX = finalSize.Width / desiredSize.Width;
            m_rootScaleTransform.ScaleY = finalSize.Height / desiredSize.Height;

            Rect originalPosition = new Rect(0, 0, desiredSize.Width, desiredSize.Height);
            LayoutRoot.Arrange(originalPosition);

            return finalSize;
        }

        #endregion 

    }
}
