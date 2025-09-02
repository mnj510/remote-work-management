import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

console.log('index.js: Starting React app...');

try {
  const rootElement = document.getElementById('root');
  console.log('index.js: Root element found:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('index.js: React root created');
  
  root.render(
    <React.StrictMode>
      <BrowserRouter basename="/remote-work-management">
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  
  console.log('index.js: React app rendered');
} catch (error) {
  console.error('index.js: Error:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">React 앱 초기화 오류: ${error.message}</div>`;
}
