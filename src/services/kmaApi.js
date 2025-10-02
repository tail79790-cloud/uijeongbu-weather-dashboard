import axios from 'axios';
import { UIJEONGBU_GRID } from '../utils/gridConverter';
import {
  getUltraSrtNcstBase,
  getUltraSrtFcstBase,
  getVilageFcstBase,
  formatDateToKMA,
  parseKMADateTime
} from '../utils/dateFormatter';
import {
  getWeatherIcon,
  getWeatherText,
  getWindDirection,
  getRainfallCategory,
  CATEGORY_CODE
} from '../constants/weatherConstants';

// 기상청 API 설정
const API_KEY = import.meta.env.VITE_KMA_API_KEY || 'demo_key';
const BASE_URL = '/api/kma';

// API 인스턴스 생성
const kmaApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
kmaApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('기상청 API 요청 오류:', error);
    return Promise.reject(error);
  }
);

/**
 * 초단기실황 조회 (현재 관측 데이터)
 * @param {Object} options - 옵션 {lat, lng, nx, ny}
 * @returns {Promise<Object>} 실황 데이터
 */
export const getUltraSrtNcst = async (options = {}) => {
  try {
    const { nx = UIJEONGBU_GRID.nx, ny = UIJEONGBU_GRID.ny } = options;
    const { baseDate, baseTime } = getUltraSrtNcstBase();

    console.log('초단기실황 요청:', { baseDate, baseTime, nx, ny });

    const response = await kmaApi.get('/VilageFcstInfoService_2.0/getUltraSrtNcst', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      return {
        success: true,
        data: processUltraSrtNcst(response.data.response.body.items.item),
        message: '초단기실황 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('초단기실황 조회 오류:', error);

    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockUltraSrtNcst();
    }

    return {
      success: false,
      data: null,
      message: error.message || '초단기실황 조회 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 초단기예보 조회 (6시간 예보)
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} 예보 데이터
 */
export const getUltraSrtFcst = async (options = {}) => {
  try {
    const { nx = UIJEONGBU_GRID.nx, ny = UIJEONGBU_GRID.ny } = options;
    const { baseDate, baseTime } = getUltraSrtFcstBase();

    console.log('초단기예보 요청:', { baseDate, baseTime, nx, ny });

    const response = await kmaApi.get('/VilageFcstInfoService_2.0/getUltraSrtFcst', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 60,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      return {
        success: true,
        data: processUltraSrtFcst(response.data.response.body.items.item),
        message: '초단기예보 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('초단기예보 조회 오류:', error);

    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockUltraSrtFcst();
    }

    return {
      success: false,
      data: [],
      message: error.message || '초단기예보 조회 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 단기예보 조회 (3일 예보)
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} 예보 데이터
 */
export const getVilageFcst = async (options = {}) => {
  try {
    const { nx = UIJEONGBU_GRID.nx, ny = UIJEONGBU_GRID.ny } = options;
    const { baseDate, baseTime } = getVilageFcstBase();

    console.log('단기예보 요청:', { baseDate, baseTime, nx, ny });

    const response = await kmaApi.get('/VilageFcstInfoService_2.0/getVilageFcst', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 1000,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      return {
        success: true,
        data: processVilageFcst(response.data.response.body.items.item),
        message: '단기예보 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('단기예보 조회 오류:', error);

    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockVilageFcst();
    }

    return {
      success: false,
      data: [],
      message: error.message || '단기예보 조회 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 기상특보 조회
 * @param {string} stnId - 지역 코드 (의정부: 109)
 * @returns {Promise<Object>} 특보 데이터
 */
export const getWeatherWarning = async (stnId = '109') => {
  try {
    console.log('기상특보 조회:', { stnId });

    const response = await kmaApi.get('/WthrWrnInfoService/getWthrWrnList', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        stnId
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      const items = response.data.response.body?.items?.item;
      return {
        success: true,
        data: items ? (Array.isArray(items) ? items : [items]) : [],
        message: '기상특보 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('기상특보 조회 오류:', error);

    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockWeatherWarning();
    }

    return {
      success: false,
      data: [],
      message: error.message || '기상특보 조회 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 기상특보 통보문 조회
 * @param {string} stnId - 지역 코드
 * @returns {Promise<Object>} 통보문 데이터
 */
export const getWeatherWarningMsg = async (stnId = '109') => {
  try {
    console.log('기상특보 통보문 조회:', { stnId });

    const response = await kmaApi.get('/WthrWrnInfoService/getWthrWrnMsg', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        stnId
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      const items = response.data.response.body?.items?.item;
      return {
        success: true,
        data: items ? (Array.isArray(items) ? items : [items]) : [],
        message: '기상특보 통보문 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('기상특보 통보문 조회 오류:', error);

    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockWeatherWarningMsg();
    }

    return {
      success: false,
      data: [],
      message: error.message || '기상특보 통보문 조회 중 오류가 발생했습니다.'
    };
  }
};

// 데이터 처리 함수들

/**
 * 초단기실황 데이터 처리
 */
function processUltraSrtNcst(items) {
  if (!Array.isArray(items)) return null;

  const data = {};
  items.forEach(item => {
    data[item.category] = item.obsrValue;
  });

  return {
    temperature: parseFloat(data.T1H) || 0,
    rainfall1h: parseFloat(data.RN1) || 0,
    humidity: parseFloat(data.REH) || 0,
    windDirection: getWindDirection(parseFloat(data.VEC) || 0),
    windSpeed: parseFloat(data.WSD) || 0,
    precipitation: data.PTY,
    precipitationText: getWeatherText(null, data.PTY),
    lastUpdate: new Date().toLocaleTimeString('ko-KR')
  };
}

/**
 * 초단기예보 데이터 처리
 */
function processUltraSrtFcst(items) {
  if (!Array.isArray(items)) return [];

  const grouped = {};
  items.forEach(item => {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped[key]) {
      grouped[key] = {
        date: item.fcstDate,
        time: item.fcstTime,
        datetime: parseKMADateTime(item.fcstDate, item.fcstTime)
      };
    }
    grouped[key][item.category] = item.fcstValue;
  });

  return Object.values(grouped).map(item => ({
    datetime: item.datetime,
    temperature: parseFloat(item.TMP) || 0,
    rainfall: getRainfallCategory(item.RN1 || '0'),
    sky: item.SKY,
    skyText: getWeatherText(item.SKY, item.PTY),
    skyIcon: getWeatherIcon(item.SKY, item.PTY),
    precipitation: item.PTY,
    humidity: parseFloat(item.REH) || 0,
    windSpeed: parseFloat(item.WSD) || 0,
    pop: parseFloat(item.POP) || 0
  }));
}

/**
 * 단기예보 데이터 처리
 */
function processVilageFcst(items) {
  if (!Array.isArray(items)) return [];

  const grouped = {};
  items.forEach(item => {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped[key]) {
      grouped[key] = {
        date: item.fcstDate,
        time: item.fcstTime,
        datetime: parseKMADateTime(item.fcstDate, item.fcstTime)
      };
    }
    grouped[key][item.category] = item.fcstValue;
  });

  return Object.values(grouped).map(item => ({
    datetime: item.datetime,
    temperature: parseFloat(item.TMP) || 0,
    tempMax: item.TMX ? parseFloat(item.TMX) : null,
    tempMin: item.TMN ? parseFloat(item.TMN) : null,
    rainfall: getRainfallCategory(item.PCP || '강수없음'),
    sky: item.SKY,
    skyText: getWeatherText(item.SKY, item.PTY),
    skyIcon: getWeatherIcon(item.SKY, item.PTY),
    precipitation: item.PTY,
    humidity: parseFloat(item.REH) || 0,
    windSpeed: parseFloat(item.WSD) || 0,
    pop: parseFloat(item.POP) || 0
  }));
}

// 목업 데이터 (개발용)

function getMockUltraSrtNcst() {
  return {
    success: true,
    data: {
      temperature: 15.2,
      rainfall1h: 0,
      humidity: 65,
      windDirection: '북서',
      windSpeed: 2.3,
      precipitation: '0',
      precipitationText: '없음',
      lastUpdate: new Date().toLocaleTimeString('ko-KR')
    },
    message: '목업 초단기실황 데이터'
  };
}

function getMockUltraSrtFcst() {
  const data = [];
  for (let i = 0; i < 6; i++) {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() + i);
    data.push({
      datetime,
      temperature: 15 + Math.random() * 5,
      rainfall: '강수없음',
      sky: i % 3 === 0 ? '1' : '3',
      skyText: i % 3 === 0 ? '맑음' : '구름많음',
      skyIcon: i % 3 === 0 ? '☀️' : '⛅',
      precipitation: '0',
      humidity: 60 + Math.random() * 20,
      windSpeed: 2 + Math.random() * 3,
      pop: Math.floor(Math.random() * 30)
    });
  }
  return {
    success: true,
    data,
    message: '목업 초단기예보 데이터'
  };
}

function getMockVilageFcst() {
  const data = [];
  for (let i = 0; i < 72; i++) {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() + i);
    data.push({
      datetime,
      temperature: 15 + Math.sin(i / 4) * 8,
      tempMax: i % 24 === 12 ? 20 : null,
      tempMin: i % 24 === 6 ? 10 : null,
      rainfall: i % 12 === 0 ? '1mm' : '강수없음',
      sky: Math.floor(i / 8) % 3 + 1,
      skyText: ['맑음', '구름많음', '흐림'][Math.floor(i / 8) % 3],
      skyIcon: ['☀️', '⛅', '☁️'][Math.floor(i / 8) % 3],
      precipitation: '0',
      humidity: 60 + Math.random() * 20,
      windSpeed: 2 + Math.random() * 3,
      pop: Math.floor(Math.random() * 60)
    });
  }
  return {
    success: true,
    data,
    message: '목업 단기예보 데이터'
  };
}

function getMockWeatherWarning() {
  return {
    success: true,
    data: [],
    message: '현재 발효 중인 기상특보가 없습니다'
  };
}

function getMockWeatherWarningMsg() {
  return {
    success: true,
    data: [],
    message: '현재 발효 중인 기상특보가 없습니다'
  };
}

/**
 * 중기기온예보 조회
 */
export const getMidTa = async (regId = '11B00000') => {
  try {
    const today = new Date();
    const tmFc = `${formatDateToKMA(today)}0600`;

    const response = await kmaApi.get('/MidFcstInfoService/getMidTa', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        regId,
        tmFc
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      return {
        success: true,
        data: response.data.response.body.items.item[0],
        message: '중기기온예보 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('중기기온예보 오류:', error);
    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockMidTa();
    }
    return { success: false, data: null, message: error.message };
  }
};

/**
 * 중기육상예보 조회
 */
export const getMidLandFcst = async (regId = '11B00000') => {
  try {
    const today = new Date();
    const tmFc = `${formatDateToKMA(today)}0600`;

    const response = await kmaApi.get('/MidFcstInfoService/getMidLandFcst', {
      params: {
        serviceKey: API_KEY,
        pageNo: 1,
        numOfRows: 10,
        dataType: 'JSON',
        regId,
        tmFc
      }
    });

    if (response.data?.response?.header?.resultCode === '00') {
      return {
        success: true,
        data: response.data.response.body.items.item[0],
        message: '중기육상예보 조회 성공'
      };
    } else {
      throw new Error(response.data?.response?.header?.resultMsg || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('중기육상예보 오류:', error);
    if (import.meta.env.DEV || API_KEY === 'demo_key') {
      return getMockMidLandFcst();
    }
    return { success: false, data: null, message: error.message };
  }
};

function getMockMidTa() {
  const data = {};
  for (let i = 3; i <= 10; i++) {
    data[`taMin${i}`] = 10 + Math.random() * 5;
    data[`taMax${i}`] = 20 + Math.random() * 5;
  }
  return {
    success: true,
    data,
    message: '목업 중기기온예보'
  };
}

function getMockMidLandFcst() {
  const data = {};
  for (let i = 3; i <= 10; i++) {
    data[`wf${i}Am`] = ['맑음', '구름많음', '흐림'][Math.floor(Math.random() * 3)];
    data[`wf${i}Pm`] = ['맑음', '구름많음', '흐림'][Math.floor(Math.random() * 3)];
    data[`rnSt${i}Am`] = Math.floor(Math.random() * 40);
    data[`rnSt${i}Pm`] = Math.floor(Math.random() * 40);
  }
  return {
    success: true,
    data,
    message: '목업 중기육상예보'
  };
}

// 생활기상지수 조회
export const getLivingWeatherIndex = async (options = {}) => {
  try {
    const { areaNo = '1100000000' } = options; // 서울특별시 기본값
    const today = new Date();
    const baseDate = formatDateToKMA(today);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const time = tomorrow.toISOString().slice(0, 16).replace('T', ' ');

    // 여러 생활기상지수를 병렬로 조회
    const [uvResult, pmResult, asthmaResult] = await Promise.allSettled([
      // 자외선지수
      kmaApi.get('/LivingWthrIdxServiceV4/getUVIdxV4', {
        params: {
          serviceKey: API_KEY,
          pageNo: 1,
          numOfRows: 10,
          dataType: 'JSON',
          areaNo,
          time
        }
      }).catch(() => null),
      // 대기확산지수
      kmaApi.get('/LivingWthrIdxServiceV4/getAirDiffusionIdxV4', {
        params: {
          serviceKey: API_KEY,
          pageNo: 1,
          numOfRows: 10,
          dataType: 'JSON',
          areaNo,
          time
        }
      }).catch(() => null),
      // 천식·폐질환 가능지수
      kmaApi.get('/LivingWthrIdxServiceV4/getAsthmaIdxV4', {
        params: {
          serviceKey: API_KEY,
          pageNo: 1,
          numOfRows: 10,
          dataType: 'JSON',
          areaNo,
          time
        }
      }).catch(() => null)
    ]);

    const data = {
      uv: null,
      airDiffusion: null,
      asthma: null,
      lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    // 자외선지수 파싱
    if (uvResult.status === 'fulfilled' && uvResult.value?.data?.response?.body?.items?.item) {
      const items = Array.isArray(uvResult.value.data.response.body.items.item)
        ? uvResult.value.data.response.body.items.item
        : [uvResult.value.data.response.body.items.item];
      if (items.length > 0) {
        const item = items[0];
        data.uv = {
          value: parseInt(item.today || item.h0 || 0),
          grade: item.code || 0,
          text: getUVText(parseInt(item.today || item.h0 || 0))
        };
      }
    }

    // 대기확산지수 파싱
    if (pmResult.status === 'fulfilled' && pmResult.value?.data?.response?.body?.items?.item) {
      const items = Array.isArray(pmResult.value.data.response.body.items.item)
        ? pmResult.value.data.response.body.items.item
        : [pmResult.value.data.response.body.items.item];
      if (items.length > 0) {
        const item = items[0];
        data.airDiffusion = {
          value: parseInt(item.today || item.h0 || 0),
          grade: item.code || 0,
          text: getAirDiffusionText(parseInt(item.today || item.h0 || 0))
        };
      }
    }

    // 천식·폐질환 가능지수 파싱
    if (asthmaResult.status === 'fulfilled' && asthmaResult.value?.data?.response?.body?.items?.item) {
      const items = Array.isArray(asthmaResult.value.data.response.body.items.item)
        ? asthmaResult.value.data.response.body.items.item
        : [asthmaResult.value.data.response.body.items.item];
      if (items.length > 0) {
        const item = items[0];
        data.asthma = {
          value: parseInt(item.today || item.h0 || 0),
          grade: item.code || 0,
          text: getAsthmaText(parseInt(item.today || item.h0 || 0))
        };
      }
    }

    return {
      success: true,
      data,
      message: '생활기상지수 조회 성공'
    };
  } catch (error) {
    console.error('생활기상지수 조회 오류:', error);

    // 목업 데이터 반환 (개발용)
    return {
      success: true,
      data: {
        uv: { value: 5, grade: 2, text: '보통' },
        airDiffusion: { value: 3, grade: 1, text: '좋음' },
        asthma: { value: 2, grade: 1, text: '낮음' },
        lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' ')
      },
      message: '목업 데이터 (API 키 필요)'
    };
  }
};

// 자외선지수 텍스트 변환
function getUVText(value) {
  if (value <= 2) return '낮음';
  if (value <= 5) return '보통';
  if (value <= 7) return '높음';
  if (value <= 10) return '매우 높음';
  return '위험';
}

// 대기확산지수 텍스트 변환
function getAirDiffusionText(value) {
  if (value <= 1) return '좋음';
  if (value <= 2) return '보통';
  if (value <= 3) return '나쁨';
  return '매우 나쁨';
}

// 천식·폐질환 가능지수 텍스트 변환
function getAsthmaText(value) {
  if (value <= 1) return '낮음';
  if (value <= 2) return '보통';
  if (value <= 3) return '높음';
  return '매우 높음';
}

export default {
  getUltraSrtNcst,
  getUltraSrtFcst,
  getVilageFcst,
  getWeatherWarning,
  getWeatherWarningMsg,
  getMidTa,
  getMidLandFcst,
  getLivingWeatherIndex
};
