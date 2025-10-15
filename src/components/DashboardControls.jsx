import { memo, useState, useEffect } from 'react'
import { useWidgets } from '../contexts/WidgetContext'

const WIDGET_NAMES = {
  // 경찰관 배치 관리 섹션
  'deployment-section': '👮 경찰관 배치 관리',
  // 핵심 위젯들
  'weather-alert': '🚨 날씨 특보',
  'weather-detail': '📄 기상특보 통보문',
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
  // Phase 3 위젯
  'uijeongbu-map': '🗺️ 의정부 지도',
  'police-indices': '👮 경찰 특화 지수',
  'smart-insights': '🧠 스마트 인사이트'
}

const DashboardControls = memo(() => {
  const {
    visibility,
    isEditMode,
    setIsEditMode,
    toggleWidgetVisibility,
    resetToDefaults
  } = useWidgets()

  // 토글 상태 관리 (localStorage 연동)
  const [isControlsOpen, setIsControlsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboard-controls-open')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  // localStorage에 토글 상태 저장
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-controls-open', JSON.stringify(isControlsOpen))
    } catch (error) {
      console.error('Failed to save controls state:', error)
    }
  }, [isControlsOpen])

  const handleToggle = () => {
    setIsControlsOpen(!isControlsOpen)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-4 p-4 rounded-t-lg transition-colors"
        onClick={handleToggle}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          ⚙️ 대시보드 설정
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({isControlsOpen ? '클릭하여 접기' : '클릭하여 펼치기'})
          </span>
        </h3>
        <button className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          {isControlsOpen ? '▲' : '▼'}
        </button>
      </div>

      {isControlsOpen && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              레이아웃 편집 및 위젯 관리
            </span>
        
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditMode(!isEditMode)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditMode
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isEditMode ? '✅ 편집 완료' : '✏️ 레이아웃 편집'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetToDefaults()
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
              >
                🔄 초기화
              </button>
            </div>
          </div>

          {isEditMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>편집 모드 활성화됨!</strong> 위젯을 드래그하여 위치를 변경하거나 모서리를 잡아 크기를 조절하세요.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              위젯 표시/숨김
            </h4>
        
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(WIDGET_NAMES).map(([widgetId, name]) => {
                const isVisible = visibility[widgetId]

                return (
                  <label
                    key={widgetId}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                      ${isVisible
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
                      }
                      hover:bg-gray-100 dark:hover:bg-gray-700/50
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleWidgetVisibility(widgetId)}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <span className={`text-sm ${isVisible ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                      {name}
                    </span>
                  </label>
                )
              })}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 재난 대응을 위해 날씨 특보 위젯을 켜두시는 것을 권장합니다.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                활성 위젯: {Object.values(visibility).filter(v => v).length}개
              </span>
              <span className="text-gray-500 dark:text-gray-500 text-xs">
                설정은 자동으로 저장됩니다
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

DashboardControls.displayName = 'DashboardControls'

export default DashboardControls