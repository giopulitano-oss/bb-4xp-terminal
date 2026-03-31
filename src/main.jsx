import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Hide loading screen
const loading = document.getElementById('loading');
if (loading) {
  loading.style.opacity = '0';
  setTimeout(() => { loading.style.display = 'none'; }, 500);
}
