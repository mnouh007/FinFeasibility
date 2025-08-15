
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useProjectStore } from '../../store/projectStore';
import { generateFullProject } from '../../services/geminiService';

interface GenerateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateIdeaModal: React.FC<GenerateIdeaModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProjectData, setActiveModule } = useProjectStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
        const projectData = await generateFullProject(prompt, i18n.language);
        setProjectData(projectData);
        setIsLoading(false);
        onClose();
        setActiveModule('m14'); // Switch to dashboard view
    } catch (e) {
        console.error(e);
        if (e instanceof Error && e.message === 'API_KEY_NOT_CONFIGURED') {
            setError(t('apiKeyError'));
        } else {
            const displayError = e instanceof Error ? e.message : t('modals.generateIdea.error');
            setError(displayError);
        }
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setPrompt('');
    setError(null);
    setIsLoading(false);
    onClose();
  }

  const samplePrompts = t('modals.generateIdea.samplePrompts', { returnObjects: true }) as { title: string, prompts: string[] };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modals.generateIdea.title')}>
      <div className="space-y-4">
        <div>
            <label htmlFor="idea-prompt" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('modals.generateIdea.promptLabel')}
            </label>
            <Textarea
            id="idea-prompt"
            rows={4}
            placeholder={t('modals.generateIdea.placeholder') || ''}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            />
        </div>

        <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{samplePrompts.title}</h4>
            <div className="flex flex-wrap gap-2">
                {samplePrompts.prompts.map((p, i) => (
                    <Button
                        key={i}
                        variant="secondary"
                        size="sm"
                        onClick={() => setPrompt(p)}
                        disabled={isLoading}
                        className="text-xs"
                    >
                        {p}
                    </Button>
                ))}
            </div>
        </div>


        {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-300 whitespace-pre-wrap" role="alert">
                {error}
            </div>
        )}
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? t('modals.generateIdea.generatingButton') : t('modals.generateIdea.generateButton')}
        </Button>
      </div>
    </Modal>
  );
};
