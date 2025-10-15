/**
 * Correlation Analyzer Utility
 * 날씨 데이터와 하천 수위 간의 상관분석
 */

/**
 * 피어슨 상관계수 계산
 * @param {Array<number>} x - X 변수 데이터
 * @param {Array<number>} y - Y 변수 데이터
 * @returns {number} 상관계수 (-1 ~ 1)
 */
export function calculatePearsonCorrelation(x, y) {
  if (!x || !y || x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * 시계열 데이터에서 시간 지연(lag) 상관분석
 * @param {Array<number>} x - 원인 변수 (예: 강수량)
 * @param {Array<number>} y - 결과 변수 (예: 수위)
 * @param {number} maxLag - 최대 지연 시간 (단위 수)
 * @returns {Array<{lag: number, correlation: number}>} 각 lag별 상관계수
 */
export function calculateLaggedCorrelation(x, y, maxLag = 5) {
  if (!x || !y || x.length < 2 || y.length < 2) {
    return [];
  }

  const results = [];

  for (let lag = 0; lag <= maxLag; lag++) {
    if (lag >= y.length) break;

    // lag만큼 y를 지연시켜 상관계수 계산
    const xSlice = x.slice(0, x.length - lag);
    const ySlice = y.slice(lag);

    const correlation = calculatePearsonCorrelation(xSlice, ySlice);

    results.push({
      lag,
      correlation,
      description: lag === 0 ? '동시' : `${lag}시간 후`
    });
  }

  return results;
}

/**
 * 산점도 데이터 준비
 * @param {Array} weatherData - 날씨 데이터 (시간, 강수량)
 * @param {Array} riverData - 하천 데이터 (시간, 수위)
 * @returns {Array<{rainfall: number, waterLevel: number, time: string}>}
 */
export function prepareScatterData(weatherData, riverData) {
  if (!weatherData || !riverData || weatherData.length === 0 || riverData.length === 0) {
    return [];
  }

  // 시간을 키로 하여 데이터 매칭
  const weatherMap = new Map(
    weatherData.map(item => [item.time || item.date, item.rainfall || item.precipitation || 0])
  );

  const scatterData = [];

  riverData.forEach(river => {
    const time = river.time || river.date;
    const rainfall = weatherMap.get(time);

    if (rainfall !== undefined && river.level !== undefined) {
      scatterData.push({
        rainfall,
        waterLevel: river.level,
        time
      });
    }
  });

  return scatterData;
}

/**
 * 상관관계 강도 분류
 * @param {number} correlation - 상관계수
 * @returns {Object} { strength: string, color: string, label: string }
 */
export function classifyCorrelationStrength(correlation) {
  const absCorr = Math.abs(correlation);

  if (absCorr >= 0.8) {
    return {
      strength: 'very_strong',
      label: '매우 강한 상관관계',
      color: correlation > 0 ? '#dc2626' : '#2563eb',
      icon: '🔥'
    };
  } else if (absCorr >= 0.6) {
    return {
      strength: 'strong',
      label: '강한 상관관계',
      color: correlation > 0 ? '#ea580c' : '#3b82f6',
      icon: '⬆️'
    };
  } else if (absCorr >= 0.4) {
    return {
      strength: 'moderate',
      label: '보통 상관관계',
      color: correlation > 0 ? '#f59e0b' : '#60a5fa',
      icon: '➡️'
    };
  } else if (absCorr >= 0.2) {
    return {
      strength: 'weak',
      label: '약한 상관관계',
      color: correlation > 0 ? '#fbbf24' : '#93c5fd',
      icon: '↗️'
    };
  } else {
    return {
      strength: 'very_weak',
      label: '매우 약한 상관관계',
      color: '#9ca3af',
      icon: '〰️'
    };
  }
}

/**
 * 단순 선형 회귀 분석
 * @param {Array<number>} x - 독립 변수
 * @param {Array<number>} y - 종속 변수
 * @returns {Object} { slope, intercept, predict: function }
 */
export function simpleLinearRegression(x, y) {
  if (!x || !y || x.length !== y.length || x.length === 0) {
    return { slope: 0, intercept: 0, predict: () => 0 };
  }

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
  const intercept = meanY - slope * meanX;

  return {
    slope,
    intercept,
    predict: (xValue) => slope * xValue + intercept,
    equation: `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`
  };
}

/**
 * 홍수 위험도 예측 (강수량 기반)
 * @param {number} rainfall - 예상 강수량 (mm)
 * @param {Object} regression - 회귀 분석 결과
 * @param {Object} thresholds - 수위 임계값
 * @returns {Object} { predictedLevel, riskLevel, riskScore, message }
 */
export function predictFloodRisk(rainfall, regression, thresholds = {}) {
  const {
    normal = 1.0,
    caution = 2.0,
    warning = 3.0,
    danger = 4.0
  } = thresholds;

  // 회귀 모델로 수위 예측
  const predictedLevel = regression.predict(rainfall);

  // 위험도 판단
  let riskLevel, riskScore, message, color, icon;

  if (predictedLevel >= danger) {
    riskLevel = 'danger';
    riskScore = 90 + Math.min((predictedLevel - danger) * 2, 10);
    message = '위험: 즉각 대피 필요';
    color = '#dc2626';
    icon = '🔴';
  } else if (predictedLevel >= warning) {
    riskLevel = 'warning';
    riskScore = 70 + ((predictedLevel - warning) / (danger - warning)) * 20;
    message = '경계: 상황 주시 필요';
    color = '#ea580c';
    icon = '🟠';
  } else if (predictedLevel >= caution) {
    riskLevel = 'caution';
    riskScore = 40 + ((predictedLevel - caution) / (warning - caution)) * 30;
    message = '주의: 모니터링 강화';
    color = '#f59e0b';
    icon = '🟡';
  } else {
    riskLevel = 'normal';
    riskScore = Math.min((predictedLevel / normal) * 40, 40);
    message = '정상: 안전 범위';
    color = '#10b981';
    icon = '🟢';
  }

  return {
    predictedLevel: Math.max(predictedLevel, 0),
    riskLevel,
    riskScore: Math.round(riskScore),
    message,
    color,
    icon,
    details: {
      formula: regression.equation,
      inputRainfall: rainfall,
      thresholdsUsed: thresholds
    }
  };
}

/**
 * 시계열 트렌드 분석
 * @param {Array<{time: string, value: number}>} data - 시계열 데이터
 * @param {number} windowSize - 이동평균 윈도우 크기
 * @returns {Array<{time: string, value: number, ma: number, trend: string}>}
 */
export function analyzeTrend(data, windowSize = 3) {
  if (!data || data.length < windowSize) {
    return data || [];
  }

  const result = [];

  for (let i = 0; i < data.length; i++) {
    const item = { ...data[i] };

    // 이동평균 계산
    if (i >= windowSize - 1) {
      const window = data.slice(i - windowSize + 1, i + 1);
      const sum = window.reduce((acc, d) => acc + (d.value || 0), 0);
      item.ma = sum / windowSize;

      // 트렌드 판단
      if (i >= windowSize) {
        const prevMA = result[i - 1].ma;
        const diff = item.ma - prevMA;

        if (diff > 0.05) {
          item.trend = 'rising';
          item.trendIcon = '📈';
        } else if (diff < -0.05) {
          item.trend = 'falling';
          item.trendIcon = '📉';
        } else {
          item.trend = 'stable';
          item.trendIcon = '➡️';
        }
      }
    }

    result.push(item);
  }

  return result;
}

/**
 * 데이터 검증
 * @param {Array} weatherData - 날씨 데이터
 * @param {Array} riverData - 하천 데이터
 * @returns {Object} { valid: boolean, weatherCount: number, riverCount: number, matchedCount: number }
 */
export function validateCorrelationData(weatherData, riverData) {
  if (!weatherData || !riverData) {
    return {
      valid: false,
      weatherCount: 0,
      riverCount: 0,
      matchedCount: 0,
      message: '데이터가 없습니다'
    };
  }

  const weatherCount = weatherData.length;
  const riverCount = riverData.length;

  // 시간 매칭 개수 확인
  const weatherTimes = new Set(weatherData.map(d => d.time || d.date));
  const matchedCount = riverData.filter(d => weatherTimes.has(d.time || d.date)).length;

  const valid = weatherCount >= 3 && riverCount >= 3 && matchedCount >= 3;

  return {
    valid,
    weatherCount,
    riverCount,
    matchedCount,
    message: valid
      ? `분석 가능: ${matchedCount}개 데이터 매칭`
      : `데이터 부족: 최소 3개 이상 필요`
  };
}

/**
 * 종합 상관분석 실행
 * @param {Array} weatherData - 날씨 데이터 (강수량 포함)
 * @param {Array} riverData - 하천 수위 데이터
 * @returns {Object} 종합 분석 결과
 */
export function performFullCorrelationAnalysis(weatherData, riverData) {
  // 데이터 검증
  const validation = validateCorrelationData(weatherData, riverData);

  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
      data: null
    };
  }

  // 산점도 데이터
  const scatterData = prepareScatterData(weatherData, riverData);

  // 강수량과 수위 추출
  const rainfallValues = scatterData.map(d => d.rainfall);
  const waterLevelValues = scatterData.map(d => d.waterLevel);

  // 상관계수 계산
  const correlation = calculatePearsonCorrelation(rainfallValues, waterLevelValues);
  const correlationStrength = classifyCorrelationStrength(correlation);

  // 시간 지연 상관분석
  const laggedCorrelations = calculateLaggedCorrelation(rainfallValues, waterLevelValues, 6);

  // 최대 상관 지연 시간 찾기
  const maxLagCorrelation = laggedCorrelations.reduce((max, item) =>
    Math.abs(item.correlation) > Math.abs(max.correlation) ? item : max
  , laggedCorrelations[0]);

  // 회귀 분석
  const regression = simpleLinearRegression(rainfallValues, waterLevelValues);

  return {
    success: true,
    message: '상관분석 완료',
    data: {
      validation,
      scatterData,
      correlation: {
        value: correlation,
        ...correlationStrength
      },
      laggedCorrelations,
      maxLagCorrelation,
      regression,
      statistics: {
        rainfallMean: rainfallValues.reduce((a, b) => a + b, 0) / rainfallValues.length,
        rainfallMax: Math.max(...rainfallValues),
        waterLevelMean: waterLevelValues.reduce((a, b) => a + b, 0) / waterLevelValues.length,
        waterLevelMax: Math.max(...waterLevelValues),
        dataPoints: scatterData.length
      }
    }
  };
}
