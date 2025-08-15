import React from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PageWrapper } from './components/layout/PageWrapper';
import { useDarkMode } from './hooks/useDarkMode';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from './store/projectStore';
import { WelcomeScreen } from './views/WelcomeScreen';

// Import all view components
import M01 from './views/M01_ProjectDefinition';
import M02 from './views/M02_EstimationBasis';
import M03 from './views/M03_CapitalInvestment';
import M04 from './views/M04_ProjectTimeline';
import M05 from './views/M05_OperatingInputs';
import M06 from './views/M06_FinancingLoans';
import M07 from './views/M07_WorkingCapital';
import M08 from './views/M08_CashFlowStatement';
import M09 from './views/M09_FinancialEvaluation';
import M10 from './views/M10_BreakEvenAnalysis';
import M11 from './views/M11_FinancialRatios';
import M12 from './views/M12_SensitivityAnalysis';
import M13 from './views/M13_MonteCarloSimulation';
import M14 from './views/M14_Dashboard';
import M15 from './views/M15_CustomReport';
import M16 from './views/M16_DataManagement';

const moduleMap: { [key: string]: React.ComponentType } = {
  m1: M01,
  m2: M02,
  m3: M03,
  m4: M04,
  m5: M05,
  m6: M06,
  m7: M07,
  m8: M08,
  m9: M09,
  m10: M10,
  m11: M11,
  m12: M12,
  m13: M13,
  m14: M14,
  m15: M15,
  m16: M16,
};


function App() {
  const [isDarkMode, setDarkMode] = useDarkMode();
  const { i18n } = useTranslation();
  const activeModule = useProjectStore((state) => state.activeModule);
  const isDataLoaded = useProjectStore((state) => state.isDataLoaded);

  React.useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = direction;
  }, [i18n, i18n.language]);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  if (!isDataLoaded) {
    return <WelcomeScreen />;
  }

  const ActiveComponent = moduleMap[activeModule] || M14; // Default to Dashboard

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <PageWrapper>
          <ActiveComponent />
        </PageWrapper>
      </div>
    </div>
  );
}

export default App;