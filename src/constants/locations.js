/**
 * 의정부시 주요 지하차도 위치 정보
 *
 * ⚠️ 주의사항:
 * - 좌표는 추정값입니다. 정확한 좌표는 의정부시청 도로관리과(031-828-2452)에 확인 필요
 * - CCTV URL은 시청에서 제공받아야 합니다
 * - x, y는 SVG 지도 상의 백분율 좌표입니다
 */

export const UNDERPASSES = [
  {
    id: 'up_1',
    name: '수락지하차도',
    road: '동부간선도로',
    address: '의정부시 용현동 일대',
    x: 65,  // SVG 지도 상 X 좌표 (%)
    y: 30,  // SVG 지도 상 Y 좌표 (%)
    lat: 37.738,  // 실제 위도 (추정)
    lon: 127.050, // 실제 경도 (추정)
    cctvUrl: null, // 시청 제공 CCTV URL (추후 업데이트)
    priority: 'high', // 침수 취약도
    description: '동부간선도로 하부, 침수 취약 지역',
    isCustom: false // 기본 위치 (사용자 추가 아님)
  },
  {
    id: 'up_2',
    name: '신곡지하차도',
    road: '시민로',
    address: '의정부시 신곡동 일대',
    x: 45,
    y: 40,
    lat: 37.730,
    lon: 127.034,
    cctvUrl: null,
    priority: 'high',
    description: '시민로 하부, 침수 취약 지역',
    isCustom: false
  },
  {
    id: 'up_3',
    name: '가능지하차도',
    road: '평화로',
    address: '의정부시 가능동 일대',
    x: 55,
    y: 50,
    lat: 37.745,
    lon: 127.038,
    cctvUrl: null,
    priority: 'high',
    description: '평화로 하부, 침수 취약 지역',
    isCustom: false
  },
  {
    id: 'up_4',
    name: '의정부역 지하차도',
    road: '경의중앙선 하부',
    address: '의정부시 의정부동 (의정부역 인근)',
    x: 50,
    y: 55,
    lat: 37.738,
    lon: 127.047,
    cctvUrl: null,
    priority: 'medium',
    description: '경의중앙선 하부, 교통 요충지',
    isCustom: false
  },
  {
    id: 'up_5',
    name: '회룡지하차도',
    road: '호국로',
    address: '의정부시 호원동 (회룡역 인근)',
    x: 40,
    y: 35,
    lat: 37.750,
    lon: 127.040,
    cctvUrl: null,
    priority: 'medium',
    description: '회룡역 인근, 교통 요충지',
    isCustom: false
  },
  {
    id: 'up_6',
    name: '녹양지하차도',
    road: '평화로',
    address: '의정부시 녹양동 (녹양역 인근)',
    x: 35,
    y: 60,
    lat: 37.720,
    lon: 127.045,
    cctvUrl: null,
    priority: 'medium',
    description: '녹양역 인근, 교통 요충지',
    isCustom: false
  },
  {
    id: 'up_7',
    name: '송산지하차도',
    road: '송산로',
    address: '의정부시 송산동 일대',
    x: 60,
    y: 70,
    lat: 37.710,
    lon: 127.030,
    cctvUrl: null,
    priority: 'low',
    description: '송산로 하부',
    isCustom: false
  },
  {
    id: 'up_8',
    name: '장암지하차도',
    road: '경의중앙선 하부',
    address: '의정부시 장암동 (장암역 인근)',
    x: 70,
    y: 45,
    lat: 37.760,
    lon: 127.048,
    cctvUrl: null,
    priority: 'low',
    description: '장암역 인근',
    isCustom: false
  },
  {
    id: 'up_9',
    name: '민락지하차도',
    road: '민락로',
    address: '의정부시 민락동 일대',
    x: 30,
    y: 50,
    lat: 37.735,
    lon: 127.025,
    cctvUrl: null,
    priority: 'low',
    description: '민락동 일대',
    isCustom: false
  },
  {
    id: 'up_10',
    name: '용현지하차도',
    road: '용현로',
    address: '의정부시 용현동 일대',
    x: 75,
    y: 65,
    lat: 37.715,
    lon: 127.055,
    cctvUrl: null,
    priority: 'low',
    description: '용현동 일대',
    isCustom: false
  }
];

/**
 * 지하차도 우선순위 그룹
 * - HIGH_PRIORITY: 침수 취약 지역, 최우선 배치
 * - MEDIUM_PRIORITY: 교통 요충지, 중요 배치
 * - LOW_PRIORITY: 일반 지역, 필요 시 배치
 */
export const UNDERPASS_GROUPS = {
  HIGH_PRIORITY: ['up_1', 'up_2', 'up_3'],
  MEDIUM_PRIORITY: ['up_4', 'up_5', 'up_6'],
  LOW_PRIORITY: ['up_7', 'up_8', 'up_9', 'up_10']
};

/**
 * 우선순위별 권장 배치 인원 (가용 인원 대비 %)
 */
export const DEPLOYMENT_RECOMMENDATIONS = {
  high_risk: {
    HIGH_PRIORITY: 0.5,    // 50%
    MEDIUM_PRIORITY: 0.3,  // 30%
    LOW_PRIORITY: 0.2      // 20%
  },
  medium_risk: {
    HIGH_PRIORITY: 0.4,    // 40%
    MEDIUM_PRIORITY: 0.4,  // 40%
    LOW_PRIORITY: 0.2      // 20%
  },
  low_risk: {
    HIGH_PRIORITY: 0.3,    // 30%
    MEDIUM_PRIORITY: 0.4,  // 40%
    LOW_PRIORITY: 0.3      // 30%
  }
};

/**
 * CCTV 외부 링크 (시청 제공 - 추후 업데이트)
 * 예시: { 'up_1': 'https://cctv.uc.go.kr/viewer?id=sulak_underpass' }
 */
export const CCTV_LINKS = {
  // 추후 의정부시청에서 제공받은 URL로 업데이트
};

/**
 * ID로 지하차도 정보 찾기
 */
export function getUnderpassById(id) {
  return UNDERPASSES.find(u => u.id === id);
}

/**
 * 이름으로 지하차도 정보 찾기
 */
export function getUnderpassByName(name) {
  return UNDERPASSES.find(u => u.name.includes(name) || name.includes(u.name));
}

/**
 * 우선순위별 지하차도 목록 가져오기
 */
export function getUnderpassesByPriority(priority) {
  return UNDERPASSES.filter(u => u.priority === priority);
}

/**
 * 지하차도 이름 목록 (엑셀 검증용)
 */
export const UNDERPASS_NAMES = UNDERPASSES.map(u => u.name);

export default {
  UNDERPASSES,
  UNDERPASS_GROUPS,
  DEPLOYMENT_RECOMMENDATIONS,
  CCTV_LINKS,
  getUnderpassById,
  getUnderpassByName,
  getUnderpassesByPriority,
  UNDERPASS_NAMES
};
