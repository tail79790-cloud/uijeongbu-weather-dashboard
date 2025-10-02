/**
 * 위험도 시각화 컴포넌트 테스트 (TDD Red Phase)
 *
 * 목표: 기상 위험도를 직관적으로 시각화
 * - RiskGauge: 게이지 바로 위험도 표시
 * - RiskBadge: 위험도 배지 개선
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskGauge from '../../components/common/RiskGauge';
import RiskBadge from '../../components/common/RiskBadge';

describe('RiskGauge - 위험도 게이지 컴포넌트', () => {
  it('게이지 바를 렌더링해야 함', () => {
    render(<RiskGauge value={50} max={100} level="safe" />);
    const gauge = screen.getByRole('progressbar');
    expect(gauge).toBeInTheDocument();
  });

  it('value와 max에 따라 정확한 퍼센트를 표시해야 함', () => {
    render(<RiskGauge value={75} max={100} level="caution" />);
    const gauge = screen.getByRole('progressbar');
    expect(gauge).toHaveAttribute('aria-valuenow', '75');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');
  });

  it('위험도 레벨에 따라 올바른 색상 클래스를 가져야 함', () => {
    const { container, rerender } = render(<RiskGauge value={50} max={100} level="safe" />);

    // Safe - 초록색
    let gaugeBar = container.querySelector('.bg-green-500');
    expect(gaugeBar).toBeInTheDocument();

    // Caution - 노란색
    rerender(<RiskGauge value={50} max={100} level="caution" />);
    gaugeBar = container.querySelector('.bg-yellow-500');
    expect(gaugeBar).toBeInTheDocument();

    // Danger - 빨간색
    rerender(<RiskGauge value={50} max={100} level="danger" />);
    gaugeBar = container.querySelector('.bg-red-500');
    expect(gaugeBar).toBeInTheDocument();
  });

  it('게이지 바가 정확한 너비를 가져야 함', () => {
    const { container } = render(<RiskGauge value={75} max={100} level="watch" />);
    const gaugeBar = container.querySelector('[role="progressbar"] > div');
    expect(gaugeBar).toHaveStyle({ width: '75%' });
  });

  it('label prop을 표시해야 함', () => {
    render(<RiskGauge value={50} max={100} level="safe" label="수위" />);
    expect(screen.getByText('수위')).toBeInTheDocument();
  });

  it('현재값/최대값을 텍스트로 표시해야 함', () => {
    render(<RiskGauge value={7.5} max={10} level="caution" showValues={true} />);
    expect(screen.getByText(/7\.5/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('퍼센트를 표시해야 함', () => {
    render(<RiskGauge value={75} max={100} level="watch" showPercent={true} />);
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('100%를 초과하지 않아야 함', () => {
    render(<RiskGauge value={120} max={100} level="danger" showPercent={true} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('음수 값을 0으로 처리해야 함', () => {
    const { container } = render(<RiskGauge value={-10} max={100} level="safe" />);
    const gaugeBar = container.querySelector('[role="progressbar"] > div');
    expect(gaugeBar).toHaveStyle({ width: '0%' });
  });
});

describe('RiskBadge - 위험도 배지 컴포넌트', () => {
  it('위험도 레벨을 텍스트로 표시해야 함', () => {
    render(<RiskBadge level="safe" text="안전" />);
    expect(screen.getByText('안전')).toBeInTheDocument();
  });

  it('위험도 레벨에 따라 올바른 색상 클래스를 가져야 함', () => {
    const { container, rerender } = render(<RiskBadge level="safe" text="안전" />);

    // Safe - 초록색
    let badge = container.firstChild;
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');

    // Watch - 파란색
    rerender(<RiskBadge level="watch" text="주의" />);
    badge = container.firstChild;
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');

    // Caution - 노란색
    rerender(<RiskBadge level="caution" text="경계" />);
    badge = container.firstChild;
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');

    // Danger - 빨간색
    rerender(<RiskBadge level="danger" text="위험" />);
    badge = container.firstChild;
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  it('아이콘을 표시해야 함', () => {
    const { container } = render(<RiskBadge level="danger" text="위험" icon="⚠️" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('아이콘 없이도 렌더링되어야 함', () => {
    render(<RiskBadge level="safe" text="안전" />);
    expect(screen.getByText('안전')).toBeInTheDocument();
  });

  it('size prop에 따라 크기가 변경되어야 함', () => {
    const { container, rerender } = render(<RiskBadge level="safe" text="안전" size="sm" />);

    let badge = container.firstChild;
    expect(badge.className).toContain('text-xs');

    rerender(<RiskBadge level="safe" text="안전" size="md" />);
    badge = container.firstChild;
    expect(badge.className).toContain('text-sm');

    rerender(<RiskBadge level="safe" text="안전" size="lg" />);
    badge = container.firstChild;
    expect(badge.className).toContain('text-base');
  });

  it('기본 크기는 md여야 함', () => {
    const { container } = render(<RiskBadge level="safe" text="안전" />);
    const badge = container.firstChild;
    expect(badge.className).toContain('text-sm');
  });

  it('추가 className을 적용할 수 있어야 함', () => {
    const { container } = render(<RiskBadge level="safe" text="안전" className="custom-class" />);
    expect(container.firstChild.className).toContain('custom-class');
  });
});
