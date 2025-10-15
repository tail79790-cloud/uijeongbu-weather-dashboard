import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WidgetProvider } from './contexts/WidgetContext'
import { DeploymentProvider } from './contexts/DeploymentContext'
import ErrorBoundary from './components/ErrorBoundary'
import DashboardGrid from './components/layouts/DashboardGrid'
import './index.css'

// Lazy load 대시보드 컨트롤
const DashboardControls = lazy(() => import('./components/DashboardControls'))

// QueryClient 설정 - 안정적인 오류 처리
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.warn('Query error:', error);
      },
    },
  },
})

const ControlLoader = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
)

function AppContent() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🌤️ 의정부시 재난대응 날씨 대시보드
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                실시간 날씨 정보 • 의정부시 • 재난담당실 전용
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="테마 전환"
            >
              {isDark ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6">
          {/* 대시보드 컨트롤 */}
          <ErrorBoundary>
            <Suspense fallback={<ControlLoader />}>
              <DashboardControls />
            </Suspense>
          </ErrorBoundary>

          {/* 위젯 그리드 (경찰관 배치 관리 섹션 포함) */}
          <ErrorBoundary>
            <DashboardGrid />
          </ErrorBoundary>
      </main>

        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-2">의정부시 재난담당실 전용 날씨 대시보드</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              데이터 출처: 기상청, 한강홍수통제소 • 5~10분 자동 갱신
            </p>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DeploymentProvider>
          <WidgetProvider>
            <AppContent />
          </WidgetProvider>
        </DeploymentProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App