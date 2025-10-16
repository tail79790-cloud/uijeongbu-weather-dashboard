/**
 * River Level API Service
 * 한강홍수통제소(HRFCO) API 연동 서비스
 * Cloudflare Worker 엔드포인트 호출
 */

const WORKER_BASE_URL = import.meta.env.VITE_WORKER_API_URL || 'https://weather-bot.seunghyeonkim.workers.dev';

/**
 * 관측소 정보
 */
export const RIVER_STATIONS = {
  SINGOK: {
    id: '1018665',
    name: '신곡교',
    location: '중랑천',
    thresholds: {
      normal: 2.5,   // 관심 수위 (한강홍수통제소 공식)
      caution: 5.1,  // 주의 수위 (한강홍수통제소 공식)
      warning: 6.0,  // 경계 수위 (한강홍수통제소 공식)
      danger: 6.5    // 심각 수위 (한강홍수통제소 공식)
    }
  },
  GEUMSIN: {
    id: '1018666',
    name: '금신교',
    location: '중랑천',
    thresholds: {
      normal: 2.5,   // 관심 수위 (한강홍수통제소 공식)
      caution: 5.1,  // 주의 수위 (한강홍수통제소 공식)
      warning: 6.0,  // 경계 수위 (한강홍수통제소 공식)
      danger: 6.5    // 심각 수위 (한강홍수통제소 공식)
    }
  }
};

/**
 * 현재 하천 수위 조회
 * @param {string} stationId - 관측소 ID (1018665, 1018666)
 * @returns {Promise<Object>} 수위 데이터
 */
export async function fetchRiverLevel(stationId = '1018665') {
  try {
    const url = `${WORKER_BASE_URL}/api/river/level?stationId=${stationId}`;
    console.log(`[riverApi] Fetching river level from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'API 응답 오류');
    }

    console.log(`[riverApi] River level data:`, result.data);

    return {
      success: true,
      data: {
        stationId: result.data.stationId || stationId,
        level: parseFloat(result.data.level),
        time: result.data.time,
        status: result.data.status,
        flowRate: result.data.flowRate || null
      },
      message: '수위 데이터 조회 성공'
    };
  } catch (error) {
    console.error(`[riverApi] Error fetching river level:`, error);

    // Development 모드에서는 목 데이터 반환
    if (import.meta.env.DEV) {
      console.warn('[riverApi] Using mock data in development mode');
      return {
        success: true,
        data: {
          stationId,
          level: 0.85 + Math.random() * 0.3, // 0.85-1.15m
          time: new Date().toISOString(),
          status: '🟢 정상',
          flowRate: 12.5
        },
        message: '목 데이터 (개발 모드)'
      };
    }

    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 하천 수위 시계열 데이터 조회
 * @param {string} stationId - 관측소 ID
 * @returns {Promise<Object>} 시계열 데이터 (최근 3시간)
 */
export async function fetchRiverSeries(stationId = '1018665') {
  try {
    const url = `${WORKER_BASE_URL}/api/river/series?stationId=${stationId}`;
    console.log(`[riverApi] Fetching river series from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'API 응답 오류');
    }

    console.log(`[riverApi] River series data:`, result.data);

    // 데이터 정렬 및 포맷팅
    const series = (result.data.series || []).map(item => ({
      time: item.time || item.measureTime,
      level: parseFloat(item.level || item.waterLevel),
      timestamp: new Date(item.time || item.measureTime).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp);

    return {
      success: true,
      data: {
        stationId: result.data.stationId || stationId,
        series,
        dataPoints: series.length
      },
      message: '시계열 데이터 조회 성공'
    };
  } catch (error) {
    console.error(`[riverApi] Error fetching river series:`, error);

    // Development 모드에서는 목 데이터 반환
    if (import.meta.env.DEV) {
      console.warn('[riverApi] Using mock series data in development mode');

      // 최근 3시간 목 데이터 생성
      const now = Date.now();
      const series = [];
      for (let i = 18; i >= 0; i--) {
        const time = new Date(now - i * 10 * 60 * 1000); // 10분 간격
        series.push({
          time: time.toISOString(),
          level: 0.85 + Math.random() * 0.3 + (i < 6 ? 0.1 : 0), // 최근 1시간 약간 상승
          timestamp: time.getTime()
        });
      }

      return {
        success: true,
        data: {
          stationId,
          series,
          dataPoints: series.length
        },
        message: '목 시계열 데이터 (개발 모드)'
      };
    }

    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 모든 관측소 수위 한 번에 조회
 * @returns {Promise<Object>} 모든 관측소 데이터
 */
export async function fetchAllStations() {
  try {
    const stationIds = Object.values(RIVER_STATIONS).map(s => s.id);

    const results = await Promise.all(
      stationIds.map(id => fetchRiverLevel(id))
    );

    const stationsData = {};
    results.forEach((result, index) => {
      const stationId = stationIds[index];
      const stationKey = Object.keys(RIVER_STATIONS).find(
        key => RIVER_STATIONS[key].id === stationId
      );
      if (stationKey && result.success) {
        stationsData[stationKey] = {
          ...RIVER_STATIONS[stationKey],
          ...result.data
        };
      }
    });

    return {
      success: true,
      data: stationsData,
      message: '전체 관측소 조회 성공'
    };
  } catch (error) {
    console.error(`[riverApi] Error fetching all stations:`, error);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 수위 변화율 계산 (최근 1시간)
 * @param {Array} series - 시계열 데이터
 * @returns {number} 변화율 (m/h)
 */
export function calculateLevelChangeRate(series) {
  if (!series || series.length < 2) return 0;

  // 최근 1시간 데이터 필터링 (6개 데이터포인트, 10분 간격)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentData = series.filter(d => d.timestamp >= oneHourAgo);

  if (recentData.length < 2) return 0;

  const firstLevel = recentData[0].level;
  const lastLevel = recentData[recentData.length - 1].level;
  const timeDiff = (recentData[recentData.length - 1].timestamp - recentData[0].timestamp) / (60 * 60 * 1000); // hours

  if (timeDiff === 0) return 0;

  return (lastLevel - firstLevel) / timeDiff;
}
