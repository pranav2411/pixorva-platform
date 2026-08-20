"use client";

import React, { useEffect, useState } from 'react';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pixorva-toast', { detail: { message, type } }));
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' }>;
      const { message, type } = customEvent.detail;
      
      const newToast: ToastData = {
        id: Date.now() + Math.random(),
        message,
        type
      };

      setToasts(prev => [...prev, newToast]);

      // Remove after 3.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3500);
    };

    window.addEventListener('pixorva-toast', handleToastEvent);
    return () => {
      window.removeEventListener('pixorva-toast', handleToastEvent);
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right-10 duration-200"
        >
          {/* Status Indicator Dot */}
          <div className={`w-4 h-4 rounded-full border-2 border-black flex-shrink-0 ${toast.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
          
          <p className="text-xs font-bold text-gray-800 uppercase tracking-wide leading-tight">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  );
}
