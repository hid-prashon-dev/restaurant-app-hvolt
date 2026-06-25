import { useEffect } from 'react';

export function useLockBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);
}

export function useEscapeClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
}

export function useModalUX(isOpen: boolean, onClose: () => void) {
  useLockBodyScroll(isOpen);
  useEscapeClose(isOpen, onClose);
}
