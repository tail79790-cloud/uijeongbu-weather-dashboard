/**
 * District Comparison Widget
 * 의정부시 8개 행정구역 날씨 비교 대시보드
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DISTRICTS,
  generateSummary,
  prepareHeatmapData,
  validateData,
  getWeatherEmoji
} from '../../utils/districtComparator';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';

const WORKER_BASE_URL = import.meta.env.VITE_WORKER_API_URL || 'https://weather-bot.seunghyeonkim.workers.dev';

/**
 * 8개 행정구역 날씨 조회 (Cloudflare Worker API)
 */
async function fetchDistrictsWeather() {
  try {
    const url = `${WORKER_BASE_URL}/api/districts/weather`;
    console.log(`[districtApi] Fetching districts weather from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'API 응답 오류');
    }

    console.log(`[districtApi] Districts data:`, result.data);

    return {
      success: true,
      data: result.data,
      message: '행정구역 날씨 조회 성공'
    };
  } catch (error) {
    console.error(`[districtApi] Error:`, error);

    // Development 모드에서는 목 데이터 반환
    if (import.meta.env.DEV) {
      console.warn('[districtApi] Using mock data in development mode');

      const mockDistricts = Object.values(DISTRICTS).map(district => ({
        district: district.name,
        lat: district.lat,
        lon: district.lon,
        weather: {
          temp: 15 + Math.random() * 10, // 15-25°C
          humidity: 50 + Math.random() * 30, // 50-80%
          windSpeed: 1 + Math.random() * 3, // 1-4 m/s
          precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0, // 30% 확률로 강수
          description: ['맑음', '구름 조금', '흐림'][Math.floor(Math.random() * 3)]
        }
      }));

      return {
        success: true,
        data: mockDistricts,
        message: '목 데이터 (개발 모드)'
      };
    }

    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

const DistrictComparisonWidget = () => {
  const [selectedMetric, setSelectedMetric] = useState('temp'); // temp, humidity, wind, precipitation

  // 행정구역 날씨 조회 (5분마다 자동 갱신)
  const {
    data: districtsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['districtsWeather'],
    queryFn: fetchDistrictsWeather,
    refetchInterval: 5 * 60 * 1000, // 5분
    staleTime: 4 * 60 * 1000,
    retry: 2
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard title="🗺️ 행정구역 날씨 비교">
        <WidgetLoader message="행정구역 날씨를 불러오는 중..." />
      </WidgetCard>
    );
  }

  // 에러 상태
  if (isError || !districtsData?.success) {
    return (
      <WidgetCard title="🗺️ 행정구역 날씨 비교">
        <WidgetError
          message={error?.message || districtsData?.message || '날씨 데이터를 불러올 수 없습니다.'}
          onRetry={refetch}
        />
      </WidgetCard>
    );
  }

  const districts = districtsData.data || [];
  const dataValidation = validateData(districts);

  // 데이터 분석
  const summary = generateSummary(districts);
  const heatmapData = prepareHeatmapData(districts, selectedMetric);

  // 측정 항목 라벨
  const metricLabels = {
    temp: '온도',
    humidity: '습도',
    wind: '풍속',
    precipitation: '강수량'
  };

  return (
    <WidgetCard
      title="🗺️ 의정부시 행정구역 날씨 비교"
      subtitle={`8개 동 실시간 날씨 (${dataValidation.validCount}/${dataValidation.totalCount} 유효)`}
      action={<RefreshButton onRefresh={refetch} />}
    >
      <div className="space-y-6">
        {/* 측정 항목 선택 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(metricLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedMetric === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 히트맵 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heatmapData.map((item) => (
            <div
              key={item.district}
              className="p-4 rounded-lg border-2 transition-transform hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: item.color,
                borderColor: item.color,
                color: selectedMetric === 'temp' && item.value > 20 ? 'white' : '#1f2937'
              }}
            >
              <div className="text-sm font-medium mb-1">{item.district}</div>
              <div className="text-2xl font-bold">{item.formattedValue}</div>
              {/* 날씨 아이콘 (온도 선택 시만 표시) */}
              {selectedMetric === 'temp' && (
                <div className="text-lg mt-1">
                  {getWeatherEmoji(
                    districts.find(d => d.district === item.district)?.weather?.description
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 요약 통계 */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            📊 요약 통계
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">평균 온도:</span>
              <span className="ml-2 font-medium">{summary.avgTemp.toFixed(1)}°C</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">평균 습도:</span>
              <span className="ml-2 font-medium">{summary.avgHumidity.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">평균 풍속:</span>
              <span className="ml-2 font-medium">{summary.avgWind.toFixed(1)} m/s</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">온도 범위:</span>
              <span className="ml-2 font-medium">
                {summary.tempRange.min.toFixed(1)}°C ~ {summary.tempRange.max.toFixed(1)}°C
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">총 강수량:</span>
              <span className="ml-2 font-medium">{summary.totalPrecipitation.toFixed(1)} mm</span>
            </div>
          </div>
        </div>

        {/* 극값 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 온도 극값 */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🌡️ 온도 극값
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-red-600 dark:text-red-400">🔥 가장 더운 곳:</span>
                <span className="font-medium">{summary.extremes.hottestDistrict || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 dark:text-blue-400">❄️ 가장 추운 곳:</span>
                <span className="font-medium">{summary.extremes.coldestDistrict || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 습도/풍속 극값 */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              💧 습도 & 풍속
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 dark:text-blue-400">💧 가장 습한 곳:</span>
                <span className="font-medium">{summary.extremes.mostHumidDistrict || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400">🌬️ 가장 바람 강한 곳:</span>
                <span className="font-medium">{summary.extremes.windiestDistrict || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 테이블 (모바일에서는 숨김) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">행정구역</th>
                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">온도</th>
                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">습도</th>
                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">풍속</th>
                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">강수량</th>
                <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">날씨</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {districts.map((district) => {
                const weather = district.weather;
                return (
                  <tr key={district.district} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                      {district.district}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                      {weather ? `${weather.temp.toFixed(1)}°C` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                      {weather ? `${weather.humidity.toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                      {weather ? `${(weather.wind || weather.windSpeed || 0).toFixed(1)} m/s` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                      {weather ? `${(weather.precipitation || weather.rain || 0).toFixed(1)} mm` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center text-xl">
                      {weather ? getWeatherEmoji(weather.description) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 데이터 출처 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          데이터 출처: 기상청 API, OpenWeather API • 5분마다 자동 갱신
        </div>
      </div>
    </WidgetCard>
  );
};

export default DistrictComparisonWidget;
