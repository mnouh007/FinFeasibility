import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  unit?: string;
  colorClass?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, unit, colorClass = 'text-slate-900 dark:text-white' }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col transition-shadow duration-300 hover:shadow-lg">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
      <p className={`mt-2 text-4xl font-bold ${colorClass}`}>
        {value}
        {unit && <span className="text-xl font-medium ml-2 rtl:mr-2 rtl:ml-0">{unit}</span>}
      </p>
      {description && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 flex-grow">{description}</p>}
    </div>
  );
};