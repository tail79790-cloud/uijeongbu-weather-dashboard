import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import useLayoutHistory from '../hooks/useLayoutHistory'
import { getPresetById } from '../constants/layoutPresets'

// 위젯 기본 설정
export const DEFAULT_LAYOUTS = {
  lg: [
    // 경찰관 배치 관리 섹션
    { i: 'deployment-section', x: 0, y: 0, w: 12, h: 10, minW: 12, minH: 8 },
    // 핵심 위젯들
    { i: 'weather-alert', x: 0, y: 10, w: 12, h: 2, minH: 1, minW: 6 },
    { i: 'weather-detail', x: 0, y: 12, w: 12, h: 5, minW: 8, minH: 4 },
    { i: 'warning-status', x: 0, y: 17, w: 12, h: 6, minW: 8, minH: 5 },
    { i: 'current-weather', x: 0, y: 23, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'rainfall-flood', x: 6, y: 23, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'river-monitoring', x: 0, y: 16, w: 12, h: 6, minW: 8, minH: 5 },
    { i: 'district-comparison', x: 0, y: 22, w: 12, h: 6, minW: 8, minH: 5 },
    { i: 'weather-river-correlation', x: 0, y: 28, w: 12, h: 7, minW: 8, minH: 6 },
    { i: 'disaster-risk', x: 0, y: 35, w: 6, h: 4, minW: 4, minH: 3 },
    // Phase 3: 고급 위젯들
    { i: 'uijeongbu-map', x: 6, y: 35, w: 6, h: 5, minW: 6, minH: 5 },
    { i: 'police-indices', x: 0, y: 40, w: 6, h: 5, minW: 6, minH: 4 },
    { i: 'smart-insights', x: 6, y: 40, w: 6, h: 5, minW: 6, minH: 4 },
    // 예보 위젯들
    { i: 'hourly-forecast', x: 0, y: 45, w: 12, h: 3, minW: 8, minH: 2 },
    { i: 'daily-forecast', x: 0, y: 48, w: 12, h: 3, minW: 8, minH: 2 },
    { i: 'mid-forecast', x: 0, y: 51, w: 12, h: 3, minW: 8, minH: 2 },
    { i: 'air-quality', x: 0, y: 54, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'living-weather', x: 6, y: 54, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'notification-settings', x: 0, y: 57, w: 12, h: 2, minW: 8, minH: 2 }
  ],
  md: [
    // 경찰관 배치 관리 섹션
    { i: 'deployment-section', x: 0, y: 0, w: 10, h: 10, minW: 10, minH: 8 },
    // 핵심 위젯들
    { i: 'weather-alert', x: 0, y: 10, w: 10, h: 2, minH: 1, minW: 5 },
    { i: 'weather-detail', x: 0, y: 12, w: 10, h: 5, minW: 8, minH: 4 },
    { i: 'warning-status', x: 0, y: 17, w: 10, h: 6, minW: 8, minH: 5 },
    { i: 'current-weather', x: 0, y: 23, w: 10, h: 4, minW: 5, minH: 3 },
    { i: 'rainfall-flood', x: 0, y: 27, w: 10, h: 4, minW: 5, minH: 3 },
    { i: 'river-monitoring', x: 0, y: 20, w: 10, h: 6, minW: 8, minH: 5 },
    { i: 'district-comparison', x: 0, y: 26, w: 10, h: 6, minW: 8, minH: 5 },
    { i: 'weather-river-correlation', x: 0, y: 32, w: 10, h: 7, minW: 8, minH: 6 },
    { i: 'disaster-risk', x: 0, y: 39, w: 10, h: 4, minW: 5, minH: 3 },
    // Phase 3: 고급 위젯들
    { i: 'uijeongbu-map', x: 0, y: 43, w: 10, h: 5, minW: 8, minH: 5 },
    { i: 'police-indices', x: 0, y: 48, w: 10, h: 5, minW: 8, minH: 4 },
    { i: 'smart-insights', x: 0, y: 53, w: 10, h: 5, minW: 8, minH: 4 },
    // 기존 위젯들
    { i: 'hourly-forecast', x: 0, y: 58, w: 10, h: 3, minW: 8, minH: 2 },
    { i: 'daily-forecast', x: 0, y: 61, w: 10, h: 3, minW: 8, minH: 2 },
    { i: 'mid-forecast', x: 0, y: 64, w: 10, h: 3, minW: 8, minH: 2 },
    { i: 'air-quality', x: 0, y: 67, w: 5, h: 3, minW: 4, minH: 2 },
    { i: 'living-weather', x: 5, y: 67, w: 5, h: 3, minW: 4, minH: 2 },
    { i: 'notification-settings', x: 0, y: 70, w: 10, h: 2, minW: 8, minH: 2 }
  ],
  sm: [
    // 경찰관 배치 관리 섹션
    { i: 'deployment-section', x: 0, y: 0, w: 6, h: 12, minW: 6, minH: 10 },
    // 핵심 위젯들
    { i: 'weather-alert', x: 0, y: 12, w: 6, h: 2, minH: 1, minW: 4 },
    { i: 'weather-detail', x: 0, y: 14, w: 6, h: 5, minW: 6, minH: 4 },
    { i: 'warning-status', x: 0, y: 19, w: 6, h: 6, minW: 6, minH: 5 },
    { i: 'current-weather', x: 0, y: 25, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'rainfall-flood', x: 0, y: 29, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'river-monitoring', x: 0, y: 22, w: 6, h: 6, minW: 6, minH: 5 },
    { i: 'district-comparison', x: 0, y: 28, w: 6, h: 6, minW: 6, minH: 5 },
    { i: 'weather-river-correlation', x: 0, y: 34, w: 6, h: 7, minW: 6, minH: 6 },
    { i: 'disaster-risk', x: 0, y: 41, w: 6, h: 4, minW: 4, minH: 3 },
    // Phase 3: 고급 위젯들
    { i: 'uijeongbu-map', x: 0, y: 45, w: 6, h: 5, minW: 6, minH: 5 },
    { i: 'police-indices', x: 0, y: 50, w: 6, h: 5, minW: 6, minH: 4 },
    { i: 'smart-insights', x: 0, y: 55, w: 6, h: 5, minW: 6, minH: 4 },
    // 기존 위젯들
    { i: 'hourly-forecast', x: 0, y: 60, w: 6, h: 3, minW: 6, minH: 2 },
    { i: 'daily-forecast', x: 0, y: 63, w: 6, h: 3, minW: 6, minH: 2 },
    { i: 'mid-forecast', x: 0, y: 66, w: 6, h: 3, minW: 6, minH: 2 },
    { i: 'air-quality', x: 0, y: 69, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'living-weather', x: 0, y: 72, w: 6, h: 3, minW: 4, minH: 2 },
    { i: 'notification-settings', x: 0, y: 75, w: 6, h: 2, minW: 6, minH: 2 }
  ],
  xs: [
    // 경찰관 배치 관리 섹션
    { i: 'deployment-section', x: 0, y: 0, w: 4, h: 12, minW: 4, minH: 10 },
    // 핵심 위젯들
    { i: 'weather-alert', x: 0, y: 12, w: 4, h: 2, minH: 1, minW: 2 },
    { i: 'weather-detail', x: 0, y: 14, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'warning-status', x: 0, y: 19, w: 4, h: 6, minW: 4, minH: 5 },
    { i: 'current-weather', x: 0, y: 25, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'rainfall-flood', x: 0, y: 29, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'river-monitoring', x: 0, y: 22, w: 4, h: 6, minW: 4, minH: 5 },
    { i: 'district-comparison', x: 0, y: 28, w: 4, h: 6, minW: 4, minH: 5 },
    { i: 'weather-river-correlation', x: 0, y: 34, w: 4, h: 7, minW: 4, minH: 6 },
    { i: 'disaster-risk', x: 0, y: 41, w: 4, h: 4, minW: 3, minH: 3 },
    // Phase 3: 고급 위젯들
    { i: 'uijeongbu-map', x: 0, y: 45, w: 4, h: 5, minW: 4, minH: 5 },
    { i: 'police-indices', x: 0, y: 50, w: 4, h: 5, minW: 4, minH: 4 },
    { i: 'smart-insights', x: 0, y: 55, w: 4, h: 5, minW: 4, minH: 4 },
    // 기존 위젯들
    { i: 'hourly-forecast', x: 0, y: 60, w: 4, h: 3, minW: 4, minH: 2 },
    { i: 'daily-forecast', x: 0, y: 63, w: 4, h: 3, minW: 4, minH: 2 },
    { i: 'mid-forecast', x: 0, y: 66, w: 4, h: 3, minW: 4, minH: 2 },
    { i: 'air-quality', x: 0, y: 69, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'living-weather', x: 0, y: 72, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'notification-settings', x: 0, y: 75, w: 4, h: 2, minW: 4, minH: 2 }
  ],
  xxs: [
    // 경찰관 배치 관리 섹션
    { i: 'deployment-section', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 10 },
    // 핵심 위젯들
    { i: 'weather-alert', x: 0, y: 12, w: 2, h: 2, minH: 1, minW: 2 },
    { i: 'weather-detail', x: 0, y: 14, w: 2, h: 5, minW: 2, minH: 4 },
    { i: 'warning-status', x: 0, y: 19, w: 2, h: 6, minW: 2, minH: 5 },
    { i: 'current-weather', x: 0, y: 25, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'rainfall-flood', x: 0, y: 29, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'river-monitoring', x: 0, y: 22, w: 2, h: 6, minW: 2, minH: 5 },
    { i: 'district-comparison', x: 0, y: 28, w: 2, h: 6, minW: 2, minH: 5 },
    { i: 'weather-river-correlation', x: 0, y: 34, w: 2, h: 7, minW: 2, minH: 6 },
    { i: 'disaster-risk', x: 0, y: 41, w: 2, h: 4, minW: 2, minH: 3 },
    // Phase 3: 고급 위젯들
    { i: 'uijeongbu-map', x: 0, y: 45, w: 2, h: 5, minW: 2, minH: 5 },
    { i: 'police-indices', x: 0, y: 50, w: 2, h: 5, minW: 2, minH: 4 },
    { i: 'smart-insights', x: 0, y: 55, w: 2, h: 5, minW: 2, minH: 4 },
    // 기존 위젯들
    { i: 'hourly-forecast', x: 0, y: 60, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'daily-forecast', x: 0, y: 63, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'mid-forecast', x: 0, y: 66, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'air-quality', x: 0, y: 69, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'living-weather', x: 0, y: 72, w: 2, h: 3, minW: 2, minH: 2 },
    { i: 'notification-settings', x: 0, y: 75, w: 2, h: 2, minW: 2, minH: 2 }
  ]
}

const DEFAULT_WIDGET_VISIBILITY = {
  // 경찰관 배치 관리 섹션
  'deployment-section': true,
  // 핵심 위젯들
  'weather-alert': true,
  'weather-detail': true,
  'warning-status': true,
  'current-weather': true,
  'rainfall-flood': true,
  'river-monitoring': true,
  'district-comparison': true,
  'weather-river-correlation': true,
  'disaster-risk': true,
  'hourly-forecast': true,
  'daily-forecast': true,
  'mid-forecast': true,
  'air-quality': true,
  'living-weather': true,
  'notification-settings': true,
  // Phase 3: 고급 위젯들
  'uijeongbu-map': true,
  'police-indices': true,
  'smart-insights': true
}

const DEFAULT_REFRESH_INTERVALS = {
  // 경찰관 배치 관리 섹션
  'deployment-section': null,    // 수동 배치 관리 (자동 새로고침 불필요)
  // 핵심 위젯들
  'weather-alert': 60000,        // 1분
  'weather-detail': 60000,       // 1분 (특보 통보문)
  'warning-status': 60000,       // 1분 (전국 특보 현황)
  'current-weather': 300000,     // 5분
  'rainfall-flood': 300000,      // 5분
  'river-monitoring': 300000,    // 5분 (수위 데이터)
  'district-comparison': 300000, // 5분 (8개 동 날씨 비교)
  'weather-river-correlation': 600000, // 10분 (상관분석)
  'disaster-risk': 60000,        // 1분
  'hourly-forecast': 600000,     // 10분
  'daily-forecast': 1800000,     // 30분
  'mid-forecast': 1800000,       // 30분
  'air-quality': 600000,         // 10분
  'living-weather': 1800000,     // 30분
  'notification-settings': null, // 수동 새로고침
  // Phase 3: 고급 위젯들
  'uijeongbu-map': 60000,        // 1분
  'police-indices': 300000,      // 5분
  'smart-insights': 60000        // 1분
}

const WidgetContext = createContext()

export function WidgetProvider({ children }) {
  // localStorage에서 설정 불러오기
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key)
      if (!saved) return defaultValue

      const parsed = JSON.parse(saved)

      // 특별 처리: layouts의 경우 저장된 값과 기본값을 병합하여 누락된 breakpoint 채우기
      if (key === 'widget-layouts' && typeof parsed === 'object') {
        const mergedLayouts = { ...defaultValue }

        // 각 breakpoint를 검증하면서 병합
        Object.keys(defaultValue).forEach(breakpoint => {
          if (parsed[breakpoint] && Array.isArray(parsed[breakpoint])) {
            // 저장된 layout이 유효한지 검증 (모든 항목에 x, y, w, h가 있는지)
            const isValid = parsed[breakpoint].every(item =>
              typeof item.x === 'number' &&
              typeof item.y === 'number' &&
              typeof item.w === 'number' &&
              typeof item.h === 'number'
            )

            if (isValid) {
              mergedLayouts[breakpoint] = parsed[breakpoint]
            }
            // 유효하지 않으면 기본값 사용 (이미 defaultValue에서 복사됨)
          }
        })

        return mergedLayouts
      }

      return parsed
    } catch {
      return defaultValue
    }
  }

  // 상태 관리
  const [layouts, setLayouts] = useState(() =>
    loadFromStorage('widget-layouts', DEFAULT_LAYOUTS)
  )
  
  const [visibility, setVisibility] = useState(() => 
    loadFromStorage('widget-visibility', DEFAULT_WIDGET_VISIBILITY)
  )
  
  const [refreshIntervals, setRefreshIntervals] = useState(() => 
    loadFromStorage('widget-refresh-intervals', DEFAULT_REFRESH_INTERVALS)
  )

  const [isEditMode, setIsEditMode] = useState(false)
  const [lastUpdates, setLastUpdates] = useState({})

  // Phase 2: 레이아웃 히스토리 관리
  const {
    addToHistory,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
    historyInfo,
    clear: clearHistory
  } = useLayoutHistory(20)

  // localStorage에 저장
  useEffect(() => {
    localStorage.setItem('widget-layouts', JSON.stringify(layouts))
  }, [layouts])

  useEffect(() => {
    localStorage.setItem('widget-visibility', JSON.stringify(visibility))
  }, [visibility])

  useEffect(() => {
    localStorage.setItem('widget-refresh-intervals', JSON.stringify(refreshIntervals))
  }, [refreshIntervals])

  // 레이아웃 변경
  const updateLayouts = useCallback((newLayouts) => {
    setLayouts(newLayouts)
    // 히스토리에 추가 (편집 모드에서만)
    if (isEditMode) {
      addToHistory(newLayouts)
    }
  }, [isEditMode, addToHistory])

  // 실행 취소 (Undo)
  const undo = useCallback(() => {
    const previousLayout = historyUndo()
    if (previousLayout) {
      setLayouts(previousLayout)
      localStorage.setItem('widget-layouts', JSON.stringify(previousLayout))
    }
  }, [historyUndo])

  // 다시 실행 (Redo)
  const redo = useCallback(() => {
    const nextLayout = historyRedo()
    if (nextLayout) {
      setLayouts(nextLayout)
      localStorage.setItem('widget-layouts', JSON.stringify(nextLayout))
    }
  }, [historyRedo])

  // 프리셋 적용
  const applyPreset = useCallback((presetId) => {
    const preset = getPresetById(presetId)
    if (!preset) {
      console.error(`프리셋을 찾을 수 없습니다: ${presetId}`)
      return
    }

    // 'default' 프리셋은 DEFAULT_LAYOUTS 사용
    const newLayouts = preset.layouts || DEFAULT_LAYOUTS

    // 현재 레이아웃을 히스토리에 추가 (Undo 가능하도록)
    addToHistory(layouts)

    // 새 레이아웃 적용
    setLayouts(newLayouts)
    localStorage.setItem('widget-layouts', JSON.stringify(newLayouts))

    // 프리셋 적용 후 히스토리에 추가
    addToHistory(newLayouts)
  }, [layouts, addToHistory])

  // 위젯 표시/숨김 토글
  const toggleWidgetVisibility = useCallback((widgetId) => {
    setVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }))
  }, [])

  // 새로고침 간격 변경
  const updateRefreshInterval = useCallback((widgetId, interval) => {
    setRefreshIntervals(prev => ({
      ...prev,
      [widgetId]: interval
    }))
  }, [])

  // 마지막 업데이트 시간 기록
  const updateLastRefresh = useCallback((widgetId) => {
    setLastUpdates(prev => ({
      ...prev,
      [widgetId]: new Date().toISOString()
    }))
  }, [])

  // 설정 초기화
  const resetToDefaults = useCallback(() => {
    // 히스토리 초기화
    clearHistory()
    // localStorage 초기화
    localStorage.removeItem('widget-layouts')
    localStorage.removeItem('widget-visibility')
    localStorage.removeItem('widget-refresh-intervals')
    // localStorage 삭제 후 페이지 새로고침하여 기본값으로 재초기화
    window.location.reload()
  }, [clearHistory])

  const value = {
    // 상태
    layouts,
    visibility,
    refreshIntervals,
    isEditMode,
    lastUpdates,

    // 액션
    updateLayouts,
    toggleWidgetVisibility,
    updateRefreshInterval,
    updateLastRefresh,
    setIsEditMode,
    resetToDefaults,

    // Phase 2: 히스토리 관리
    undo,
    redo,
    canUndo,
    canRedo,
    historyInfo,
    applyPreset
  }

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  )
}

export function useWidgets() {
  const context = useContext(WidgetContext)
  if (!context) {
    throw new Error('useWidgets must be used within WidgetProvider')
  }
  return context
}