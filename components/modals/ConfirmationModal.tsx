import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'danger'
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  confirmButtonVariant = 'primary'
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-slate-600 dark:text-slate-300 text-sm">{message}</div>
      <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-5 mt-5 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary" onClick={onClose}>
          {cancelButtonText || t('common.cancel')}
        </Button>
        <Button variant={confirmButtonVariant} onClick={handleConfirm}>
          {confirmButtonText || t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
};