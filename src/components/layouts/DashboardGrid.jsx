import { memo, Suspense, lazy, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useWidgets } from '../../contexts/WidgetContext'
import ErrorBoundary from '../ErrorBoundary'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// 위젯 컴포넌트들
import WeatherAlertWidget from '../widgets/WeatherAlertWidget'
import CurrentWeather from '../widgets/CurrentWeather'
import DisasterRiskScore from '../risk/DisasterRiskScore'

// 경찰관 배치 관리 섹션
import DeploymentSection from '../DeploymentSection'

// Lazy load 위젯들
const RainfallFloodWidget = lazy(() => import('../widgets/RainfallFloodWidget'))
const HourlyForecastWidget = lazy(() => import('../widgets/HourlyForecastWidget'))
const DailyForecastWidget = lazy(() => import('../widgets/DailyForecastWidget'))
const MidForecastWidget = lazy(() => import('../widgets/MidForecastWidget'))
const AirQualityWidget = lazy(() => import('../widgets/AirQualityWidget'))
const LivingWeatherWidget = lazy(() => import('../widgets/LivingWeatherWidget'))
const NotificationSettings = lazy(() => import('../NotificationSettings'))
const RiverMonitoringWidget = lazy(() => import('../widgets/RiverMonitoringWidget'))
const DistrictComparisonWidget = lazy(() => import('../widgets/DistrictComparisonWidget'))
const WeatherRiverCorrelationWidget = lazy(() => import('../widgets/WeatherRiverCorrelationWidget'))

// Phase 3: 고급 위젯들
const UijeongbuMapWidget = lazy(() => import('../map/UijeongbuMapWidget'))
const PoliceIndicesWidget = lazy(() => import('../risk/PoliceIndicesWidget'))
const SmartInsightsWidget = lazy(() => import('../risk/SmartInsightsWidget'))

// 위젯 로더
const WidgetLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

// 위젯 컴포넌트 매핑
const WIDGET_COMPONENTS = {
  // 경찰관 배치 관리 섹션
  'deployment-section': DeploymentSection,
  // 핵심 위젯들
  'weather-alert': WeatherAlertWidget,
  'current-weather': CurrentWeather,
  'rainfall-flood': RainfallFloodWidget,
  'river-monitoring': RiverMonitoringWidget,
  'district-comparison': DistrictComparisonWidget,
  'weather-river-correlation': WeatherRiverCorrelationWidget,
  'disaster-risk': DisasterRiskScore,
  'hourly-forecast': HourlyForecastWidget,
  'daily-forecast': DailyForecastWidget,
  'mid-forecast': MidForecastWidget,
  'air-quality': AirQualityWidget,
  'living-weather': LivingWeatherWidget,
  'notification-settings': NotificationSettings,
  // Phase 3: 고급 위젯들
  'uijeongbu-map': UijeongbuMapWidget,
  'police-indices': PoliceIndicesWidget,
  'smart-insights': SmartInsightsWidget
}

// 위젯 래퍼 컴포넌트 (메모이제이션 적용)
const WidgetWrapper = memo(({ widgetId, isEditMode }) => {
  const Component = WIDGET_COMPONENTS[widgetId]
  
  if (!Component) return null

  // Lazy loaded 컴포넌트 처리
  const isLazy = [
    'rainfall-flood', 'river-monitoring', 'district-comparison', 'weather-river-correlation',
    'hourly-forecast', 'daily-forecast', 'mid-forecast', 'air-quality', 'living-weather', 'notification-settings',
    'uijeongbu-map', 'police-indices', 'smart-insights'
  ].includes(widgetId)

  const content = (
    <div className={`h-full ${isEditMode ? 'pointer-events-none' : ''}`}>
      <ErrorBoundary>
        {isLazy ? (
          <Suspense fallback={<WidgetLoader />}>
            <Component />
          </Suspense>
        ) : (
          <Component />
        )}
      </ErrorBoundary>
    </div>
  )

  // 편집 모드일 때 드래그 핸들 및 시각적 피드백 표시
  if (isEditMode) {
    // 레이아웃에서 static 속성 확인 (더 이상 하드코딩하지 않음)
    const isStatic = false  // 모든 위젯이 이동 가능

    return (
      <div className={`h-full relative group ${isStatic ? '' : 'cursor-move'}`}>
        {/* 편집 가능 표시 오버레이 */}
        <div className={`
          absolute inset-0 pointer-events-none z-10 rounded-lg transition-all duration-200
          ${isStatic
            ? 'ring-2 ring-gray-300 dark:ring-gray-600 ring-opacity-50'
            : 'ring-2 ring-blue-400 dark:ring-blue-500 ring-opacity-0 group-hover:ring-opacity-60'
          }
        `}>
          {/* 드래그 핸들 */}
          {!isStatic && (
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1 pt-1">
              <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
            </div>
          )}

          {/* Static 위젯 표시 */}
          {isStatic && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              고정됨
            </div>
          )}
        </div>
        {content}
      </div>
    )
  }

  return content
})

WidgetWrapper.displayName = 'WidgetWrapper'

// 메인 대시보드 그리드 컴포넌트
const DashboardGrid = memo(() => {
  const { 
    layouts, 
    visibility, 
    isEditMode, 
    updateLayouts 
  } = useWidgets()

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    updateLayouts(allLayouts)
  }, [updateLayouts])

  // 표시할 위젯 필터링
  const visibleWidgets = Object.keys(visibility).filter(id => visibility[id])

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      onLayoutChange={handleLayoutChange}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={80}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isDraggable={isEditMode}
      isResizable={isEditMode}
      compactType="vertical"
      preventCollision={false}
    >
      {visibleWidgets.map(widgetId => (
        <div
          key={widgetId}
          data-widget-id={widgetId}
          className="widget-container"
        >
          <WidgetWrapper
            widgetId={widgetId}
            isEditMode={isEditMode}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  )
})

DashboardGrid.displayName = 'DashboardGrid'

export default DashboardGrid