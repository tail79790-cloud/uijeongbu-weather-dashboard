import { useState, useEffect, useMemo } from 'react';
import { useWidgets } from '../contexts/WidgetContext';

/**
 * 브레이크포인트 감지 함수
 * react-grid-layout의 breakpoints와 동일하게 설정
 */
const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  if (width >= 1200) return 'lg';
  if (width >= 996) return 'md';
  if (width >= 768) return 'sm';
  if (width >= 480) return 'xs';
  return 'xxs';
};

/**
 * Debounce 유틸리티 함수
 * 빠른 크기 변경 시 성능 최적화
 */
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * 위젯 크기 추적 커스텀 Hook
 *
 * @param {string} widgetId - 위젯 ID (예: 'current-weather')
 * @returns {Object} 크기 정보 객체
 * - size: 'small' | 'medium' | 'large' - 크기 카테고리 (실제 픽셀 너비 기반)
 * - dimensions: { w, h } - 그리드 단위 크기
 * - chartHeight: number - 계산된 차트 높이 (px)
 * - breakpoint: string - 현재 브레이크포인트
 * - actualWidth: number - 실제 픽셀 너비
 */
export const useWidgetSize = (widgetId) => {
  const { layouts } = useWidgets();
  const [dimensions, setDimensions] = useState({ w: 6, h: 4 });
  const [breakpoint, setBreakpoint] = useState('lg');
  const [actualWidth, setActualWidth] = useState(0);
  const [containerElement, setContainerElement] = useState(null);

  // 브레이크포인트와 위젯 크기 업데이트
  useEffect(() => {
    const updateSize = () => {
      const bp = getCurrentBreakpoint();
      setBreakpoint(bp);

      // 현재 브레이크포인트의 레이아웃에서 위젯 찾기
      const layout = layouts[bp];
      if (!layout) return;

      const widget = layout.find(item => item.i === widgetId);

      if (widget) {
        setDimensions({ w: widget.w, h: widget.h });
      }
    };

    // Debounce 적용 (150ms)
    const debouncedUpdate = debounce(updateSize, 150);

    // 초기 실행
    updateSize();

    // Window resize 이벤트 리스너
    window.addEventListener('resize', debouncedUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [layouts, widgetId]);

  // ResizeObserver로 실제 컨테이너 너비 측정
  useEffect(() => {
    // DOM이 완전히 렌더링된 후에 요소 찾기 (지연 처리)
    const findAndObserveElement = () => {
      const element = document.querySelector(`[data-widget-id="${widgetId}"]`);

      if (!element) {
        // 요소가 아직 없으면 다음 프레임에 다시 시도
        requestAnimationFrame(findAndObserveElement);
        return;
      }

      setContainerElement(element);

      // ResizeObserver 생성
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // contentBoxSize를 사용하여 정확한 너비 측정
          const width = entry.contentRect.width;
          if (width > 0) {  // 유효한 너비만 설정
            setActualWidth(Math.floor(width));
          }
        }
      });

      // 옵저버 시작
      resizeObserver.observe(element);

      // 초기 너비 설정
      const initialWidth = element.getBoundingClientRect().width;
      if (initialWidth > 0) {
        setActualWidth(Math.floor(initialWidth));
      }

      // Cleanup 함수 반환
      return () => {
        resizeObserver.disconnect();
      };
    };

    // 초기 시도
    const cleanup = findAndObserveElement();

    // Cleanup 반환
    return () => {
      if (cleanup) cleanup();
    };
  }, [widgetId]);

  // 크기 카테고리 계산 (실제 픽셀 너비 기반)
  const size = useMemo(() => {
    // ResizeObserver 데이터가 없으면 그리드 기반 추정
    if (actualWidth === 0) {
      const area = dimensions.w * dimensions.h;
      if (area <= 12) return 'small';
      if (area <= 32) return 'medium';
      return 'large';
    }

    // 실제 픽셀 너비 기반 (CSS Container Queries와 동일한 기준)
    if (actualWidth < 350) return 'small';
    if (actualWidth < 600) return 'medium';
    return 'large';
  }, [dimensions, actualWidth]);

  // 차트 높이 계산 (높이에 비례)
  const chartHeight = useMemo(() => {
    // h 값에 따라 동적으로 계산
    // h=2: 100px (최소), h=3: 105px, h=4: 140px, h=6: 210px
    return Math.max(100, dimensions.h * 35);
  }, [dimensions.h]);

  // 실제 픽셀 너비 추정 (참고용)
  const estimatedWidth = useMemo(() => {
    const cols = {
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2
    }[breakpoint];

    // 대략적인 너비 계산 (컨테이너 너비는 가변적)
    const containerWidth = window.innerWidth - 32; // 패딩 고려
    return Math.floor((containerWidth / cols) * dimensions.w);
  }, [breakpoint, dimensions.w]);

  return {
    size,              // 'small' | 'medium' | 'large' (실제 픽셀 너비 기반)
    dimensions,        // { w: number, h: number }
    chartHeight,       // 차트에 사용할 높이 (px)
    breakpoint,        // 'lg' | 'md' | 'sm' | 'xs' | 'xxs'
    actualWidth,       // 실제 측정된 픽셀 너비 (ResizeObserver)
    estimatedWidth,    // 대략적인 픽셀 너비 (참고용, 구버전 호환)
  };
};

export default useWidgetSize;
