/**
 * 레이아웃 프리셋 정의
 *
 * 사용자가 빠르게 레이아웃을 전환할 수 있도록
 * 미리 정의된 레이아웃 템플릿을 제공합니다.
 */

export const LAYOUT_PRESETS = {
  // 기본 레이아웃 (현재 사용 중인 레이아웃)
  default: {
    id: 'default',
    name: '기본 레이아웃',
    description: '현재 사용 중인 레이아웃',
    icon: '📐',
    // layouts는 WidgetContext의 DEFAULT_LAYOUTS를 사용
    layouts: null // null이면 DEFAULT_LAYOUTS 사용
  },

  // 컴팩트 레이아웃 (밀집형)
  compact: {
    id: 'compact',
    name: '컴팩트',
    description: '위젯을 촘촘히 배치하여 한 눈에 많은 정보를 확인',
    icon: '📦',
    layouts: {
      lg: [
        // 경찰관 배치 관리 (상단 고정, 높이 축소)
        { i: 'deployment-section', x: 0, y: 0, w: 12, h: 8, minW: 12, minH: 8 },
        // 핵심 정보를 2열로 배치
        { i: 'weather-alert', x: 0, y: 8, w: 12, h: 1, minH: 1, minW: 6 },
        { i: 'weather-detail', x: 0, y: 9, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'warning-status', x: 6, y: 9, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'current-weather', x: 0, y: 13, w: 4, h: 3, minW: 4, minH: 3 },
        { i: 'rainfall-flood', x: 4, y: 13, w: 4, h: 3, minW: 4, minH: 3 },
        { i: 'disaster-risk', x: 8, y: 13, w: 4, h: 3, minW: 4, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 16, w: 12, h: 5, minW: 8, minH: 5 },
        { i: 'district-comparison', x: 0, y: 21, w: 6, h: 5, minW: 6, minH: 5 },
        { i: 'weather-river-correlation', x: 6, y: 21, w: 6, h: 5, minW: 6, minH: 5 },
        // 예보 정보는 3열로
        { i: 'hourly-forecast', x: 0, y: 26, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'daily-forecast', x: 4, y: 26, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'mid-forecast', x: 8, y: 26, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'air-quality', x: 0, y: 29, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'living-weather', x: 4, y: 29, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'uijeongbu-map', x: 8, y: 29, w: 4, h: 3, minW: 4, minH: 3 },
        { i: 'police-indices', x: 0, y: 32, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'smart-insights', x: 6, y: 32, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'notification-settings', x: 0, y: 36, w: 12, h: 2, minW: 8, minH: 2 }
      ],
      md: [
        { i: 'deployment-section', x: 0, y: 0, w: 10, h: 8, minW: 10, minH: 8 },
        { i: 'weather-alert', x: 0, y: 8, w: 10, h: 1, minH: 1, minW: 5 },
        { i: 'weather-detail', x: 0, y: 9, w: 5, h: 4, minW: 5, minH: 4 },
        { i: 'warning-status', x: 5, y: 9, w: 5, h: 4, minW: 5, minH: 4 },
        { i: 'current-weather', x: 0, y: 13, w: 5, h: 3, minW: 5, minH: 3 },
        { i: 'rainfall-flood', x: 5, y: 13, w: 5, h: 3, minW: 5, minH: 3 },
        { i: 'disaster-risk', x: 0, y: 16, w: 10, h: 3, minW: 5, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 19, w: 10, h: 5, minW: 8, minH: 5 },
        { i: 'district-comparison', x: 0, y: 24, w: 10, h: 5, minW: 8, minH: 5 },
        { i: 'weather-river-correlation', x: 0, y: 29, w: 10, h: 5, minW: 8, minH: 5 },
        { i: 'hourly-forecast', x: 0, y: 34, w: 10, h: 3, minW: 8, minH: 2 },
        { i: 'daily-forecast', x: 0, y: 37, w: 10, h: 3, minW: 8, minH: 2 },
        { i: 'mid-forecast', x: 0, y: 40, w: 10, h: 3, minW: 8, minH: 2 },
        { i: 'air-quality', x: 0, y: 43, w: 5, h: 3, minW: 4, minH: 2 },
        { i: 'living-weather', x: 5, y: 43, w: 5, h: 3, minW: 4, minH: 2 },
        { i: 'uijeongbu-map', x: 0, y: 46, w: 10, h: 4, minW: 8, minH: 4 },
        { i: 'police-indices', x: 0, y: 50, w: 10, h: 4, minW: 8, minH: 4 },
        { i: 'smart-insights', x: 0, y: 54, w: 10, h: 4, minW: 8, minH: 4 },
        { i: 'notification-settings', x: 0, y: 58, w: 10, h: 2, minW: 8, minH: 2 }
      ],
      sm: [
        { i: 'deployment-section', x: 0, y: 0, w: 6, h: 10, minW: 6, minH: 8 },
        { i: 'weather-alert', x: 0, y: 10, w: 6, h: 1, minH: 1, minW: 4 },
        { i: 'weather-detail', x: 0, y: 11, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'warning-status', x: 0, y: 15, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'current-weather', x: 0, y: 19, w: 6, h: 3, minW: 4, minH: 3 },
        { i: 'rainfall-flood', x: 0, y: 22, w: 6, h: 3, minW: 4, minH: 3 },
        { i: 'disaster-risk', x: 0, y: 25, w: 6, h: 3, minW: 4, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 28, w: 6, h: 5, minW: 6, minH: 5 },
        { i: 'district-comparison', x: 0, y: 33, w: 6, h: 5, minW: 6, minH: 5 },
        { i: 'weather-river-correlation', x: 0, y: 38, w: 6, h: 6, minW: 6, minH: 6 },
        { i: 'hourly-forecast', x: 0, y: 44, w: 6, h: 3, minW: 6, minH: 2 },
        { i: 'daily-forecast', x: 0, y: 47, w: 6, h: 3, minW: 6, minH: 2 },
        { i: 'mid-forecast', x: 0, y: 50, w: 6, h: 3, minW: 6, minH: 2 },
        { i: 'air-quality', x: 0, y: 53, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'living-weather', x: 0, y: 56, w: 6, h: 3, minW: 4, minH: 2 },
        { i: 'uijeongbu-map', x: 0, y: 59, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'police-indices', x: 0, y: 63, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'smart-insights', x: 0, y: 67, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'notification-settings', x: 0, y: 71, w: 6, h: 2, minW: 6, minH: 2 }
      ],
      xs: [
        { i: 'deployment-section', x: 0, y: 0, w: 4, h: 10, minW: 4, minH: 8 },
        { i: 'weather-alert', x: 0, y: 10, w: 4, h: 1, minH: 1, minW: 2 },
        { i: 'weather-detail', x: 0, y: 11, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'warning-status', x: 0, y: 15, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'current-weather', x: 0, y: 19, w: 4, h: 3, minW: 3, minH: 3 },
        { i: 'rainfall-flood', x: 0, y: 22, w: 4, h: 3, minW: 3, minH: 3 },
        { i: 'disaster-risk', x: 0, y: 25, w: 4, h: 3, minW: 3, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 28, w: 4, h: 5, minW: 4, minH: 5 },
        { i: 'district-comparison', x: 0, y: 33, w: 4, h: 5, minW: 4, minH: 5 },
        { i: 'weather-river-correlation', x: 0, y: 38, w: 4, h: 6, minW: 4, minH: 6 },
        { i: 'hourly-forecast', x: 0, y: 44, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'daily-forecast', x: 0, y: 47, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'mid-forecast', x: 0, y: 50, w: 4, h: 3, minW: 4, minH: 2 },
        { i: 'air-quality', x: 0, y: 53, w: 4, h: 3, minW: 3, minH: 2 },
        { i: 'living-weather', x: 0, y: 56, w: 4, h: 3, minW: 3, minH: 2 },
        { i: 'uijeongbu-map', x: 0, y: 59, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'police-indices', x: 0, y: 63, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'smart-insights', x: 0, y: 67, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'notification-settings', x: 0, y: 71, w: 4, h: 2, minW: 4, minH: 2 }
      ],
      xxs: [
        { i: 'deployment-section', x: 0, y: 0, w: 2, h: 10, minW: 2, minH: 8 },
        { i: 'weather-alert', x: 0, y: 10, w: 2, h: 2, minH: 1, minW: 2 },
        { i: 'weather-detail', x: 0, y: 12, w: 2, h: 4, minW: 2, minH: 4 },
        { i: 'warning-status', x: 0, y: 16, w: 2, h: 5, minW: 2, minH: 5 },
        { i: 'current-weather', x: 0, y: 21, w: 2, h: 3, minW: 2, minH: 3 },
        { i: 'rainfall-flood', x: 0, y: 24, w: 2, h: 3, minW: 2, minH: 3 },
        { i: 'disaster-risk', x: 0, y: 27, w: 2, h: 3, minW: 2, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 30, w: 2, h: 5, minW: 2, minH: 5 },
        { i: 'district-comparison', x: 0, y: 35, w: 2, h: 5, minW: 2, minH: 5 },
        { i: 'weather-river-correlation', x: 0, y: 40, w: 2, h: 6, minW: 2, minH: 6 },
        { i: 'hourly-forecast', x: 0, y: 46, w: 2, h: 3, minW: 2, minH: 2 },
        { i: 'daily-forecast', x: 0, y: 49, w: 2, h: 3, minW: 2, minH: 2 },
        { i: 'mid-forecast', x: 0, y: 52, w: 2, h: 3, minW: 2, minH: 2 },
        { i: 'air-quality', x: 0, y: 55, w: 2, h: 3, minW: 2, minH: 2 },
        { i: 'living-weather', x: 0, y: 58, w: 2, h: 3, minW: 2, minH: 2 },
        { i: 'uijeongbu-map', x: 0, y: 61, w: 2, h: 4, minW: 2, minH: 4 },
        { i: 'police-indices', x: 0, y: 65, w: 2, h: 4, minW: 2, minH: 4 },
        { i: 'smart-insights', x: 0, y: 69, w: 2, h: 4, minW: 2, minH: 4 },
        { i: 'notification-settings', x: 0, y: 73, w: 2, h: 2, minW: 2, minH: 2 }
      ]
    }
  },

  // 넓게 레이아웃 (여유형)
  spacious: {
    id: 'spacious',
    name: '넓게',
    description: '여유 있는 배치로 각 위젯을 크게 표시',
    icon: '🏞️',
    layouts: {
      lg: [
        // 경찰관 배치 관리 (더 넓게)
        { i: 'deployment-section', x: 0, y: 0, w: 12, h: 12, minW: 12, minH: 8 },
        // 핵심 정보를 크게 표시
        { i: 'weather-alert', x: 0, y: 12, w: 12, h: 2, minH: 1, minW: 6 },
        { i: 'weather-detail', x: 0, y: 14, w: 12, h: 6, minW: 8, minH: 4 },
        { i: 'warning-status', x: 0, y: 20, w: 12, h: 7, minW: 8, minH: 5 },
        { i: 'current-weather', x: 0, y: 27, w: 6, h: 5, minW: 4, minH: 3 },
        { i: 'rainfall-flood', x: 6, y: 27, w: 6, h: 5, minW: 4, minH: 3 },
        { i: 'disaster-risk', x: 0, y: 32, w: 6, h: 5, minW: 4, minH: 3 },
        { i: 'river-monitoring', x: 6, y: 32, w: 6, h: 5, minW: 6, minH: 5 },
        { i: 'district-comparison', x: 0, y: 37, w: 12, h: 7, minW: 8, minH: 5 },
        { i: 'weather-river-correlation', x: 0, y: 44, w: 12, h: 8, minW: 8, minH: 6 },
        { i: 'hourly-forecast', x: 0, y: 52, w: 12, h: 4, minW: 8, minH: 2 },
        { i: 'daily-forecast', x: 0, y: 56, w: 12, h: 4, minW: 8, minH: 2 },
        { i: 'mid-forecast', x: 0, y: 60, w: 12, h: 4, minW: 8, minH: 2 },
        { i: 'air-quality', x: 0, y: 64, w: 6, h: 4, minW: 4, minH: 2 },
        { i: 'living-weather', x: 6, y: 64, w: 6, h: 4, minW: 4, minH: 2 },
        { i: 'uijeongbu-map', x: 0, y: 68, w: 6, h: 6, minW: 6, minH: 5 },
        { i: 'police-indices', x: 6, y: 68, w: 6, h: 6, minW: 6, minH: 4 },
        { i: 'smart-insights', x: 0, y: 74, w: 12, h: 6, minW: 6, minH: 4 },
        { i: 'notification-settings', x: 0, y: 80, w: 12, h: 2, minW: 8, minH: 2 }
      ],
      // md, sm, xs, xxs는 compact와 동일
      md: null, // 기본 레이아웃 사용
      sm: null,
      xs: null,
      xxs: null
    }
  },

  // 타일 레이아웃 (균등형)
  tiles: {
    id: 'tiles',
    name: '타일',
    description: '모든 위젯을 균등한 크기로 타일처럼 배치',
    icon: '🎲',
    layouts: {
      lg: [
        // 모든 위젯을 4x3 크기로 균등하게
        { i: 'deployment-section', x: 0, y: 0, w: 12, h: 4, minW: 12, minH: 4 },
        { i: 'weather-alert', x: 0, y: 4, w: 12, h: 1, minH: 1, minW: 6 },
        { i: 'weather-detail', x: 0, y: 5, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'warning-status', x: 6, y: 5, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'current-weather', x: 0, y: 9, w: 4, h: 4, minW: 4, minH: 3 },
        { i: 'rainfall-flood', x: 4, y: 9, w: 4, h: 4, minW: 4, minH: 3 },
        { i: 'disaster-risk', x: 8, y: 9, w: 4, h: 4, minW: 4, minH: 3 },
        { i: 'river-monitoring', x: 0, y: 13, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'district-comparison', x: 6, y: 13, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'weather-river-correlation', x: 0, y: 17, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'hourly-forecast', x: 6, y: 17, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'daily-forecast', x: 0, y: 21, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'mid-forecast', x: 4, y: 21, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'air-quality', x: 8, y: 21, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'living-weather', x: 0, y: 25, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'uijeongbu-map', x: 4, y: 25, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'police-indices', x: 8, y: 25, w: 4, h: 4, minW: 4, minH: 4 },
        { i: 'smart-insights', x: 0, y: 29, w: 6, h: 4, minW: 6, minH: 4 },
        { i: 'notification-settings', x: 6, y: 29, w: 6, h: 4, minW: 6, minH: 4 }
      ],
      // md, sm, xs, xxs는 compact와 동일
      md: null,
      sm: null,
      xs: null,
      xxs: null
    }
  }
}

/**
 * 프리셋 ID 배열 (순서대로 표시)
 */
export const PRESET_IDS = ['default', 'compact', 'spacious', 'tiles']

/**
 * 프리셋 ID로 프리셋 가져오기
 * @param {string} presetId - 프리셋 ID
 * @returns {Object|null} - 프리셋 객체 또는 null
 */
export const getPresetById = (presetId) => {
  return LAYOUT_PRESETS[presetId] || null
}

/**
 * 모든 프리셋 배열로 가져오기
 * @returns {Array} - 프리셋 배열
 */
export const getAllPresets = () => {
  return PRESET_IDS.map(id => LAYOUT_PRESETS[id])
}
