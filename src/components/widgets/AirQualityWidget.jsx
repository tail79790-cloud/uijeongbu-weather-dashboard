import { useQuery } from '@tanstack/react-query';
import { getAirPollution } from '../../services/openWeatherApi';

const AQI_INFO = {
  1: { text: '매우 좋음', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  2: { text: '좋음', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  3: { text: '보통', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  4: { text: '나쁨', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  5: { text: '매우 나쁨', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
};

const AirQualityWidget = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['airPollution'],
    queryFn: () => getAirPollution(37.738, 127.034),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="weather-card">
        <div className="weather-card-header">💨 대기질 정보</div>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="weather-card border-l-4 border-gray-400">
        <div className="weather-card-header">💨 대기질 정보</div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">대기질 데이터를 불러올 수 없습니다</p>
          <p className="text-xs mt-2">OpenWeatherMap API 키 필요</p>
        </div>
      </div>
    );
  }

  const airData = data.data;
  const aqi = airData.aqi || 2;
  const aqiInfo = AQI_INFO[aqi] || AQI_INFO[2];

  return (
    <div className={`weather-card border-l-4 ${aqiInfo.border}`}>
      <div className="weather-card-header">
        <span>💨 대기질 정보</span>
        <span className="text-xs text-gray-500 font-normal">
          {airData.lastUpdate}
        </span>
      </div>

      <div className="p-4">
        {/* 종합 대기질 지수 */}
        <div className={`${aqiInfo.bg} rounded-lg p-4 mb-4 border ${aqiInfo.border}`}>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">종합 대기질 지수</div>
            <div className={`text-3xl font-bold ${aqiInfo.color}`}>
              {aqiInfo.text}
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">미세먼지 (PM10)</div>
            <div className="text-lg font-semibold text-gray-800">
              {Math.round(airData.pm10 || 0)}
            </div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">초미세먼지 (PM2.5)</div>
            <div className="text-lg font-semibold text-gray-800">
              {Math.round(airData.pm2_5 || 0)}
            </div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">오존 (O₃)</div>
            <div className="text-lg font-semibold text-gray-800">
              {Math.round(airData.o3 || 0)}
            </div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">이산화질소 (NO₂)</div>
            <div className="text-lg font-semibold text-gray-800">
              {Math.round(airData.no2 || 0)}
            </div>
            <div className="text-xs text-gray-500">μg/m³</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
          자동 갱신: 30분마다
        </div>
      </div>
    </div>
  );
};

export default AirQualityWidget;
