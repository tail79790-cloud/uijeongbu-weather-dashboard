/**
 * River Monitoring Widget
 * 하천 수위 실시간 모니터링 위젯
 * 신곡교/금신교 수위 데이터 시각화 및 위험도 분석
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { getUijeongbuWaterLevel, getWaterLevelSeries, UIJEONGBU_STATIONS, WATER_LEVEL_THRESHOLDS } from '../../services/hanRiverApi';
import { adaptSingleLevelData, adaptSeriesData, createRiverStations } from '../../utils/riverDataAdapter';
import {
  getRiskLevel,
  calculateRiskScore,
  analyzeTrend,
  getRecommendations,
  formatLevel,
  prepareChartData,
  calculateStatistics
} from '../../utils/riverLevelCalculator';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import RiskGauge from '../common/RiskGauge';

// hanRiverApi UIJEONGBU_STATIONS을 riverApi RIVER_STATIONS 형식으로 변환
const RIVER_STATIONS = createRiverStations(UIJEONGBU_STATIONS, WATER_LEVEL_THRESHOLDS);

// 수위 변화율 계산 (어댑터를 통해 변환된 데이터 사용)
function calculateLevelChangeRate(series) {
  if (!series || series.length < 2) return 0;

  // 최근 1시간 데이터 필터링 (6개 데이터포인트, 10분 간격)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentData = series.filter(d => d.timestamp >= oneHourAgo);

  if (recentData.length < 2) return 0;

  const firstLevel = recentData[0].level;  // 어댑터로 변환된 'level' 필드 사용
  const lastLevel = recentData[recentData.length - 1].level;
  const timeDiff = (recentData[recentData.length - 1].timestamp - recentData[0].timestamp) / (60 * 60 * 1000); // hours

  if (timeDiff === 0) return 0;

  return (lastLevel - firstLevel) / timeDiff;
}

const RiverMonitoringWidget = () => {
  const [selectedStation, setSelectedStation] = useState('1018665'); // 신곡교 기본 선택

  // 현재 수위 데이터 조회 (5분마다 자동 갱신)
  const {
    data: rawLevelData,
    isLoading: levelLoading,
    isError: levelError,
    error: levelErrorMsg,
    refetch: refetchLevel
  } = useQuery({
    queryKey: ['waterLevel', 'hanriver', selectedStation],
    queryFn: async () => {
      const result = await getUijeongbuWaterLevel(selectedStation);
      return adaptSingleLevelData(result); // 어댑터 적용
    },
    refetchInterval: 5 * 60 * 1000, // 5분
    staleTime: 4 * 60 * 1000, // 4분
    retry: 2
  });

  // 시계열 데이터 조회 (5분마다 자동 갱신)
  const {
    data: rawSeriesData,
    isLoading: seriesLoading,
    isError: seriesError,
    error: seriesErrorMsg,
    refetch: refetchSeries
  } = useQuery({
    queryKey: ['waterLevelSeries', 'hanriver', selectedStation],
    queryFn: async () => {
      const result = await getWaterLevelSeries(selectedStation, 3);
      return adaptSeriesData(result); // 어댑터 적용
    },
    refetchInterval: 5 * 60 * 1000, // 5분
    staleTime: 4 * 60 * 1000,
    retry: 2
  });

  // 어댑터를 통해 변환된 데이터 사용
  const levelData = rawLevelData;
  const seriesData = rawSeriesData;

  // 전체 새로고침
  const handleRefresh = () => {
    refetchLevel();
    refetchSeries();
  };

  // 로딩 상태
  if (levelLoading || seriesLoading) {
    return (
      <WidgetCard title="🌊 하천 수위 모니터링">
        <WidgetLoader message="수위 데이터를 불러오는 중..." />
      </WidgetCard>
    );
  }

  // 에러 상태
  if (levelError || seriesError) {
    return (
      <WidgetCard title="🌊 하천 수위 모니터링">
        <WidgetError
          message={levelErrorMsg?.message || seriesErrorMsg?.message || '수위 데이터를 불러올 수 없습니다.'}
          onRetry={handleRefresh}
        />
      </WidgetCard>
    );
  }

  // 데이터 추출
  const level = levelData?.data?.level || 0;
  const time = levelData?.data?.time;
  const series = seriesData?.data?.series || [];

  // 관측소 정보
  const station = Object.values(RIVER_STATIONS).find(s => s.id === selectedStation) || RIVER_STATIONS.SINGOK;
  const thresholds = station.thresholds;

  // 위험도 계산
  const changeRate = calculateLevelChangeRate(series);
  const riskLevel = getRiskLevel(level, thresholds);
  const riskScore = calculateRiskScore(level, changeRate, thresholds);
  const trend = analyzeTrend(series);
  const recommendations = getRecommendations(riskLevel);
  const statistics = calculateStatistics(series);

  // 차트 데이터 준비
  const { data: chartData, referenceLines } = prepareChartData(series, thresholds);

  // 관측소 변경 핸들러
  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
  };

  return (
    <WidgetCard
      title="🌊 하천 수위 실시간 모니터링"
      subtitle={`${station.name} (${station.location})`}
      action={<RefreshButton onRefresh={handleRefresh} />}
    >
      <div className="space-y-6">
        {/* 관측소 선택 */}
        <div className="flex gap-2">
          {Object.values(RIVER_STATIONS).map((s) => (
            <button
              key={s.id}
              onClick={() => handleStationChange(s.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStation === s.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* 현재 수위 및 위험도 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 현재 수위 카드 */}
          <div
            className={`p-6 rounded-xl border-2 ${riskLevel.bgColor} ${riskLevel.borderColor} ${riskLevel.darkBgColor} ${riskLevel.darkBorderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${riskLevel.textColor} ${riskLevel.darkTextColor}`}>
                현재 수위
              </h3>
              <span className="text-3xl">{riskLevel.icon}</span>
            </div>
            <div className={`text-5xl font-bold ${riskLevel.textColor} ${riskLevel.darkTextColor} mb-2`}>
              {formatLevel(level)}
            </div>
            <div className={`text-sm ${riskLevel.textColor} ${riskLevel.darkTextColor} mb-2`}>
              상태: {riskLevel.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {time ? new Date(time).toLocaleString('ko-KR') : '시간 정보 없음'}
            </div>
          </div>

          {/* 위험도 점수 카드 */}
          <div className="p-6 rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              위험도 점수
            </h3>
            <RiskGauge score={riskScore} />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">수위 추세:</span>
                <span className="font-medium">
                  {trend.trendIcon} {trend.trendLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">변화량:</span>
                <span className="font-medium">{trend.changeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">변화율:</span>
                <span className="font-medium">
                  {changeRate >= 0 ? '+' : ''}{changeRate.toFixed(3)} m/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 수위 추세 그래프 */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📈 최근 3시간 수위 변화
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="time"
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  label={{ value: '수위 (m)', angle: -90, position: 'insideLeft' }}
                  className="text-xs text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Legend />

                {/* 임계값 참조선 */}
                {referenceLines.map((line, index) => (
                  <ReferenceLine
                    key={index}
                    y={line.y}
                    label={{
                      value: line.label,
                      fill: line.stroke,
                      fontSize: 12,
                      position: 'right'
                    }}
                    stroke={line.stroke}
                    strokeDasharray={line.strokeDasharray}
                  />
                ))}

                {/* 수위 데이터 라인 */}
                <Line
                  type="monotone"
                  dataKey="수위"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              시계열 데이터가 없습니다.
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">최소</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatLevel(statistics.min)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">최대</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatLevel(statistics.max)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">평균</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatLevel(statistics.avg)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">데이터</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {statistics.dataPoints}개
            </div>
          </div>
        </div>

        {/* 권장 행동 사항 */}
        <div
          className={`p-4 rounded-lg border ${riskLevel.borderColor} ${riskLevel.bgColor} ${riskLevel.darkBgColor} ${riskLevel.darkBorderColor}`}
        >
          <h3 className={`text-sm font-semibold ${riskLevel.textColor} ${riskLevel.darkTextColor} mb-2`}>
            📋 권장 행동
          </h3>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className={`text-sm ${riskLevel.textColor} ${riskLevel.darkTextColor}`}
              >
                • {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* 임계값 정보 */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="font-semibold mb-1">수위 임계값 기준:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>🟢 정상: {formatLevel(thresholds.normal)} 미만</div>
            <div>🟡 주의: {formatLevel(thresholds.caution)} 이상</div>
            <div>🟠 경계: {formatLevel(thresholds.warning)} 이상</div>
            <div>🔴 위험: {formatLevel(thresholds.danger)} 이상</div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};

export default RiverMonitoringWidget;
