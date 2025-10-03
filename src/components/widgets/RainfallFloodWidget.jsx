import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  getUijeongbuWaterLevel,
  WATER_LEVEL_THRESHOLDS
} from '../../services/hanRiverApi';
import RiskGauge from '../common/RiskGauge';
import RiskBadge from '../common/RiskBadge';
import RefreshButton from '../common/RefreshButton';
import { calculateRainfallRisk, calculateWaterLevelRisk } from '../../utils/riskCalculator';

// 아이콘 컴포넌트들
const RainIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const WaterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AlertIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L.072 16.5C-.697 17.333.25 19 1.79 19z" />
  </svg>
);

// 강수량 정보 컴포넌트
const RainfallInfo = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <RainIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>강수량 데이터가 없습니다</p>
      </div>
    );
  }

  const latest = data[0];
  const risk = calculateRainfallRisk({
    rainfall1h: latest.rainfall1h || 0,
    rainfall24h: latest.rainfall24h || 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RainIcon className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">강수량 정보</h4>
        </div>
        <RiskBadge level={risk.level} text={risk.text} icon="💧" />
      </div>

      {/* 강수량 게이지 추가 */}
      <RiskGauge
        value={latest.rainfall24h || 0}
        max={250}
        level={risk.level}
        label="24시간 누적"
        showValues={true}
        showPercent={false}
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="weather-value-large text-blue-600">{latest.rainfall1h}mm</div>
            <div className="weather-label">1시간</div>
          </div>
          <div className="text-center">
            <div className="weather-value-large text-blue-600">{latest.rainfall24h}mm</div>
            <div className="weather-label">24시간</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-700">{latest.rainfall3h}mm</div>
            <div className="text-xs text-gray-500">3시간</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{latest.rainfall6h}mm</div>
            <div className="text-xs text-gray-500">6시간</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-700">{latest.rainfall12h}mm</div>
            <div className="text-xs text-gray-500">12시간</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>{latest.stationName}</span>
        <span>{latest.measureTime}</span>
      </div>
    </div>
  );
};

// 수위 정보 컴포넌트
const WaterLevelInfo = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-4 text-gray-500">
        <WaterIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>수위 데이터가 없습니다</p>
      </div>
    );
  }

  const risk = calculateWaterLevelRisk({
    current: data.waterLevel,
    watch: WATER_LEVEL_THRESHOLDS.ATTENTION,
    caution: WATER_LEVEL_THRESHOLDS.CAUTION,
    danger: WATER_LEVEL_THRESHOLDS.DANGER,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WaterIcon className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">수위 정보</h4>
        </div>
        <RiskBadge level={data.status.level} text={data.status.text} icon="🌊" />
      </div>

      {/* 수위 게이지 */}
      <RiskGauge
        value={data.waterLevel}
        max={WATER_LEVEL_THRESHOLDS.DANGER}
        level={data.status.level}
        label="현재 수위"
        showValues={true}
        showPercent={true}
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="weather-value-large text-blue-600">{data.waterLevel.toFixed(2)}m</div>
          <div className="weather-label">{data.status.text} ({data.status.description})</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">홍수위 (심각)</span>
            <span className="text-sm font-medium text-red-600">{WATER_LEVEL_THRESHOLDS.DANGER.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">경계수위 (위험)</span>
            <span className="text-sm font-medium text-orange-600">{WATER_LEVEL_THRESHOLDS.WARNING.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">주의수위 (경보)</span>
            <span className="text-sm font-medium text-yellow-600">{WATER_LEVEL_THRESHOLDS.CAUTION.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">관심수위</span>
            <span className="text-sm font-medium text-blue-600">{WATER_LEVEL_THRESHOLDS.ATTENTION.toFixed(2)}m</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">경보까지 여유</span>
            <span className="text-sm font-semibold text-blue-700">{data.remainingToWarning}m</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-700">유량</span>
            <span className="text-sm font-semibold text-blue-700">{data.flowRate.toFixed(2)}㎥/s</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>{data.stationName} ({data.location})</span>
        <span>{data.observedAt}</span>
      </div>
    </div>
  );
};

// 홍수 특보 컴포넌트
const FloodWarning = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-800 font-medium">현재 홍수 특보가 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.slice(0, 3).map((warning, index) => (
        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertIcon className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-800 font-medium">{warning.title || '홍수 특보'}</span>
            </div>
            <span className="text-xs text-red-600">{warning.date}</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{warning.content}</p>
        </div>
      ))}
    </div>
  );
};

// 메인 위젯 컴포넌트
const RainfallFloodWidget = () => {
  const [selectedStation, setSelectedStation] = useState('singok');

  // 신곡교 수위 데이터
  const { data: singokData, isLoading: singokLoading, error: singokError, refetch: refetchSingok } = useQuery({
    queryKey: ['water-level', 'singok'],
    queryFn: () => getUijeongbuWaterLevel('1018665'),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  // 금신교 수위 데이터
  const { data: geumshinData, isLoading: geumshinLoading, error: geumshinError, refetch: refetchGeumshin } = useQuery({
    queryKey: ['water-level', 'geumshin'],
    queryFn: () => getUijeongbuWaterLevel('1018666'),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = singokLoading || geumshinLoading;
  const error = singokError || geumshinError;
  const refetch = () => {
    refetchSingok();
    refetchGeumshin();
  };

  const waterData = selectedStation === 'singok' ? singokData : geumshinData;

  if (error) {
    return (
      <div className="weather-card status-danger">
        <div className="weather-card-header">
          <span>강수량 & 홍수 정보</span>
          <RefreshButton onRefresh={refetch} isLoading={isLoading} />
        </div>
        <div className="text-center py-8 text-red-600">
          <AlertIcon className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium">데이터를 불러올 수 없습니다</p>
          <p className="text-sm mt-2">{error.message}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <span>중랑천 수위 정보</span>
        <RefreshButton onRefresh={refetch} isLoading={isLoading} />
      </div>

      <div className="space-y-6">
        {/* 관측소 선택 탭 */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setSelectedStation('singok')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedStation === 'singok'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            신곡교
          </button>
          <button
            onClick={() => setSelectedStation('geumshin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedStation === 'geumshin'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            금신교
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">수위 데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <WaterLevelInfo data={waterData?.success ? waterData.data : null} />
          )}
        </div>

        {/* 마지막 업데이트 시간 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t dark:border-gray-700 pt-4">
          마지막 업데이트: {format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
        </div>
      </div>
    </div>
  );
};

export default RainfallFloodWidget;