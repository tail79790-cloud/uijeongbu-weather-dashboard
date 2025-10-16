/**
 * Weather-River Correlation Widget
 * 날씨 데이터(강수량)와 하천 수위 간의 상관분석 대시보드
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  performFullCorrelationAnalysis,
  predictFloodRisk,
  classifyCorrelationStrength
} from '../../utils/correlationAnalyzer';
import { getWaterLevelSeries } from '../../services/hanRiverApi';
import { adaptSeriesData } from '../../utils/riverDataAdapter';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';

const WORKER_BASE_URL = import.meta.env.VITE_WORKER_API_URL || 'https://weather-bot.seunghyeonkim.workers.dev';

/**
 * 날씨 데이터 조회 (최근 24시간)
 */
async function fetchWeatherHistory() {
  try {
    const url = `${WORKER_BASE_URL}/api/weather/history`;
    console.log(`[weatherHistoryApi] Fetching from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'API 오류');
    }

    return {
      success: true,
      data: result.data // [{ time, rainfall, temp, humidity }]
    };
  } catch (error) {
    console.error(`[weatherHistoryApi] Error:`, error);

    // Development 모드: 목 데이터
    if (import.meta.env.DEV) {
      console.warn('[weatherHistoryApi] Using mock data');

      const now = Date.now();
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toISOString(),
        rainfall: Math.random() > 0.7 ? Math.random() * 10 : 0, // 30% 확률로 비
        temp: 15 + Math.random() * 10,
        humidity: 50 + Math.random() * 30
      }));

      return {
        success: true,
        data: mockData
      };
    }

    return {
      success: false,
      data: null
    };
  }
}

const WeatherRiverCorrelationWidget = () => {
  const [selectedStation] = useState('1018665'); // 신곡교
  const [predictRainfall, setPredictRainfall] = useState(10); // 예측용 강수량 (mm)

  // 날씨 이력 데이터 조회
  const {
    data: weatherData,
    isLoading: weatherLoading,
    isError: weatherError,
    refetch: refetchWeather
  } = useQuery({
    queryKey: ['weatherHistory'],
    queryFn: fetchWeatherHistory,
    refetchInterval: 10 * 60 * 1000, // 10분
    staleTime: 5 * 60 * 1000
  });

  // 하천 수위 시계열 데이터 조회 (한강 API + 어댑터)
  const {
    data: riverData,
    isLoading: riverLoading,
    isError: riverError,
    refetch: refetchRiver
  } = useQuery({
    queryKey: ['waterLevelSeries', 'hanriver', 'correlation', selectedStation],
    queryFn: async () => {
      const result = await getWaterLevelSeries(selectedStation, 24); // 24시간 데이터
      return adaptSeriesData(result); // 어댑터 적용
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000
  });

  // 로딩 상태
  if (weatherLoading || riverLoading) {
    return (
      <WidgetCard title="📊 날씨-하천 상관분석">
        <WidgetLoader message="상관분석 데이터를 불러오는 중..." />
      </WidgetCard>
    );
  }

  // 에러 상태
  if (weatherError || riverError || !weatherData?.success || !riverData?.success) {
    return (
      <WidgetCard title="📊 날씨-하천 상관분석">
        <WidgetError
          message="상관분석 데이터를 불러올 수 없습니다."
          onRetry={() => {
            refetchWeather();
            refetchRiver();
          }}
        />
      </WidgetCard>
    );
  }

  // 상관분석 실행
  const analysis = performFullCorrelationAnalysis(
    weatherData.data || [],
    riverData.data || []
  );

  if (!analysis.success) {
    return (
      <WidgetCard title="📊 날씨-하천 상관분석">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {analysis.message}
        </div>
      </WidgetCard>
    );
  }

  const { correlation, scatterData, laggedCorrelations, regression, statistics, maxLagCorrelation } =
    analysis.data;

  // 홍수 위험도 예측
  const floodPrediction = predictFloodRisk(predictRainfall, regression, {
    normal: 1.0,
    caution: 2.0,
    warning: 3.0,
    danger: 4.0
  });

  // 회귀선 데이터 준비 (산점도에 추가)
  const regressionLineData = [
    { rainfall: 0, predicted: regression.predict(0) },
    {
      rainfall: Math.max(...scatterData.map(d => d.rainfall)),
      predicted: regression.predict(Math.max(...scatterData.map(d => d.rainfall)))
    }
  ];

  return (
    <WidgetCard
      title="📊 날씨-하천 상관분석"
      subtitle={`강수량 ↔ 수위 상관관계 (${statistics.dataPoints}개 데이터)`}
      action={
        <RefreshButton
          onRefresh={() => {
            refetchWeather();
            refetchRiver();
          }}
        />
      }
    >
      <div className="space-y-6">
        {/* 상관계수 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 상관계수 */}
          <div
            className="p-4 rounded-lg border-2 transition-transform hover:scale-105"
            style={{ borderColor: correlation.color, backgroundColor: `${correlation.color}15` }}
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {correlation.icon} 상관계수
            </div>
            <div className="text-3xl font-bold" style={{ color: correlation.color }}>
              {correlation.value.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{correlation.label}</div>
          </div>

          {/* 최적 시간 지연 */}
          <div className="p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              ⏱️ 최대 상관 시점
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {maxLagCorrelation.lag}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              상관도: {maxLagCorrelation.correlation.toFixed(3)}
            </div>
          </div>

          {/* 회귀식 */}
          <div className="p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              📐 회귀 방정식
            </div>
            <div className="text-sm font-mono text-purple-600 dark:text-purple-400 mt-2">
              {regression.equation}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              수위 = f(강수량)
            </div>
          </div>
        </div>

        {/* 산점도 + 회귀선 */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            📈 산점도 분석 (강수량 vs 수위)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                type="number"
                dataKey="rainfall"
                name="강수량"
                unit=" mm"
                label={{ value: '강수량 (mm)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="waterLevel"
                name="수위"
                unit=" m"
                label={{ value: '수위 (m)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value.toFixed(2)} ${name === 'rainfall' ? 'mm' : 'm'}`,
                  name === 'rainfall' ? '강수량' : '수위'
                ]}
                labelFormatter={(label) => `데이터 포인트`}
              />
              <Legend />

              {/* 실제 데이터 (산점도) */}
              <Scatter name="실제 관측값" data={scatterData} fill="#3b82f6" />

              {/* 회귀선 */}
              <Scatter
                name="회귀선"
                data={regressionLineData}
                fill="transparent"
                line={{ stroke: '#ef4444', strokeWidth: 2 }}
                shape={() => null}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 시간 지연 상관분석 */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            ⏱️ 시간 지연 상관분석 (Lagged Correlation)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={laggedCorrelations} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="lag"
                label={{ value: '시간 지연 (시간)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                label={{ value: '상관계수', angle: -90, position: 'insideLeft' }}
                domain={[-1, 1]}
              />
              <Tooltip
                formatter={(value) => value.toFixed(3)}
                labelFormatter={(lag) => `${lag}시간 후`}
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Bar dataKey="correlation" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            강수량 발생 후 수위 변화까지의 시간 지연 효과 분석
          </div>
        </div>

        {/* 홍수 위험도 예측 */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🌧️ 홍수 위험도 예측 시뮬레이터
          </h3>

          {/* 강수량 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              예상 강수량: {predictRainfall} mm
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={predictRainfall}
              onChange={(e) => setPredictRainfall(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 mm</span>
              <span>50 mm</span>
              <span>100 mm</span>
            </div>
          </div>

          {/* 예측 결과 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border-2" style={{ borderColor: floodPrediction.color }}>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {floodPrediction.icon} 위험도
              </div>
              <div className="text-2xl font-bold" style={{ color: floodPrediction.color }}>
                {floodPrediction.riskScore}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {floodPrediction.message}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">💧 예측 수위</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {floodPrediction.predictedLevel.toFixed(2)}m
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                기준: {regression.slope.toFixed(3)} m/mm
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">📊 예측 정확도</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.abs(correlation.value * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                상관도 기반 신뢰도
              </div>
            </div>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-gray-600 dark:text-gray-400 mb-1">평균 강수량</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {statistics.rainfallMean.toFixed(1)} mm
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-gray-600 dark:text-gray-400 mb-1">최대 강수량</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {statistics.rainfallMax.toFixed(1)} mm
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-gray-600 dark:text-gray-400 mb-1">평균 수위</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {statistics.waterLevelMean.toFixed(2)} m
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-gray-600 dark:text-gray-400 mb-1">최대 수위</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {statistics.waterLevelMax.toFixed(2)} m
            </div>
          </div>
        </div>

        {/* 분석 정보 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          데이터 출처: 기상청 API, 한강홍수통제소 API • 10분마다 자동 갱신
          <br />
          피어슨 상관계수 및 단순 선형 회귀 분석 적용
        </div>
      </div>
    </WidgetCard>
  );
};

export default WeatherRiverCorrelationWidget;
