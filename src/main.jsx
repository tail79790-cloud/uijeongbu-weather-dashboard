import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 전역 에러 핸들링
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');

    if (!rootElement) {
      console.error('Root element not found!');
      return;
    }

    // React 18 createRoot로 렌더링
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);

    // 렌더링 실패 시 사용자에게 에러 표시
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="max-width: 600px; margin: 50px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="background: #fee; border-left: 4px solid #c00; padding: 20px; border-radius: 4px;">
            <h1 style="color: #c00; margin: 0 0 10px 0;">⚠️ React 렌더링 오류</h1>
            <p style="margin: 10px 0;">앱을 초기화하는 중 오류가 발생했습니다:</p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${error.message}\n\n${error.stack}</pre>
            <p style="margin: 15px 0 5px 0; font-size: 13px; color: #666;">브라우저를 새로고침(F5)하거나 콘솔(F12)에서 자세한 정보를 확인하세요.</p>
          </div>
        </div>
      `;
    }
  }
};

// DOM이 준비되면 앱 렌더링
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}