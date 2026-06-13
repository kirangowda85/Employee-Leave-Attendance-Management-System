import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    resolve: null
  });

  const openConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  const handleCancel = () => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  return (
    <ConfirmContext.Provider value={{ openConfirm }}>
      {children}
      {confirmState.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
            <div className="flex-gap" style={{ alignItems: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Please Confirm</h2>
            </div>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              {confirmState.message}
            </p>
            <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" style={{ backgroundColor: 'var(--surface)' }} onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
