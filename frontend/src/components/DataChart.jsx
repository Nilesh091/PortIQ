import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function DataChart({ data, chartType = 'auto', title = 'Data Visualization' }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-error">
        <p>No data available for visualization</p>
      </div>
    );
  }

  // Auto-detect chart type based on data structure
  const detectChartType = () => {
    if (chartType !== 'auto') return chartType;
    
    const firstItem = data[0];
    const columns = Object.keys(firstItem);
    
    // Check for portfolio value data
    if (columns.includes('name') && columns.includes('total_value')) {
      return 'bar';
    }
    
    // Check for asset allocation data
    if (columns.includes('asset_name') && columns.includes('market_value')) {
      return 'pie';
    }
    
    // Check for portfolio breakdown data
    if (columns.includes('asset_name') && (columns.includes('quantity') || columns.includes('market_value'))) {
      return 'pie';
    }
    
    // Check for time series data
    if (columns.includes('date') || columns.includes('month') || columns.includes('year')) {
      return 'line';
    }
    
    // Default to bar chart
    return 'bar';
  };

  const selectedChartType = detectChartType();

  // Prepare data for different chart types
  const prepareChartData = () => {
    const firstItem = data[0];
    if (!firstItem) return null;
    
    const columns = Object.keys(firstItem);
    if (columns.length < 2) return null;
    
    if (selectedChartType === 'bar') {
      // For bar charts, use the first two columns
      const labelColumn = columns[0];
      const valueColumn = columns[1];
      
      // Validate that both columns exist and have data
      if (!labelColumn || !valueColumn) return null;
      
      return {
        labels: data.map(item => item[labelColumn] || 'Unknown'),
        datasets: [
          {
            label: valueColumn.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: data.map(item => item[valueColumn] || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    }
    
    if (selectedChartType === 'pie') {
      // For pie charts, use the first two columns
      const labelColumn = columns[0];
      const valueColumn = columns[1];
      
      // Validate that both columns exist and have data
      if (!labelColumn || !valueColumn) return null;
      
      const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
      ];
      
      return {
        labels: data.map(item => item[labelColumn] || 'Unknown'),
        datasets: [
          {
            data: data.map(item => item[valueColumn] || 0),
            backgroundColor: colors.slice(0, data.length),
            borderColor: colors.slice(0, data.length).map(color => color.replace('0.8', '1')),
            borderWidth: 2,
          },
        ],
      };
    }
    
    if (selectedChartType === 'line') {
      // For line charts, use the first two columns
      const labelColumn = columns[0];
      const valueColumn = columns[1];
      
      // Validate that both columns exist and have data
      if (!labelColumn || !valueColumn) return null;
      
      return {
        labels: data.map(item => item[labelColumn] || 'Unknown'),
        datasets: [
          {
            label: valueColumn.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: data.map(item => item[valueColumn] || 0),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
          },
        ],
      };
    }
    
    return null;
  };

  const chartData = prepareChartData();
  
  if (!chartData) {
    return (
      <div className="chart-error">
        <p>Unable to prepare chart data</p>
      </div>
    );
  }

  // Common options for all charts
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y || context.parsed;
            return `${context.dataset.label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  // Chart-specific options
  const getChartOptions = () => {
    if (selectedChartType === 'bar') {
      return {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              },
            },
          },
        },
      };
    }
    
    if (selectedChartType === 'pie') {
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
      };
    }
    
    if (selectedChartType === 'line') {
      return {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              },
            },
          },
        },
      };
    }
    
    return commonOptions;
  };

  const renderChart = () => {
    const options = getChartOptions();
    
    switch (selectedChartType) {
      case 'bar':
        return <Bar data={chartData} options={options} height={400} />;
      case 'pie':
        return <Pie data={chartData} options={options} height={400} />;
      case 'line':
        return <Line data={chartData} options={options} height={400} />;
      default:
        return <Bar data={chartData} options={options} height={400} />;
    }
  };

  return (
    <div className="data-chart-container">
      <div className="chart-wrapper">
        {renderChart()}
      </div>
      <div className="chart-info">
        <p className="chart-type-info">
          Chart Type: {selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)}
        </p>
        <p className="chart-data-info">
          Data Points: {data.length} | Columns: {Object.keys(data[0]).length}
        </p>
      </div>
    </div>
  );
}

export default DataChart; 