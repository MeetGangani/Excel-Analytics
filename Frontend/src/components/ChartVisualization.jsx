import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Register the chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartVisualization = () => {
  const chartRef = useRef(null);
  const [exportFormat, setExportFormat] = useState('png');
  const { chartConfig, fileData, selectedColumns } = useSelector(state => state.charts);
  
  // Check if we have data to display
  const hasData = chartConfig.datasets.length > 0 && chartConfig.labels.length > 0;
  
  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!chartConfig.title,
        text: chartConfig.title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' || chartConfig.type === 'polarArea' 
      ? undefined 
      : {
          x: {
            title: {
              display: true,
              text: selectedColumns.x,
            },
          },
          y: {
            title: {
              display: true,
              text: selectedColumns.y,
            },
            beginAtZero: true,
          },
        },
  };
  
  // Prepare the chart data
  const data = {
    labels: chartConfig.labels,
    datasets: chartConfig.datasets,
  };
  
  // Export chart as image or PDF
  const exportChart = async () => {
    if (!chartRef.current) return;
    
    try {
      const chartElement = chartRef.current;
      
      // Create a canvas from the chart
      const canvas = await html2canvas(chartElement);
      
      if (exportFormat === 'png') {
        // For PNG, create a download link
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `chart-${Date.now()}.png`;
        link.href = image;
        link.click();
        toast.success('Chart exported as PNG');
      } else {
        // For PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
        });
        
        // Calculate dimensions to fit the chart
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`chart-${Date.now()}.pdf`);
        toast.success('Chart exported as PDF');
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast.error('Failed to export chart');
    }
  };
  
  // Render the appropriate chart type
  const renderChart = () => {
    if (!hasData) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chart data</h3>
            <p className="mt-1 text-sm text-gray-500">Select data columns to visualize</p>
          </div>
        </div>
      );
    }
    
    switch (chartConfig.type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      case 'polar':
        return <PolarArea data={data} options={chartOptions} />;
      case 'radar':
        return <Radar data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {chartConfig.title || 'Chart Visualization'}
        </h2>
        
        {hasData && (
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="png">PNG</option>
              <option value="pdf">PDF</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportChart}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </motion.button>
          </div>
        )}
      </div>
      
      <div ref={chartRef} className="mt-4 chart-container p-4 bg-white rounded-lg">
        {renderChart()}
      </div>
      
      {hasData && fileData && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p>
            Showing data from: {fileData.sheetName || 'Unknown sheet'} | 
            X-Axis: {selectedColumns.x} | 
            Y-Axis: {selectedColumns.y} | 
            Total records: {fileData.totalRows || 0}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartVisualization;