import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { syncCloudProgress } from './services/cloudSync';

const App: React.FC = () => {
  useEffect(() => {
    syncCloudProgress().catch(() => {});
    const intervalId = window.setInterval(() => {
      syncCloudProgress().catch(() => {});
    }, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        syncCloudProgress().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
