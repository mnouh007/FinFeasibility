import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-8">
        {children}
      </div>
    </main>
  );
};