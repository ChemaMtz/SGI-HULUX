import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Load Bootstrap from npm (CSS and JS bundle)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Import browser compatibility styles and utilities
import './browser-compatibility.css';
import './utils/browserCompat';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
