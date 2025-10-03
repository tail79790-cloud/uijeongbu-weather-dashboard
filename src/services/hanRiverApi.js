import axios from 'axios';

// 한강홍수통제소 API 설정 (새 엔드포인트)
const SERVICE_KEY = import.meta.env.VITE_HANRIVER_API_KEY || '52832662-D130-4239-9C5F-730AD3BE6BC6';
const BASE_URL = import.meta.env.VITE_HANRIVER_BASE_URL || 'https://api.hrfco.go.kr';

// 의정부 관측소 코드
const UIJEONGBU_STATIONS = {
  SINGOK: '1018665',  // 신곡교 (메인)
  GEUMSHIN: '1018666' // 금신교 (보조)
};

// 수위 경보 기준 (신곡교 기준)
const WATER_LEVEL_THRESHOLDS = {
  ATTENTION: 2.5,  // 관심 수위
  CAUTION: 5.1,    // 주의 수위 (경보)
  WARNING: 6.0,    // 경계 수위 (위험)
  DANGER: 6.5      // 심각 수위 (홍수)
};

// API 인스턴스 생성
const hanRiverApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/xml',
  },
});

// 응답 인터셉터
hanRiverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('한강홍수통제소 API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 날짜/시간 포맷팅 유틸리티
const formatDateTime = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}`;
};

// XML을 JSON으로 파싱
const parseXML = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const waterlevels = xmlDoc.getElementsByTagName('Waterlevel');
    const result = [];

    for (let i = 0; i < waterlevels.length; i++) {
      const item = waterlevels[i];
      const fw = item.getElementsByTagName('fw')[0]?.textContent?.trim();
      const wl = item.getElementsByTagName('wl')[0]?.textContent?.trim();
      const wlobscd = item.getElementsByTagName('wlobscd')[0]?.textContent?.trim();
      const ymdhm = item.getElementsByTagName('ymdhm')[0]?.textContent?.trim();

      // 데이터가 있는 경우만 추가
      if (fw && wl) {
        result.push({
          waterLevel: parseFloat(fw),  // 수위 (m)
          flowRate: parseFloat(wl),    // 유량 (㎥/s)
          stationCode: wlobscd,
          observedAt: ymdhm
        });
      }
    }

    return result;
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    return [];
  }
};

// 수위 상태 계산
const calculateWaterLevelStatus = (waterLevel) => {
  if (waterLevel >= WATER_LEVEL_THRESHOLDS.DANGER) {
    return {
      level: 'danger',
      text: '심각',
      color: 'red',
      description: '홍수 위험 - 즉시 대피 필요'
    };
  } else if (waterLevel >= WATER_LEVEL_THRESHOLDS.WARNING) {
    return {
      level: 'warning',
      text: '경계',
      color: 'orange',
      description: '위험 수위 - 주의 필요'
    };
  } else if (waterLevel >= WATER_LEVEL_THRESHOLDS.CAUTION) {
    return {
      level: 'caution',
      text: '주의',
      color: 'yellow',
      description: '경보 수위 - 상황 주시'
    };
  } else if (waterLevel >= WATER_LEVEL_THRESHOLDS.ATTENTION) {
    return {
      level: 'attention',
      text: '관심',
      color: 'blue',
      description: '관심 수위 - 평상시 관리'
    };
  } else {
    return {
      level: 'normal',
      text: '정상',
      color: 'green',
      description: '정상 수위'
    };
  }
};

// 의정부 수위 데이터 조회
export const getUijeongbuWaterLevel = async (stationCode = UIJEONGBU_STATIONS.SINGOK) => {
  try {
    const now = new Date();
    const endTime = formatDateTime(now);

    // 30분 전부터 현재까지 데이터 조회
    const startDate = new Date(now.getTime() - 30 * 60 * 1000);
    const startTime = formatDateTime(startDate);

    console.log('수위 데이터 요청:', {
      stationCode,
      startTime,
      endTime
    });

    const endpoint = `/${SERVICE_KEY}/waterlevel/list/10M/${stationCode}/${startTime}/${endTime}.xml`;

    const response = await hanRiverApi.get(endpoint);

    if (response.data) {
      const waterLevelData = parseXML(response.data);

      if (waterLevelData.length === 0) {
        throw new Error('수위 데이터가 없습니다');
      }

      // 가장 최근 데이터 선택
      const latestData = waterLevelData[0];
      const status = calculateWaterLevelStatus(latestData.waterLevel);

      // 경보까지 여유 계산
      const remainingToWarning = (WATER_LEVEL_THRESHOLDS.CAUTION - latestData.waterLevel).toFixed(2);

      return {
        success: true,
        data: {
          ...latestData,
          status,
          thresholds: WATER_LEVEL_THRESHOLDS,
          remainingToWarning: parseFloat(remainingToWarning),
          stationName: stationCode === UIJEONGBU_STATIONS.SINGOK ? '신곡교' : '금신교',
          location: '의정부시 (중랑천)'
        },
        message: '수위 데이터 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('수위 데이터 조회 오류:', error);

    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        data: null,
        message: '한강홍수통제소 API 연결 실패: 네트워크를 확인하세요'
      };
    }

    return {
      success: false,
      data: null,
      message: error.message || '수위 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 관측소 정보 조회
export const getStationInfo = async () => {
  try {
    const endpoint = `/${SERVICE_KEY}/waterlevel/info.xml`;
    const response = await hanRiverApi.get(endpoint);

    if (response.data) {
      // XML 파싱하여 의정부 관측소만 필터링
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const stations = xmlDoc.getElementsByTagName('WaterlevelInfo');
      const uijeongbuStations = [];

      for (let i = 0; i < stations.length; i++) {
        const addr = stations[i].getElementsByTagName('addr')[0]?.textContent;
        const wlobscd = stations[i].getElementsByTagName('wlobscd')[0]?.textContent;

        if (addr && addr.includes('의정부')) {
          uijeongbuStations.push({
            code: wlobscd,
            name: stations[i].getElementsByTagName('obsnm')[0]?.textContent,
            address: addr,
            location: stations[i].getElementsByTagName('etcaddr')[0]?.textContent,
          });
        }
      }

      return {
        success: true,
        data: uijeongbuStations,
        message: '관측소 정보 조회 성공'
      };
    }

    return {
      success: false,
      data: [],
      message: '관측소 정보 조회 실패'
    };
  } catch (error) {
    console.error('관측소 정보 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: error.message || '관측소 정보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 환경 변수 확인 함수
export const checkApiConfiguration = () => {
  const config = {
    serviceKey: !!SERVICE_KEY && SERVICE_KEY !== 'sample_key',
    baseUrl: BASE_URL,
    stations: UIJEONGBU_STATIONS
  };

  console.log('한강홍수통제소 API 설정 상태:', config);
  return config;
};

export default {
  getUijeongbuWaterLevel,
  getStationInfo,
  checkApiConfiguration,
  UIJEONGBU_STATIONS,
  WATER_LEVEL_THRESHOLDS
};
