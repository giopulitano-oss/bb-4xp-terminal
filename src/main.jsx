import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { AuthProvider } from './firebase/AuthContext';
import AuthGuard from './components/AuthGuard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AuthGuard>
      <App />
    </AuthGuard>
  </AuthProvider>
);

// Hide loading screen
const loading = document.getElementById('loading');
if (loading) {
  loading.style.opacity = '0';
  setTimeout(() => { loading.style.display = 'none'; }, 500);
}
