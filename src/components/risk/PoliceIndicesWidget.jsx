import { useQuery } from '@tanstack/react-query';
import { getUltraSrtNcst, getLivingWeatherIndex } from '../../services/kmaApi';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';

/**
 * 경찰 특화 활동 지수 위젯
 * - 교통안전지수: 노면 상태 + 가시거리
 * - 순찰적합지수: 체감온도 + 풍속
 * - 사고위험지수: 강수 + 풍속 + 기타 요소
 */
export default function PoliceIndicesWidget() {
  // 초단기실황 데이터 (5분 갱신)
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['ultraSrtNcst'],
    queryFn: getUltraSrtNcst,
    refetchInterval: 300000, // 5분
    staleTime: 240000,
  });

  // 생활기상지수 데이터 (30분 갱신)
  const { data: livingData, isLoading: livingLoading } = useQuery({
    queryKey: ['livingWeatherIndex'],
    queryFn: getLivingWeatherIndex,
    refetchInterval: 1800000, // 30분
    staleTime: 1740000,
  });

  // 교통안전지수 계산 (100점 만점)
  const calculateTrafficSafetyIndex = () => {
    if (!weatherData?.data) return { score: 50, level: '보통', color: 'text-blue-600', bgColor: 'bg-blue-50' };

    const { rainfall1h, windSpeed, temperature, precipitation } = weatherData.data;

    let score = 100;
    let reasons = [];

    // 강수량 영향 (최대 -40점)
    if (rainfall1h >= 50) {
      score -= 40;
      reasons.push('매우 강한 비 (-40)');
    } else if (rainfall1h >= 30) {
      score -= 30;
      reasons.push('강한 비 (-30)');
    } else if (rainfall1h >= 15) {
      score -= 20;
      reasons.push('보통 비 (-20)');
    } else if (rainfall1h >= 5) {
      score -= 10;
      reasons.push('약한 비 (-10)');
    }

    // 결빙 위험 (최대 -30점)
    if (temperature <= 0 && rainfall1h > 0) {
      score -= 30;
      reasons.push('결빙 위험 (-30)');
    } else if (temperature <= 2) {
      score -= 15;
      reasons.push('결빙 가능 (-15)');
    }

    // 풍속 영향 (최대 -20점)
    if (windSpeed >= 14) {
      score -= 20;
      reasons.push('강풍 (-20)');
    } else if (windSpeed >= 10) {
      score -= 10;
      reasons.push('바람 강함 (-10)');
    }

    // 강수 형태 (눈)
    if (precipitation === '3' || precipitation === '2') {
      score -= 15;
      reasons.push('적설 영향 (-15)');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      level: getIndexLevel(score),
      color: getIndexColor(score),
      bgColor: getIndexBgColor(score),
      reasons: reasons.length > 0 ? reasons.join(', ') : '양호한 교통 상황'
    };
  };

  // 순찰적합지수 계산 (100점 만점)
  const calculatePatrolComfortIndex = () => {
    if (!weatherData?.data) return { score: 50, level: '보통', color: 'text-green-600', bgColor: 'bg-green-50' };

    const { temperature, windSpeed, rainfall1h, humidity } = weatherData.data;

    let score = 100;
    let reasons = [];

    // 체감온도 계산 (풍속 고려)
    const apparentTemp = temperature - (windSpeed * 0.7);

    // 체감온도 영향 (최대 -40점)
    if (apparentTemp <= -10) {
      score -= 40;
      reasons.push('극한의 추위 (-40)');
    } else if (apparentTemp <= -5) {
      score -= 30;
      reasons.push('매우 추움 (-30)');
    } else if (apparentTemp <= 0) {
      score -= 20;
      reasons.push('추움 (-20)');
    } else if (apparentTemp >= 33) {
      score -= 35;
      reasons.push('폭염 (-35)');
    } else if (apparentTemp >= 28) {
      score -= 25;
      reasons.push('매우 더움 (-25)');
    } else if (apparentTemp >= 25) {
      score -= 15;
      reasons.push('더움 (-15)');
    }

    // 강수량 영향 (최대 -30점)
    if (rainfall1h >= 30) {
      score -= 30;
      reasons.push('강한 비 (-30)');
    } else if (rainfall1h >= 15) {
      score -= 20;
      reasons.push('보통 비 (-20)');
    } else if (rainfall1h >= 5) {
      score -= 10;
      reasons.push('약한 비 (-10)');
    }

    // 풍속 영향 (최대 -20점)
    if (windSpeed >= 14) {
      score -= 20;
      reasons.push('강풍 (-20)');
    } else if (windSpeed >= 10) {
      score -= 10;
      reasons.push('바람 강함 (-10)');
    }

    // 습도 영향 (최대 -10점, 여름철만)
    if (temperature >= 25 && humidity >= 80) {
      score -= 10;
      reasons.push('높은 습도 (-10)');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      level: getIndexLevel(score),
      color: getIndexColor(score),
      bgColor: getIndexBgColor(score),
      reasons: reasons.length > 0 ? reasons.join(', ') : '순찰에 적합한 날씨',
      apparentTemp: apparentTemp.toFixed(1)
    };
  };

  // 사고위험지수 계산 (0-100, 높을수록 위험)
  const calculateAccidentRiskIndex = () => {
    if (!weatherData?.data) return { score: 30, level: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };

    const { rainfall1h, windSpeed, temperature, precipitation } = weatherData.data;
    const uvValue = livingData?.data?.uv?.value || 0;

    let score = 0;
    let reasons = [];

    // 강수량 (최대 +40점)
    if (rainfall1h >= 50) {
      score += 40;
      reasons.push('매우 강한 비 (+40)');
    } else if (rainfall1h >= 30) {
      score += 30;
      reasons.push('강한 비 (+30)');
    } else if (rainfall1h >= 15) {
      score += 20;
      reasons.push('보통 비 (+20)');
    } else if (rainfall1h >= 5) {
      score += 10;
      reasons.push('약한 비 (+10)');
    }

    // 강수 형태 (눈) (최대 +25점)
    if (precipitation === '3') {
      score += 25;
      reasons.push('적설 (+25)');
    } else if (precipitation === '2') {
      score += 20;
      reasons.push('진눈깨비 (+20)');
    }

    // 결빙 위험 (최대 +20점)
    if (temperature <= 0 && (rainfall1h > 0 || precipitation !== '0')) {
      score += 20;
      reasons.push('결빙 위험 (+20)');
    } else if (temperature <= 2) {
      score += 10;
      reasons.push('결빙 가능 (+10)');
    }

    // 풍속 (최대 +15점)
    if (windSpeed >= 14) {
      score += 15;
      reasons.push('강풍 (+15)');
    } else if (windSpeed >= 10) {
      score += 10;
      reasons.push('바람 강함 (+10)');
    }

    // 자외선 (고반사, 최대 +10점)
    if (uvValue >= 8 && rainfall1h === 0) {
      score += 10;
      reasons.push('눈부심 위험 (+10)');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      level: getRiskIndexLevel(score),
      color: getRiskIndexColor(score),
      bgColor: getRiskIndexBgColor(score),
      reasons: reasons.length > 0 ? reasons.join(', ') : '사고 위험 낮음'
    };
  };

  // 지수 레벨 판정 (높을수록 좋음)
  const getIndexLevel = (score) => {
    if (score >= 80) return '매우 좋음';
    if (score >= 60) return '좋음';
    if (score >= 40) return '보통';
    if (score >= 20) return '나쁨';
    return '매우 나쁨';
  };

  // 지수 색상 (높을수록 좋음)
  const getIndexColor = (score) => {
    if (score >= 80) return 'text-green-700 dark:text-green-400';
    if (score >= 60) return 'text-blue-700 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-700 dark:text-yellow-400';
    if (score >= 20) return 'text-orange-700 dark:text-orange-400';
    return 'text-red-700 dark:text-red-400';
  };

  // 지수 배경색 (높을수록 좋음)
  const getIndexBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20';
    if (score >= 40) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (score >= 20) return 'bg-orange-50 dark:bg-orange-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  // 위험 지수 레벨 (낮을수록 좋음)
  const getRiskIndexLevel = (score) => {
    if (score >= 70) return '매우 높음';
    if (score >= 50) return '높음';
    if (score >= 30) return '보통';
    if (score >= 10) return '낮음';
    return '매우 낮음';
  };

  // 위험 지수 색상 (낮을수록 좋음)
  const getRiskIndexColor = (score) => {
    if (score >= 70) return 'text-red-700 dark:text-red-400';
    if (score >= 50) return 'text-orange-700 dark:text-orange-400';
    if (score >= 30) return 'text-yellow-700 dark:text-yellow-400';
    if (score >= 10) return 'text-blue-700 dark:text-blue-400';
    return 'text-green-700 dark:text-green-400';
  };

  // 위험 지수 배경색 (낮을수록 좋음)
  const getRiskIndexBgColor = (score) => {
    if (score >= 70) return 'bg-red-50 dark:bg-red-900/20';
    if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/20';
    if (score >= 30) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (score >= 10) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  if (weatherLoading || livingLoading) {
    return (
      <WidgetCard title="👮 경찰 특화 활동 지수" borderColor="blue">
        <WidgetLoader />
      </WidgetCard>
    );
  }

  if (!weatherData || !weatherData.success) {
    return (
      <WidgetCard title="👮 경찰 특화 활동 지수" borderColor="blue">
        <WidgetError message="날씨 데이터를 불러올 수 없습니다" />
      </WidgetCard>
    );
  }

  const trafficIndex = calculateTrafficSafetyIndex();
  const patrolIndex = calculatePatrolComfortIndex();
  const accidentIndex = calculateAccidentRiskIndex();

  return (
    <WidgetCard title="👮 경찰 특화 활동 지수" borderColor="blue">
      <div className="space-y-4">
        {/* 교통안전지수 */}
        <div className={`p-4 rounded-lg border-2 ${trafficIndex.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                교통안전지수
              </span>
            </div>
            <div className={`text-3xl font-bold ${trafficIndex.color}`}>
              {trafficIndex.score}
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-medium ${trafficIndex.color}`}>
              {trafficIndex.level}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {trafficIndex.reasons}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-500">
            노면 상태, 가시거리, 결빙 위험 종합 평가
          </div>
        </div>

        {/* 순찰적합지수 */}
        <div className={`p-4 rounded-lg border-2 ${patrolIndex.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚶</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                순찰적합지수
              </span>
            </div>
            <div className={`text-3xl font-bold ${patrolIndex.color}`}>
              {patrolIndex.score}
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-medium ${patrolIndex.color}`}>
              {patrolIndex.level}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {patrolIndex.reasons}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              체감온도: {patrolIndex.apparentTemp}°C
              (실제: {weatherData.data.temperature}°C)
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-500">
            체감온도, 강수량, 풍속 종합 평가
          </div>
        </div>

        {/* 사고위험지수 */}
        <div className={`p-4 rounded-lg border-2 ${accidentIndex.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                사고위험지수
              </span>
            </div>
            <div className={`text-3xl font-bold ${accidentIndex.color}`}>
              {accidentIndex.score}
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-medium ${accidentIndex.color}`}>
              {accidentIndex.level}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {accidentIndex.reasons}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-500">
            강수량, 결빙, 풍속, 눈부심 종합 평가 (높을수록 위험)
          </div>
        </div>

        {/* 생활기상지수 (추가 참고용) */}
        {livingData?.data && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              추가 참고 지수
            </div>
            <div className="grid grid-cols-3 gap-2">
              {livingData.data.uv && (
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">자외선</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {livingData.data.uv.text}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {livingData.data.uv.value}
                  </div>
                </div>
              )}
              {livingData.data.airDiffusion && (
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">대기확산</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {livingData.data.airDiffusion.text}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {livingData.data.airDiffusion.value}
                  </div>
                </div>
              )}
              {livingData.data.asthma && (
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400">천식</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {livingData.data.asthma.text}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {livingData.data.asthma.value}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
