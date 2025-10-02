import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component - Error Boundary', () => {
  it('React 앱이 정상적으로 마운트되어야 함', () => {
    const { container } = render(<App />);

    // root div에 컨텐츠가 있어야 함
    const appContent = container.querySelector('.min-h-screen');
    expect(appContent).toBeInTheDocument();
    expect(appContent.children.length).toBeGreaterThan(0);
  });

  it('헤더가 렌더링되어야 함', () => {
    render(<App />);

    // 헤더 텍스트 확인
    expect(screen.getByText(/의정부시 재난대응 날씨 대시보드/i)).toBeInTheDocument();
  });

  it('테마 토글 버튼이 있어야 함', () => {
    render(<App />);

    // 다크모드 토글 버튼
    const toggleButton = screen.getByRole('button', { name: /테마 전환/i });
    expect(toggleButton).toBeInTheDocument();
  });
});

describe('App Component - 위젯 오류 격리', () => {
  // 이 테스트는 ErrorBoundary 구현 후 통과해야 함
  it.skip('위젯 오류가 발생해도 전체 앱이 크래시하지 않아야 함', () => {
    // ErrorBoundary가 구현되면 이 테스트 활성화
    // 현재는 skip
  });
});
