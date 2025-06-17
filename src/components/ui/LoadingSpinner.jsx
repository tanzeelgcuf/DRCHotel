import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const spinnerClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const spinner = (
    <div className={`spinner ${spinnerClasses[size]}`}>
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }
        
        .fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          z-index: 9999;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fullscreen spinner-container">
        {spinner}
      </div>
    );
  }

  return <div className="spinner-container">{spinner}</div>;
};

export default LoadingSpinner;