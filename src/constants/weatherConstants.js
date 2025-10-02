/**
 * 기상 관련 상수 정의
 */

// 하늘 상태 코드
export const SKY_CODE = {
  1: { text: '맑음', icon: '☀️' },
  3: { text: '구름많음', icon: '⛅' },
  4: { text: '흐림', icon: '☁️' }
};

// 강수 형태 코드
export const PTY_CODE = {
  0: { text: '없음', icon: '' },
  1: { text: '비', icon: '🌧️' },
  2: { text: '비/눈', icon: '🌨️' },
  3: { text: '눈', icon: '❄️' },
  4: { text: '소나기', icon: '🌦️' },
  5: { text: '빗방울', icon: '💧' },
  6: { text: '빗방울눈날림', icon: '🌨️' },
  7: { text: '눈날림', icon: '❄️' }
};

// 기상 카테고리 코드
export const CATEGORY_CODE = {
  // 초단기실황
  T1H: { name: '기온', unit: '°C' },
  RN1: { name: '1시간 강수량', unit: 'mm' },
  UUU: { name: '동서바람성분', unit: 'm/s' },
  VVV: { name: '남북바람성분', unit: 'm/s' },
  REH: { name: '습도', unit: '%' },
  PTY: { name: '강수형태', unit: '코드' },
  VEC: { name: '풍향', unit: 'deg' },
  WSD: { name: '풍속', unit: 'm/s' },

  // 초단기예보/단기예보
  POP: { name: '강수확률', unit: '%' },
  PCP: { name: '1시간 강수량', unit: 'mm' },
  SKY: { name: '하늘상태', unit: '코드' },
  TMP: { name: '1시간 기온', unit: '°C' },
  TMN: { name: '일 최저기온', unit: '°C' },
  TMX: { name: '일 최고기온', unit: '°C' },
  SNO: { name: '1시간 신적설', unit: 'cm' },
  WAV: { name: '파고', unit: 'm' }
};

// 풍향 변환
export const WIND_DIRECTION = {
  0: '북',
  22.5: '북북동',
  45: '북동',
  67.5: '동북동',
  90: '동',
  112.5: '동남동',
  135: '남동',
  157.5: '남남동',
  180: '남',
  202.5: '남남서',
  225: '남서',
  247.5: '서남서',
  270: '서',
  292.5: '서북서',
  315: '북서',
  337.5: '북북서',
  360: '북'
};

/**
 * 풍향 각도를 방위로 변환
 * @param {number} deg - 풍향 각도
 * @returns {string} 방위 문자열
 */
export function getWindDirection(deg) {
  const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// 기상특보 종류
export const WARNING_TYPE = {
  W00: '태풍주의보',
  W01: '태풍경보',
  W02: '호우주의보',
  W03: '호우경보',
  W04: '강풍주의보',
  W05: '강풍경보',
  W06: '풍랑주의보',
  W07: '풍랑경보',
  W08: '대설주의보',
  W09: '대설경보',
  W10: '한파주의보',
  W11: '한파경보',
  W12: '폭염주의보',
  W13: '폭염경보',
  W14: '건조주의보',
  W15: '건조경보',
  W16: '황사주의보',
  W17: '황사경보',
  W18: '폭풍해일주의보',
  W19: '폭풍해일경보'
};

// 특보 레벨 색상
export const WARNING_LEVEL_COLOR = {
  주의보: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    ring: 'ring-yellow-500'
  },
  경보: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    ring: 'ring-red-500'
  }
};

// 중기예보 구역 코드
export const MID_FORECAST_REGION = {
  서울: '11B00000',
  인천: '11B00000',
  경기도: '11B00000',
  강원도영서: '11D10000',
  강원도영동: '11D20000',
  대전: '11C20000',
  세종: '11C20000',
  충청남도: '11C20000',
  충청북도: '11C10000',
  광주: '11F20000',
  전라남도: '11F20000',
  전라북도: '11F10000',
  대구: '11H10000',
  경상북도: '11H10000',
  부산: '11H20000',
  울산: '11H20000',
  경상남도: '11H20000',
  제주: '11G00000'
};

// 중기 육상예보 구역 코드
export const MID_LAND_REGION = {
  서울경기: '11B00000',
  강원영서: '11D10000',
  강원영동: '11D20000',
  대전충남: '11C20000',
  충북: '11C10000',
  광주전남: '11F20000',
  전북: '11F10000',
  대구경북: '11H10000',
  부산울산경남: '11H20000',
  제주: '11G00000'
};

// 날씨 아이콘 매핑
export function getWeatherIcon(sky, pty) {
  if (pty && pty !== '0' && pty !== 0) {
    const ptyCode = PTY_CODE[pty];
    return ptyCode ? ptyCode.icon : '🌤️';
  }

  const skyCode = SKY_CODE[sky];
  return skyCode ? skyCode.icon : '🌤️';
}

// 날씨 텍스트 매핑
export function getWeatherText(sky, pty) {
  if (pty && pty !== '0' && pty !== 0) {
    const ptyCode = PTY_CODE[pty];
    return ptyCode ? ptyCode.text : '알 수 없음';
  }

  const skyCode = SKY_CODE[sky];
  return skyCode ? skyCode.text : '알 수 없음';
}

// 강수량 범주
export function getRainfallCategory(rainfall) {
  const value = parseFloat(rainfall);
  if (isNaN(value) || value < 0.1) return '강수없음';
  if (value < 1.0) return '1mm 미만';
  if (value < 30) return `${Math.round(value)}mm`;
  if (value < 50) return '30~50mm';
  return '50mm 이상';
}

// 적설량 범주
export function getSnowfallCategory(snowfall) {
  const value = parseFloat(snowfall);
  if (isNaN(value) || value < 0.1) return '적설없음';
  if (value < 1.0) return '1cm 미만';
  if (value < 5) return `${Math.round(value)}cm`;
  return '5cm 이상';
}

export default {
  SKY_CODE,
  PTY_CODE,
  CATEGORY_CODE,
  WIND_DIRECTION,
  WARNING_TYPE,
  WARNING_LEVEL_COLOR,
  MID_FORECAST_REGION,
  MID_LAND_REGION,
  getWindDirection,
  getWeatherIcon,
  getWeatherText,
  getRainfallCategory,
  getSnowfallCategory
};
