import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeatherWarning, getWeatherWarningMsg } from '../../services/kmaApi';
import { formatKoreanDateTime } from '../../utils/dateFormatter';

// 아이콘 컴포넌트
const AlertIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L.072 16.5C-.697 17.333.25 19 1.79 19z" />
  </svg>
);

const BellIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4", spinning = false }) => (
  <svg className={`${className} ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// 특보 레벨에 따른 스타일
const getLevelStyle = (title) => {
  if (title.includes('경보')) {
    return {
      container: 'bg-red-50 border-red-300 border-2',
      header: 'bg-red-600 text-white',
      icon: 'text-red-600',
      badge: 'bg-red-600 text-white',
      pulse: 'bg-red-500'
    };
  } else if (title.includes('주의보')) {
    return {
      container: 'bg-yellow-50 border-yellow-300 border-2',
      header: 'bg-yellow-500 text-white',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-500 text-white',
      pulse: 'bg-yellow-500'
    };
  } else {
    return {
      container: 'bg-blue-50 border-blue-300 border-2',
      header: 'bg-blue-500 text-white',
      icon: 'text-blue-600',
      badge: 'bg-blue-500 text-white',
      pulse: 'bg-blue-500'
    };
  }
};

// 특보 카드 컴포넌트
const AlertCard = ({ warning, message }) => {
  const [expanded, setExpanded] = useState(false);
  const style = getLevelStyle(warning.t1 || warning.title || '특보');

  return (
    <div className={`${style.container} rounded-lg overflow-hidden mb-4 shadow-lg`}>
      {/* 헤더 */}
      <div className={`${style.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <AlertIcon className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-lg">
            {warning.t1 || warning.title || '기상특보'}
          </span>
        </div>
        <span className="text-xs font-medium">
          {warning.tmFc ? formatKoreanDateTime(new Date(warning.tmFc)) : '발효 중'}
        </span>
      </div>

      {/* 내용 */}
      <div className="p-4">
        {/* 발효 지역 */}
        {warning.t7 && (
          <div className="mb-3">
            <span className="text-sm font-semibold text-gray-700">📍 발효 지역:</span>
            <p className="text-sm text-gray-800 mt-1">{warning.t7}</p>
          </div>
        )}

        {/* 통보문 */}
        {message && (
          <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            <div className="flex items-start space-x-2">
              <BellIcon className={`${style.icon} mt-1 flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {message.t1 || '특보 상세 정보가 없습니다.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 추가 정보 (확장 가능) */}
        {(warning.other || message?.other) && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {expanded ? '▼ 접기' : '▶ 상세보기'}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(warning, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 바 (애니메이션) */}
      <div className={`h-1 ${style.pulse} animate-pulse`}></div>
    </div>
  );
};

// 메인 위젯
const WeatherAlertWidget = () => {
  // 기상특보 목록 조회 (1분마다 갱신)
  const { data: warningData, isLoading: warningLoading, error: warningError, refetch: refetchWarning } = useQuery({
    queryKey: ['weatherWarning'],
    queryFn: () => getWeatherWarning('109'), // 의정부 지역 코드
    refetchInterval: 60 * 1000, // 1분
    staleTime: 30 * 1000,
  });

  // 기상특보 통보문 조회
  const { data: messageData, isLoading: messageLoading, refetch: refetchMessage } = useQuery({
    queryKey: ['weatherWarningMsg'],
    queryFn: () => getWeatherWarningMsg('109'),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const handleRefresh = () => {
    refetchWarning();
    refetchMessage();
  };

  const isLoading = warningLoading || messageLoading;
  const warnings = warningData?.data || [];
  const messages = messageData?.data || [];

  // 특보와 통보문 매칭
  const alertsWithMessages = warnings.map(warning => {
    const message = messages.find(m => m.stnId === warning.stnId);
    return { warning, message };
  });

  // 에러 상태
  if (warningError) {
    return (
      <div className="weather-card border-l-4 border-red-400">
        <div className="weather-card-header">
          <span>🚨 긴급 기상특보</span>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshIcon />
          </button>
        </div>
        <div className="text-center py-8 text-red-600">
          <AlertIcon className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium">특보 정보를 불러올 수 없습니다</p>
          <p className="text-sm mt-2">{warningError.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="weather-card">
        <div className="weather-card-header">
          <span>🚨 긴급 기상특보</span>
          <RefreshIcon spinning />
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">특보 정보 확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 특보 없음
  if (alertsWithMessages.length === 0) {
    return (
      <div className="weather-card border-l-4 border-green-400">
        <div className="weather-card-header">
          <span>🚨 긴급 기상특보</span>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <RefreshIcon spinning={isLoading} />
          </button>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            현재 발효 중인 기상특보가 없습니다
          </p>
          <p className="text-sm text-gray-500">
            의정부시는 현재 안전합니다
          </p>
          <p className="text-xs text-gray-400 mt-4">
            마지막 확인: {formatKoreanDateTime(new Date())}
          </p>
        </div>
      </div>
    );
  }

  // 특보 있음
  return (
    <div className="weather-card border-l-4 border-red-500">
      <div className="weather-card-header bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertIcon className="w-6 h-6 text-red-600 animate-pulse" />
          <span className="text-red-700 font-bold">🚨 긴급 기상특보 발효 중</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
            {alertsWithMessages.length}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-red-100 rounded-full transition-colors"
          disabled={isLoading}
        >
          <RefreshIcon spinning={isLoading} className="text-red-600" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* 특보 카드 목록 */}
        {alertsWithMessages.map((alert, index) => (
          <AlertCard
            key={index}
            warning={alert.warning}
            message={alert.message}
          />
        ))}

        {/* 주의사항 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">⚠️ 주의사항</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 외출 시 기상 상황을 수시로 확인하세요</li>
            <li>• 위험 지역 접근을 삼가하세요</li>
            <li>• 재난 문자 및 경보에 주의하세요</li>
            <li>• 긴급 상황 시 119에 신고하세요</li>
          </ul>
        </div>

        {/* 마지막 업데이트 */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          자동 갱신: 1분마다 • 마지막 확인: {formatKoreanDateTime(new Date())}
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertWidget;
