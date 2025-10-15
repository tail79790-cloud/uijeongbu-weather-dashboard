import { memo } from 'react';
import { useRealtimeUpdate } from '../../hooks/useRealtimeUpdate';

/**
 * 실시간 업데이트 인디케이터 컴포넌트
 * 마지막 업데이트 시간과 다음 업데이트까지 남은 시간을 표시
 */
const UpdateIndicator = memo(({ 
  widgetId, 
  interval, 
  isLoading = false,
  compact = false,
  className = '' 
}) => {
  const {
    lastUpdate,
    isUpdating,
    countdown,
    progress,
    statusText,
    relativeTime
  } = useRealtimeUpdate(widgetId, interval);

  // 컴팩트 모드: 작은 점 형태의 인디케이터
  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="relative">
          <span 
            className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${
              isUpdating || isLoading
                ? 'bg-blue-500 animate-pulse' 
                : countdown && countdown < 10
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-green-500'
            }`}
          />
          {(isUpdating || isLoading) && (
            <span className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
          )}
        </div>
        {!isUpdating && !isLoading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {statusText}
          </span>
        )}
      </div>
    );
  }

  // 전체 모드: 프로그레스 바와 상세 정보 포함
  return (
    <div className={`space-y-1 ${className}`}>
      {/* 상태 텍스트 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span 
              className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${
                isUpdating || isLoading
                  ? 'bg-blue-500 animate-pulse' 
                  : countdown && countdown < 10
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-green-500'
              }`}
            />
            {(isUpdating || isLoading) && (
              <span className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            {isUpdating || isLoading ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                업데이트 중...
              </span>
            ) : (
              <>
                마지막 업데이트: <span className="font-medium">{relativeTime || '방금 전'}</span>
              </>
            )}
          </span>
        </div>
        
        {!isUpdating && !isLoading && countdown !== null && (
          <span className={`font-medium ${
            countdown < 10 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-gray-500 dark:text-gray-500'
          }`}>
            {countdown < 60 
              ? `${countdown}초 후` 
              : `${Math.floor(countdown / 60)}분 후`
            }
          </span>
        )}
      </div>

      {/* 프로그레스 바 */}
      <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-1000 rounded-full ${
            isUpdating || isLoading
              ? 'bg-blue-500 animate-pulse w-full'
              : countdown && countdown < 10
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ 
            width: isUpdating || isLoading ? '100%' : `${progress}%` 
          }}
        />
      </div>
    </div>
  );
});

UpdateIndicator.displayName = 'UpdateIndicator';

/**
 * 간단한 업데이트 뱃지
 */
export const UpdateBadge = memo(({ isUpdating, countdown, className = '' }) => {
  if (!isUpdating && (!countdown || countdown > 10)) return null;

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${isUpdating 
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 animate-pulse' 
        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      } ${className}
    `}>
      {isUpdating ? '업데이트 중' : `${countdown}초`}
    </span>
  );
});

UpdateBadge.displayName = 'UpdateBadge';

/**
 * 실시간 타임스탬프
 */
export const LiveTimestamp = memo(({ timestamp, prefix = '업데이트' }) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const time = date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });

  return (
    <div className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      <span>{prefix}: {time}</span>
    </div>
  );
});

LiveTimestamp.displayName = 'LiveTimestamp';

export default UpdateIndicator;