import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeatherWarning, getWeatherWarningMsg } from '../../services/kmaApi';
import { useWidgets } from '../../contexts/WidgetContext';
import { useWidgetSize } from '../../hooks/useWidgetSize';
import { formatKoreanDateTime, parseKMADateTime, getWeatherWarningMsgBase, getNextPublishTime } from '../../utils/dateFormatter';
import { formatAlertText, REGION_CODES, REGION_NAMES } from '../../utils/alertFormatter';
import RefreshButton from '../common/RefreshButton';

// 아이콘 컴포넌트
const AlertIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L.072 16.5C-.697 17.333.25 19 1.79 19z" />
  </svg>
);

// BellIcon 제거 (요구사항: 종 모양 아이콘 제거)
// RefreshIcon 제거 - RefreshButton 공통 컴포넌트 사용

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
          {warning.tmFc ? formatKoreanDateTime(
            parseKMADateTime(
              String(warning.tmFc).slice(0, 8),  // YYYYMMDD
              String(warning.tmFc).slice(8, 12)  // HHmm
            )
          ) : '발효 중'}
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
            <div className="flex-1">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {formatAlertText(message.t1) || '특보 상세 정보가 없습니다.'}
              </p>
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

// 독립 통보문 섹션 컴포넌트
const WeatherMessageSection = ({ messages, size }) => {
  const [expanded, setExpanded] = useState(false);
  const { baseDate, baseTime, publishHour } = getWeatherWarningMsgBase();
  const { nextTime, timeUntil } = getNextPublishTime();

  if (!messages || messages.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">기상 통보문</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            발표 시각: {String(publishHour).padStart(2, '0')}:00
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          현재 발효 중인 통보문이 없습니다
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          다음 발표: {nextTime} ({timeUntil})
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <h3 className="font-semibold text-blue-800 dark:text-blue-300">기상 통보문</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
            {messages.length}
          </span>
        </div>
        <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
          발표: {String(publishHour).padStart(2, '0')}:00 | 다음: {nextTime} ({timeUntil})
        </span>
      </div>

      {/* 통보문 목록 */}
      <div className="space-y-2">
        {messages.slice(0, expanded || size === 'large' ? messages.length : 1).map((msg, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {formatAlertText(msg.t1) || msg.t1 || '통보문 내용이 없습니다.'}
            </p>
            {msg.tmFc && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                발표 시각: {formatKoreanDateTime(
                  parseKMADateTime(
                    String(msg.tmFc).slice(0, 8),
                    String(msg.tmFc).slice(8, 12)
                  )
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 더보기 버튼 - 통보문이 2개 이상이고 large가 아닐 때 */}
      {messages.length > 1 && size !== 'large' && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          {expanded ? '▼ 접기' : `▶ ${messages.length - 1}개 더보기`}
        </button>
      )}

      {/* 발표 일정 안내 - large에서만 */}
      {size === 'large' && (
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            💡 통보문은 하루 3회(05:00, 11:00, 17:00) 발표됩니다
          </p>
        </div>
      )}
    </div>
  );
};

// 메인 위젯
const WeatherAlertWidget = memo(() => {
  const { refreshIntervals, updateLastRefresh } = useWidgets();
  const widgetId = 'weather-alert';
  const { size } = useWidgetSize(widgetId);

  // 지역 선택 상태 (기본: 의정부)
  const [selectedRegion, setSelectedRegion] = useState('uijeongbu');
  const currentRegionCode = REGION_CODES[selectedRegion];

  // 기상특보 목록 조회 (커스터마이징 가능한 인터벌)
  const { data: warningData, isLoading: warningLoading, error: warningError, refetch: refetchWarning } = useQuery({
    queryKey: ['weatherWarning', currentRegionCode],
    queryFn: () => getWeatherWarning(currentRegionCode || '109'),
    refetchInterval: refreshIntervals[widgetId] || 60 * 1000,
    staleTime: 30 * 1000,
    onSuccess: () => updateLastRefresh(widgetId)
  });

  // 기상특보 통보문 조회
  // 통보문은 05:00, 11:00, 17:00에 발표되므로 발표 시각 근처에서는 더 자주 갱신
  const getMessageRefetchInterval = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 발표 시각 (05, 11, 17시) 전후 30분은 1분마다 갱신
    const publishHours = [5, 11, 17];
    const isNearPublishTime = publishHours.some(hour => {
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (hour * 60));
      return timeDiff <= 30; // 발표 시각 전후 30분
    });

    // 발표 시각 근처: 1분마다, 그 외: 10분마다
    return isNearPublishTime ? 60 * 1000 : 10 * 60 * 1000;
  };

  const { data: messageData, isLoading: messageLoading, refetch: refetchMessage } = useQuery({
    queryKey: ['weatherWarningMsg', currentRegionCode],
    queryFn: () => getWeatherWarningMsg(currentRegionCode || '109'),
    refetchInterval: getMessageRefetchInterval(),
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
          <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />
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
          <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />
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

  // 탭 버튼 렌더링 함수
  const renderTabs = () => (
    <div className="flex space-x-2 p-2 bg-gray-50 rounded-lg mb-4">
      {Object.keys(REGION_CODES).map((region) => (
        <button
          key={region}
          role="tab"
          onClick={() => setSelectedRegion(region)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedRegion === region
              ? 'bg-blue-600 text-white shadow-md active'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {REGION_NAMES[region]}
        </button>
      ))}
    </div>
  );

  // 특보 없음 - Compact 모드 (하지만 통보문은 독립적으로 표시)
  if (alertsWithMessages.length === 0) {
    return (
      <div className="weather-card border-l-4 border-green-400">
        <div className="weather-card-header">
          <span>🚨 긴급 기상특보</span>
          <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />
        </div>

        <div className="px-4 py-3">
          {/* 특보 없음 상태 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  현재 발효 중인 기상특보가 없습니다
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {REGION_NAMES[selectedRegion]} • 마지막 확인: {formatKoreanDateTime(new Date())}
                </p>
              </div>
            </div>
            {/* 지역 선택 드롭다운 - large에서만 표시 */}
            {size === 'large' && (
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(REGION_CODES).map((region) => (
                  <option key={region} value={region}>
                    {REGION_NAMES[region]}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 독립 통보문 섹션 - 특보 유무와 관계없이 표시 */}
          <WeatherMessageSection messages={messages} size={size} />
        </div>
      </div>
    );
  }

  // 특보 있음
  // 크기에 따라 표시할 알림 수 제한
  const maxAlerts = size === 'small' ? 1 : size === 'medium' ? 2 : alertsWithMessages.length;
  const displayedAlerts = alertsWithMessages.slice(0, maxAlerts);

  return (
    <div className="weather-card border-l-4 border-red-500">
      <div className="weather-card-header bg-red-50">
        <div className="flex items-center space-x-2">
          <AlertIcon className="w-6 h-6 text-red-600 animate-pulse" />
          <span className="text-red-700 font-bold">{size === 'small' ? '🚨 특보' : '🚨 긴급 기상특보 발효 중'}</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
            {alertsWithMessages.length}
          </span>
        </div>
        <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} />
      </div>

      <div className="p-4 space-y-4">
        {/* 지역 선택 탭 - medium 이상에서만 표시 */}
        {size !== 'small' && renderTabs()}

        {/* 특보 카드 목록 - 크기에 따라 제한 */}
        {displayedAlerts.map((alert, index) => (
          <AlertCard
            key={index}
            warning={alert.warning}
            message={alert.message}
          />
        ))}

        {/* 더 많은 특보가 있을 때 안내 - small/medium 크기에서만 */}
        {alertsWithMessages.length > maxAlerts && (
          <div className="text-center text-sm text-gray-600">
            외 {alertsWithMessages.length - maxAlerts}개 특보 (위젯 확대 시 표시)
          </div>
        )}

        {/* 독립 통보문 섹션 - 특보가 있을 때도 별도로 표시 */}
        <WeatherMessageSection messages={messages} size={size} />

        {/* 주의사항 - large에서만 표시 */}
        {size === 'large' && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">⚠️ 주의사항</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 외출 시 기상 상황을 수시로 확인하세요</li>
              <li>• 위험 지역 접근을 삼가하세요</li>
              <li>• 재난 문자 및 경보에 주의하세요</li>
              <li>• 긴급 상황 시 119에 신고하세요</li>
            </ul>
          </div>
        )}

        {/* 마지막 업데이트 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            자동 갱신: 1분마다 • 마지막 확인: {formatKoreanDateTime(new Date())}
          </div>
        )}
      </div>
    </div>
  );
});

WeatherAlertWidget.displayName = 'WeatherAlertWidget';

export default WeatherAlertWidget;
