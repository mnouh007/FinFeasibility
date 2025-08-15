import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const M16_DataManagement = () => {
  const { t } = useTranslation();
  
  const functions = t('m16_dataManagement.functions', { returnObjects: true }) as Record<string, string>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m16')}</h1>
      
      <Card title={t('m16_dataManagement.title')}>
        <p className="mb-6 text-slate-600 dark:text-slate-300">
          {t('m16_dataManagement.description')}
        </p>
        
        <div className="space-y-4">
          {Object.entries(functions).filter(([key]) => !key.endsWith('Desc')).map(([key, title]) => (
            <div key={key} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {functions[`${key}Desc`]}
                </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
export default M16_DataManagement;