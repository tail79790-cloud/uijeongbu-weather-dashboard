import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentWeather } from '../../services/openWeatherApi'

// 의정부시 좌표
const UIJEONGBU_COORDS = {
  lat: 37.738,
  lon: 127.034
}

function CurrentWeather() {
  // React Query로 날씨 데이터 조회 (5분마다 자동 새로고침)
  const { data: weatherResponse, isLoading, error } = useQuery({
    queryKey: ['currentWeather', UIJEONGBU_COORDS.lat, UIJEONGBU_COORDS.lon],
    queryFn: () => getCurrentWeather(UIJEONGBU_COORDS.lat, UIJEONGBU_COORDS.lon),
    refetchInterval: 5 * 60 * 1000, // 5분마다 새로고침
    staleTime: 4 * 60 * 1000, // 4분간 데이터를 fresh로 간주
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  const weatherData = weatherResponse?.data
  const hasError = !isLoading && (!weatherResponse?.success || error)

  if (isLoading) {
    return (
      <div className="weather-card animate-pulse">
        <div className="weather-card-header">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          <div className="text-right">
            <div className="h-12 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 처리
  if (hasError) {
    return (
      <div className="weather-card border-l-4 border-red-400">
        <div className="weather-card-header">
          ⚠️ 날씨 정보 오류
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">날씨 데이터를 가져올 수 없습니다</p>
          <p className="text-sm text-gray-400">
            {error?.message || weatherResponse?.message || '알 수 없는 오류'}
          </p>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (!weatherData) {
    return (
      <div className="weather-card border-l-4 border-yellow-400">
        <div className="weather-card-header">
          📡 데이터 없음
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">날씨 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="weather-card border-l-4 border-blue-400">
      <div className="weather-card-header">
        🌤️ 현재 날씨
        <span className="text-xs text-gray-500 font-normal">
          {weatherData.lastUpdate} 업데이트
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-6xl">
          {weatherData.skyIcon}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-800">
            {typeof weatherData.temperature === 'number' ? weatherData.temperature.toFixed(1) : weatherData.temperature}°C
          </div>
          <div className="text-sm text-gray-600">
            {weatherData.sky}
          </div>
          {weatherData.feelsLike && (
            <div className="text-xs text-gray-500">
              체감 {typeof weatherData.feelsLike === 'number' ? weatherData.feelsLike.toFixed(1) : weatherData.feelsLike}°C
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">습도</div>
          <div className="text-xl font-semibold text-blue-600">
            {Math.round(weatherData.humidity)}%
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">풍속</div>
          <div className="text-xl font-semibold text-green-600">
            {typeof weatherData.windSpeed === 'number' ? weatherData.windSpeed.toFixed(1) : weatherData.windSpeed}m/s
          </div>
          {weatherData.windDirection && (
            <div className="text-xs text-gray-500">
              {weatherData.windDirection}
            </div>
          )}
        </div>
      </div>

      {/* 추가 정보 */}
      {(weatherData.pressure || weatherData.visibility || weatherData.precipitation > 0) && (
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          {weatherData.pressure && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600">기압</div>
              <div className="font-semibold">{weatherData.pressure}hPa</div>
            </div>
          )}
          {weatherData.visibility && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs text-gray-600">가시거리</div>
              <div className="font-semibold">{weatherData.visibility}km</div>
            </div>
          )}
          {weatherData.precipitation > 0 && (
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-600">강수량</div>
              <div className="font-semibold text-blue-700">{weatherData.precipitation.toFixed(1)}mm</div>
            </div>
          )}
        </div>
      )}

      {/* 일출/일몰 정보 */}
      {(weatherData.sunrise || weatherData.sunset) && (
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          {weatherData.sunrise && (
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-xs text-yellow-600">🌅 일출</div>
              <div className="font-semibold text-yellow-700">{weatherData.sunrise}</div>
            </div>
          )}
          {weatherData.sunset && (
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-xs text-orange-600">🌅 일몰</div>
              <div className="font-semibold text-orange-700">{weatherData.sunset}</div>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          {weatherData.location ? `${weatherData.location} • ` : ''}실시간 업데이트
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather