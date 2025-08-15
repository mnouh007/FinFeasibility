import React from 'react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../../constants';
import { useProjectStore } from '../../store/projectStore';

export const Sidebar = () => {
    const { t } = useTranslation();
    const { activeModule, setActiveModule } = useProjectStore();

    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700 flex-shrink-0 px-4">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">FinFeasibility</h1>
            </div>
            <nav className="flex-1 overflow-y-auto sidebar-scroll p-2">
                <h2 className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('sidebar.title')}</h2>
                <ul className="mt-2 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveModule(item.id); }}
                                    aria-current={activeModule === item.id ? 'page' : undefined}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeModule === item.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0"/>
                                    <span className="flex-1">{t(`sidebar.${item.id}`)}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};