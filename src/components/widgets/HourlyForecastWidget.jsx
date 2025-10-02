import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getUltraSrtFcst, getVilageFcst } from '../../services/kmaApi';
import { formatKoreanTime } from '../../utils/dateFormatter';

// 시간별 예보 카드 컴포넌트
const HourlyCard = ({ forecast }) => {
  return (
    <div className="flex-shrink-0 w-24 bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-center">
        {/* 시간 */}
        <div className="text-xs font-semibold text-gray-600 mb-2">
          {formatKoreanTime(forecast.datetime, 'HH:mm')}
        </div>

        {/* 날씨 아이콘 */}
        <div className="text-3xl mb-2">
          {forecast.skyIcon}
        </div>

        {/* 기온 */}
        <div className="text-lg font-bold text-gray-900 mb-1">
          {Math.round(forecast.temperature)}°
        </div>

        {/* 강수확률 */}
        {forecast.pop > 0 && (
          <div className="text-xs text-blue-600 mb-1">
            💧 {forecast.pop}%
          </div>
        )}

        {/* 강수량 */}
        {forecast.rainfall && forecast.rainfall !== '강수없음' && (
          <div className="text-xs text-blue-700 font-medium mb-1">
            {forecast.rainfall}
          </div>
        )}

        {/* 풍속 */}
        <div className="text-xs text-gray-500">
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
  // 초단기예보 (6시간)
  const { data: ultraData, isLoading: ultraLoading } = useQuery({
    queryKey: ['ultraSrtFcst'],
    queryFn: getUltraSrtFcst,
    refetchInterval: 10 * 60 * 1000, // 10분
    staleTime: 5 * 60 * 1000,
  });

  // 단기예보 (24시간)
  const { data: vilageData, isLoading: vilageLoading } = useQuery({
    queryKey: ['vilageFcst'],
    queryFn: getVilageFcst,
    refetchInterval: 30 * 60 * 1000, // 30분
    staleTime: 15 * 60 * 1000,
  });

  const isLoading = ultraLoading || vilageLoading;

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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="weather-card">
        <div className="weather-card-header">📊 시간별 예보</div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">예보 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (forecasts.length === 0) {
    return (
      <div className="weather-card">
        <div className="weather-card-header">📊 시간별 예보</div>
        <div className="text-center py-12 text-gray-500">
          <p>예보 데이터가 없습니다</p>
        </div>
      </div>
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
    <div className="weather-card">
      <div className="weather-card-header">
        <span>📊 시간별 예보 (24시간)</span>
        <span className="text-xs text-gray-500 font-normal">
          초단기 + 단기예보
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* 온도 그래프 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🌡️ 기온 변화</h3>
          <ResponsiveContainer width="100%" height={150}>
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

        {/* 강수확률 그래프 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💧 강수확률</h3>
          <ResponsiveContainer width="100%" height={100}>
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

        {/* 시간별 카드 스크롤 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⏰ 시간별 상세</h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {forecasts.slice(0, 12).map((forecast, index) => (
                <HourlyCard key={index} forecast={forecast} />
              ))}
            </div>
          </div>
        </div>

        {/* 마지막 업데이트 */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          자동 갱신: 10분마다 • 마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecastWidget;
