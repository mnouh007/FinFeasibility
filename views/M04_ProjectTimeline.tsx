import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TrashIcon, PlusIcon } from '../components/ui/Icons';
import { Task } from '../types';
import { GanttChart } from '../components/charts/GanttChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { validateSchedule } from '../services/geminiService';

const M04_ProjectTimeline = () => {
  const { t, i18n } = useTranslation();
  const { projectData, addTask, updateTask, removeTask } = useProjectStore();
  const { tasks } = projectData.timeline;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleTaskChange = (id: string, field: keyof Omit<Task, 'id' | 'dependencies'>, value: string | number) => {
    const isNumeric = field === 'progress';
    updateTask(id, { [field]: isNumeric ? Number(value) : value });
  };

  const validTasks = tasks.filter(task => task.startDate && task.endDate && new Date(task.startDate) <= new Date(task.endDate));

  const handleValidateSchedule = async () => {
    if (tasks.length === 0) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await validateSchedule(tasks, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Schedule Validation Failed:", error);
        setAiInsight(t('m4_projectTimeline.aiValidator.error'));
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m4')}</h1>
      
      <Card title={t('m4_projectTimeline.title')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-2/5">{t('m4_projectTimeline.table.taskName')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m4_projectTimeline.table.startDate')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m4_projectTimeline.table.endDate')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m4_projectTimeline.table.progress')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m4_projectTimeline.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {tasks.map(task => (
                <tr key={task.id}>
                  <td className="px-2 py-2"><Input type="text" value={task.name} onChange={e => handleTaskChange(task.id, 'name', e.target.value)} /></td>
                  <td className="px-2 py-2"><Input type="date" value={task.startDate} onChange={e => handleTaskChange(task.id, 'startDate', e.target.value)} /></td>
                  <td className="px-2 py-2"><Input type="date" value={task.endDate} onChange={e => handleTaskChange(task.id, 'endDate', e.target.value)} /></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center">
                        <Input className="w-20 mr-2" type="number" min="0" max="100" value={task.progress} onChange={e => handleTaskChange(task.id, 'progress', e.target.value)} />
                        <span>%</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">{t('m4_projectTimeline.noTasks')}</p>}
        <div className="mt-4 flex justify-end">
            <Button onClick={addTask} className="flex items-center"><PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0"/>{t('m4_projectTimeline.addTask')}</Button>
        </div>
      </Card>

      <AIInsightBox
        title={t('m4_projectTimeline.aiValidator.title')}
        insight={aiInsight}
        isLoading={isAiLoading}
        onGenerate={handleValidateSchedule}
        onInsightChange={setAiInsight}
        generateButtonText={t('m4_projectTimeline.aiValidator.generateButton')}
        loadingText={t('m4_projectTimeline.aiValidator.generating')}
        placeholderText={t('m4_projectTimeline.aiValidator.placeholder')}
      />
      
      <Card title={t('m4_projectTimeline.ganttChartTitle')}>
        {validTasks.length > 0 ? (
          <GanttChart tasks={validTasks} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">{t('m4_projectTimeline.noTasksForChart')}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
export default M04_ProjectTimeline;