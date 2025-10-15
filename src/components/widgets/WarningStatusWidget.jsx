import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWthrPwnStatus } from '../../services/kmaApi';
import { useWidgets } from '../../contexts/WidgetContext';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';

// 전국 시도 매핑
const REGION_NAMES = {
  '11': '서울특별시',
  '26': '부산광역시',
  '27': '대구광역시',
  '28': '인천광역시',
  '29': '광주광역시',
  '30': '대전광역시',
  '31': '울산광역시',
  '36': '세종특별자치시',
  '41': '경기도',
  '42': '강원도',
  '43': '충청북도',
  '44': '충청남도',
  '45': '전라북도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '50': '제주특별자치도'
};

// 특보 레벨 스타일
const getWarningStyle = (level) => {
  if (level === '경보') {
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-400',
      icon: '🔴'
    };
  } else if (level === '주의보') {
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: '🟡'
    };
  }
  return {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-700 dark:text-green-400',
    icon: '🟢'
  };
};

// 특보 유형 아이콘 매핑
const WARNING_TYPE_ICONS = {
  '호우': '🌧️',
  '대설': '❄️',
  '강풍': '💨',
  '풍랑': '🌊',
  '태풍': '🌀',
  '건조': '🏜️',
  '한파': '🥶',
  '폭염': '🔥',
  '황사': '😷',
  '폭풍해일': '🌪️'
};

const WarningStatusWidget = memo(() => {
  const { refreshIntervals, updateLastRefresh } = useWidgets();
  const widgetId = 'warning-status';

  // 전국 특보 현황 조회
  const {
    data: statusData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['warningStatus'],
    queryFn: () => getWthrPwnStatus(),
    refetchInterval: refreshIntervals[widgetId] || 60000, // 1분
    staleTime: 30000,
    onSuccess: () => updateLastRefresh(widgetId)
  });

  const warnings = statusData?.data || [];

  // 통계 계산
  const statistics = useMemo(() => {
    const stats = {
      total: warnings.length,
      advisory: 0, // 주의보
      warning: 0,  // 경보
      byType: {},  // 특보 유형별 개수
      byRegion: {} // 지역별 특보
    };

    warnings.forEach(item => {
      // 주의보/경보 구분 (title 또는 warnVar 필드 확인)
      const title = item.title || item.warnVar || '';
      if (title.includes('경보')) {
        stats.warning++;
      } else if (title.includes('주의보')) {
        stats.advisory++;
      }

      // 특보 유형별 집계
      const type = title.replace(/(주의보|경보)/g, '').trim();
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // 지역별 집계 (areaCode나 stnId로 그룹핑)
      const regionCode = (item.areaCode || item.stnId || '').substring(0, 2);
      if (!stats.byRegion[regionCode]) {
        stats.byRegion[regionCode] = [];
      }
      stats.byRegion[regionCode].push(item);
    });

    return stats;
  }, [warnings]);

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard title="🗺️ 전국 특보 현황">
        <WidgetLoader message="전국 특보 현황을 불러오는 중..." />
      </WidgetCard>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <WidgetCard title="🗺️ 전국 특보 현황">
        <WidgetError
          message="전국 특보 현황을 불러올 수 없습니다"
          onRetry={refetch}
        />
      </WidgetCard>
    );
  }

  // 특보 없음
  if (statistics.total === 0) {
    return (
      <WidgetCard
        title="🗺️ 전국 특보 현황"
        subtitle="전국 실시간 기상특보 모니터링"
        action={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
      >
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            전국에 발효 중인 기상특보가 없습니다
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            전국 17개 시도 모두 안전한 상태입니다
          </p>
        </div>
      </WidgetCard>
    );
  }

  // 특보 있음
  return (
    <WidgetCard
      title="🗺️ 전국 특보 현황"
      subtitle={`현재 발효 중: ${statistics.total}건`}
      action={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >
      <div className="space-y-4">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3">
          {/* 총 특보 수 */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              📊 전체
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">발효 중</div>
          </div>

          {/* 주의보 */}
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              🟡 주의보
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {statistics.advisory}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">건</div>
          </div>

          {/* 경보 */}
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              🔴 경보
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {statistics.warning}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">건</div>
          </div>
        </div>

        {/* 특보 유형별 통계 */}
        {Object.keys(statistics.byType).length > 0 && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📊 특보 유형별 현황
            </h3>
            <div className="space-y-2">
              {Object.entries(statistics.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{WARNING_TYPE_ICONS[type] || '⚠️'}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${(count / statistics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 지역별 특보 현황 */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            📍 지역별 특보 현황
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {Object.keys(REGION_NAMES).map(code => {
              const regionWarnings = statistics.byRegion[code] || [];
              const hasWarning = regionWarnings.length > 0;
              const level = hasWarning ? (regionWarnings[0].title?.includes('경보') ? '경보' : '주의보') : '정상';
              const style = getWarningStyle(level);

              return (
                <div
                  key={code}
                  className={`p-3 rounded-lg border-2 ${style.bg} ${style.border} transition-all hover:scale-105`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{style.icon}</span>
                      <span className={`text-sm font-medium ${style.text}`}>
                        {REGION_NAMES[code]}
                      </span>
                    </div>
                    {hasWarning && (
                      <span className={`text-xs font-bold ${style.text}`}>
                        {regionWarnings.length}건
                      </span>
                    )}
                  </div>
                  {hasWarning && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {regionWarnings.map(w => w.title || w.warnVar).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 상세 특보 목록 */}
        {warnings.length > 0 && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📋 전체 특보 목록
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {warnings.map((warning, index) => {
                const title = warning.title || warning.warnVar || '기상특보';
                const level = title.includes('경보') ? '경보' : '주의보';
                const style = getWarningStyle(level);

                return (
                  <div
                    key={index}
                    className={`p-2 rounded border ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${style.text}`}>
                        {style.icon} {title}
                      </span>
                      {warning.tmFc && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {warning.tmFc}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          데이터 출처: 기상청 API • 1분마다 자동 갱신
        </div>
      </div>
    </WidgetCard>
  );
});

WarningStatusWidget.displayName = 'WarningStatusWidget';

export default WarningStatusWidget;
