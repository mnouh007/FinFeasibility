import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-700 rounded-md transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';