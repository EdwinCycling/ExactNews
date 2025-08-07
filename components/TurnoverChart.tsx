import React from 'react';

interface TurnoverChartProps {
  data?: any;
  className?: string;
}

const TurnoverChart: React.FC<TurnoverChartProps> = ({ data, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Turnover Chart
      </h3>
      <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
        Chart component placeholder
      </div>
    </div>
  );
};

export default TurnoverChart;