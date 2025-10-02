import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  getUijeongbuData,
  processRainfallData,
  processWaterLevelData,
  calculateRiskLevel
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
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <WaterIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>수위 데이터가 없습니다</p>
      </div>
    );
  }

  const latest = data[0];
  const risk = calculateWaterLevelRisk({
    current: latest.waterLevel,
    watch: latest.warningLevel1,
    caution: latest.warningLevel2,
    danger: latest.warningLevel3,
  });

  const getWaterLevelStatus = () => {
    if (latest.waterLevel >= latest.warningLevel3) return '홍수위';
    if (latest.waterLevel >= latest.warningLevel2) return '경계수위';
    if (latest.waterLevel >= latest.warningLevel1) return '주의수위';
    return '평상수위';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WaterIcon className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">수위 정보</h4>
        </div>
        <RiskBadge level={risk.level} text={risk.text} icon="🌊" />
      </div>

      {/* 수위 게이지 추가 */}
      <RiskGauge
        value={latest.waterLevel}
        max={latest.warningLevel3}
        level={risk.level}
        label="현재 수위"
        showValues={true}
        showPercent={true}
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="weather-value-large text-blue-600">{latest.waterLevel.toFixed(2)}m</div>
          <div className="weather-label">{getWaterLevelStatus()}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">홍수위</span>
            <span className="text-sm font-medium text-red-600">{latest.warningLevel3.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">경계수위</span>
            <span className="text-sm font-medium text-yellow-600">{latest.warningLevel2.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">주의수위</span>
            <span className="text-sm font-medium text-blue-600">{latest.warningLevel1.toFixed(2)}m</span>
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
  const [selectedTab, setSelectedTab] = useState('rainfall');

  // 데이터 조회
  const { data: floodData, isLoading, error, refetch } = useQuery({
    queryKey: ['uijeongbu-flood-data'],
    queryFn: getUijeongbuData,
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });

  const processedData = React.useMemo(() => {
    if (!floodData?.success) return null;

    return {
      rainfall: processRainfallData(floodData.data.rainfall),
      waterLevel: processWaterLevelData(floodData.data.waterLevel),
      floodWarning: floodData.data.floodWarning
    };
  }, [floodData]);

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
        <span>강수량 & 홍수 정보</span>
        <RefreshButton onRefresh={refetch} isLoading={isLoading} />
      </div>

      <div className="space-y-6">
        {/* 탭 메뉴 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('rainfall')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'rainfall'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            강수량
          </button>
          <button
            onClick={() => setSelectedTab('water')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'water'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            수위
          </button>
          <button
            onClick={() => setSelectedTab('warning')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'warning'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            특보
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <>
              {selectedTab === 'rainfall' && (
                <RainfallInfo data={processedData?.rainfall} />
              )}
              {selectedTab === 'water' && (
                <WaterLevelInfo data={processedData?.waterLevel} />
              )}
              {selectedTab === 'warning' && (
                <FloodWarning data={processedData?.floodWarning} />
              )}
            </>
          )}
        </div>

        {/* 마지막 업데이트 시간 */}
        <div className="text-xs text-gray-500 text-center border-t pt-4">
          마지막 업데이트: {format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
        </div>
      </div>
    </div>
  );
};

export default RainfallFloodWidget;