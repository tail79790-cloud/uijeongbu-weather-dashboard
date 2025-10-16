/**
 * 위젯 제약 조건 정의
 *
 * 각 위젯의 최소/최대 크기, 비율 등을 정의하여
 * 일관되고 최적화된 레이아웃을 유지합니다.
 */

export const WIDGET_CONSTRAINTS = {
  // 경찰관 배치 관리 섹션
  'deployment-section': {
    minW: 12,
    maxW: 12,
    minH: 8,
    maxH: 15,
    description: '경찰관 배치 관리',
    category: 'management',
    isStatic: false, // 이동 가능
    resizeHandles: ['s'] // 세로만 리사이즈
  },

  // 날씨 특보
  'weather-alert': {
    minW: 6,
    maxW: 12,
    minH: 1,
    maxH: 3,
    description: '긴급 기상특보',
    category: 'alert',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 기상특보 통보문
  'weather-detail': {
    minW: 8,
    maxW: 12,
    minH: 4,
    maxH: 10,
    description: '기상특보 상세 통보문',
    category: 'alert',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 전국 특보 현황
  'warning-status': {
    minW: 8,
    maxW: 12,
    minH: 5,
    maxH: 12,
    description: '전국 기상특보 현황',
    category: 'alert',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 현재 날씨
  'current-weather': {
    minW: 4,
    maxW: 8,
    minH: 3,
    maxH: 6,
    aspectRatio: 1.33, // 4:3 비율 권장
    description: '현재 날씨 정보',
    category: 'weather',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 강수량/수위
  'rainfall-flood': {
    minW: 4,
    maxW: 8,
    minH: 3,
    maxH: 6,
    aspectRatio: 1.33,
    description: '강수량 및 수위 정보',
    category: 'water',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 하천 수위 모니터링
  'river-monitoring': {
    minW: 8,
    maxW: 12,
    minH: 5,
    maxH: 10,
    description: '하천 수위 실시간 모니터링',
    category: 'water',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 행정구역별 비교
  'district-comparison': {
    minW: 8,
    maxW: 12,
    minH: 5,
    maxH: 10,
    description: '8개 동 날씨 비교',
    category: 'analysis',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 날씨-하천 상관분석
  'weather-river-correlation': {
    minW: 8,
    maxW: 12,
    minH: 6,
    maxH: 12,
    description: '날씨와 하천 수위 상관분석',
    category: 'analysis',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 재난 위험도
  'disaster-risk': {
    minW: 4,
    maxW: 8,
    minH: 3,
    maxH: 6,
    aspectRatio: 1.33,
    description: '재난 위험도 점수',
    category: 'risk',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 시간별 예보
  'hourly-forecast': {
    minW: 8,
    maxW: 12,
    minH: 2,
    maxH: 5,
    description: '24시간 시간별 예보',
    category: 'forecast',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 일별 예보
  'daily-forecast': {
    minW: 8,
    maxW: 12,
    minH: 2,
    maxH: 5,
    description: '3일 일별 예보',
    category: 'forecast',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 중기 예보
  'mid-forecast': {
    minW: 8,
    maxW: 12,
    minH: 2,
    maxH: 5,
    description: '중기 예보 (10일)',
    category: 'forecast',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 대기질
  'air-quality': {
    minW: 4,
    maxW: 8,
    minH: 2,
    maxH: 5,
    description: '대기질 및 미세먼지',
    category: 'environment',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 생활기상지수
  'living-weather': {
    minW: 4,
    maxW: 8,
    minH: 2,
    maxH: 5,
    description: '생활기상지수',
    category: 'environment',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 알림 설정
  'notification-settings': {
    minW: 8,
    maxW: 12,
    minH: 2,
    maxH: 4,
    description: '알림 설정',
    category: 'settings',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // Phase 3: 고급 위젯들

  // 의정부 지도
  'uijeongbu-map': {
    minW: 6,
    maxW: 12,
    minH: 5,
    maxH: 10,
    aspectRatio: 1.2, // 지도 비율
    description: '의정부 지역 지도',
    category: 'map',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 경찰 특화 지수
  'police-indices': {
    minW: 6,
    maxW: 12,
    minH: 4,
    maxH: 8,
    description: '경찰 특화 지수',
    category: 'police',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  },

  // 스마트 인사이트
  'smart-insights': {
    minW: 6,
    maxW: 12,
    minH: 4,
    maxH: 8,
    description: 'AI 기반 스마트 인사이트',
    category: 'intelligence',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  }
}

/**
 * 카테고리별 위젯 그룹
 */
export const WIDGET_CATEGORIES = {
  management: {
    name: '관리',
    description: '경찰관 배치 및 관리',
    color: 'blue',
    widgets: ['deployment-section']
  },
  alert: {
    name: '특보',
    description: '기상특보 및 경보',
    color: 'red',
    widgets: ['weather-alert', 'weather-detail', 'warning-status']
  },
  weather: {
    name: '날씨',
    description: '현재 날씨 정보',
    color: 'sky',
    widgets: ['current-weather']
  },
  water: {
    name: '수위',
    description: '강수량 및 하천 수위',
    color: 'cyan',
    widgets: ['rainfall-flood', 'river-monitoring']
  },
  analysis: {
    name: '분석',
    description: '비교 및 상관분석',
    color: 'purple',
    widgets: ['district-comparison', 'weather-river-correlation']
  },
  risk: {
    name: '위험도',
    description: '재난 위험도 평가',
    color: 'orange',
    widgets: ['disaster-risk']
  },
  forecast: {
    name: '예보',
    description: '시간별/일별 예보',
    color: 'indigo',
    widgets: ['hourly-forecast', 'daily-forecast', 'mid-forecast']
  },
  environment: {
    name: '환경',
    description: '대기질 및 생활지수',
    color: 'green',
    widgets: ['air-quality', 'living-weather']
  },
  settings: {
    name: '설정',
    description: '알림 및 설정',
    color: 'gray',
    widgets: ['notification-settings']
  },
  map: {
    name: '지도',
    description: '지역 지도 정보',
    color: 'teal',
    widgets: ['uijeongbu-map']
  },
  police: {
    name: '경찰',
    description: '경찰 특화 기능',
    color: 'blue',
    widgets: ['police-indices']
  },
  intelligence: {
    name: '인텔리전스',
    description: 'AI 분석 및 인사이트',
    color: 'violet',
    widgets: ['smart-insights']
  }
}

/**
 * 위젯 제약 조건 가져오기
 * @param {string} widgetId - 위젯 ID
 * @returns {Object} - 제약 조건 객체
 */
export const getWidgetConstraints = (widgetId) => {
  return WIDGET_CONSTRAINTS[widgetId] || {
    minW: 4,
    maxW: 12,
    minH: 2,
    maxH: 10,
    description: '위젯',
    category: 'default',
    isStatic: false,
    resizeHandles: ['s', 'e', 'se']
  }
}

/**
 * 위젯이 제약 조건을 만족하는지 검증
 * @param {string} widgetId - 위젯 ID
 * @param {number} w - 너비
 * @param {number} h - 높이
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateWidgetSize = (widgetId, w, h) => {
  const constraints = getWidgetConstraints(widgetId)
  const errors = []

  if (w < constraints.minW) {
    errors.push(`최소 너비: ${constraints.minW}`)
  }
  if (w > constraints.maxW) {
    errors.push(`최대 너비: ${constraints.maxW}`)
  }
  if (h < constraints.minH) {
    errors.push(`최소 높이: ${constraints.minH}`)
  }
  if (h > constraints.maxH) {
    errors.push(`최대 높이: ${constraints.maxH}`)
  }

  // 비율 검사 (선택적)
  if (constraints.aspectRatio) {
    const currentRatio = w / h
    const targetRatio = constraints.aspectRatio
    const tolerance = 0.3 // 30% 허용 오차

    if (Math.abs(currentRatio - targetRatio) > tolerance) {
      errors.push(`권장 비율: ${targetRatio.toFixed(2)}:1`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 카테고리별 위젯 목록 가져오기
 * @param {string} category - 카테고리 ID
 * @returns {string[]} - 위젯 ID 배열
 */
export const getWidgetsByCategory = (category) => {
  return WIDGET_CATEGORIES[category]?.widgets || []
}

/**
 * 모든 카테고리 목록 가져오기
 * @returns {Object[]} - 카테고리 배열
 */
export const getAllCategories = () => {
  return Object.entries(WIDGET_CATEGORIES).map(([id, category]) => ({
    id,
    ...category
  }))
}
