import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "", lines = 3 }) => {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-slate-300 dark:bg-gray-600 rounded ${
            index === lines - 1 ? 'w-1/2' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;