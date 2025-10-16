/**
 * River Data Adapter
 * hanRiverApi 응답 형식 → riverLevelCalculator 호환 형식 변환
 *
 * Purpose: RiverMonitoringWidget이 hanRiverApi를 사용하도록 마이그레이션하면서
 *          기존 riverLevelCalculator 유틸리티와 호환되도록 데이터 형식을 변환
 */

/**
 * 단일 수위 데이터 변환
 * @param {Object} hanRiverData - hanRiverApi.getUijeongbuWaterLevel() 응답
 * @returns {Object} riverApi 호환 형식 데이터
 */
export function adaptSingleLevelData(hanRiverData) {
  if (!hanRiverData || !hanRiverData.success || !hanRiverData.data) {
    return {
      success: false,
      data: null,
      message: hanRiverData?.message || '데이터가 없습니다'
    };
  }

  const { data } = hanRiverData;

  // hanRiverApi 형식 → riverApi 형식
  return {
    success: true,
    data: {
      stationId: data.stationCode,         // stationCode → stationId
      level: data.waterLevel,              // waterLevel → level
      time: data.observedAt,               // observedAt → time (YYYYMMDDHHMM 형식 유지)
      status: formatStatus(data.status),   // 구조화된 객체 → 문자열
      flowRate: data.flowRate,             // 동일
      // 추가 정보 유지
      stationName: data.stationName,
      location: data.location,
      source: data.source,
      thresholds: data.thresholds,
      remainingToWarning: data.remainingToWarning
    },
    message: hanRiverData.message
  };
}

/**
 * 시계열 데이터 변환
 * @param {Object} hanRiverSeriesData - hanRiverApi.getWaterLevelSeries() 응답
 * @returns {Object} riverApi 호환 형식 시계열 데이터
 */
export function adaptSeriesData(hanRiverSeriesData) {
  if (!hanRiverSeriesData || !hanRiverSeriesData.success || !hanRiverSeriesData.data) {
    return {
      success: false,
      data: null,
      message: hanRiverSeriesData?.message || '시계열 데이터가 없습니다'
    };
  }

  const { data } = hanRiverSeriesData;

  // 각 시계열 항목 변환
  const adaptedSeries = data.series.map(item => ({
    time: item.time,                      // ISO 문자열 (이미 변환됨)
    level: item.waterLevel,               // waterLevel → level
    timestamp: item.timestamp,            // 동일
    flowRate: item.flowRate,              // 추가 정보
    stationCode: item.stationCode         // 추가 정보
  }));

  return {
    success: true,
    data: {
      stationId: data.stationCode,        // stationCode → stationId
      series: adaptedSeries,              // 변환된 시계열
      dataPoints: data.dataPoints,        // 동일
      // 추가 정보 유지
      stationName: data.stationName,
      timeRange: data.timeRange
    },
    message: hanRiverSeriesData.message
  };
}

/**
 * status 객체를 문자열로 포맷
 * @param {Object} statusObj - hanRiverApi의 status 객체
 * @returns {string} 포맷된 상태 문자열
 */
function formatStatus(statusObj) {
  if (!statusObj) return '상태 불명';

  const iconMap = {
    'normal': '🟢',
    'attention': '🔵',
    'caution': '🟡',
    'warning': '🟠',
    'danger': '🔴'
  };

  const icon = iconMap[statusObj.level] || '⚪';
  return `${icon} ${statusObj.text}`;
}

/**
 * RIVER_STATIONS 구조 변환
 * hanRiverApi의 UIJEONGBU_STATIONS → riverApi 호환 RIVER_STATIONS
 */
export function createRiverStations(hanRiverStations, thresholds) {
  return {
    SINGOK: {
      id: hanRiverStations.SINGOK,
      name: '신곡교',
      location: '중랑천',
      thresholds: thresholds
    },
    GEUMSIN: {
      id: hanRiverStations.GEUMSHIN,
      name: '금신교',
      location: '중랑천',
      thresholds: thresholds
    }
  };
}

/**
 * 역변환: riverApi 형식 → hanRiverApi 형식 (필요 시)
 * @param {Object} riverApiData - riverApi 형식 데이터
 * @returns {Object} hanRiverApi 형식 데이터
 */
export function reverseAdaptSingleLevelData(riverApiData) {
  if (!riverApiData || !riverApiData.success || !riverApiData.data) {
    return {
      success: false,
      data: null,
      message: riverApiData?.message || '데이터가 없습니다'
    };
  }

  const { data } = riverApiData;

  return {
    success: true,
    data: {
      stationCode: data.stationId,
      waterLevel: data.level,
      observedAt: data.time,
      flowRate: data.flowRate,
      status: parseStatus(data.status),
      stationName: data.stationName,
      location: data.location,
      source: data.source,
      thresholds: data.thresholds,
      remainingToWarning: data.remainingToWarning
    },
    message: riverApiData.message
  };
}

/**
 * 문자열 status를 객체로 파싱
 */
function parseStatus(statusStr) {
  if (!statusStr || typeof statusStr !== 'string') {
    return { level: 'normal', text: '정상', color: 'green', description: '정상 수위' };
  }

  // "🟢 정상" 형식에서 텍스트 추출
  const text = statusStr.replace(/[🟢🔵🟡🟠🔴⚪]\s*/, '').trim();

  const levelMap = {
    '정상': 'normal',
    '관심': 'attention',
    '주의': 'caution',
    '경계': 'warning',
    '위험': 'danger',
    '심각': 'danger'
  };

  const level = levelMap[text] || 'normal';

  return {
    level,
    text,
    color: getColorFromLevel(level),
    description: `${text} 수위`
  };
}

/**
 * level에 따른 색상 반환
 */
function getColorFromLevel(level) {
  const colorMap = {
    'normal': 'green',
    'attention': 'blue',
    'caution': 'yellow',
    'warning': 'orange',
    'danger': 'red'
  };
  return colorMap[level] || 'gray';
}

export default {
  adaptSingleLevelData,
  adaptSeriesData,
  createRiverStations,
  reverseAdaptSingleLevelData
};
