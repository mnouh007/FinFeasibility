import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-700 rounded-md transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';