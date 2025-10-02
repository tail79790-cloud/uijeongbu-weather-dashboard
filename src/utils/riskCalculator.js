/**
 * 위험도 계산 유틸리티
 * 강수량, 수위 등의 데이터를 기반으로 위험도를 계산
 */

/**
 * 위험도 레벨 계산
 * @param {Object} params
 * @param {number} params.value - 현재값
 * @param {Object} params.thresholds - 기준값들
 * @param {number} params.thresholds.watch - 주의 기준
 * @param {number} params.thresholds.caution - 경계 기준
 * @param {number} params.thresholds.danger - 위험 기준
 * @returns {Object} { level, text }
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
 * 위험도 레벨에 따른 색상 반환
 * @param {string} level - 위험도 레벨
 * @returns {string} 색상 클래스
 */
export function getRiskColor(level) {
  const colors = {
    safe: 'green',
    watch: 'blue',
    caution: 'yellow',
    danger: 'red',
  };
  return colors[level] || 'gray';
}

/**
 * 위험도 레벨에 따른 텍스트 반환
 * @param {string} level - 위험도 레벨
 * @returns {string} 한글 텍스트
 */
export function getRiskText(level) {
  const texts = {
    safe: '안전',
    watch: '주의',
    caution: '경계',
    danger: '위험',
  };
  return texts[level] || '알 수 없음';
}

/**
 * 수위 기반 위험도 계산
 * @param {Object} params
 * @param {number} params.current - 현재 수위
 * @param {number} params.watch - 주의수위
 * @param {number} params.caution - 경계수위
 * @param {number} params.danger - 홍수위
 * @returns {Object} { level, text, percent }
 */
export function calculateWaterLevelRisk({ current, watch, caution, danger }) {
  const result = calculateRiskLevel({
    value: current,
    thresholds: { watch, caution, danger },
  });

  // 퍼센트 계산 (홍수위 기준)
  const percent = Math.round((current / danger) * 100);

  return {
    ...result,
    percent: Math.min(percent, 100),
  };
}

/**
 * 강수량 기반 위험도 계산
 * @param {Object} params
 * @param {number} params.rainfall1h - 1시간 강수량
 * @param {number} params.rainfall24h - 24시간 강수량
 * @returns {Object} { level, text }
 */
export function calculateRainfallRisk({ rainfall1h = 0, rainfall24h = 0 }) {
  // 1시간 강수량 기준 (mm)
  const hourlyThresholds = {
    watch: 10,    // 10mm 이상
    caution: 30,  // 30mm 이상
    danger: 50,   // 50mm 이상
  };

  // 24시간 강수량 기준 (mm)
  const dailyThresholds = {
    watch: 80,    // 80mm 이상
    caution: 150, // 150mm 이상
    danger: 250,  // 250mm 이상
  };

  const hourlyRisk = calculateRiskLevel({
    value: rainfall1h,
    thresholds: hourlyThresholds,
  });

  const dailyRisk = calculateRiskLevel({
    value: rainfall24h,
    thresholds: dailyThresholds,
  });

  // 둘 중 높은 위험도 반환
  const levels = ['safe', 'watch', 'caution', 'danger'];
  const hourlyIndex = levels.indexOf(hourlyRisk.level);
  const dailyIndex = levels.indexOf(dailyRisk.level);

  return hourlyIndex > dailyIndex ? hourlyRisk : dailyRisk;
}

export default {
  calculateRiskLevel,
  getRiskColor,
  getRiskText,
  calculateWaterLevelRisk,
  calculateRainfallRisk,
};
