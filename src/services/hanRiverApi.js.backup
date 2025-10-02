import axios from 'axios';

// 한강홍수통제소 API 기본 설정
const HAN_RIVER_BASE_URL = 'http://openapi.seoul.go.kr:8088';
const API_KEY = process.env.VITE_HAN_RIVER_API_KEY || 'sample_key'; // 환경변수에서 API 키 가져오기

// API 인스턴스 생성
const hanRiverApi = axios.create({
  baseURL: HAN_RIVER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 강수량 데이터 조회
export const getRainfallData = async (stationCode = '', startDate = '', endDate = '') => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) => {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const start = startDate || formatDate(yesterday);
    const end = endDate || formatDate(today);

    // 강수량 데이터 API 호출
    const response = await hanRiverApi.get(
      `/${API_KEY}/json/WPOSInformationTime/1/100/${start}/${end}/${stationCode}`
    );

    if (response.data?.WPOSInformationTime?.RESULT?.CODE === 'INFO-000') {
      return {
        success: true,
        data: response.data.WPOSInformationTime.row || [],
        message: '강수량 데이터 조회 성공'
      };
    } else {
      throw new Error(response.data?.WPOSInformationTime?.RESULT?.MESSAGE || '데이터 조회 실패');
    }
  } catch (error) {
    console.error('강수량 데이터 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '강수량 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 수위 데이터 조회
export const getWaterLevelData = async (stationCode = '', startDate = '', endDate = '') => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) => {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    };

    const start = startDate || formatDate(yesterday);
    const end = endDate || formatDate(today);

    // 수위 데이터 API 호출
    const response = await hanRiverApi.get(
      `/${API_KEY}/json/WLOSInformationTime/1/100/${start}/${end}/${stationCode}`
    );

    if (response.data?.WLOSInformationTime?.RESULT?.CODE === 'INFO-000') {
      return {
        success: true,
        data: response.data.WLOSInformationTime.row || [],
        message: '수위 데이터 조회 성공'
      };
    } else {
      throw new Error(response.data?.WLOSInformationTime?.RESULT?.MESSAGE || '데이터 조회 실패');
    }
  } catch (error) {
    console.error('수위 데이터 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '수위 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 댐 정보 조회
export const getDamInfo = async (damCode = '') => {
  try {
    const response = await hanRiverApi.get(
      `/${API_KEY}/json/DRTCInformationTime/1/100/${damCode}`
    );

    if (response.data?.DRTCInformationTime?.RESULT?.CODE === 'INFO-000') {
      return {
        success: true,
        data: response.data.DRTCInformationTime.row || [],
        message: '댐 정보 조회 성공'
      };
    } else {
      throw new Error(response.data?.DRTCInformationTime?.RESULT?.MESSAGE || '데이터 조회 실패');
    }
  } catch (error) {
    console.error('댐 정보 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '댐 정보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 홍수 특보 정보 조회
export const getFloodWarning = async () => {
  try {
    const response = await hanRiverApi.get(
      `/${API_KEY}/json/FcstWarningInformation/1/100`
    );

    if (response.data?.FcstWarningInformation?.RESULT?.CODE === 'INFO-000') {
      return {
        success: true,
        data: response.data.FcstWarningInformation.row || [],
        message: '홍수 특보 정보 조회 성공'
      };
    } else {
      throw new Error(response.data?.FcstWarningInformation?.RESULT?.MESSAGE || '데이터 조회 실패');
    }
  } catch (error) {
    console.error('홍수 특보 정보 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '홍수 특보 정보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 의정부 지역 특화 데이터 조회
export const getUijeongbuData = async () => {
  try {
    // 의정부 인근 지역의 강수량 및 수위 데이터를 병렬로 조회
    const [rainfallResult, waterLevelResult, floodWarningResult] = await Promise.all([
      getRainfallData('410350'), // 의정부 지역 코드 (실제 코드로 변경 필요)
      getWaterLevelData('410350'),
      getFloodWarning()
    ]);

    return {
      success: true,
      data: {
        rainfall: rainfallResult.data,
        waterLevel: waterLevelResult.data,
        floodWarning: floodWarningResult.data
      },
      message: '의정부 지역 데이터 조회 성공'
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

// 데이터 처리 유틸리티 함수들
export const processRainfallData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    stationName: item.SITE_NAME,
    rainfall1h: parseFloat(item.RF_1H) || 0,
    rainfall3h: parseFloat(item.RF_3H) || 0,
    rainfall6h: parseFloat(item.RF_6H) || 0,
    rainfall12h: parseFloat(item.RF_12H) || 0,
    rainfall24h: parseFloat(item.RF_24H) || 0,
    measureTime: item.MSR_DT,
    lat: parseFloat(item.LAT) || 0,
    lon: parseFloat(item.LON) || 0
  }));
};

export const processWaterLevelData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    stationName: item.SITE_NAME,
    waterLevel: parseFloat(item.WL) || 0,
    warningLevel1: parseFloat(item.WRN_LEV1) || 0,
    warningLevel2: parseFloat(item.WRN_LEV2) || 0,
    warningLevel3: parseFloat(item.WRN_LEV3) || 0,
    measureTime: item.MSR_DT,
    lat: parseFloat(item.LAT) || 0,
    lon: parseFloat(item.LON) || 0
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

export default {
  getRainfallData,
  getWaterLevelData,
  getDamInfo,
  getFloodWarning,
  getUijeongbuData,
  processRainfallData,
  processWaterLevelData,
  calculateRiskLevel
};