import { useQuery } from '@tanstack/react-query';
import { getMidTa, getMidLandFcst } from '../../services/kmaApi';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES } from '../../constants/designSystem';

const DayCard = ({ day, temp, weather }) => {
  const getWeatherIcon = (wf) => {
    if (!wf) return '🌤️';
    if (wf.includes('맑음')) return '☀️';
    if (wf.includes('구름')) return '⛅';
    if (wf.includes('흐림')) return '☁️';
    if (wf.includes('비')) return '🌧️';
    if (wf.includes('눈')) return '❄️';
    return '🌤️';
  };

  // 유효한 날짜인지 확인
  const isValidDate = day && !isNaN(new Date(day).getTime());

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="text-center mb-2">
        <div className="text-sm font-semibold text-gray-700">
          {isValidDate ? format(day, 'MM/dd') : '-'}
        </div>
        <div className="text-xs text-gray-500">
          {isValidDate ? format(day, 'EEE', { locale: ko }) : '-'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs mb-2">
        <div>
          <div className="text-2xl">{getWeatherIcon(weather?.am)}</div>
          <div className="text-gray-500">오전</div>
          {weather?.popAm !== undefined && (
            <div className="text-blue-600">{weather.popAm}%</div>
          )}
        </div>
        <div>
          <div className="text-2xl">{getWeatherIcon(weather?.pm)}</div>
          <div className="text-gray-500">오후</div>
          {weather?.popPm !== undefined && (
            <div className="text-blue-600">{weather.popPm}%</div>
          )}
        </div>
      </div>

      <div className="flex justify-between text-sm pt-2 border-t">
        <span className="text-blue-500 font-semibold">
          {temp?.min !== undefined ? Math.round(temp.min) : '-'}°
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-red-500 font-semibold">
          {temp?.max !== undefined ? Math.round(temp.max) : '-'}°
        </span>
      </div>
    </div>
  );
};

const MidForecastWidget = () => {
  const { data: tempData, isLoading: tempLoading, error: tempError, refetch: tempRefetch } = useQuery({
    queryKey: ['midTa'],
    queryFn: () => getMidTa('11B00000'),
    refetchInterval: 6 * 60 * 60 * 1000,
    staleTime: 3 * 60 * 60 * 1000,
  });

  const { data: weatherData, isLoading: weatherLoading, error: weatherError, refetch: weatherRefetch } = useQuery({
    queryKey: ['midLandFcst'],
    queryFn: () => getMidLandFcst('11B00000'),
    refetchInterval: 6 * 60 * 60 * 1000,
    staleTime: 3 * 60 * 60 * 1000,
  });

  const isLoading = tempLoading || weatherLoading;
  const error = tempError || weatherError;
  const handleRefresh = () => {
    tempRefetch();
    weatherRefetch();
  };

  // 에러 상태
  if (error) {
    return (
      <WidgetCard
        title="📆 중기예보 (3~10일)"
        subtitle="하루 2회 발표"
        borderColor={WIDGET_BORDER_COLORS.INFO}
        headerAction={<RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />}
      >
        <WidgetError message="중기예보 데이터를 불러올 수 없습니다" onRetry={handleRefresh} />
      </WidgetCard>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard
        title="📆 중기예보 (3~10일)"
        subtitle="하루 2회 발표"
        borderColor={WIDGET_BORDER_COLORS.INFO}
      >
        <WidgetLoader message={LOADING_MESSAGES.FORECAST} />
      </WidgetCard>
    );
  }

  const tempFcst = tempData?.data || {};
  const weatherFcst = weatherData?.data || {};

  const days = [];
  for (let i = 3; i <= 10; i++) {
    days.push({
      date: addDays(new Date(), i),
      temp: {
        min: tempFcst[`taMin${i}`],
        max: tempFcst[`taMax${i}`]
      },
      weather: {
        am: weatherFcst[`wf${i}Am`],
        pm: weatherFcst[`wf${i}Pm`],
        popAm: weatherFcst[`rnSt${i}Am`],
        popPm: weatherFcst[`rnSt${i}Pm`]
      }
    });
  }

  return (
    <WidgetCard
      title="📆 중기예보 (3~10일)"
      subtitle="하루 2회 발표"
      borderColor={WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />}
    >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {days.map((day, idx) => (
            <DayCard key={idx} {...day} />
          ))}
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-xs text-yellow-800">
          <p>💡 <strong>참고:</strong> 중기예보는 3일 이후의 날씨로 변동 가능성이 있습니다.</p>
        </div>

        <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
          자동 갱신: 6시간마다 • 발표시각: 06시, 18시
        </div>
    </WidgetCard>
  );
};

export default MidForecastWidget;
