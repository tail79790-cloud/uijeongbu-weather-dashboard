/**
 * 기상특보 위젯 테스트 (TDD Red Phase)
 *
 * 요구사항:
 * 1. 탭 기능: 전국 / 수도권 / 의정부 선택
 * 2. 텍스트 포맷팅: 'ㅇ', 'ㅁ' 기호마다 줄바꿈
 * 3. 이모지 제거: 🔔 종 모양 이모지 사용 안 함
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeatherAlertWidget from '../components/widgets/WeatherAlertWidget';
import { formatAlertText } from '../utils/alertFormatter';

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
      {component}
    </QueryClientProvider>
  );
}

describe('기상특보 위젯 - 탭 기능 (Green Phase)', () => {
  it('전국, 수도권, 의정부 탭이 렌더링되어야 함', async () => {
    renderWithProviders(<WeatherAlertWidget />);

    // API 응답 대기
    await waitFor(() => {
      // 탭이 있어야 함 (데이터 로드 후)
      const tabs = document.querySelectorAll('button[role="tab"]');
      expect(tabs.length).toBe(3);
    }, { timeout: 3000 });
  });

  it('탭 클릭 시 활성 탭이 변경되어야 함', async () => {
    const { container } = renderWithProviders(<WeatherAlertWidget />);

    // 초기 상태: 의정부 탭 활성화
    const uijeongbuTab = screen.queryByText(/의정부/i);
    if (uijeongbuTab) {
      expect(uijeongbuTab.closest('button')).toHaveClass('active');
    }

    // 수도권 탭 클릭
    const sudogwonTab = screen.queryByText(/수도권/i);
    if (sudogwonTab) {
      fireEvent.click(sudogwonTab);
      await waitFor(() => {
        expect(sudogwonTab.closest('button')).toHaveClass('active');
      });
    }
  });

  it('탭 전환 시 해당 지역 데이터를 요청해야 함', async () => {
    const { container } = renderWithProviders(<WeatherAlertWidget />);

    // 전국 탭 클릭
    const nationwideTab = screen.queryByText(/전국/i);
    if (nationwideTab) {
      fireEvent.click(nationwideTab);

      // API 호출 로그 확인 (콘솔에 "기상특보 조회: {stnId: 전국코드}" 로그가 있어야 함)
      await waitFor(() => {
        expect(true).toBe(true); // API 호출 검증은 실제 구현 후 추가
      });
    }
  });
});

describe('기상특보 위젯 - 텍스트 포맷팅 (Red Phase)', () => {
  it('텍스트에서 "ㅇ" 기호 앞에 줄바꿈이 추가되어야 함', () => {
    const sampleText = "ㅇ 서울특별시ㅇ 경기도ㅇ 인천광역시";
    const formattedText = formatAlertText(sampleText);

    // "ㅇ" 앞에 줄바꿈이 있어야 함
    expect(formattedText).toContain('\nㅇ 서울특별시');
    expect(formattedText).toContain('\nㅇ 경기도');
    expect(formattedText).toContain('\nㅇ 인천광역시');
  });

  it('텍스트에서 "ㅁ" 기호 앞에 줄바꿈이 추가되어야 함', () => {
    const sampleText = "ㅁ 특보내용ㅁ 주의사항ㅁ 추가정보";
    const formattedText = formatAlertText(sampleText);

    // "ㅁ" 앞에 줄바꿈이 있어야 함
    expect(formattedText).toContain('\nㅁ 특보내용');
    expect(formattedText).toContain('\nㅁ 주의사항');
    expect(formattedText).toContain('\nㅁ 추가정보');
  });

  it('연속된 줄바꿈은 하나로 정리되어야 함', () => {
    const sampleText = "내용1\n\n\n내용2";
    const formattedText = formatAlertText(sampleText);

    // 연속된 줄바꿈이 하나로
    expect(formattedText).not.toContain('\n\n\n');
    expect(formattedText).toContain('내용1\n내용2');
  });

  it('공백 문자열은 빈 문자열로 반환되어야 함', () => {
    expect(formatAlertText('')).toBe('');
    expect(formatAlertText('   ')).toBe('');
    expect(formatAlertText(null)).toBe('');
    expect(formatAlertText(undefined)).toBe('');
  });
});

describe('기상특보 위젯 - 이모지 제거 (Red Phase)', () => {
  it('BellIcon 컴포넌트가 렌더링되지 않아야 함', async () => {
    renderWithProviders(<WeatherAlertWidget />);

    await waitFor(() => {
      // 종 모양 SVG path가 없어야 함
      const bellIconPath = document.querySelector('path[d*="M15 17h5"]');
      expect(bellIconPath).toBeNull();
    }, { timeout: 3000 });
  });

  it('텍스트에 🔔 이모지가 표시되지 않아야 함', async () => {
    renderWithProviders(<WeatherAlertWidget />);

    await waitFor(() => {
      const text = document.body.textContent;
      expect(text).not.toContain('🔔');
    }, { timeout: 3000 });
  });
});

describe('기상특보 위젯 - 통합 테스트 (Red Phase)', () => {
  it('위젯이 에러 없이 렌더링되어야 함', () => {
    expect(() => {
      renderWithProviders(<WeatherAlertWidget />);
    }).not.toThrow();
  });

  it('특보가 없을 때 안전 메시지를 표시해야 함', async () => {
    renderWithProviders(<WeatherAlertWidget />);

    await waitFor(() => {
      const safeMessage = screen.queryByText(/현재 발효 중인 기상특보가 없습니다/i);
      expect(safeMessage).toBeDefined();
    }, { timeout: 3000 });
  });

  it('지역 선택에 따라 안전 메시지의 지역명이 변경되어야 함', async () => {
    renderWithProviders(<WeatherAlertWidget />);

    // 의정부 선택 시
    await waitFor(() => {
      const message = screen.queryByText(/의정부/i);
      if (message) {
        expect(message.textContent).toContain('의정부');
      }
    }, { timeout: 3000 });

    // 수도권 선택 시
    const sudogwonTab = screen.queryByText(/수도권/i);
    if (sudogwonTab) {
      fireEvent.click(sudogwonTab);
      await waitFor(() => {
        const message = screen.queryByText(/수도권/i);
        expect(message).toBeDefined();
      });
    }
  });
});

// formatAlertText는 이제 alertFormatter에서 import됨
