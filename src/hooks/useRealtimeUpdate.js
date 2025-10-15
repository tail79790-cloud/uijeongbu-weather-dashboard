import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 실시간 업데이트 추적 및 표시를 위한 커스텀 훅
 * @param {string} widgetId - 위젯 식별자
 * @param {number} interval - 업데이트 간격 (ms)
 * @returns {object} 업데이트 상태 및 컨트롤
 */
export function useRealtimeUpdate(widgetId, interval = 60000) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  // 다음 업데이트 시간 계산
  useEffect(() => {
    if (interval && lastUpdate) {
      const next = new Date(lastUpdate.getTime() + interval);
      setNextUpdate(next);
    }
  }, [lastUpdate, interval]);

  // 카운트다운 타이머
  useEffect(() => {
    if (!nextUpdate || !interval) return;

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = nextUpdate.getTime() - now.getTime();
      
      if (remaining <= 0) {
        setCountdown(0);
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUpdate, interval]);

  // 업데이트 시작
  const startUpdate = useCallback(() => {
    setIsUpdating(true);
  }, []);

  // 업데이트 완료
  const completeUpdate = useCallback(() => {
    setLastUpdate(new Date());
    setIsUpdating(false);
    setUpdateCount(prev => prev + 1);
  }, []);

  // 상대 시간 표시
  const relativeTime = useMemo(() => {
    if (!lastUpdate) return null;
    
    try {
      return formatDistanceToNow(lastUpdate, {
        locale: ko,
        addSuffix: true,
      });
    } catch {
      return null;
    }
  }, [lastUpdate]);

  // 진행률 계산 (0-100)
  const progress = useMemo(() => {
    if (!interval || !countdown) return 100;
    const elapsed = interval - (countdown * 1000);
    return Math.min(100, Math.max(0, (elapsed / interval) * 100));
  }, [countdown, interval]);

  // 업데이트 상태 문자열
  const statusText = useMemo(() => {
    if (isUpdating) return '업데이트 중...';
    if (countdown === 0) return '곧 업데이트';
    if (countdown && countdown < 10) return `${countdown}초 후 업데이트`;
    if (countdown && countdown < 60) return `${countdown}초 후`;
    if (countdown) {
      const minutes = Math.floor(countdown / 60);
      return `${minutes}분 후`;
    }
    return relativeTime;
  }, [isUpdating, countdown, relativeTime]);

  return {
    // 상태
    lastUpdate,
    nextUpdate,
    isUpdating,
    updateCount,
    countdown,
    relativeTime,
    progress,
    statusText,
    
    // 액션
    startUpdate,
    completeUpdate,
  };
}

/**
 * 자동 새로고침 관리 훅
 * @param {function} refetch - 데이터 새로고침 함수
 * @param {number} interval - 자동 새로고침 간격 (ms)
 * @param {boolean} enabled - 자동 새로고침 활성화 여부
 */
export function useAutoRefresh(refetch, interval, enabled = true) {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [lastAutoRefresh, setLastAutoRefresh] = useState(null);

  useEffect(() => {
    if (!enabled || !interval || !refetch) return;

    const timer = setInterval(async () => {
      setIsAutoRefreshing(true);
      try {
        await refetch();
        setLastAutoRefresh(new Date());
      } finally {
        setIsAutoRefreshing(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [refetch, interval, enabled]);

  return {
    isAutoRefreshing,
    lastAutoRefresh,
  };
}

/**
 * 업데이트 애니메이션을 위한 훅
 * @param {boolean} isUpdating - 업데이트 중 여부
 * @returns {object} 애니메이션 클래스
 */
export function useUpdateAnimation(isUpdating) {
  const pulseClass = isUpdating ? 'animate-pulse' : '';
  const spinClass = isUpdating ? 'animate-spin' : '';
  const fadeClass = isUpdating ? 'opacity-70' : 'opacity-100';
  const scaleClass = isUpdating ? 'scale-95' : 'scale-100';

  return {
    pulse: pulseClass,
    spin: spinClass,
    fade: fadeClass,
    scale: scaleClass,
    combined: `${fadeClass} ${scaleClass} transition-all duration-300`,
  };
}