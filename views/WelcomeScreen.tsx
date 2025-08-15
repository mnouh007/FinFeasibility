import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { ProjectData } from '../types';
import { UploadCloudIcon, FilePlus2Icon, FlaskConicalIcon } from '../components/ui/Icons';

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => (
    <div 
        onClick={onClick} 
        className="cursor-pointer group block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-lg transform transition-all duration-300"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

export const WelcomeScreen = () => {
    const { t, i18n } = useTranslation();
    const { startNewStudy, setProjectData } = useProjectStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not text");
                const data = JSON.parse(text) as ProjectData;
                setProjectData(data);
            } catch (error) {
                console.error("Failed to load or parse file:", error);
                alert(t('notifications.loadError'));
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleLoadSample = async () => {
        try {
            const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
            const fileName = lang === 'ar' ? 'sample-data.ar.json' : 'sample-data.json';
            const response = await fetch(`/${fileName}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setProjectData(data as ProjectData);
        } catch (error) {
            console.error("Failed to load sample data:", error);
            alert(t('notifications.loadError'));
        }
    };
    
    const handleStartNew = () => {
        startNewStudy();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-12">
                 <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">{t('welcome.title')}</h1>
                 <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('welcome.subtitle')}</p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard 
                    icon={<UploadCloudIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    title={t('welcome.uploadTitle')}
                    description={t('welcome.uploadDesc')}
                    onClick={handleUploadClick}
                />
                 <ActionCard 
                    icon={<FilePlus2Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    title={t('welcome.newTitle')}
                    description={t('welcome.newDesc')}
                    onClick={handleStartNew}
                />
                 <ActionCard 
                    icon={<FlaskConicalIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    title={t('welcome.sampleTitle')}
                    description={t('welcome.sampleDesc')}
                    onClick={handleLoadSample}
                />
            </div>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".hosp,application/json"
            />
        </div>
    );
};