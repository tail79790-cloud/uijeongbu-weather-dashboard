/**
 * River Level Calculator Utility
 * 하천 수위 기반 위험도 계산 및 분석 로직
 */

/**
 * 수위 위험 단계 상수
 */
export const RISK_LEVELS = {
  NORMAL: {
    key: 'normal',
    label: '정상',
    color: 'green',
    icon: '🟢',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    darkBorderColor: 'dark:border-green-800'
  },
  CAUTION: {
    key: 'caution',
    label: '주의',
    color: 'yellow',
    icon: '🟡',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkTextColor: 'dark:text-yellow-400',
    darkBorderColor: 'dark:border-yellow-800'
  },
  WARNING: {
    key: 'warning',
    label: '경계',
    color: 'orange',
    icon: '🟠',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    darkBgColor: 'dark:bg-orange-900/20',
    darkTextColor: 'dark:text-orange-400',
    darkBorderColor: 'dark:border-orange-800'
  },
  DANGER: {
    key: 'danger',
    label: '위험',
    color: 'red',
    icon: '🔴',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    darkBorderColor: 'dark:border-red-800'
  }
};

/**
 * 수위 기반 위험 단계 결정
 * @param {number} level - 현재 수위 (m)
 * @param {Object} thresholds - 임계값 설정
 * @returns {Object} 위험 단계 정보
 */
export function getRiskLevel(level, thresholds = {}) {
  const {
    normal = 1.0,
    caution = 1.5,
    warning = 2.0,
    danger = 2.5
  } = thresholds;

  if (level >= danger) return RISK_LEVELS.DANGER;
  if (level >= warning) return RISK_LEVELS.WARNING;
  if (level >= caution) return RISK_LEVELS.CAUTION;
  return RISK_LEVELS.NORMAL;
}

/**
 * 위험도 점수 계산 (0-100)
 * @param {number} level - 현재 수위 (m)
 * @param {number} changeRate - 수위 변화율 (m/h)
 * @param {Object} thresholds - 임계값 설정
 * @returns {number} 위험도 점수 (0-100)
 */
export function calculateRiskScore(level, changeRate = 0, thresholds = {}) {
  const { danger = 2.5 } = thresholds;

  // 기본 수위 점수 (0-70점)
  const levelScore = Math.min((level / danger) * 70, 70);

  // 변화율 점수 (0-30점)
  // 긍정적 변화(상승)만 위험도에 반영
  const changeRateScore = changeRate > 0
    ? Math.min((changeRate / 0.5) * 30, 30) // 0.5 m/h 이상이면 최대 점수
    : 0;

  const totalScore = Math.min(levelScore + changeRateScore, 100);

  return Math.round(totalScore);
}

/**
 * 수위 추세 분석
 * @param {Array} series - 시계열 데이터 [{ time, level, timestamp }]
 * @returns {Object} 추세 분석 결과
 */
export function analyzeTrend(series) {
  if (!series || series.length < 2) {
    return {
      trend: 'stable',
      trendLabel: '안정',
      trendIcon: '➡️',
      change: 0,
      changeLabel: '변화 없음'
    };
  }

  // 최근 1시간 데이터 추출
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentData = series.filter(d => d.timestamp >= oneHourAgo);

  if (recentData.length < 2) {
    return {
      trend: 'stable',
      trendLabel: '안정',
      trendIcon: '➡️',
      change: 0,
      changeLabel: '데이터 부족'
    };
  }

  // 첫 값과 마지막 값 비교
  const firstLevel = recentData[0].level;
  const lastLevel = recentData[recentData.length - 1].level;
  const change = lastLevel - firstLevel;

  // 추세 결정 (0.05m 이상 변화 시)
  let trend, trendLabel, trendIcon, changeLabel;

  if (change > 0.05) {
    trend = 'rising';
    trendLabel = '상승';
    trendIcon = '📈';
    changeLabel = `+${change.toFixed(2)}m (1시간)`;
  } else if (change < -0.05) {
    trend = 'falling';
    trendLabel = '하강';
    trendIcon = '📉';
    changeLabel = `${change.toFixed(2)}m (1시간)`;
  } else {
    trend = 'stable';
    trendLabel = '안정';
    trendIcon = '➡️';
    changeLabel = `${change >= 0 ? '+' : ''}${change.toFixed(2)}m (1시간)`;
  }

  return {
    trend,
    trendLabel,
    trendIcon,
    change,
    changeLabel,
    recentDataPoints: recentData.length
  };
}

/**
 * 위험 단계별 권장 행동 메시지
 * @param {Object} riskLevel - 위험 단계 객체
 * @returns {Array<string>} 권장 행동 메시지 배열
 */
export function getRecommendations(riskLevel) {
  const recommendations = {
    normal: [
      '현재 수위는 정상 범위입니다.',
      '정기적인 모니터링을 계속합니다.'
    ],
    caution: [
      '수위가 주의 단계에 진입했습니다.',
      '지속적인 모니터링이 필요합니다.',
      '하천 주변 저지대 확인을 권장합니다.'
    ],
    warning: [
      '⚠️ 수위가 경계 단계입니다!',
      '하천 주변 저지대 침수 가능성이 있습니다.',
      '주민 대피 준비를 시작하세요.',
      '재난 담당 부서에 상황을 보고하세요.'
    ],
    danger: [
      '🚨 위험! 즉각적인 조치가 필요합니다!',
      '하천 범람 위험이 매우 높습니다.',
      '즉시 주민 대피를 시행하세요.',
      '재난 대응 본부를 가동하세요.',
      '교통 통제 및 우회로를 설정하세요.'
    ]
  };

  return recommendations[riskLevel.key] || recommendations.normal;
}

/**
 * 수위 데이터 포맷팅
 * @param {number} level - 수위 (m)
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷된 수위 문자열
 */
export function formatLevel(level, decimals = 2) {
  if (level === null || level === undefined || isNaN(level)) {
    return 'N/A';
  }
  return `${level.toFixed(decimals)}m`;
}

/**
 * 시계열 데이터를 차트 데이터로 변환
 * @param {Array} series - 시계열 데이터
 * @param {Object} thresholds - 임계값 설정
 * @returns {Object} 차트 데이터 및 참조선 정보
 */
export function prepareChartData(series, thresholds = {}) {
  if (!series || series.length === 0) {
    return {
      data: [],
      referenceLines: []
    };
  }

  // 차트 데이터: 시간을 HH:MM 형식으로 변환
  const chartData = series.map(item => ({
    time: new Date(item.time).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    수위: item.level,
    timestamp: item.timestamp,
    fullTime: item.time
  }));

  // 참조선 (임계값)
  const referenceLines = [
    {
      y: thresholds.danger || 2.5,
      label: '위험',
      stroke: '#ef4444',
      strokeDasharray: '5 5'
    },
    {
      y: thresholds.warning || 2.0,
      label: '경계',
      stroke: '#f97316',
      strokeDasharray: '5 5'
    },
    {
      y: thresholds.caution || 1.5,
      label: '주의',
      stroke: '#eab308',
      strokeDasharray: '5 5'
    }
  ];

  return {
    data: chartData,
    referenceLines
  };
}

/**
 * 시간대별 통계 계산
 * @param {Array} series - 시계열 데이터
 * @returns {Object} 통계 정보
 */
export function calculateStatistics(series) {
  if (!series || series.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      current: 0,
      dataPoints: 0
    };
  }

  const levels = series.map(s => s.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  const current = series[series.length - 1].level;

  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    avg: parseFloat(avg.toFixed(2)),
    current: parseFloat(current.toFixed(2)),
    dataPoints: series.length
  };
}
