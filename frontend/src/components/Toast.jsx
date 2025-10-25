import { useState, useEffect } from 'react';
import '../styles/Toast.css';

let toastCallbacks = [];

export const toast = {
  success: (message, duration = 3000) => {
    toastCallbacks.forEach(callback => callback({ message, type: 'success', duration }));
  },
  error: (message, duration = 3000) => {
    toastCallbacks.forEach(callback => callback({ message, type: 'error', duration }));
  },
  warning: (message, duration = 3000) => {
    toastCallbacks.forEach(callback => callback({ message, type: 'warning', duration }));
  },
  info: (message, duration = 3000) => {
    toastCallbacks.forEach(callback => callback({ message, type: 'info', duration }));
  }
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const callback = (toast) => {
      const id = Date.now();
      const newToast = { ...toast, id };
      
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration);
    };
    
    toastCallbacks.push(callback);
    
    return () => {
      toastCallbacks = toastCallbacks.filter(cb => cb !== callback);
    };
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close"
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
