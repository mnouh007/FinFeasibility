import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  projectName: string;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, url, projectName }) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'report'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('m15_customReport.previewModal.title')} size="5xl">
        <div className="w-full h-[75vh] bg-gray-200 dark:bg-gray-900">
            <iframe
                src={url}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title={t('m15_customReport.previewModal.title')}
            />
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleDownload}>
                {t('m15_customReport.previewModal.downloadButton')}
            </Button>
        </div>
    </Modal>
  );
};
