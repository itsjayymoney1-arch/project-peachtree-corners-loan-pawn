import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from './context/RouterContext';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </RouterProvider>
  </React.StrictMode>
);
