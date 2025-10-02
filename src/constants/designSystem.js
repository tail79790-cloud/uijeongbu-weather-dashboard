/**
 * 통일된 디자인 시스템 상수
 * 모든 컴포넌트에서 일관된 스타일을 사용
 */

// 위젯 테두리 색상
export const WIDGET_BORDER_COLORS = {
  DEFAULT: 'gray',
  INFO: 'blue',
  SUCCESS: 'green',
  WARNING: 'yellow',
  DANGER: 'red',
  ALERT: 'orange',
  SPECIAL: 'purple',
};

// 위험도 레벨 색상
export const RISK_LEVEL_COLORS = {
  safe: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  watch: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  caution: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
};

// 로딩 메시지
export const LOADING_MESSAGES = {
  DEFAULT: '로딩 중...',
  WEATHER: '날씨 데이터 로딩 중...',
  FORECAST: '예보 데이터 로딩 중...',
  ALERT: '기상특보 조회 중...',
  AIR_QUALITY: '대기질 정보 로딩 중...',
  RAINFALL: '강수량 데이터 로딩 중...',
};

// 에러 메시지
export const ERROR_MESSAGES = {
  DEFAULT: '오류가 발생했습니다',
  NETWORK: '네트워크 오류가 발생했습니다',
  API: '데이터를 불러올 수 없습니다',
  TIMEOUT: '요청 시간이 초과되었습니다',
  NO_DATA: '데이터가 없습니다',
};

// 공통 스타일 클래스
export const COMMON_STYLES = {
  spinner: 'w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin',
  card: 'weather-card',
  cardHeader: 'weather-card-header',
  button: {
    primary: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors',
    secondary: 'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors',
    danger: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors',
  },
};

export default {
  WIDGET_BORDER_COLORS,
  RISK_LEVEL_COLORS,
  LOADING_MESSAGES,
  ERROR_MESSAGES,
  COMMON_STYLES,
};
