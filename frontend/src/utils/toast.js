import toast from 'react-hot-toast';

// Custom dark-mode success notification wrapper
export const showSuccessToast = (message) => {
  toast.success(message, {
    style: {
      background: '#0F172A',
      color: '#34D399',
      border: '1px solid #059669',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    },
    iconTheme: {
      primary: '#10B981',
      secondary: '#0F172A',
    },
  });
};

// Custom dark-mode error notification wrapper
export const showErrorToast = (message) => {
  toast.error(message, {
    style: {
      background: '#0F172A',
      color: '#F87171',
      border: '1px solid #DC2626',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    },
    iconTheme: {
      primary: '#EF4444',
      secondary: '#0F172A',
    },
  });
};

// Custom dark-mode info notification wrapper
export const showInfoToast = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#0F172A',
      color: '#38BDF8',
      border: '1px solid #0284C7',
      borderRadius: '8px',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    },
  });
};

export default toast;
