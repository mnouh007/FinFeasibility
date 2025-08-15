import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { TrashIcon, PlusIcon, XIcon, MapPinIcon } from '../components/ui/Icons';
import { ProjectDefinition, Partner } from '../types';
import { OwnershipPieChart } from '../components/charts/OwnershipPieChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { summarizeProjectDefinition } from '../services/geminiService';
import { Select } from '../components/ui/Select';
import { MapModal } from '../components/modals/MapModal';

const M01_ProjectDefinition = () => {
  const { t, i18n } = useTranslation();
  const { 
    projectData, 
    calculatedOutputs,
    updateField, 
    addPartner, 
    updatePartner, 
    removePartner,
    addStakeholder,
    removeStakeholder
  } = useProjectStore();
  const { definition } = projectData;

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState('');
  const [isMapModalOpen, setMapModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     if (name === 'latitude' || name === 'longitude') {
        updateField('definition', name as keyof ProjectDefinition, value === '' ? undefined : parseFloat(value));
    } else {
        updateField('definition', name as keyof ProjectDefinition, value);
    }
  };

  const handlePartnerChange = (id: string, field: keyof Omit<Partner, 'id'>, value: string | number) => {
    const isNumeric = field === 'share';
    updatePartner(id, { [field]: isNumeric ? Number(value) : value });
  };
  
  const handleAddStakeholder = () => {
    if (newStakeholder && !definition.stakeholders.includes(newStakeholder)) {
      addStakeholder(newStakeholder);
      setNewStakeholder('');
    }
  };
  
  const handleLocationConfirm = (address: string, lat: number, lng: number) => {
    updateField('definition', 'projectLocation', address);
    updateField('definition', 'latitude', parseFloat(lat.toFixed(6)));
    updateField('definition', 'longitude', parseFloat(lng.toFixed(6)));
  };


  const totalShare = definition.partners.reduce((sum, p) => sum + (Number(p.share) || 0), 0);
  const isShareInvalid = totalShare !== 100 && definition.partners.length > 0;
  
  const chartData = definition.partners.filter(p => p.share > 0);

  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    setAiSummary(null);
    try {
        const summary = await summarizeProjectDefinition(definition, i18n.language);
        setAiSummary(summary);
    } catch (error) {
        console.error("AI Summary Generation Failed:", error);
        setAiSummary(t('m1_projectDefinition.aiSummary.error'));
    } finally {
        setIsAiLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: projectData.estimationBasis.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  const firstOpYearIndex = calculatedOutputs.revenueSchedule.findIndex(rev => rev > 0);
  const firstOpYearNopat = firstOpYearIndex !== -1 ? (calculatedOutputs.cashFlowStatement?.[firstOpYearIndex]?.nopat ?? 0) : 0;

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m1')}</h1>
      
      <AIInsightBox
        title={t('m1_projectDefinition.aiSummary.title')}
        insight={aiSummary}
        isLoading={isAiLoading}
        onGenerate={handleGenerateSummary}
        onInsightChange={setAiSummary}
        generateButtonText={t('m1_projectDefinition.aiSummary.generateButton')}
        loadingText={t('m1_projectDefinition.aiSummary.generating')}
        placeholderText={t('m1_projectDefinition.aiSummary.placeholder')}
        isGenerateDisabled={!definition.projectName && !definition.projectDescription}
      />

      <Card title={t('m1_projectDefinition.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.projectName')}</label>
                <Input
                  id="projectName"
                  name="projectName"
                  type="text"
                  value={definition.projectName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.projectDescription')}</label>
                <Textarea
                  id="projectDescription"
                  name="projectDescription"
                  rows={4}
                  placeholder={t('m1_projectDefinition.descriptionPlaceholder') || ''}
                  value={definition.projectDescription}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="objectives" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.objectives')}</label>
                <Textarea
                  id="objectives"
                  name="objectives"
                  rows={4}
                  placeholder={t('m1_projectDefinition.objectivesPlaceholder') || ''}
                  value={definition.objectives}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="baseCase" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.baseCaseDescription')}</label>
                <Textarea
                  id="baseCase"
                  name="baseCase"
                  rows={4}
                  placeholder={t('m1_projectDefinition.baseCasePlaceholder') || ''}
                  value={definition.baseCase}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectLocation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.projectLocation')}</label>
                <div className="flex gap-2">
                    <Input
                        id="projectLocation"
                        name="projectLocation"
                        type="text"
                        value={definition.projectLocation}
                        onChange={handleInputChange}
                    />
                    <Button variant="secondary" onClick={() => setMapModalOpen(true)} aria-label={t('m1_projectDefinition.mapModal.buttonLabel')}>
                        <MapPinIcon className="h-5 w-5" />
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.latitude')}</label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={definition.latitude ?? ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 30.0444"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.longitude')}</label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={definition.longitude ?? ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 31.2357"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="geographicScope" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.geographicScope')}</label>
                <Select id="geographicScope" name="geographicScope" value={definition.geographicScope} onChange={handleInputChange}>
                  <option value="">{t('common.select')}</option>
                  <option value="Single Governorate">{t('m1_projectDefinition.geographicScopeOptions.singleGov')}</option>
                  <option value="Multi Governorates Region">{t('m1_projectDefinition.geographicScopeOptions.multiGov')}</option>
                  <option value="Whole Country">{t('m1_projectDefinition.geographicScopeOptions.wholeCountry')}</option>
                  <option value="Specific District in a Governorate">{t('m1_projectDefinition.geographicScopeOptions.specificDistrict')}</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m1_projectDefinition.stakeholders')}</label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newStakeholder}
                        onChange={(e) => setNewStakeholder(e.target.value)}
                        placeholder={t('m1_projectDefinition.stakeholderPlaceholder') || ''}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddStakeholder(); } }}
                    />
                    <Button onClick={handleAddStakeholder} variant='secondary'>{t('m1_projectDefinition.addStakeholder')}</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {definition.stakeholders.map((s, i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
                            {s}
                            <button onClick={() => removeStakeholder(s)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                                <XIcon className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
              </div>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('m1_projectDefinition.partnersTitle')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-3/5">{t('m1_projectDefinition.partnerName')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/5">{t('m1_projectDefinition.sharePercentage')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/5">{t('m1_projectDefinition.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {definition.partners.map(partner => (
                  <tr key={partner.id}>
                    <td className="px-4 py-2"><Input type="text" value={partner.name} onChange={e => handlePartnerChange(partner.id, 'name', e.target.value)} /></td>
                    <td className="px-4 py-2"><Input type="number" min="0" max="100" value={partner.share} onChange={e => handlePartnerChange(partner.id, 'share', e.target.value)} /></td>
                    <td className="px-4 py-2">
                      <Button variant="ghost" size="sm" onClick={() => removePartner(partner.id)}>
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button onClick={addPartner} size="sm" variant="secondary" className="flex items-center">
              <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('m1_projectDefinition.addPartner')}
            </Button>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('m1_projectDefinition.totalShare')}: </span>
              <span className={`text-sm font-bold ${isShareInvalid ? 'text-red-500' : 'text-green-600'}`}>{totalShare.toFixed(2)}%</span>
              {isShareInvalid && <p className="text-xs text-red-500 mt-1">{t('m1_projectDefinition.shareError')}</p>}
            </div>
          </div>
        </Card>
        
        <Card title={t('m1_projectDefinition.profitShareTitle')}>
            {firstOpYearNopat > 0 && definition.partners.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-300">{t('m1_projectDefinition.partner')}</th>
                                <th className="py-2 text-right text-sm font-medium text-slate-500 dark:text-slate-300">{t('m1_projectDefinition.profitShare')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {definition.partners.map(p => (
                                <tr key={p.id}>
                                    <td className="py-2 font-medium">{p.name}</td>
                                    <td className="py-2 text-right font-mono">{formatCurrency((p.share / 100) * firstOpYearNopat)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 dark:text-slate-400 text-center">{t('m1_projectDefinition.noProfitData')}</p>
                </div>
            )}
        </Card>
        
        {chartData.length > 0 && (
          <Card title={t('m1_projectDefinition.ownershipChartTitle')}>
            <OwnershipPieChart data={chartData} />
          </Card>
        )}
      </div>

    </div>
    <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onConfirm={handleLocationConfirm}
    />
    </>
  );
};
export default M01_ProjectDefinition;