import React from 'react';

// 通用加载组件
const LoadingSpinner = ({ size = 'medium', text = '加载中...', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;