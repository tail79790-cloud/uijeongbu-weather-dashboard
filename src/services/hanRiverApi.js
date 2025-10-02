import axios from 'axios';

// 한강홍수통제소 API 설정
const API_KEY = import.meta.env.VITE_HANRIVER_API_KEY || 'sample_key';
const BASE_URL = '/api/hanriver'; // Vite 프록시를 통한 요청

// API 인스턴스 생성
const hanRiverApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 에러 처리
hanRiverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 날짜 포맷팅 유틸리티
const formatDate = (date = new Date()) => {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
};

// 한강 홍수통제소 실시간 수위 데이터 조회
export const getWaterLevelData = async (stationCode = '') => {
  try {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    // 수위 데이터 API 엔드포인트
    const endpoint = `/getRealTimeWaterLevel`;

    const params = {
      serviceKey: API_KEY,
      pageNo: 1,
      numOfRows: 100,
      startDt: yesterday,
      endDt: today,
      stationCode: stationCode || '', // 빈 문자열이면 전체 조회
    };

    console.log('수위 데이터 요청:', endpoint, params);

    const response = await hanRiverApi.get(endpoint, { params });

    // XML 응답을 파싱하여 JSON으로 변환 (실제 API는 XML 응답)
    if (response.data) {
      return {
        success: true,
        data: parseWaterLevelResponse(response.data),
        message: '수위 데이터 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('수위 데이터 조회 오류:', error);

    // 개발 환경에서는 목업 데이터 반환
    if (import.meta.env.DEV) {
      return getMockWaterLevelData();
    }

    return {
      success: false,
      data: [],
      message: error.message || '수위 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 강수량 데이터 조회
export const getRainfallData = async (stationCode = '') => {
  try {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const endpoint = `/getRealTimeRainfall`;

    const params = {
      serviceKey: API_KEY,
      pageNo: 1,
      numOfRows: 100,
      startDt: yesterday,
      endDt: today,
      stationCode: stationCode || '',
    };

    console.log('강수량 데이터 요청:', endpoint, params);

    const response = await hanRiverApi.get(endpoint, { params });

    if (response.data) {
      return {
        success: true,
        data: parseRainfallResponse(response.data),
        message: '강수량 데이터 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('강수량 데이터 조회 오류:', error);

    // 개발 환경에서는 목업 데이터 반환
    if (import.meta.env.DEV) {
      return getMockRainfallData();
    }

    return {
      success: false,
      data: [],
      message: error.message || '강수량 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 홍수 특보 정보 조회
export const getFloodWarning = async () => {
  try {
    const endpoint = `/getFloodWarning`;

    const params = {
      serviceKey: API_KEY,
      pageNo: 1,
      numOfRows: 10,
    };

    console.log('홍수 특보 요청:', endpoint, params);

    const response = await hanRiverApi.get(endpoint, { params });

    if (response.data) {
      return {
        success: true,
        data: parseFloodWarningResponse(response.data),
        message: '홍수 특보 정보 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('홍수 특보 조회 오류:', error);

    // 개발 환경에서는 목업 데이터 반환
    if (import.meta.env.DEV) {
      return getMockFloodWarningData();
    }

    return {
      success: false,
      data: [],
      message: error.message || '홍수 특보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 의정부 지역 통합 데이터 조회
export const getUijeongbuData = async () => {
  try {
    // 의정부 지역 관련 관측소 코드들 (실제 코드로 수정 필요)
    const uijeongbuStations = ['1001', '1002', '1003']; // 예시 코드

    console.log('의정부 지역 데이터 조회 시작');

    // 병렬로 데이터 조회
    const [rainfallResult, waterLevelResult, floodWarningResult] = await Promise.allSettled([
      getRainfallData(uijeongbuStations[0]),
      getWaterLevelData(uijeongbuStations[0]),
      getFloodWarning()
    ]);

    return {
      success: true,
      data: {
        rainfall: rainfallResult.status === 'fulfilled' ? rainfallResult.value.data : [],
        waterLevel: waterLevelResult.status === 'fulfilled' ? waterLevelResult.value.data : [],
        floodWarning: floodWarningResult.status === 'fulfilled' ? floodWarningResult.value.data : []
      },
      message: '의정부 지역 데이터 조회 완료'
    };
  } catch (error) {
    console.error('의정부 지역 데이터 조회 오류:', error);
    return {
      success: false,
      data: {
        rainfall: [],
        waterLevel: [],
        floodWarning: []
      },
      message: error.message || '의정부 지역 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 응답 파싱 함수들 (XML을 JSON으로 변환)
const parseWaterLevelResponse = (xmlData) => {
  // 실제로는 XML 파서 라이브러리를 사용해야 함
  // 여기서는 간단한 목업 데이터 반환
  return getMockWaterLevelData().data;
};

const parseRainfallResponse = (xmlData) => {
  // 실제로는 XML 파서 라이브러리를 사용해야 함
  return getMockRainfallData().data;
};

const parseFloodWarningResponse = (xmlData) => {
  // 실제로는 XML 파서 라이브러리를 사용해야 함
  return getMockFloodWarningData().data;
};

// 목업 데이터 함수들 (개발/테스트용)
const getMockWaterLevelData = () => ({
  success: true,
  data: [
    {
      stationName: '의정부 수위관측소',
      waterLevel: 2.45,
      warningLevel1: 3.0,
      warningLevel2: 4.0,
      warningLevel3: 5.0,
      measureTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lat: 37.738,
      lon: 127.034
    },
    {
      stationName: '중랑천 수위관측소',
      waterLevel: 1.85,
      warningLevel1: 2.5,
      warningLevel2: 3.5,
      warningLevel3: 4.5,
      measureTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lat: 37.741,
      lon: 127.037
    }
  ],
  message: '목업 수위 데이터'
});

const getMockRainfallData = () => ({
  success: true,
  data: [
    {
      stationName: '의정부 강수관측소',
      rainfall1h: 2.5,
      rainfall3h: 5.2,
      rainfall6h: 8.7,
      rainfall12h: 12.3,
      rainfall24h: 18.6,
      measureTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lat: 37.738,
      lon: 127.034
    },
    {
      stationName: '도봉산 강수관측소',
      rainfall1h: 3.1,
      rainfall3h: 6.8,
      rainfall6h: 11.2,
      rainfall12h: 15.7,
      rainfall24h: 22.4,
      measureTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lat: 37.728,
      lon: 127.012
    }
  ],
  message: '목업 강수량 데이터'
});

const getMockFloodWarningData = () => ({
  success: true,
  data: [
    {
      title: '중랑천 수위상승 주의보',
      content: '지속적인 강우로 인해 중랑천 수위가 상승하고 있습니다. 인근 지역 주민들은 주의하시기 바랍니다.',
      level: 'caution',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      area: '의정부시, 도봉구'
    }
  ],
  message: '목업 홍수 특보 데이터'
});

// 데이터 처리 유틸리티 함수들
export const processRainfallData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    stationName: item.stationName || item.SITE_NAME || '관측소명 없음',
    rainfall1h: parseFloat(item.rainfall1h || item.RF_1H) || 0,
    rainfall3h: parseFloat(item.rainfall3h || item.RF_3H) || 0,
    rainfall6h: parseFloat(item.rainfall6h || item.RF_6H) || 0,
    rainfall12h: parseFloat(item.rainfall12h || item.RF_12H) || 0,
    rainfall24h: parseFloat(item.rainfall24h || item.RF_24H) || 0,
    measureTime: item.measureTime || item.MSR_DT || new Date().toISOString(),
    lat: parseFloat(item.lat || item.LAT) || 0,
    lon: parseFloat(item.lon || item.LON) || 0
  }));
};

export const processWaterLevelData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    stationName: item.stationName || item.SITE_NAME || '관측소명 없음',
    waterLevel: parseFloat(item.waterLevel || item.WL) || 0,
    warningLevel1: parseFloat(item.warningLevel1 || item.WRN_LEV1) || 0,
    warningLevel2: parseFloat(item.warningLevel2 || item.WRN_LEV2) || 0,
    warningLevel3: parseFloat(item.warningLevel3 || item.WRN_LEV3) || 0,
    measureTime: item.measureTime || item.MSR_DT || new Date().toISOString(),
    lat: parseFloat(item.lat || item.LAT) || 0,
    lon: parseFloat(item.lon || item.LON) || 0
  }));
};

// 위험도 계산 함수
export const calculateRiskLevel = (rainfall24h, waterLevel, warningLevels) => {
  let riskScore = 0;

  // 강수량 위험도 (24시간 누적)
  if (rainfall24h >= 100) riskScore += 3;
  else if (rainfall24h >= 50) riskScore += 2;
  else if (rainfall24h >= 20) riskScore += 1;

  // 수위 위험도
  if (waterLevel >= warningLevels.level3) riskScore += 3;
  else if (waterLevel >= warningLevels.level2) riskScore += 2;
  else if (waterLevel >= warningLevels.level1) riskScore += 1;

  // 위험도 레벨 반환
  if (riskScore >= 5) return { level: 'danger', text: '위험', color: 'red' };
  if (riskScore >= 3) return { level: 'caution', text: '주의', color: 'yellow' };
  if (riskScore >= 1) return { level: 'watch', text: '관심', color: 'blue' };
  return { level: 'safe', text: '안전', color: 'green' };
};

// 환경 변수 확인 함수
export const checkApiConfiguration = () => {
  const config = {
    apiKey: !!API_KEY && API_KEY !== 'sample_key',
    baseUrl: BASE_URL,
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE
  };

  console.log('API 설정 상태:', config);
  return config;
};

export default {
  getWaterLevelData,
  getRainfallData,
  getFloodWarning,
  getUijeongbuData,
  processRainfallData,
  processWaterLevelData,
  calculateRiskLevel,
  checkApiConfiguration
};