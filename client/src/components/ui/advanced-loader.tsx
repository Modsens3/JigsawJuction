import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedLoaderProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'custom';
  customColor?: string;
  text?: string;
  progress?: number; // 0-100
  className?: string;
}

export const AdvancedLoader: React.FC<AdvancedLoaderProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  customColor,
  text,
  progress,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    custom: customColor ? `text-[${customColor}]` : 'text-blue-600'
  };

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 bg-current rounded-full ${colorClasses[color]}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`w-full h-full bg-current rounded-full ${colorClasses[color]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );

      case 'skeleton':
        return (
          <div className="space-y-2">
            <motion.div
              className="h-4 bg-gray-200 rounded"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="h-4 bg-gray-200 rounded w-3/4"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2,
                ease: "easeInOut"
              }}
            />
          </div>
        );

      case 'progress':
        return (
          <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {progress !== undefined && (
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={type}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {renderLoader()}
        </motion.div>
      </AnimatePresence>
      
      {text && (
        <motion.p
          className="mt-2 text-sm text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string; type?: AdvancedLoaderProps['type'] }> = ({ 
  text = 'Loading...', 
  type = 'spinner' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <AdvancedLoader type={type} size="xl" text={text} />
  </div>
);

export const ButtonLoader: React.FC<{ type?: AdvancedLoaderProps['type'] }> = ({ type = 'spinner' }) => (
  <AdvancedLoader type={type} size="sm" color="white" />
);

export const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className="h-4 bg-gray-200 rounded"
        style={{ width: `${100 - (i * 10)}%` }}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export const ProgressLoader: React.FC<{ 
  progress: number; 
  text?: string; 
  showPercentage?: boolean 
}> = ({ 
  progress, 
  text, 
  showPercentage = true 
}) => (
  <div className="w-full">
    <AdvancedLoader 
      type="progress" 
      progress={progress} 
      text={text}
    />
    {showPercentage && (
      <p className="text-sm text-gray-600 mt-1 text-center">
        {Math.round(progress)}% Complete
      </p>
    )}
  </div>
);
