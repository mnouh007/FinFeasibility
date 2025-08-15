import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`block w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-300 dark:border-slate-700 rounded-md transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400 ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';