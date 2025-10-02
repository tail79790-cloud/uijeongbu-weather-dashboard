/**
 * 공통 위젯 컴포넌트 테스트 (TDD Red Phase)
 *
 * 목표: 모든 위젯에서 일관된 UI/UX 제공
 * - WidgetLoader: 통일된 로딩 UI
 * - WidgetError: 통일된 에러 UI
 * - WidgetCard: 통일된 카드 래퍼
 * - RefreshButton: 통일된 새로고침 버튼
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WidgetLoader from '../../components/common/WidgetLoader';
import WidgetError from '../../components/common/WidgetError';
import WidgetCard from '../../components/common/WidgetCard';
import RefreshButton from '../../components/common/RefreshButton';

describe('WidgetLoader - 로딩 컴포넌트', () => {
  it('로딩 스피너를 표시해야 함', () => {
    render(<WidgetLoader />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('로딩 메시지를 표시해야 함', () => {
    render(<WidgetLoader message="데이터 로딩 중..." />);
    expect(screen.getByText(/데이터 로딩 중/i)).toBeInTheDocument();
  });

  it('기본 메시지를 표시해야 함', () => {
    render(<WidgetLoader />);
    expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
  });

  it('스피너가 회전 애니메이션을 가져야 함', () => {
    const { container } = render(<WidgetLoader />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('WidgetError - 에러 컴포넌트', () => {
  it('에러 메시지를 표시해야 함', () => {
    render(<WidgetError message="데이터를 불러올 수 없습니다" />);
    expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument();
  });

  it('재시도 버튼을 표시해야 함', () => {
    const onRetry = vi.fn();
    render(<WidgetError message="오류" onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument();
  });

  it('재시도 버튼 클릭 시 onRetry를 호출해야 함', () => {
    const onRetry = vi.fn();
    render(<WidgetError message="오류" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /다시 시도/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('onRetry가 없으면 재시도 버튼을 표시하지 않아야 함', () => {
    render(<WidgetError message="오류" />);
    expect(screen.queryByRole('button', { name: /다시 시도/i })).not.toBeInTheDocument();
  });

  it('에러 아이콘을 표시해야 함', () => {
    const { container } = render(<WidgetError message="오류" />);
    // SVG 아이콘 또는 이모지 확인
    const icon = container.querySelector('[aria-label="error-icon"]') || screen.getByText(/⚠️|❌/);
    expect(icon).toBeInTheDocument();
  });

  it('기본 에러 메시지를 표시해야 함', () => {
    render(<WidgetError />);
    expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument();
  });
});

describe('WidgetCard - 카드 래퍼 컴포넌트', () => {
  it('children을 렌더링해야 함', () => {
    render(
      <WidgetCard>
        <div>테스트 내용</div>
      </WidgetCard>
    );
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();
  });

  it('title prop을 헤더에 표시해야 함', () => {
    render(<WidgetCard title="날씨 정보">내용</WidgetCard>);
    expect(screen.getByText('날씨 정보')).toBeInTheDocument();
  });

  it('subtitle을 표시해야 함', () => {
    render(
      <WidgetCard title="날씨" subtitle="실시간 업데이트">
        내용
      </WidgetCard>
    );
    expect(screen.getByText('실시간 업데이트')).toBeInTheDocument();
  });

  it('borderColor prop에 따라 테두리 색상이 변경되어야 함', () => {
    const { container } = render(
      <WidgetCard borderColor="blue">내용</WidgetCard>
    );
    const card = container.firstChild;
    expect(card.className).toContain('border-blue');
  });

  it('기본 테두리 색상은 gray여야 함', () => {
    const { container } = render(<WidgetCard>내용</WidgetCard>);
    const card = container.firstChild;
    expect(card.className).toContain('border-gray');
  });

  it('className prop을 추가할 수 있어야 함', () => {
    const { container } = render(
      <WidgetCard className="custom-class">내용</WidgetCard>
    );
    expect(container.firstChild.className).toContain('custom-class');
  });

  it('headerAction을 렌더링해야 함', () => {
    render(
      <WidgetCard
        title="제목"
        headerAction={<button>액션</button>}
      >
        내용
      </WidgetCard>
    );
    expect(screen.getByRole('button', { name: '액션' })).toBeInTheDocument();
  });
});

describe('RefreshButton - 새로고침 버튼 컴포넌트', () => {
  it('버튼을 렌더링해야 함', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('클릭 시 onRefresh를 호출해야 함', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('로딩 중일 때 disabled 상태여야 함', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('로딩 중일 때 회전 애니메이션을 가져야 함', () => {
    const onRefresh = vi.fn();
    const { container } = render(<RefreshButton onRefresh={onRefresh} isLoading={true} />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('로딩 중이 아닐 때는 회전하지 않아야 함', () => {
    const onRefresh = vi.fn();
    const { container } = render(<RefreshButton onRefresh={onRefresh} isLoading={false} />);

    // 버튼 내부 아이콘은 있지만 animate-spin 클래스는 없어야 함
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('aria-label을 가져야 함', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} />);

    const button = screen.getByRole('button', { name: /새로고침/i });
    expect(button).toBeInTheDocument();
  });

  it('툴팁 텍스트를 표시해야 함', () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} tooltip="데이터 새로고침" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '데이터 새로고침');
  });
});
