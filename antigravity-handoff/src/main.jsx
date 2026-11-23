import React from 'react';
import ReactDOM from 'react-dom/client';
import SafeApp from './SafeApp';
import HoursAdmin from './components/HoursAdmin';
import './index.css';
import './safe.css';

const isHoursAdmin = window.location.pathname.replace(/\/$/, '') === '/staff-hours';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isHoursAdmin ? <HoursAdmin /> : <SafeApp />}
  </React.StrictMode>
);
