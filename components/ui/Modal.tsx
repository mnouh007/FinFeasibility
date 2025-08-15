import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'xl' | '3xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-lg',
    xl: 'max-w-xl',
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl m-4 w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale ${sizeClasses[size]}`}
        style={{ animation: 'fade-in-scale 0.2s forwards' }}
      >
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-slate-700">
          <h3 id="modal-title" className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-slate-700 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
             <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>,
    document.body
  );
};