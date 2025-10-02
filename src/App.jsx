import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import './index.css'

// 중요한 위젯만 즉시 로드
import WeatherAlertWidget from './components/widgets/WeatherAlertWidget'
import CurrentWeather from './components/widgets/CurrentWeather'

// 나머지는 lazy loading으로 분리
const RainfallFloodWidget = lazy(() => import('./components/widgets/RainfallFloodWidget'))
const HourlyForecastWidget = lazy(() => import('./components/widgets/HourlyForecastWidget'))
const DailyForecastWidget = lazy(() => import('./components/widgets/DailyForecastWidget'))
const MidForecastWidget = lazy(() => import('./components/widgets/MidForecastWidget'))
const AirQualityWidget = lazy(() => import('./components/widgets/AirQualityWidget'))
const LivingWeatherWidget = lazy(() => import('./components/widgets/LivingWeatherWidget'))
const NotificationSettings = lazy(() => import('./components/NotificationSettings'))

// 로딩 컴포넌트
const WidgetLoader = () => (
  <div className="weather-card">
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
)

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

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 긴급 특보 (최상단, 전체 너비) */}
            <WeatherAlertWidget />

            {/* 현재 날씨 & 강수량/수위 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CurrentWeather />
              <Suspense fallback={<WidgetLoader />}>
                <RainfallFloodWidget />
              </Suspense>
            </div>

            {/* 시간별 예보 (전체 너비) */}
            <Suspense fallback={<WidgetLoader />}>
              <HourlyForecastWidget />
            </Suspense>

            {/* 3일 예보 (전체 너비) */}
            <Suspense fallback={<WidgetLoader />}>
              <DailyForecastWidget />
            </Suspense>

            {/* 중기예보 (전체 너비) */}
            <Suspense fallback={<WidgetLoader />}>
              <MidForecastWidget />
            </Suspense>

            {/* 대기질 & 생활기상지수 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<WidgetLoader />}>
                <AirQualityWidget />
              </Suspense>
              <Suspense fallback={<WidgetLoader />}>
                <LivingWeatherWidget />
              </Suspense>
            </div>

            {/* 알림 설정 */}
            <Suspense fallback={<WidgetLoader />}>
              <NotificationSettings />
            </Suspense>
          </div>
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
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App