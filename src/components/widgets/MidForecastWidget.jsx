import { useQuery } from '@tanstack/react-query';
import { getMidTa, getMidLandFcst } from '../../services/kmaApi';
import { addDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

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

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="text-center mb-2">
        <div className="text-sm font-semibold text-gray-700">
          {format(day, 'MM/dd')}
        </div>
        <div className="text-xs text-gray-500">
          {format(day, 'EEE', { locale: ko })}
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
        <span className="text-blue-500 font-semibold">{Math.round(temp?.min)}°</span>
        <span className="text-gray-400">/</span>
        <span className="text-red-500 font-semibold">{Math.round(temp?.max)}°</span>
      </div>
    </div>
  );
};

const MidForecastWidget = () => {
  const { data: tempData, isLoading: tempLoading } = useQuery({
    queryKey: ['midTa'],
    queryFn: () => getMidTa('11B00000'),
    refetchInterval: 6 * 60 * 60 * 1000,
    staleTime: 3 * 60 * 60 * 1000,
  });

  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['midLandFcst'],
    queryFn: () => getMidLandFcst('11B00000'),
    refetchInterval: 6 * 60 * 60 * 1000,
    staleTime: 3 * 60 * 60 * 1000,
  });

  const isLoading = tempLoading || weatherLoading;

  if (isLoading) {
    return (
      <div className="weather-card">
        <div className="weather-card-header">📆 중기예보 (3~10일)</div>
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
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
    <div className="weather-card">
      <div className="weather-card-header">
        <span>📆 중기예보 (3~10일)</span>
        <span className="text-xs text-gray-500 font-normal">
          하루 2회 발표
        </span>
      </div>

      <div className="p-4">
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
      </div>
    </div>
  );
};

export default MidForecastWidget;
