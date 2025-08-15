import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { SparklesIcon, RotateCwIcon, BriefcaseIcon, LayersIcon, WrapTextIcon, LanguagesIcon } from './Icons';
import { transformText } from '../../services/geminiService';

interface AIInsightBoxProps {
    title: string;
    insight: string | null;
    isLoading: boolean;
    onGenerate?: () => void;
    onInsightChange: (newInsight: string) => void;
    generateButtonText?: string;
    loadingText?: string;
    placeholderText: string;
    isGenerateDisabled?: boolean;
}

const TransformButton = ({ onClick, disabled, children, icon: Icon }: { onClick: () => void, disabled: boolean, children: React.ReactNode, icon: React.ElementType }) => (
    <Button 
        variant="secondary" 
        size="sm" 
        onClick={onClick} 
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs"
        title={children as string}
    >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{children}</span>
    </Button>
);

export const AIInsightBox: React.FC<AIInsightBoxProps> = ({
    title,
    insight,
    isLoading,
    onGenerate,
    onInsightChange,
    generateButtonText,
    loadingText,
    placeholderText,
    isGenerateDisabled = false,
}) => {
    const { t, i18n } = useTranslation();
    const [editableInsight, setEditableInsight] = useState('');
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformError, setTransformError] = useState<string | null>(null);

    useEffect(() => {
        setEditableInsight(insight || '');
    }, [insight]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableInsight(e.target.value);
        onInsightChange(e.target.value);
    };

    const handleTransform = async (transformation: 'rewrite' | 'formal' | 'summarize' | 'longer' | 'translate') => {
        if (!editableInsight) return;
        setIsTransforming(true);
        setTransformError(null);
        try {
            const targetLang = transformation === 'translate' ? (i18n.language === 'en' ? 'ar' : 'en') : undefined;
            const transformedText = await transformText(editableInsight, transformation, targetLang);
            setEditableInsight(transformedText);
            onInsightChange(transformedText);
        } catch (error) {
            console.error('Text transformation failed:', error);
            setTransformError(t('aiTransform.error'));
        } finally {
            setIsTransforming(false);
        }
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-blue-500" />
                    {title}
                </h3>
                {onGenerate && generateButtonText && (
                    <Button onClick={onGenerate} disabled={isLoading || isGenerateDisabled || isTransforming} size="sm">
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:ml-2 rtl:mr-0"></div>
                                {loadingText}
                            </>
                        ) : (
                            generateButtonText
                        )}
                    </Button>
                )}
            </div>
            
            {isLoading ? (
                 <div className="space-y-2 pt-2">
                    <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                    <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                </div>
            ) : insight !== null ? (
                <div className="space-y-2">
                    <Textarea
                        value={editableInsight}
                        onChange={handleTextChange}
                        rows={5}
                        className="bg-white dark:bg-slate-700"
                        disabled={isTransforming}
                    />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('aiTransform.toolbarTitle')}</span>
                        <TransformButton onClick={() => handleTransform('rewrite')} disabled={isTransforming} icon={RotateCwIcon}>{t('aiTransform.rewrite')}</TransformButton>
                        <TransformButton onClick={() => handleTransform('formal')} disabled={isTransforming} icon={BriefcaseIcon}>{t('aiTransform.formal')}</TransformButton>
                        <TransformButton onClick={() => handleTransform('summarize')} disabled={isTransforming} icon={LayersIcon}>{t('aiTransform.summarize')}</TransformButton>
                        <TransformButton onClick={() => handleTransform('longer')} disabled={isTransforming} icon={WrapTextIcon}>{t('aiTransform.longer')}</TransformButton>
                        <TransformButton onClick={() => handleTransform('translate')} disabled={isTransforming} icon={LanguagesIcon}>{t('aiTransform.translate')}</TransformButton>
                    </div>
                     {transformError && (
                        <p className="text-xs text-red-500 mt-1">{transformError}</p>
                     )}
                </div>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm px-2 py-4">
                    {placeholderText}
                </p>
            )}
        </div>
    );
};