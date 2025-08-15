import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/projectStore';
import { GenerateIdeaModal } from '../modals/GenerateIdeaModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { ProjectData } from '../../types';
import { SunIcon, MoonIcon, LanguagesIcon } from '../ui/Icons';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { t, i18n } = useTranslation();
  const { projectData, startNewStudy, setProjectData, setActiveModule } = useProjectStore();
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: ''
  });

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleNewStudy = () => {
    setConfirmModal({
        isOpen: true,
        title: t('confirmations.newStudyTitle'),
        message: t('confirmations.newStudy'),
        onConfirm: () => startNewStudy(),
        confirmText: t('confirmations.newStudyConfirm')
    });
  };

  const handleSaveStudy = () => {
    try {
      const dataStr = JSON.stringify(projectData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project.hosp';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(t('notifications.studySaved'));
    } catch (error) {
      console.error("Failed to save study:", error);
    }
  };
  
  const handleLoadStudyClick = () => {
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
        alert(t('notifications.studyLoaded'));
        setActiveModule('m14'); // Switch to dashboard
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

  const doLoadSample = async () => {
    try {
      const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
      const fileName = lang === 'ar' ? 'sample-data.ar.json' : 'sample-data.json';
      const response = await fetch(`/${fileName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjectData(data as ProjectData);
      setActiveModule('m14'); // Switch to dashboard
    } catch (error) {
      console.error("Failed to load sample data:", error);
      alert(t('notifications.loadError'));
    }
  };

  const handleLoadSample = () => {
     setConfirmModal({
        isOpen: true,
        title: t('confirmations.loadSampleTitle'),
        message: t('confirmations.loadSample'),
        onConfirm: doLoadSample,
        confirmText: t('confirmations.loadSampleConfirm')
    });
  };


  return (
    <>
        <header className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-2 h-16 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="primary" onClick={() => setGenerateModalOpen(true)}>{t('header.generateIdea')}</Button>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="secondary" onClick={handleNewStudy}>{t('header.newStudy')}</Button>
            <Button variant="secondary" onClick={handleLoadSample}>{t('header.loadSample')}</Button>
            <Button variant="secondary" onClick={handleLoadStudyClick}>{t('header.loadStudy')}</Button>
            <Button variant="secondary" onClick={handleSaveStudy}>{t('header.saveStudy')}</Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".hosp,application/json"
            />
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Button variant="ghost" onClick={toggleLanguage} className="p-2 rounded-full" aria-label="Toggle Language">
                <LanguagesIcon className="h-5 w-5"/>
            </Button>
            <Button variant="ghost" onClick={toggleDarkMode} className="p-2 rounded-full" aria-label="Toggle Dark Mode">
                {isDarkMode ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>}
            </Button>
            </div>
        </div>
        </header>
        <GenerateIdeaModal isOpen={isGenerateModalOpen} onClose={() => setGenerateModalOpen(false)} />
        <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            confirmButtonText={confirmModal.confirmText}
        />
    </>
  );
};