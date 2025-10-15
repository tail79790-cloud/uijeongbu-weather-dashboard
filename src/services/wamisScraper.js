import axios from 'axios';

// WAMIS (국가수자원관리종합정보시스템) 크롤링 서비스
// 한강 API 실패 시 Fallback으로 사용

// WAMIS API 인스턴스
const wamisApi = axios.create({
  baseURL: '/api/wamis',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// 관측소명 매핑 (코드 → 이름)
const STATION_NAME_MAP = {
  '1018665': '신곡교',
  '1018666': '금신교',
};

/**
 * WAMIS에서 실시간 수위 데이터 크롤링
 * @param {string} stationCode - 관측소 코드 (1018665, 1018666)
 * @returns {Promise<Object>} { success, data, source }
 */
export const fetchWamisWaterLevel = async (stationCode = '1018665') => {
  const stationName = STATION_NAME_MAP[stationCode] || '신곡교';

  console.log('🌐 WAMIS 크롤링 시작:', stationName);

  try {
    // WAMIS 실시간 수위 목록 API 호출
    const response = await wamisApi.post('/wkw/wl_dubwlobs_list.do',
      new URLSearchParams({
        basin: '',       // 유역 (빈 값 = 전체)
        name: stationName,  // 관측소명으로 검색
        opstate: '',     // 운영상태
        organ: '',       // 관리기관
        obsknd: '',      // 관측종류
        strSort: '',     // 정렬
      })
    );

    console.log('📦 WAMIS 응답 수신:', response.status);
    console.log('📦 WAMIS 응답 헤더:', response.headers);
    console.log('📦 WAMIS 응답 데이터 타입:', typeof response.data);
    console.log('📦 WAMIS 응답 데이터 길이:', response.data?.length || 0);
    console.log('📦 WAMIS 응답 전체:', JSON.stringify(response.data, null, 2).substring(0, 1000));
    console.log('📊 응답 데이터:', response.data);

    // JSON 응답 파싱
    const data = parseWamisResponse(response.data, stationName);

    if (data.length === 0) {
      throw new Error(`WAMIS에서 ${stationName} 데이터를 찾을 수 없습니다`);
    }

    console.log(`✅ WAMIS 크롤링 성공: ${data.length}개 항목`);

    return {
      success: true,
      data: data,
      source: 'WAMIS',
      message: `WAMIS 크롤링 성공 (${stationName})`,
    };

  } catch (error) {
    console.error('❌ WAMIS 크롤링 실패:', error.message);

    return {
      success: false,
      data: [],
      source: 'WAMIS',
      message: `WAMIS 크롤링 실패: ${error.message}`,
    };
  }
};

/**
 * WAMIS JSON 응답을 표준 형식으로 변환
 * @param {Object|Array} responseData - WAMIS API 응답 데이터
 * @param {string} stationName - 관측소명
 * @returns {Array} 표준 형식 수위 데이터
 */
function parseWamisResponse(responseData, stationName) {
  console.log('🔍 WAMIS 응답 파싱 시작...');

  try {
    // 응답이 배열인지 확인
    const dataArray = Array.isArray(responseData) ? responseData :
                     responseData.list ? responseData.list :
                     responseData.data ? responseData.data : [];

    console.log(`📋 발견된 항목 수: ${dataArray.length}`);

    if (dataArray.length === 0) {
      console.warn('⚠️ 빈 응답 데이터');
      return [];
    }

    // 첫 번째 항목 구조 로깅
    console.log('🔬 첫 번째 항목 샘플:', JSON.stringify(dataArray[0], null, 2));

    // 관측소명으로 필터링 (정확한 매칭)
    const filtered = dataArray.filter(item => {
      const itemName = item.obsnm || item.name || item.obsname || '';
      return itemName.includes(stationName);
    });

    console.log(`🎯 ${stationName} 필터링 결과: ${filtered.length}개`);

    if (filtered.length === 0) {
      console.warn(`⚠️ ${stationName} 관측소 데이터를 찾을 수 없음`);
      // 전체 데이터에서 사용 가능한 관측소명 출력
      const availableNames = dataArray.map(item =>
        item.obsnm || item.name || item.obsname || 'unknown'
      ).slice(0, 5);
      console.log('📌 사용 가능한 관측소명 (처음 5개):', availableNames);
    }

    // 표준 형식으로 변환
    const result = filtered.map(item => {
      // 다양한 필드명 시도 (WAMIS 응답 구조가 불명확하므로)
      const waterLevel = parseFloat(
        item.wl || item.waterlevel || item.level || item.curwl || 0
      );

      const flowRate = parseFloat(
        item.fw || item.flowrate || item.flow || item.discharge || 0
      );

      const observedAt = item.ymdhm || item.obsdt || item.datetime ||
                        item.time || new Date().toISOString();

      return {
        waterLevel: waterLevel,  // 수위 (m)
        flowRate: flowRate,      // 유량 (㎥/s)
        stationCode: item.obscd || item.code || 'unknown',
        stationName: item.obsnm || item.name || stationName,
        observedAt: observedAt,
      };
    });

    console.log('✅ 파싱 완료:', result);

    return result;

  } catch (error) {
    console.error('❌ WAMIS 응답 파싱 오류:', error);
    console.error('원본 데이터:', responseData);
    return [];
  }
}

/**
 * WAMIS 크롤링이 작동하는지 테스트
 * @returns {Promise<boolean>} 성공 여부
 */
export const testWamisConnection = async () => {
  console.log('🧪 WAMIS 연결 테스트 시작...');

  try {
    const result = await fetchWamisWaterLevel('1018665');

    if (result.success && result.data.length > 0) {
      console.log('✅ WAMIS 연결 테스트 성공!');
      console.log('샘플 데이터:', result.data[0]);
      return true;
    } else {
      console.warn('⚠️ WAMIS 응답은 받았으나 데이터 없음');
      return false;
    }
  } catch (error) {
    console.error('❌ WAMIS 연결 테스트 실패:', error);
    return false;
  }
};

export default {
  fetchWamisWaterLevel,
  testWamisConnection,
};
