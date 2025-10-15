import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  getUijeongbuWaterLevel,
  WATER_LEVEL_THRESHOLDS
} from '../../services/hanRiverApi';
import { useWidgetSize } from '../../hooks/useWidgetSize';
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
const WaterLevelInfo = ({ data, size = 'large' }) => {
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

      {/* 수위 게이지 - medium 이상에서만 표시 */}
      {size !== 'small' && (
        <RiskGauge
          value={data.waterLevel}
          max={WATER_LEVEL_THRESHOLDS.DANGER}
          level={data.status.level}
          label="현재 수위"
          showValues={true}
          showPercent={true}
        />
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-4">
          {data.waterLevel === 0 ? (
            <>
              <div className={`${size === 'small' ? 'text-2xl' : 'weather-value-large'} text-gray-400`}>측정 중</div>
              {size !== 'small' && <div className="weather-label text-gray-500">실시간 데이터 갱신 대기 중</div>}
            </>
          ) : (
            <>
              <div className={`${size === 'small' ? 'text-3xl' : 'weather-value-large'} text-blue-600`}>
                {data.waterLevel.toFixed(2)}m
              </div>
              <div className="weather-label">{data.status.text}</div>
              {size !== 'small' && <div className="text-xs text-gray-500">({data.status.description})</div>}
            </>
          )}
        </div>

        {/* 임계값 정보 - medium 이상에서만 표시 */}
        {size !== 'small' && (
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
        )}

        {/* 추가 정보 - large에서만 표시 */}
        {size === 'large' && (
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
        )}
      </div>

      {/* 관측소 정보 - medium 이상에서만 표시 */}
      {size !== 'small' && (
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>{data.stationName} ({data.location})</span>
          <span>{data.observedAt}</span>
        </div>
      )}

      {/* 데이터 출처 표시 - large에서만 표시 */}
      {size === 'large' && data.source && data.source !== 'HAN_RIVER_API' && (
        <div className="mt-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center text-xs text-yellow-800">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {data.source === 'WAMIS' && '※ WAMIS 크롤링 데이터 (한강 API 장애 시 대체)'}
            </span>
          </div>
        </div>
      )}
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
  const { size } = useWidgetSize('rainfall-flood');
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

  // 에러 상태 상세 정보
  const errorInfo = singokError || geumshinError;
  const errorMessage = errorInfo?.response?.data?.message ||
                       errorInfo?.message ||
                       '알 수 없는 오류가 발생했습니다';

  if (error) {
    console.log('==== RainfallFloodWidget 에러 표시 ====');
    console.log('신곡교 에러:', singokError);
    console.log('금신교 에러:', geumshinError);
    console.log('표시할 에러 메시지:', errorMessage);
    console.log('=====================================');

    return (
      <div className="weather-card">
        <div className="weather-card-header">
          <span>중랑천 수위 정보</span>
          <RefreshButton onRefresh={refetch} isLoading={isLoading} />
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="font-medium text-red-800 mb-2">수위 데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-red-600 mb-4">{errorMessage}</p>

            {/* 디버깅 정보 */}
            <details className="text-left bg-white rounded p-3 mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                기술 정보 (개발자용)
              </summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p>• 신곡교 상태: {singokError ? '에러' : '정상'}</p>
                <p>• 금신교 상태: {geumshinError ? '에러' : '정상'}</p>
                <p>• API 엔드포인트: /api/hanriver/[SERVICE_KEY]/waterlevel/list/10M/...</p>
                <p>• 브라우저 콘솔(F12)에서 상세 로그를 확인하세요</p>
              </div>
            </details>

            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '재시도 중...' : '다시 시도'}
            </button>
          </div>
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
            <WaterLevelInfo data={waterData?.success ? waterData.data : null} size={size} />
          )}
        </div>

        {/* 마지막 업데이트 시간 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t dark:border-gray-700 pt-4">
            마지막 업데이트: {format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RainfallFloodWidget;