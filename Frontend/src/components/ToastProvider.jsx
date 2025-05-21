import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '12px 20px',
        },
        success: {
          style: {
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderLeft: '4px solid rgb(34, 197, 94)',
          },
          iconTheme: {
            primary: 'rgb(34, 197, 94)',
            secondary: '#FFFAEE',
          },
        },
        error: {
          style: {
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderLeft: '4px solid rgb(239, 68, 68)',
          },
          iconTheme: {
            primary: 'rgb(239, 68, 68)',
            secondary: '#FFFAEE',
          },
        },
      }}
    />
  );
};

export default ToastProvider; 