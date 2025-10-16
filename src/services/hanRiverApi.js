import axios from 'axios';
import { format, subHours } from 'date-fns';
import { fetchWamisWaterLevel } from './wamisScraper.js';

// 한강홍수통제소 API 설정 (새 엔드포인트)
const SERVICE_KEY = import.meta.env.VITE_HANRIVER_API_KEY || '52832662-D130-4239-9C5F-730AD3BE6BC6';
const BASE_URL = '/api/hanriver'; // Vite 프록시를 통한 요청

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


// XML을 JSON으로 파싱 (포괄적 디버깅 포함)
const parseXML = (xmlString) => {
  // 🚨 함수 진입 확인 (최우선 로그)
  console.log('🚨🚨🚨 parseXML 함수 호출됨! 🚨🚨🚨');
  console.log('🚨 xmlString 타입:', typeof xmlString);
  console.log('🚨 xmlString이 null/undefined인가?', xmlString == null);

  try {
    console.log('==== XML 파싱 시작 (Phase 1: 포괄적 디버깅) ====');
    console.log('1️⃣ XML 길이:', xmlString?.length || 0);

    // 1단계: 원본 XML 전체 로깅 (최대 2000자로 증가)
    const xmlPreview = xmlString?.substring(0, 2000) || '';
    console.log('2️⃣ XML 원본 미리보기 (최대 2000자):\n', xmlPreview);

    if (!xmlString || xmlString.length === 0) {
      console.error('❌ XML 데이터가 비어있습니다');
      return [];
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // XML 파싱 에러 확인
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('❌ XML 파싱 실패:', parserError.textContent);
      console.error('원본 XML:', xmlString);
      throw new Error('XML 파싱 실패: 잘못된 XML 형식');
    }

    // 2단계: DOM 구조 확인 로깅
    console.log('3️⃣ XML DOM 구조 분석:');
    console.log('   - 루트 태그:', xmlDoc.documentElement?.tagName || 'undefined');
    console.log('   - 자식 노드 수:', xmlDoc.documentElement?.childNodes?.length || 0);

    // 모든 태그 이름 수집
    const allTags = new Set();
    const allElements = xmlDoc.getElementsByTagName('*');
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
      allTags.add(allElements[i].tagName);
    }
    console.log('   - 발견된 태그 목록:', Array.from(allTags).join(', '));

    // 3단계: 여러 태그 이름 패턴 시도 (Phase 1-수정: Waterlevel 추가)
    const possibleItemTags = [
      'Waterlevel',      // 한강 API 실제 태그 (콘솔에서 확인됨)
      'WATERLEVEL',      // 대문자 변형
      'waterlevel',      // 소문자 변형
      'item', 'Item', 'ITEM',  // 기존 호환성 유지
      'list', 'List',
      'data', 'Data'
    ];
    let items = null;
    let foundTagName = '';

    for (const tagName of possibleItemTags) {
      const foundItems = xmlDoc.getElementsByTagName(tagName);
      if (foundItems.length > 0) {
        items = foundItems;
        foundTagName = tagName;
        console.log(`4️⃣ ✅ "${tagName}" 태그 발견:`, foundItems.length, '개');
        break;
      }
    }

    if (!items || items.length === 0) {
      console.error('❌ 데이터 항목 태그를 찾을 수 없습니다');
      console.error('   시도한 태그:', possibleItemTags.join(', '));
      console.error('   전체 태그 목록:', Array.from(allTags).join(', '));
      return [];
    }

    const result = [];

    // 4단계: 각 필드 파싱 시도 및 결과 로깅
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`\n5️⃣ 항목 ${i} 파싱 시도:`);

      // 이 항목의 모든 자식 태그 확인
      const childTags = [];
      for (let j = 0; j < item.childNodes.length; j++) {
        if (item.childNodes[j].nodeType === 1) { // Element node
          childTags.push(item.childNodes[j].tagName);
        }
      }
      console.log('   - 자식 태그:', childTags.join(', '));

      // 여러 케이스 시도: 대문자, 소문자, 첫글자만 대문자
      const fieldPatterns = {
        fw: ['FW', 'fw', 'Fw', 'flowrate', 'FlowRate', 'FLOWRATE'],
        wl: ['WL', 'wl', 'Wl', 'waterlevel', 'WaterLevel', 'WATERLEVEL'],
        wlobscd: ['WLOBSCD', 'wlobscd', 'Wlobscd', 'stationcode', 'StationCode', 'STATIONCODE'],
        ymdhm: ['YMDHM', 'ymdhm', 'Ymdhm', 'datetime', 'DateTime', 'DATETIME', 'time', 'Time', 'TIME']
      };

      let fw = null, wl = null, wlobscd = null, ymdhm = null;

      // 🔧 NEW APPROACH: childNodes 직접 순회 (getElementsByTagName 버그 우회)
      console.log('   🔧 childNodes 직접 순회 시작...');

      for (let j = 0; j < item.childNodes.length; j++) {
        const node = item.childNodes[j];

        // Element node만 처리 (텍스트 노드 제외)
        if (node.nodeType === 1) {
          const tagName = node.tagName.toLowerCase();
          const value = node.textContent?.trim();

          // 빈 값 체크
          if (!value || value === '') {
            console.log(`   ⚠️ 태그 ${node.tagName}의 값이 비어있음`);
            continue;
          }

          // 태그명으로 필드 매핑
          if (tagName === 'fw' || tagName === 'flowrate') {
            fw = value;
            console.log(`   ✅ FW 발견 (태그: ${node.tagName}):`, fw);
          } else if (tagName === 'wl' || tagName === 'waterlevel') {
            wl = value;
            console.log(`   ✅ WL 발견 (태그: ${node.tagName}):`, wl);
          } else if (tagName === 'wlobscd' || tagName === 'stationcode') {
            wlobscd = value;
            console.log(`   ✅ WLOBSCD 발견 (태그: ${node.tagName}):`, wlobscd);
          } else if (tagName === 'ymdhm' || tagName === 'datetime' || tagName === 'time') {
            ymdhm = value;
            console.log(`   ✅ YMDHM 발견 (태그: ${node.tagName}):`, ymdhm);
          }
        }
      }

      // 최종 결과 로깅
      if (!fw) console.log('   ❌ FW 필드를 찾을 수 없음');
      if (!wl) console.log('   ❌ WL 필드를 찾을 수 없음');
      if (!wlobscd) console.log('   ⚠️ WLOBSCD 필드를 찾을 수 없음 (선택 필드)');
      if (!ymdhm) console.log('   ⚠️ YMDHM 필드를 찾을 수 없음 (선택 필드)');

      // 데이터가 있는 경우만 추가
      if (fw && wl) {
        const parsedData = {
          waterLevel: parseFloat(wl),  // WL = 수위 (Water Level, m)
          flowRate: parseFloat(fw),    // FW = 유량 (Flow, ㎥/s)
          stationCode: wlobscd || 'unknown',
          observedAt: ymdhm || 'unknown'
        };
        result.push(parsedData);
        console.log('   ✅ 파싱 성공:', parsedData);
      } else {
        console.log('   ❌ 필수 필드 누락 (FW, WL 필요)');
      }
    }

    console.log('\n6️⃣ 최종 파싱 결과:');
    console.log('   - 성공 항목 수:', result.length);
    console.log('   - 전체 항목 수:', items.length);
    console.log('=====================\n');

    return result;
  } catch (error) {
    console.error('==== XML 파싱 오류 ====');
    console.error('에러 이름:', error?.name || 'undefined');
    console.error('에러 메시지:', error?.message || 'undefined');
    console.error('에러 스택:', error?.stack || 'undefined');
    console.error('XML 원본 (최대 500자):', xmlString?.substring(0, 500) || 'undefined');
    console.error('======================');
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

// 의정부 수위 데이터 조회 (2단계 Fallback: 한강 API → WAMIS 크롤링)
export const getUijeongbuWaterLevel = async (stationCode = UIJEONGBU_STATIONS.SINGOK) => {
  // 요청 정보를 try 블록 외부에 저장 (에러 발생 시에도 접근 가능)
  let requestInfo = {
    stationCode,
    stationName: stationCode === UIJEONGBU_STATIONS.SINGOK ? '신곡교' : '금신교',
    endTime: null,
    startTime: null,
    endpoint: null,
    fullUrl: null
  };

  // ===== 1차 시도: 한강홍수통제소 공식 API (XML) =====
  try {
    console.log('🔵 getUijeongbuWaterLevel 함수 try 블록 진입!');

    // 최신 데이터 조회 (시간 범위 없이 - 최신 1개 반환)
    requestInfo.endpoint = `/${SERVICE_KEY}/waterlevel/list/10M/${stationCode}.json`;
    requestInfo.fullUrl = BASE_URL + requestInfo.endpoint;

    console.log('==== 수위 데이터 요청 (JSON API - 최신 데이터) ====');
    console.log('관측소 코드:', requestInfo.stationCode);
    console.log('관측소 이름:', requestInfo.stationName);
    console.log('서비스 키:', SERVICE_KEY ? SERVICE_KEY.substring(0, 10) + '...' : 'undefined');
    console.log('요청 URL:', requestInfo.fullUrl);
    console.log('====================================');

    console.log('🔵 JSON API 요청 시작...');
    const response = await hanRiverApi.get(requestInfo.endpoint);
    console.log('🔵 JSON API 요청 완료!');

    // JSON 응답 로깅
    console.log('==== JSON 응답 상세 ====');
    console.log('응답 상태 코드:', response?.status || 'undefined');
    console.log('응답 헤더 Content-Type:', response?.headers?.['content-type'] || 'undefined');
    console.log('응답 데이터 타입:', typeof response?.data || 'undefined');
    console.log('JSON 데이터:', JSON.stringify(response?.data, null, 2).substring(0, 500));
    console.log('========================');

    if (response?.data) {
      // JSON 데이터 파싱
      const jsonData = response.data;

      // JSON 구조 확인
      console.log('📋 JSON 구조:', Object.keys(jsonData));
      console.log('📋 content 필드:', jsonData.content?.length || 0);
      console.log('📋 list 필드:', jsonData.list?.length || 0);

      // content 또는 list 필드에서 배열 추출
      const dataList = Array.isArray(jsonData) ? jsonData :
                       jsonData.content || jsonData.list || [];

      console.log('📊 JSON 파싱 완료:', dataList.length, '개 항목');

      if (dataList.length > 0) {
        console.log('📋 첫 번째 항목 샘플:', dataList[0]);
      }

      if (dataList.length === 0) {
        throw new Error(`수위 데이터가 없습니다 (관측소: ${requestInfo.stationName})`);
      }

      // JSON을 표준 형식으로 변환 (빈 문자열 처리 포함)
      const waterLevelData = dataList.map((item, index) => {
        // 빈 문자열("")을 0으로 처리
        const wlValue = (item.wl || item.WL || '0').toString().trim();
        const fwValue = (item.fw || item.FW || '0').toString().trim();

        const waterLevel = parseFloat(wlValue) || 0;
        const flowRate = parseFloat(fwValue) || 0;

        // 첫 번째 항목만 상세 로깅
        if (index === 0) {
          console.log('🔍 원본 값:', { wl: item.wl, fw: item.fw });
          console.log('🔍 변환 후:', { waterLevel, flowRate });

          if (isNaN(waterLevel)) {
            console.warn('⚠️ 수위 값이 NaN:', item);
          }
          if (fwValue === '' || fwValue === '0') {
            console.warn('⚠️ 유량 값 없음 (빈 문자열 또는 0):', item.fw);
          }
        }

        return {
          waterLevel,
          flowRate,
          stationCode: item.wlobscd || item.WLOBSCD || 'unknown',
          observedAt: item.ymdhm || item.YMDHM || 'unknown'
        };
      });

      console.log('✅ JSON 변환 성공:', waterLevelData.length, '개');
      console.log('첫 번째 항목:', waterLevelData[0]);

      // 145개 항목 중 유효한 데이터 찾기 (wl > 0 또는 fw > 0)
      const validData = waterLevelData.find(item =>
        item.waterLevel > 0 || item.flowRate > 0
      );

      if (validData) {
        console.log('✅ 유효한 데이터 발견:', validData);
      } else {
        console.warn('⚠️ 145개 항목 모두 빈 데이터 (wl=0, fw=0)');
      }

      // 유효한 데이터가 있으면 사용, 없으면 첫 번째 항목 사용
      const latestData = validData || waterLevelData[0];
      const status = calculateWaterLevelStatus(latestData.waterLevel);

      // 경보까지 여유 계산
      const remainingToWarning = (WATER_LEVEL_THRESHOLDS.CAUTION - latestData.waterLevel).toFixed(2);

      console.log('✅ 수위 데이터 조회 성공:', {
        stationName: requestInfo.stationName,
        waterLevel: latestData.waterLevel,
        flowRate: latestData.flowRate
      });

      return {
        success: true,
        data: {
          ...latestData,
          status,
          thresholds: WATER_LEVEL_THRESHOLDS,
          remainingToWarning: parseFloat(remainingToWarning),
          stationName: requestInfo.stationName,
          location: '의정부시 (중랑천)',
          source: 'HAN_RIVER_API'  // 데이터 출처 표시
        },
        message: '수위 데이터 조회 성공 (한강 API)'
      };
    } else {
      throw new Error('응답 데이터가 없습니다 (response.data is empty)');
    }
  } catch (apiError) {
    // Phase 2: 향상된 에러 로깅 (모든 속성 포함)
    console.error('==== 한강 API 실패 (Phase 2) ====');
    console.error('에러 타입:', apiError?.code || apiError?.name || typeof apiError);
    console.error('에러 메시지:', apiError?.message || String(apiError));
    console.error('API 응답 상태:', apiError?.response?.status || 'undefined');
    console.error('API 응답 데이터:', apiError?.response?.data?.substring?.(0, 200) || apiError?.response?.data || 'undefined');
    console.error('요청 URL:', apiError?.config?.url || requestInfo.fullUrl || 'undefined');
    console.error('요청 메소드:', apiError?.config?.method?.toUpperCase?.() || 'GET');
    console.error('관측소 정보:', requestInfo.stationName, `(${requestInfo.stationCode})`);
    console.error('시간 범위:', `${requestInfo.startTime} ~ ${requestInfo.endTime}`);
    console.error('====================================');

    // ===== 2차 시도: WAMIS 크롤링 (Fallback) =====
    console.warn('⚠️ 한강 API 실패, WAMIS 크롤링으로 전환합니다...');

    try {
      const wamisResult = await fetchWamisWaterLevel(stationCode);

      if (wamisResult.success && wamisResult.data.length > 0) {
        console.log('✅ WAMIS 크롤링 성공! 데이터:', wamisResult.data[0]);

        // WAMIS 데이터를 한강 API와 동일한 형식으로 변환
        const wamisData = wamisResult.data[0];
        const status = calculateWaterLevelStatus(wamisData.waterLevel);
        const remainingToWarning = (WATER_LEVEL_THRESHOLDS.CAUTION - wamisData.waterLevel).toFixed(2);

        return {
          success: true,
          data: {
            waterLevel: wamisData.waterLevel,
            flowRate: wamisData.flowRate,
            stationCode: wamisData.stationCode,
            observedAt: wamisData.observedAt,
            status,
            thresholds: WATER_LEVEL_THRESHOLDS,
            remainingToWarning: parseFloat(remainingToWarning),
            stationName: requestInfo.stationName,
            location: '의정부시 (중랑천)',
            source: 'WAMIS'  // 데이터 출처 표시
          },
          message: `수위 데이터 조회 성공 (WAMIS 크롤링, ${requestInfo.stationName})`
        };
      } else {
        throw new Error('WAMIS 크롤링 실패 또는 데이터 없음');
      }
    } catch (wamisError) {
      console.error('❌ WAMIS 크롤링도 실패:', wamisError.message);

      // 모든 데이터 소스 실패 - 최종 에러 반환
      console.error('==== 모든 데이터 소스 실패 ====');
      console.error('1차 실패: 한강 API -', apiError.message);
      console.error('2차 실패: WAMIS 크롤링 -', wamisError.message);
      console.error('================================');

      return {
        success: false,
        data: null,
        message: `${requestInfo.stationName} 수위 데이터를 가져올 수 없습니다 (한강 API 및 WAMIS 크롤링 모두 실패)`,
        source: 'NONE'
      };
    }
  }
};

// 관측소 정보 조회
export const getStationInfo = async () => {
  try {
    // 서비스 키를 URL 경로에 포함 (한강홍수통제소 API 형식)
    const endpoint = `/${SERVICE_KEY}/waterlevel/info.xml`;
    const response = await hanRiverApi.get(endpoint, {
      responseType: 'text'
    });

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

/**
 * 수위 시계열 데이터 조회 (최근 N시간)
 * @param {string} stationCode - 관측소 코드 (1018665: 신곡교, 1018666: 금신교)
 * @param {number} hours - 조회 시간 범위 (기본: 3시간)
 * @returns {Promise<Object>} 시계열 데이터
 */
export const getWaterLevelSeries = async (stationCode = UIJEONGBU_STATIONS.SINGOK, hours = 3) => {
  const requestInfo = {
    stationCode,
    stationName: stationCode === UIJEONGBU_STATIONS.SINGOK ? '신곡교' : '금신교',
    hours
  };

  try {
    // 시작/종료 시간 계산 (현재부터 N시간 전까지)
    const endTime = new Date();
    const startTime = subHours(endTime, hours);

    const startTimeStr = formatDateTime(startTime);
    const endTimeStr = formatDateTime(endTime);

    // JSON API 엔드포인트 (시간 범위 조회)
    const endpoint = `/${SERVICE_KEY}/waterlevel/list/10M/${stationCode}.json`;
    requestInfo.endpoint = endpoint;
    requestInfo.startTime = startTimeStr;
    requestInfo.endTime = endTimeStr;

    console.log('==== 수위 시계열 데이터 요청 ====');
    console.log('관측소:', requestInfo.stationName, `(${stationCode})`);
    console.log('시간 범위:', startTimeStr, '~', endTimeStr);
    console.log('요청 URL:', BASE_URL + endpoint);
    console.log('====================================');

    const response = await hanRiverApi.get(endpoint, {
      params: {
        // 한강 API는 URL에 파라미터를 포함하지 않고 JSON 엔드포인트만 호출
      },
      timeout: 15000
    });

    console.log('응답 상태:', response?.status);
    console.log('응답 타입:', typeof response?.data);
    console.log('응답 데이터 구조:', Object.keys(response?.data || {}));

    if (response?.data) {
      const jsonData = response.data;
      const dataList = Array.isArray(jsonData) ? jsonData :
                       jsonData.content || jsonData.list || [];

      console.log('📊 시계열 데이터 파싱:', dataList.length, '개 항목');

      if (dataList.length === 0) {
        // 개발 모드에서는 Mock 데이터 반환
        if (import.meta.env.DEV) {
          console.warn('⚠️ 개발 모드: Mock 시계열 데이터 사용');
          return getMockWaterLevelSeries(stationCode, hours);
        }

        throw new Error(`시계열 데이터가 없습니다 (관측소: ${requestInfo.stationName})`);
      }

      // JSON을 시계열 형식으로 변환
      const series = dataList.map((item) => {
        const wlValue = (item.wl || item.WL || '0').toString().trim();
        const fwValue = (item.fw || item.FW || '0').toString().trim();
        const timeValue = item.ymdhm || item.YMDHM || '';

        return {
          waterLevel: parseFloat(wlValue) || 0,
          flowRate: parseFloat(fwValue) || 0,
          stationCode: item.wlobscd || item.WLOBSCD || stationCode,
          observedAt: timeValue,
          // 타임스탬프 변환 (YYYYMMDDHHMM → ISO)
          time: timeValue ? parseTimeToISO(timeValue) : new Date().toISOString(),
          timestamp: timeValue ? parseTimeToTimestamp(timeValue) : Date.now()
        };
      }).filter(item => item.waterLevel > 0 || item.flowRate > 0); // 빈 데이터 필터링

      // 시간순 정렬 (오래된 것부터)
      series.sort((a, b) => a.timestamp - b.timestamp);

      console.log('✅ 시계열 데이터 조회 성공:', series.length, '개 (유효 데이터)');
      console.log('첫 번째 항목:', series[0]);
      console.log('마지막 항목:', series[series.length - 1]);

      return {
        success: true,
        data: {
          stationCode,
          stationName: requestInfo.stationName,
          series,
          dataPoints: series.length,
          timeRange: { start: startTimeStr, end: endTimeStr }
        },
        message: `시계열 데이터 조회 성공 (${series.length}개)`
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('==== 한강 API 시계열 조회 실패 ====');
    console.error('에러 타입:', error?.code || error?.name || typeof error);
    console.error('에러 메시지:', error?.message || String(error));
    console.error('HTTP 상태:', error?.response?.status || 'undefined');
    console.error('관측소:', requestInfo.stationName, `(${stationCode})`);
    console.error('=====================================');

    // 개발 모드에서는 Mock 데이터 반환
    if (import.meta.env.DEV) {
      console.warn('⚠️ 개발 모드: Mock 시계열 데이터 사용');
      return getMockWaterLevelSeries(stationCode, hours);
    }

    return {
      success: false,
      data: null,
      message: `${requestInfo.stationName} 시계열 데이터를 가져올 수 없습니다: ${error.message}`
    };
  }
};

/**
 * YYYYMMDDHHMM 형식을 ISO 문자열로 변환
 */
function parseTimeToISO(timeStr) {
  if (!timeStr || timeStr.length !== 12) return new Date().toISOString();

  const year = timeStr.substring(0, 4);
  const month = timeStr.substring(4, 6);
  const day = timeStr.substring(6, 8);
  const hour = timeStr.substring(8, 10);
  const minute = timeStr.substring(10, 12);

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+09:00`).toISOString();
}

/**
 * YYYYMMDDHHMM 형식을 타임스탬프로 변환
 */
function parseTimeToTimestamp(timeStr) {
  if (!timeStr || timeStr.length !== 12) return Date.now();

  const year = parseInt(timeStr.substring(0, 4));
  const month = parseInt(timeStr.substring(4, 6)) - 1; // 0-based
  const day = parseInt(timeStr.substring(6, 8));
  const hour = parseInt(timeStr.substring(8, 10));
  const minute = parseInt(timeStr.substring(10, 12));

  return new Date(year, month, day, hour, minute).getTime();
}

/**
 * Mock 시계열 데이터 생성 (개발용)
 */
function getMockWaterLevelSeries(stationCode, hours = 3) {
  const series = [];
  const now = Date.now();
  const stationName = stationCode === UIJEONGBU_STATIONS.SINGOK ? '신곡교' : '금신교';

  // 10분 간격으로 데이터 생성
  const dataPoints = hours * 6; // 3시간 = 18개 포인트
  for (let i = dataPoints; i >= 0; i--) {
    const timestamp = now - i * 10 * 60 * 1000; // 10분 간격
    const time = new Date(timestamp);
    const baseLevel = 0.85;
    const variation = Math.sin(i / 6) * 0.15 + Math.random() * 0.05;

    series.push({
      waterLevel: baseLevel + variation,
      flowRate: 12.5 + Math.random() * 2,
      stationCode,
      observedAt: formatDateTime(time),
      time: time.toISOString(),
      timestamp
    });
  }

  return {
    success: true,
    data: {
      stationCode,
      stationName,
      series,
      dataPoints: series.length,
      timeRange: { start: 'mock', end: 'mock' }
    },
    message: `Mock 시계열 데이터 (${series.length}개, 개발 모드)`
  };
}

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

// Named exports
export { UIJEONGBU_STATIONS, WATER_LEVEL_THRESHOLDS };

export default {
  getUijeongbuWaterLevel,
  getWaterLevelSeries,
  getStationInfo,
  checkApiConfiguration,
  UIJEONGBU_STATIONS,
  WATER_LEVEL_THRESHOLDS
};
