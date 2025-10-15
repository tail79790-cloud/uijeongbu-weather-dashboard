import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeatherWarningMsg } from '../../services/kmaApi';
import { useWidgets } from '../../contexts/WidgetContext';
import { formatKoreanDateTime, parseKMADateTime } from '../../utils/dateFormatter';
import { formatAlertText, REGION_CODES, REGION_NAMES } from '../../utils/alertFormatter';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';

// 통보문 레벨에 따른 스타일
const getLevelStyle = (title) => {
  if (!title) {
    return {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
      header: 'bg-blue-600 dark:bg-blue-700 text-white',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-600 text-white',
    };
  }

  if (title.includes('경보')) {
    return {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
      header: 'bg-red-600 dark:bg-red-700 text-white',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-600 text-white',
    };
  } else if (title.includes('주의보')) {
    return {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
      header: 'bg-yellow-500 dark:bg-yellow-600 text-white',
      icon: 'text-yellow-600 dark:text-yellow-400',
      badge: 'bg-yellow-500 text-white',
    };
  }

  return {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    header: 'bg-blue-600 dark:bg-blue-700 text-white',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-600 text-white',
  };
};

// 통보문 상세 카드 컴포넌트
const DetailCard = ({ message }) => {
  const style = getLevelStyle(message.t1);

  return (
    <div className={`${style.container} border-2 rounded-lg overflow-hidden mb-4 shadow-md`}>
      {/* 헤더 */}
      <div className={`${style.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-bold text-lg">
            {message.t1 || '기상특보 통보문'}
          </span>
        </div>
        {message.tmFc && (
          <span className="text-xs font-medium">
            {formatKoreanDateTime(
              parseKMADateTime(
                String(message.tmFc).slice(0, 8),  // YYYYMMDD
                String(message.tmFc).slice(8, 12)  // HHmm
              )
            )}
          </span>
        )}
      </div>

      {/* 통보문 내용 */}
      <div className="p-4 bg-white dark:bg-gray-800">
        {/* 주 통보문 (t1) */}
        {message.t1 && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-2xl">📋</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">제목</h4>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {formatAlertText(message.t1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 상세 내용 (t2) */}
        {message.t2 && (
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">상세 내용</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {formatAlertText(message.t2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 발효 지역 (t7) */}
        {message.t7 && (
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">📍</span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">발효 지역</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {message.t7}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 추가 정보 표시 (t3 ~ t10이 있는 경우) */}
        {Object.keys(message).filter(key => key.match(/^t[3-9]$|^t10$/) && message[key]).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">추가 정보</h4>
            <div className="space-y-2">
              {Object.keys(message)
                .filter(key => key.match(/^t[3-9]$|^t10$/) && message[key])
                .map(key => (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}: </span>
                    <span className="text-gray-600 dark:text-gray-400">{message[key]}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 발표 시간 푸터 */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <span>기상청 발표</span>
        {message.tmSeq && <span>발표 번호: {message.tmSeq}</span>}
      </div>
    </div>
  );
};

// 메인 위젯
const WeatherDetailWidget = memo(() => {
  const { refreshIntervals, updateLastRefresh } = useWidgets();
  const widgetId = 'weather-detail';

  // 지역 선택 상태 (기본: 의정부)
  const [selectedRegion, setSelectedRegion] = useState('uijeongbu');
  const currentRegionCode = REGION_CODES[selectedRegion];

  // 기상특보 통보문 조회
  const {
    data: messageData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['weatherDetail', currentRegionCode],
    queryFn: () => getWeatherWarningMsg(currentRegionCode || '109'),
    refetchInterval: refreshIntervals[widgetId] || 60000, // 1분
    staleTime: 30000,
    onSuccess: () => updateLastRefresh(widgetId)
  });

  const messages = messageData?.data || [];

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard title="📄 기상특보 통보문" subtitle={REGION_NAMES[selectedRegion]}>
        <WidgetLoader message="통보문을 불러오는 중..." />
      </WidgetCard>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <WidgetCard title="📄 기상특보 통보문" subtitle={REGION_NAMES[selectedRegion]}>
        <WidgetError
          message="통보문을 불러올 수 없습니다"
          onRetry={refetch}
        />
      </WidgetCard>
    );
  }

  // 통보문 없음
  if (messages.length === 0) {
    return (
      <WidgetCard
        title="📄 기상특보 통보문"
        subtitle={`${REGION_NAMES[selectedRegion]} • ${formatKoreanDateTime(new Date())}`}
        action={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
      >
        <div className="p-6 text-center">
          {/* 지역 선택 드롭다운 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              지역 선택
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full max-w-xs px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(REGION_CODES).map((region) => (
                <option key={region} value={region}>
                  {REGION_NAMES[region]}
                </option>
              ))}
            </select>
          </div>

          {/* 특보 없음 표시 */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            현재 발효 중인 기상특보가 없습니다
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {REGION_NAMES[selectedRegion]} 지역에 발효 중인 기상특보 통보문이 없습니다.
          </p>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 기상특보가 발효되면 기상청의 상세한 통보문을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </WidgetCard>
    );
  }

  // 통보문 표시
  return (
    <WidgetCard
      title="📄 기상특보 통보문"
      subtitle={`${REGION_NAMES[selectedRegion]} • ${messages.length}건 발효 중`}
      action={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >
      <div className="space-y-4">
        {/* 지역 선택 탭 */}
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          {Object.keys(REGION_CODES).map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedRegion === region
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {REGION_NAMES[region]}
            </button>
          ))}
        </div>

        {/* 통보문 카드 목록 */}
        {messages.map((message, index) => (
          <DetailCard key={index} message={message} />
        ))}

        {/* 안내 문구 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          자동 갱신: 1분마다 • 마지막 확인: {formatKoreanDateTime(new Date())}
        </div>
      </div>
    </WidgetCard>
  );
});

WeatherDetailWidget.displayName = 'WeatherDetailWidget';

export default WeatherDetailWidget;
