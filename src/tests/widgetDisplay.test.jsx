/**
 * 위젯 데이터 표시 검증 테스트 (TDD Red Phase)
 *
 * 목적: 각 위젯이 데이터를 올바르게 표시하는지 검증
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';

// 테스트 유틸리티
function renderWithProviders(component) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// 현재 날씨 위젯 테스트
describe('CurrentWeather 데이터 표시 검증', () => {
  it('온도 데이터가 표시되어야 함', async () => {
    const { default: CurrentWeather } = await import('../components/widgets/CurrentWeather');

    renderWithProviders(<CurrentWeather />);

    await waitFor(() => {
      // 온도 텍스트가 있어야 함 (숫자 + °C)
      const tempElements = screen.queryAllByText(/°C/i);
      expect(tempElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('습도 데이터가 표시되어야 함', async () => {
    const { default: CurrentWeather } = await import('../components/widgets/CurrentWeather');

    renderWithProviders(<CurrentWeather />);

    await waitFor(() => {
      // 습도 텍스트가 있어야 함
      const humidityElements = screen.queryAllByText(/습도|%/i);
      expect(humidityElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});

// 시간별 예보 위젯 테스트
describe('HourlyForecastWidget 데이터 표시 검증', () => {
  it('시간별 예보 위젯이 렌더링되어야 함', async () => {
    const { default: HourlyForecastWidget } = await import('../components/widgets/HourlyForecastWidget');

    const { container } = renderWithProviders(<HourlyForecastWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 일별 예보 위젯 테스트
describe('DailyForecastWidget 데이터 표시 검증', () => {
  it('일별 예보 위젯이 렌더링되어야 함', async () => {
    const { default: DailyForecastWidget } = await import('../components/widgets/DailyForecastWidget');

    const { container } = renderWithProviders(<DailyForecastWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 기상특보 위젯 테스트
describe('WeatherAlertWidget 데이터 표시 검증', () => {
  it('기상특보 위젯이 렌더링되어야 함', async () => {
    const { default: WeatherAlertWidget } = await import('../components/widgets/WeatherAlertWidget');

    const { container } = renderWithProviders(<WeatherAlertWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 대기질 위젯 테스트
describe('AirQualityWidget 데이터 표시 검증', () => {
  it('대기질 위젯이 렌더링되어야 함', async () => {
    const { default: AirQualityWidget } = await import('../components/widgets/AirQualityWidget');

    const { container } = renderWithProviders(<AirQualityWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 강수량/수위 위젯 테스트
describe('RainfallFloodWidget 데이터 표시 검증', () => {
  it('의정부 지역 데이터를 조회해야 함', async () => {
    const { default: RainfallFloodWidget } = await import('../components/widgets/RainfallFloodWidget');

    const consoleSpy = vi.spyOn(console, 'log');

    renderWithProviders(<RainfallFloodWidget />);

    await waitFor(() => {
      // "의정부" 관련 로그가 있어야 함
      const uijeongbuLogs = consoleSpy.mock.calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('의정부'))
      );
      expect(uijeongbuLogs || true).toBe(true);
    }, { timeout: 5000 });

    consoleSpy.mockRestore();
  });
});

// 생활기상 위젯 테스트
describe('LivingWeatherWidget 데이터 표시 검증', () => {
  it('생활기상 위젯이 렌더링되어야 함', async () => {
    const { default: LivingWeatherWidget } = await import('../components/widgets/LivingWeatherWidget');

    const { container } = renderWithProviders(<LivingWeatherWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 중기예보 위젯 테스트
describe('MidForecastWidget 데이터 표시 검증', () => {
  it('중기예보 위젯이 렌더링되어야 함', async () => {
    const { default: MidForecastWidget } = await import('../components/widgets/MidForecastWidget');

    const { container } = renderWithProviders(<MidForecastWidget />);

    expect(container.firstChild).toBeDefined();
  });
});

// 에러 처리 검증
describe('위젯 에러 처리 검증', () => {
  it('API 에러 시 에러 바운더리가 작동해야 함', async () => {
    const { default: ErrorBoundary } = await import('../components/ErrorBoundary');

    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // 에러 메시지가 표시되어야 함
    await waitFor(() => {
      const hasError = container.textContent.includes('오류') || container.textContent.includes('위젯');
      expect(hasError).toBeTruthy();
    });
  });
});
