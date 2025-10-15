/**
 * 통합 재난 위험도 계산 유틸리티
 * - 100점 만점 시스템
 * - 5가지 요소 통합 계산: 기상특보, 강수량, 수위, 풍속, 통보문
 */

import { getWeatherWarning, getWeatherWarningMsg, getUltraSrtNcst } from '../services/kmaApi';
import { getUijeongbuWaterLevel } from '../services/hanRiverApi';

/**
 * 통합 재난 위험도 점수 계산 (100점 만점)
 * @returns {Promise<Object>} 위험도 데이터
 */
export async function calculateDisasterRisk() {
  let score = 0;
  const details = [];

  try {
    // 1. 기상특보 (30점 만점)
    const warningScore = await calculateWarningScore();
    score += warningScore.score;
    if (warningScore.score > 0) {
      details.push(...warningScore.details);
    }

    // 2. 강수량 (25점 만점)
    const rainfallScore = await calculateRainfallScore();
    score += rainfallScore.score;
    if (rainfallScore.score > 0) {
      details.push(rainfallScore.detail);
    }

    // 3. 수위 (25점 만점)
    const waterScore = await calculateWaterLevelScore();
    score += waterScore.score;
    if (waterScore.score > 0) {
      details.push(waterScore.detail);
    }

    // 4. 풍속 (10점 만점)
    const windScore = await calculateWindScore();
    score += windScore.score;
    if (windScore.score > 0) {
      details.push(windScore.detail);
    }

    // 5. 통보문 키워드 (10점 만점)
    const keywordScore = await calculateKeywordScore();
    score += keywordScore.score;
    if (keywordScore.score > 0) {
      details.push(keywordScore.detail);
    }

    const totalScore = Math.min(score, 100);

    return {
      success: true,
      totalScore,
      level: getRiskLevel(totalScore),
      color: getRiskColor(totalScore),
      details,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('위험도 계산 오류:', error);
    return {
      success: false,
      totalScore: 0,
      level: '알 수 없음',
      color: 'bg-gray-500 text-white',
      details: [],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 기상특보 점수 계산 (30점 만점)
 * @returns {Promise<Object>}
 */
async function calculateWarningScore() {
  try {
    const response = await getWeatherWarning('109'); // 의정부
    if (!response.success || !response.data || response.data.length === 0) {
      return { score: 0, details: [] };
    }

    let score = 0;
    const details = [];

    for (const warning of response.data) {
      const title = warning.t1 || '';

      if (title.includes('경보')) {
        score += 15;
        details.push({
          category: '기상경보',
          points: 15,
          reason: title,
          icon: '🚨'
        });
      } else if (title.includes('주의보')) {
        score += 10;
        details.push({
          category: '기상주의보',
          points: 10,
          reason: title,
          icon: '⚠️'
        });
      }

      // 최대 30점까지만
      if (score >= 30) break;
    }

    return { score: Math.min(score, 30), details };
  } catch (error) {
    console.error('기상특보 점수 계산 오류:', error);
    return { score: 0, details: [] };
  }
}

/**
 * 강수량 점수 계산 (25점 만점)
 * @returns {Promise<Object>}
 */
async function calculateRainfallScore() {
  try {
    const response = await getUltraSrtNcst();
    if (!response.success || !response.data) {
      return { score: 0, detail: null };
    }

    const rainfall = response.data.rainfall1h || 0;
    let score = 0;
    let description = '';

    if (rainfall >= 50) {
      score = 25;
      description = '매우 강한 비';
    } else if (rainfall >= 30) {
      score = 20;
      description = '강한 비';
    } else if (rainfall >= 15) {
      score = 15;
      description = '보통 비';
    } else if (rainfall >= 5) {
      score = 10;
      description = '약한 비';
    }

    return {
      score,
      detail: score > 0 ? {
        category: '강수량',
        points: score,
        reason: `${rainfall.toFixed(1)}mm/h (${description})`,
        icon: '💧'
      } : null
    };
  } catch (error) {
    console.error('강수량 점수 계산 오류:', error);
    return { score: 0, detail: null };
  }
}

/**
 * 수위 점수 계산 (25점 만점)
 * @returns {Promise<Object>}
 */
async function calculateWaterLevelScore() {
  try {
    const response = await getUijeongbuWaterLevel();
    if (!response.success || !response.data || response.data.length === 0) {
      return { score: 0, detail: null };
    }

    // 신곡교와 금신교 중 높은 수위 선택
    const levels = response.data.map(station => station.waterLevel || 0);
    const maxLevel = Math.max(...levels);
    const stationName = response.data.find(s => s.waterLevel === maxLevel)?.stationName || '측정소';

    let score = 0;
    let description = '';

    if (maxLevel >= 6.5) {
      score = 25;
      description = '위험';
    } else if (maxLevel >= 6.0) {
      score = 20;
      description = '경보';
    } else if (maxLevel >= 5.1) {
      score = 15;
      description = '경계';
    } else if (maxLevel >= 2.5) {
      score = 10;
      description = '주의';
    }

    return {
      score,
      detail: score > 0 ? {
        category: '수위',
        points: score,
        reason: `${stationName} ${maxLevel.toFixed(2)}m (${description})`,
        icon: '🌊'
      } : null
    };
  } catch (error) {
    console.error('수위 점수 계산 오류:', error);
    return { score: 0, detail: null };
  }
}

/**
 * 풍속 점수 계산 (10점 만점)
 * @returns {Promise<Object>}
 */
async function calculateWindScore() {
  try {
    const response = await getUltraSrtNcst();
    if (!response.success || !response.data) {
      return { score: 0, detail: null };
    }

    const windSpeed = response.data.windSpeed || 0;
    let score = 0;
    let description = '';

    if (windSpeed >= 14) {
      score = 10;
      description = '강풍';
    } else if (windSpeed >= 10) {
      score = 7;
      description = '바람 강함';
    } else if (windSpeed >= 7) {
      score = 4;
      description = '바람 약간 강함';
    }

    return {
      score,
      detail: score > 0 ? {
        category: '풍속',
        points: score,
        reason: `${windSpeed.toFixed(1)}m/s (${description})`,
        icon: '💨'
      } : null
    };
  } catch (error) {
    console.error('풍속 점수 계산 오류:', error);
    return { score: 0, detail: null };
  }
}

/**
 * 통보문 키워드 점수 계산 (10점 만점)
 * @returns {Promise<Object>}
 */
async function calculateKeywordScore() {
  try {
    const response = await getWeatherWarningMsg('109'); // 의정부
    if (!response.success || !response.data || response.data.length === 0) {
      return { score: 0, detail: null };
    }

    const keywords = ['침수', '범람', '대피', '고립', '붕괴', '산사태'];
    let score = 0;
    const foundKeywords = [];

    for (const msg of response.data) {
      const text = msg.t1 || '';

      for (const keyword of keywords) {
        if (text.includes(keyword) && !foundKeywords.includes(keyword)) {
          foundKeywords.push(keyword);
          score += 2;
          if (score >= 10) break;
        }
      }

      if (score >= 10) break;
    }

    return {
      score: Math.min(score, 10),
      detail: score > 0 ? {
        category: '통보문 키워드',
        points: score,
        reason: `위험 키워드 감지 (${foundKeywords.join(', ')})`,
        icon: '📄'
      } : null
    };
  } catch (error) {
    console.error('통보문 키워드 점수 계산 오류:', error);
    return { score: 0, detail: null };
  }
}

/**
 * 위험도 레벨 판정 (4단계)
 * @param {number} score - 위험도 점수 (0-100)
 * @returns {string} 위험도 레벨
 */
export function getRiskLevel(score) {
  if (score >= 70) return '매우 위험';
  if (score >= 50) return '위험';
  if (score >= 30) return '주의';
  return '안전';
}

/**
 * 위험도 레벨에 따른 색상 반환 (Tailwind CSS)
 * @param {number} score - 위험도 점수 (0-100)
 * @returns {string} Tailwind CSS 클래스
 */
export function getRiskColor(score) {
  if (score >= 70) return 'bg-red-600 text-white';
  if (score >= 50) return 'bg-orange-500 text-white';
  if (score >= 30) return 'bg-yellow-500 text-gray-900';
  return 'bg-green-500 text-white';
}

/**
 * 위험도 레벨에 따른 배경 색상 (다크모드 지원)
 * @param {number} score - 위험도 점수 (0-100)
 * @returns {string} Tailwind CSS 클래스
 */
export function getRiskBgColor(score) {
  if (score >= 70) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
  if (score >= 30) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
}

/**
 * 위험도 레벨에 따른 텍스트 색상 (다크모드 지원)
 * @param {number} score - 위험도 점수 (0-100)
 * @returns {string} Tailwind CSS 클래스
 */
export function getRiskTextColor(score) {
  if (score >= 70) return 'text-red-700 dark:text-red-400';
  if (score >= 50) return 'text-orange-700 dark:text-orange-400';
  if (score >= 30) return 'text-yellow-700 dark:text-yellow-400';
  return 'text-green-700 dark:text-green-400';
}

// 기존 호환성 유지 함수들

/**
 * 위험도 레벨 계산 (기존 방식)
 * @deprecated Use calculateDisasterRisk instead
 */
export function calculateRiskLevel({ value, thresholds }) {
  const { watch, caution, danger } = thresholds;

  if (value >= danger) {
    return { level: 'danger', text: '위험' };
  }
  if (value >= caution) {
    return { level: 'caution', text: '경계' };
  }
  if (value >= watch) {
    return { level: 'watch', text: '주의' };
  }
  return { level: 'safe', text: '안전' };
}

/**
 * 수위 기반 위험도 계산 (기존 방식)
 * @deprecated Use calculateDisasterRisk instead
 */
export function calculateWaterLevelRisk({ current, watch, caution, danger }) {
  const result = calculateRiskLevel({
    value: current,
    thresholds: { watch, caution, danger },
  });

  const percent = Math.round((current / danger) * 100);

  return {
    ...result,
    percent: Math.min(percent, 100),
  };
}

/**
 * 강수량 기반 위험도 계산 (기존 방식)
 * @deprecated Use calculateDisasterRisk instead
 */
export function calculateRainfallRisk({ rainfall1h = 0, rainfall24h = 0 }) {
  const hourlyThresholds = {
    watch: 10,
    caution: 30,
    danger: 50,
  };

  const dailyThresholds = {
    watch: 80,
    caution: 150,
    danger: 250,
  };

  const hourlyRisk = calculateRiskLevel({
    value: rainfall1h,
    thresholds: hourlyThresholds,
  });

  const dailyRisk = calculateRiskLevel({
    value: rainfall24h,
    thresholds: dailyThresholds,
  });

  const levels = ['safe', 'watch', 'caution', 'danger'];
  const hourlyIndex = levels.indexOf(hourlyRisk.level);
  const dailyIndex = levels.indexOf(dailyRisk.level);

  return hourlyIndex > dailyIndex ? hourlyRisk : dailyRisk;
}

export default {
  calculateDisasterRisk,
  getRiskLevel,
  getRiskColor,
  getRiskBgColor,
  getRiskTextColor,
  // 기존 호환성
  calculateRiskLevel,
  calculateWaterLevelRisk,
  calculateRainfallRisk,
};
