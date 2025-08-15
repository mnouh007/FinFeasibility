import React from 'react';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative flex items-center group">
      {children}
      <div
        role="tooltip"
        className={`absolute ${positionClasses[position]} px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded-md shadow-sm dark:bg-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      >
        {text}
      </div>
    </div>
  );
};