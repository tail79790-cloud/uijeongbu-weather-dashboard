import { memo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentWeather } from '../../services/openWeatherApi'
import { useWidgets } from '../../contexts/WidgetContext'
import { useWidgetSize } from '../../hooks/useWidgetSize'
import WidgetCard from '../common/WidgetCard'
import WidgetLoader from '../common/WidgetLoader'
import WidgetError from '../common/WidgetError'
import RefreshButton from '../common/RefreshButton'
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES, ERROR_MESSAGES } from '../../constants/designSystem'

// 의정부시 좌표
const UIJEONGBU_COORDS = {
  lat: 37.738,
  lon: 127.034
}

const CurrentWeather = memo(() => {
  const { refreshIntervals, updateLastRefresh } = useWidgets()
  const widgetId = 'current-weather'
  const { size } = useWidgetSize(widgetId)

  // React Query로 날씨 데이터 조회 (커스터마이징 가능한 인터벌)
  const { data: weatherResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['currentWeather', UIJEONGBU_COORDS.lat, UIJEONGBU_COORDS.lon],
    queryFn: () => getCurrentWeather(UIJEONGBU_COORDS.lat, UIJEONGBU_COORDS.lon),
    refetchInterval: refreshIntervals[widgetId] || 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: () => updateLastRefresh(widgetId)
  })

  const weatherData = weatherResponse?.data
  const hasError = !isLoading && (!weatherResponse?.success || error)

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard title="🌤️ 현재 날씨" borderColor={WIDGET_BORDER_COLORS.INFO}>
        <WidgetLoader message={LOADING_MESSAGES.WEATHER} />
      </WidgetCard>
    )
  }

  // 에러 상태
  if (hasError) {
    return (
      <WidgetCard title="🌤️ 현재 날씨" borderColor={WIDGET_BORDER_COLORS.DANGER}>
        <WidgetError
          message={error?.message || weatherResponse?.message || ERROR_MESSAGES.API}
          onRetry={refetch}
        />
      </WidgetCard>
    )
  }

  // 데이터 없음
  if (!weatherData) {
    return (
      <WidgetCard title="🌤️ 현재 날씨" borderColor={WIDGET_BORDER_COLORS.WARNING}>
        <WidgetError message={ERROR_MESSAGES.NO_DATA} />
      </WidgetCard>
    )
  }

  return (
    <WidgetCard
      title="🌤️ 현재 날씨"
      subtitle={`${weatherData.lastUpdate} 업데이트`}
      borderColor={WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >

      {/* 핵심 정보 - 항상 표시 */}
      <div className="flex items-center justify-between mb-4">
        <div className="widget-icon">
          {weatherData.skyIcon}
        </div>
        <div className="text-right">
          <div className="widget-temp font-bold text-gray-800 dark:text-white">
            {typeof weatherData.temperature === 'number' ? weatherData.temperature.toFixed(1) : weatherData.temperature}°C
          </div>
          <div className="widget-text-sm text-gray-600 dark:text-gray-300">
            {weatherData.sky}
          </div>
          {weatherData.feelsLike && (
            <div className="widget-text-sm text-gray-500 dark:text-gray-400">
              체감 {typeof weatherData.feelsLike === 'number' ? weatherData.feelsLike.toFixed(1) : weatherData.feelsLike}°C
            </div>
          )}
        </div>
      </div>

      {/* 기본 정보 - 중간 크기 이상에서 표시 */}
      {size !== 'small' && (
        <div className="grid grid-cols-2 widget-gap mb-4">
          <div className="text-center widget-padding bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="widget-text-sm text-gray-600 dark:text-gray-300">습도</div>
            <div className="widget-text-lg font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(weatherData.humidity)}%
            </div>
          </div>
          <div className="text-center widget-padding bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="widget-text-sm text-gray-600 dark:text-gray-300">풍속</div>
            <div className="widget-text-lg font-semibold text-green-600 dark:text-green-400">
              {typeof weatherData.windSpeed === 'number' ? weatherData.windSpeed.toFixed(1) : weatherData.windSpeed}m/s
            </div>
            {weatherData.windDirection && (
              <div className="widget-text-sm text-gray-500 dark:text-gray-400">
                {weatherData.windDirection}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 추가 정보 - 큰 크기에서만 표시 */}
      {size === 'large' && (weatherData.pressure || weatherData.visibility || weatherData.precipitation > 0) && (
        <div className="grid grid-cols-3 widget-gap mb-4">
          {weatherData.pressure && (
            <div className="text-center widget-padding bg-gray-50 dark:bg-gray-700 rounded">
              <div className="widget-text-sm text-gray-600 dark:text-gray-300">기압</div>
              <div className="font-semibold dark:text-white">{weatherData.pressure}hPa</div>
            </div>
          )}
          {weatherData.visibility && (
            <div className="text-center widget-padding bg-gray-50 dark:bg-gray-700 rounded">
              <div className="widget-text-sm text-gray-600 dark:text-gray-300">가시거리</div>
              <div className="font-semibold dark:text-white">{weatherData.visibility}km</div>
            </div>
          )}
          {weatherData.precipitation > 0 && (
            <div className="text-center widget-padding bg-blue-50 dark:bg-blue-900/30 rounded">
              <div className="widget-text-sm text-blue-600 dark:text-blue-400">강수량</div>
              <div className="font-semibold text-blue-700 dark:text-blue-300">{weatherData.precipitation.toFixed(1)}mm</div>
            </div>
          )}
        </div>
      )}

      {/* 일출/일몰 정보 - 큰 크기에서만 표시 */}
      {size === 'large' && (weatherData.sunrise || weatherData.sunset) && (
        <div className="grid grid-cols-2 widget-gap mb-4">
          {weatherData.sunrise && (
            <div className="text-center widget-padding bg-yellow-50 dark:bg-yellow-900/30 rounded">
              <div className="widget-text-sm text-yellow-600 dark:text-yellow-400">🌅 일출</div>
              <div className="font-semibold text-yellow-700 dark:text-yellow-300">{weatherData.sunrise}</div>
            </div>
          )}
          {weatherData.sunset && (
            <div className="text-center widget-padding bg-orange-50 dark:bg-orange-900/30 rounded">
              <div className="widget-text-sm text-orange-600 dark:text-orange-400">🌇 일몰</div>
              <div className="font-semibold text-orange-700 dark:text-orange-300">{weatherData.sunset}</div>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center widget-gap px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full widget-text-sm">
          <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></span>
          {weatherData.location ? `${weatherData.location} • ` : ''}실시간 업데이트
        </div>
      </div>
    </WidgetCard>
  )
})

CurrentWeather.displayName = 'CurrentWeather'

export default CurrentWeather