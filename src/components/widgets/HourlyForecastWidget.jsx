import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { getUltraSrtFcst, getVilageFcst } from '../../services/kmaApi';
import { formatKoreanTime } from '../../utils/dateFormatter';
import { useWidgetSize } from '../../hooks/useWidgetSize';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES } from '../../constants/designSystem';

// 시간별 예보 카드 컴포넌트
const HourlyCard = ({ forecast }) => {
  return (
    <div className="flex-shrink-0 w-24 bg-white dark:bg-gray-800 rounded-lg widget-padding border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="text-center">
        {/* 시간 */}
        <div className="widget-text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
          {formatKoreanTime(forecast.datetime, 'HH:mm')}
        </div>

        {/* 날씨 아이콘 */}
        <div className="text-3xl mb-2">
          {forecast.skyIcon}
        </div>

        {/* 기온 */}
        <div className="widget-text-lg font-bold text-gray-900 dark:text-white mb-1">
          {Math.round(forecast.temperature)}°
        </div>

        {/* 강수확률 */}
        {forecast.pop > 0 && (
          <div className="widget-text-sm text-blue-600 dark:text-blue-400 mb-1">
            💧 {forecast.pop}%
          </div>
        )}

        {/* 강수량 */}
        {forecast.rainfall && forecast.rainfall !== '강수없음' && (
          <div className="widget-text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
            {forecast.rainfall}
          </div>
        )}

        {/* 풍속 */}
        <div className="widget-text-sm text-gray-500 dark:text-gray-400">
          🌪️ {forecast.windSpeed.toFixed(1)}m/s
        </div>
      </div>
    </div>
  );
};

// 차트 툴팁
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          {formatKoreanTime(data.datetime, 'HH:mm')}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">기온:</span> {Math.round(data.temperature)}°C
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">강수확률:</span> {data.pop}%
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">습도:</span> {Math.round(data.humidity)}%
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">풍속:</span> {data.windSpeed.toFixed(1)}m/s
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// 메인 위젯
const HourlyForecastWidget = () => {
  const { size, chartHeight } = useWidgetSize('hourly-forecast');

  // 초단기예보 (6시간)
  const { data: ultraData, isLoading: ultraLoading, error: ultraError, refetch: ultraRefetch } = useQuery({
    queryKey: ['ultraSrtFcst'],
    queryFn: getUltraSrtFcst,
    refetchInterval: 10 * 60 * 1000, // 10분
    staleTime: 5 * 60 * 1000,
  });

  // 단기예보 (24시간)
  const { data: vilageData, isLoading: vilageLoading, error: vilageError, refetch: vilageRefetch } = useQuery({
    queryKey: ['vilageFcst'],
    queryFn: getVilageFcst,
    refetchInterval: 30 * 60 * 1000, // 30분
    staleTime: 15 * 60 * 1000,
  });

  const isLoading = ultraLoading || vilageLoading;
  const error = ultraError || vilageError;
  const handleRefresh = () => {
    ultraRefetch();
    vilageRefetch();
  };

  // 데이터 통합 (초단기 6시간 + 단기 24시간)
  const forecasts = (() => {
    const ultra = ultraData?.data || [];
    const vilage = vilageData?.data || [];

    // 초단기예보 우선, 이후 단기예보로 채우기
    const combined = [...ultra];
    const ultraEndTime = ultra.length > 0 ? ultra[ultra.length - 1].datetime.getTime() : 0;

    vilage.forEach(item => {
      if (item.datetime.getTime() > ultraEndTime) {
        combined.push(item);
      }
    });

    // 24시간까지만
    return combined.slice(0, 24);
  })();

  // 에러 상태
  if (error) {
    return (
      <WidgetCard
        title="📊 시간별 예보"
        subtitle="초단기 + 단기예보"
        borderColor={WIDGET_BORDER_COLORS.INFO}
        headerAction={<RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />}
      >
        <WidgetError message="예보 데이터를 불러올 수 없습니다" onRetry={handleRefresh} />
      </WidgetCard>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard
        title="📊 시간별 예보"
        subtitle="초단기 + 단기예보"
        borderColor={WIDGET_BORDER_COLORS.INFO}
      >
        <WidgetLoader message={LOADING_MESSAGES.FORECAST} />
      </WidgetCard>
    );
  }

  // 데이터 없음
  if (forecasts.length === 0) {
    return (
      <WidgetCard
        title="📊 시간별 예보"
        subtitle="초단기 + 단기예보"
        borderColor={WIDGET_BORDER_COLORS.INFO}
        headerAction={<RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />}
      >
        <div className="text-center py-12 text-gray-500">
          <p>예보 데이터가 없습니다</p>
        </div>
      </WidgetCard>
    );
  }

  // 차트 데이터 준비
  const chartData = forecasts.map(f => ({
    time: formatKoreanTime(f.datetime, 'HH:mm'),
    datetime: f.datetime,
    temperature: f.temperature,
    pop: f.pop,
    humidity: f.humidity,
    windSpeed: f.windSpeed
  }));

  return (
    <WidgetCard
      title="📊 시간별 예보 (24시간)"
      subtitle="초단기 + 단기예보"
      borderColor={WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />}
    >
      <div className="space-y-6">
        {/* 온도 그래프 */}
        <div>
          <h3 className="widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🌡️ 기온 변화</h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                domain={['dataMin - 2', 'dataMax + 2']}
                unit="°C"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 강수확률 그래프 - 중간 크기 이상에서 표시 */}
        {size !== 'small' && (
          <div>
            <h3 className="widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">💧 강수확률</h3>
            <ResponsiveContainer width="100%" height={Math.max(80, chartHeight * 0.6)}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pop"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#popGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        )}

        {/* 시간별 카드 스크롤 - 크기에 따라 표시 개수 조절 */}
        <div>
          <h3 className="widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">⏰ 시간별 상세</h3>
          <div className="overflow-x-auto">
            <div className="flex widget-gap pb-2">
              {forecasts.slice(0, size === 'small' ? 6 : size === 'medium' ? 9 : 12).map((forecast, index) => (
                <HourlyCard key={index} forecast={forecast} />
              ))}
            </div>
          </div>
        </div>

        {/* 마지막 업데이트 */}
        <div className="widget-text-sm text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          자동 갱신: 10분마다 • 마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
        </div>
      </div>
    </WidgetCard>
  );
};

export default HourlyForecastWidget;
