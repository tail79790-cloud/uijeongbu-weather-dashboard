import { useQuery } from '@tanstack/react-query';
import { getAirPollution } from '../../services/openWeatherApi';
import { useWidgetSize } from '../../hooks/useWidgetSize';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES } from '../../constants/designSystem';

const AQI_INFO = {
  1: { text: '매우 좋음', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  2: { text: '좋음', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  3: { text: '보통', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  4: { text: '나쁨', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  5: { text: '매우 나쁨', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
};

const AirQualityWidget = () => {
  const { size } = useWidgetSize('air-quality');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['airPollution'],
    queryFn: () => getAirPollution(37.738, 127.034),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <WidgetCard title="💨 대기질 정보" borderColor={WIDGET_BORDER_COLORS.DEFAULT}>
        <WidgetLoader message={LOADING_MESSAGES.AIR_QUALITY} />
      </WidgetCard>
    );
  }

  if (error || !data?.success) {
    return (
      <WidgetCard
        title="💨 대기질 정보"
        borderColor={WIDGET_BORDER_COLORS.DEFAULT}
        headerAction={<RefreshButton onRefresh={refetch} />}
      >
        <WidgetError
          message="대기질 데이터를 불러올 수 없습니다"
          onRetry={refetch}
        />
      </WidgetCard>
    );
  }

  const airData = data.data;
  const aqi = airData.aqi || 2;
  const aqiInfo = AQI_INFO[aqi] || AQI_INFO[2];

  return (
    <WidgetCard
      title="💨 대기질 정보"
      subtitle={airData.lastUpdate}
      borderColor={aqiInfo.border.includes('green') ? WIDGET_BORDER_COLORS.SUCCESS :
                   aqiInfo.border.includes('red') ? WIDGET_BORDER_COLORS.DANGER :
                   aqiInfo.border.includes('yellow') ? WIDGET_BORDER_COLORS.WARNING :
                   aqiInfo.border.includes('orange') ? WIDGET_BORDER_COLORS.ALERT :
                   WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >

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

        {/* 상세 정보 - 크기에 따라 표시되는 항목 조절 */}
        {size !== 'small' && (
          <div className="grid grid-cols-2 gap-3">
            {/* PM10 - medium 이상 */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">미세먼지 (PM10)</div>
              <div className="text-lg font-semibold text-gray-800">
                {Math.round(airData.pm10 || 0)}
              </div>
              <div className="text-xs text-gray-500">μg/m³</div>
            </div>

            {/* PM2.5 - medium 이상 */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">초미세먼지 (PM2.5)</div>
              <div className="text-lg font-semibold text-gray-800">
                {Math.round(airData.pm2_5 || 0)}
              </div>
              <div className="text-xs text-gray-500">μg/m³</div>
            </div>

            {/* O3, NO2 - large에서만 */}
            {size === 'large' && (
              <>
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
              </>
            )}
          </div>
        )}

        {/* 갱신 정보 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
            자동 갱신: 30분마다
          </div>
        )}
      </div>
    </WidgetCard>
  );
};

export default AirQualityWidget;
