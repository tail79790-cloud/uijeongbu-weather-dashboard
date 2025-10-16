import { memo, Suspense, lazy, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useWidgets } from '../../contexts/WidgetContext'
import ErrorBoundary from '../ErrorBoundary'
import EditModeToolbar from './EditModeToolbar'
import GridOverlay from './GridOverlay'
import DragHandle from './DragHandle'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import '../../styles/react-grid-layout-custom.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// 위젯 컴포넌트들
import WeatherAlertWidget from '../widgets/WeatherAlertWidget'
import CurrentWeather from '../widgets/CurrentWeather'
import DisasterRiskScore from '../risk/DisasterRiskScore'

// 경찰관 배치 관리 섹션
import DeploymentSection from '../DeploymentSection'

// Lazy load 위젯들
const WeatherDetailWidget = lazy(() => import('../widgets/WeatherDetailWidget'))
const WarningStatusWidget = lazy(() => import('../widgets/WarningStatusWidget'))
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

// 위젯 이름 매핑
const WIDGET_NAMES = {
  'deployment-section': '👮 경찰관 배치 관리',
  'weather-alert': '🚨 날씨 특보',
  'weather-detail': '📄 기상특보 통보문',
  'warning-status': '🗺️ 전국 특보 현황',
  'current-weather': '🌤️ 현재 날씨',
  'rainfall-flood': '💧 강수량/수위',
  'river-monitoring': '🌊 하천 수위 모니터링',
  'district-comparison': '📍 행정구역별 비교',
  'weather-river-correlation': '📊 날씨-하천 상관분석',
  'disaster-risk': '🚨 재난 위험도',
  'hourly-forecast': '⏰ 시간별 예보',
  'daily-forecast': '📅 일별 예보',
  'mid-forecast': '📊 중기 예보',
  'air-quality': '🌫️ 대기질',
  'living-weather': '🏃 생활기상지수',
  'notification-settings': '🔔 알림 설정',
  'uijeongbu-map': '🗺️ 의정부 지도',
  'police-indices': '👮 경찰 특화 지수',
  'smart-insights': '🧠 스마트 인사이트'
}

// 위젯 컴포넌트 매핑
const WIDGET_COMPONENTS = {
  // 경찰관 배치 관리 섹션
  'deployment-section': DeploymentSection,
  // 핵심 위젯들
  'weather-alert': WeatherAlertWidget,
  'weather-detail': WeatherDetailWidget,
  'warning-status': WarningStatusWidget,
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
    'weather-detail', 'warning-status', 'rainfall-flood', 'river-monitoring', 'district-comparison', 'weather-river-correlation',
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
    // 레이아웃에서 static 속성 확인
    const isStatic = false  // 모든 위젯이 이동 가능
    const widgetName = WIDGET_NAMES[widgetId] || widgetId

    return (
      <div className={`h-full relative group ${isStatic ? '' : 'cursor-move'}`}>
        {/* 드래그 핸들 */}
        <DragHandle widgetName={widgetName} isStatic={isStatic} />

        {/* 편집 가능 표시 오버레이 */}
        <div className={`
          absolute inset-0 pointer-events-none z-10 rounded-lg transition-all duration-200
          ${isStatic
            ? 'ring-2 ring-gray-300 dark:ring-gray-600 ring-opacity-50'
            : 'ring-2 ring-blue-400 dark:ring-blue-500 ring-opacity-0 group-hover:ring-opacity-60'
          }
        `} />

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
    setIsEditMode,
    updateLayouts,
    resetToDefaults,
    // Phase 2: 히스토리 관리
    undo,
    redo,
    canUndo,
    canRedo,
    historyInfo,
    applyPreset
  } = useWidgets()

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    updateLayouts(allLayouts)
  }, [updateLayouts])

  // 편집 모드 종료 핸들러
  const handleExitEdit = useCallback(() => {
    setIsEditMode(false)
  }, [setIsEditMode])

  // 레이아웃 초기화 핸들러
  const handleResetLayout = useCallback(() => {
    if (window.confirm('레이아웃을 초기화하시겠습니까?\n모든 변경사항이 사라집니다.')) {
      resetToDefaults()
    }
  }, [resetToDefaults])

  // 표시할 위젯 필터링
  const visibleWidgets = Object.keys(visibility).filter(id => visibility[id])

  return (
    <>
      {/* 편집 모드 툴바 */}
      {isEditMode && (
        <EditModeToolbar
          onExitEdit={handleExitEdit}
          onResetLayout={handleResetLayout}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          historyInfo={historyInfo}
          onApplyPreset={applyPreset}
        />
      )}

      {/* 편집 모드 그리드 오버레이 */}
      {isEditMode && <GridOverlay />}

      {/* 편집 모드일 때 상단 여백 추가 (툴바 공간 확보) */}
      <div className={`${isEditMode ? 'mt-24' : ''} transition-all duration-300`}>
        <div className={isEditMode ? 'edit-mode-active' : ''}>
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
            draggableHandle=".drag-handle"
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
        </div>
      </div>
    </>
  )
})

DashboardGrid.displayName = 'DashboardGrid'

export default DashboardGrid