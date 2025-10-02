import { useQuery } from '@tanstack/react-query';
import { getVilageFcst } from '../../services/kmaApi';
import { formatKoreanDate } from '../../utils/dateFormatter';
import { startOfDay, addDays, isSameDay } from 'date-fns';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES } from '../../constants/designSystem';

// 일별 예보 카드
const DayCard = ({ day }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* 날짜 */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-gray-900">
          {formatKoreanDate(day.date, 'MM월 dd일')}
        </div>
        <div className="text-sm text-gray-600">
          {formatKoreanDate(day.date, 'EEEE')}
        </div>
      </div>

      {/* 날씨 아이콘 */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">
          {day.icon}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {day.condition}
        </div>
      </div>

      {/* 기온 */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">최고</div>
          <div className="text-2xl font-bold text-red-500">
            {Math.round(day.tempMax)}°
          </div>
        </div>
        <div className="text-gray-300 text-2xl">/</div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">최저</div>
          <div className="text-2xl font-bold text-blue-500">
            {Math.round(day.tempMin)}°
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-2 border-t pt-3">
        {/* 강수확률 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">💧 강수확률</span>
          <span className="font-semibold text-blue-600">
            {day.pop}%
          </span>
        </div>

        {/* 강수량 */}
        {day.rainfall && day.rainfall !== '강수없음' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">🌧️ 예상 강수량</span>
            <span className="font-semibold text-blue-700">
              {day.rainfall}
            </span>
          </div>
        )}

        {/* 습도 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">💨 평균 습도</span>
          <span className="font-semibold text-gray-700">
            {Math.round(day.humidity)}%
          </span>
        </div>

        {/* 풍속 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🌪️ 평균 풍속</span>
          <span className="font-semibold text-gray-700">
            {day.windSpeed.toFixed(1)}m/s
          </span>
        </div>
      </div>

      {/* 한줄 요약 */}
      {day.summary && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 text-center">
          {day.summary}
        </div>
      )}
    </div>
  );
};

// 메인 위젯
const DailyForecastWidget = () => {
  // 단기예보 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vilageFcst'],
    queryFn: getVilageFcst,
    refetchInterval: 30 * 60 * 1000, // 30분
    staleTime: 15 * 60 * 1000,
  });

  // 에러 상태
  if (error) {
    return (
      <WidgetCard
        title="📅 3일간 예보"
        subtitle="단기예보 기반"
        borderColor={WIDGET_BORDER_COLORS.DANGER}
        headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
      >
        <WidgetError message="예보 데이터를 불러올 수 없습니다" onRetry={refetch} />
      </WidgetCard>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard
        title="📅 3일간 예보"
        subtitle="단기예보 기반"
        borderColor={WIDGET_BORDER_COLORS.INFO}
      >
        <WidgetLoader message={LOADING_MESSAGES.FORECAST} />
      </WidgetCard>
    );
  }

  const forecasts = data?.data || [];

  // 데이터 없음
  if (forecasts.length === 0) {
    return (
      <WidgetCard
        title="📅 3일간 예보"
        subtitle="단기예보 기반"
        borderColor={WIDGET_BORDER_COLORS.INFO}
        headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
      >
        <div className="text-center py-12 text-gray-500">
          <p>예보 데이터가 없습니다</p>
        </div>
      </WidgetCard>
    );
  }

  // 일별 데이터 집계
  const dailyData = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < 3; i++) {
    const targetDate = addDays(today, i);
    const dayForecasts = forecasts.filter(f =>
      isSameDay(f.datetime, targetDate)
    );

    if (dayForecasts.length > 0) {
      // 최고/최저 기온 찾기
      let tempMax = dayForecasts[0].tempMax;
      let tempMin = dayForecasts[0].tempMin;

      // TMX, TMN이 없으면 TMP에서 계산
      if (!tempMax || !tempMin) {
        const temps = dayForecasts.map(f => f.temperature);
        tempMax = Math.max(...temps);
        tempMin = Math.min(...temps);
      }

      // 대표 날씨 (낮 12시 기준, 없으면 중간값)
      const noonForecast = dayForecasts.find(f =>
        f.datetime.getHours() === 12
      ) || dayForecasts[Math.floor(dayForecasts.length / 2)];

      // 평균값 계산
      const avgHumidity = dayForecasts.reduce((sum, f) => sum + f.humidity, 0) / dayForecasts.length;
      const avgWindSpeed = dayForecasts.reduce((sum, f) => sum + f.windSpeed, 0) / dayForecasts.length;
      const maxPop = Math.max(...dayForecasts.map(f => f.pop));

      // 강수량 (가장 많은 시간대)
      const rainfalls = dayForecasts.map(f => f.rainfall).filter(r => r && r !== '강수없음');
      const rainfall = rainfalls.length > 0 ? rainfalls[0] : '강수없음';

      // 한줄 요약
      let summary = '';
      if (maxPop >= 60) {
        summary = '우산을 챙기세요';
      } else if (tempMax >= 30) {
        summary = '더운 날씨, 수분 섭취 필수';
      } else if (tempMin <= 0) {
        summary = '영하 날씨, 방한 준비';
      } else if (avgWindSpeed >= 10) {
        summary = '바람이 강하게 붑니다';
      } else {
        summary = '쾌적한 날씨 예상';
      }

      dailyData.push({
        date: targetDate,
        tempMax,
        tempMin,
        icon: noonForecast.skyIcon,
        condition: noonForecast.skyText,
        pop: maxPop,
        rainfall,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        summary
      });
    }
  }

  return (
    <WidgetCard
      title="📅 3일간 예보"
      subtitle="단기예보 기반"
      borderColor={WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >
        {dailyData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {dailyData.map((day, index) => (
                <DayCard key={index} day={day} />
              ))}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <span className="font-semibold">예보 안내:</span> 기상 상황은 수시로 변할 수 있습니다.
                외출 전 최신 예보를 확인하세요.
              </p>
            </div>

            {/* 마지막 업데이트 */}
            <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
              자동 갱신: 30분마다 • 마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>3일 예보 데이터를 처리할 수 없습니다</p>
          </div>
        )}
    </WidgetCard>
  );
};

export default DailyForecastWidget;
