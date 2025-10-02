import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI를 보여주도록 상태를 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI
      return (
        <div className="weather-card border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="weather-card-header text-red-700 dark:text-red-400">
            ⚠️ 위젯 로딩 오류
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p className="font-medium">이 위젯을 불러올 수 없습니다.</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>

            {/* 개발 모드에서만 오류 상세 표시 */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-xs mt-3">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                  개발자 정보 (오류 상세)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
