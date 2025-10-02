/**
 * 위험도 계산 로직 테스트 (TDD Red Phase)
 *
 * 목표: 강수량, 수위에 따른 위험도를 일관되게 계산
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRiskLevel,
  getRiskColor,
  getRiskText,
  calculateWaterLevelRisk,
  calculateRainfallRisk
} from '../../utils/riskCalculator';

describe('calculateRiskLevel - 위험도 계산', () => {
  it('안전 수준을 반환해야 함', () => {
    const result = calculateRiskLevel({
      value: 5,
      thresholds: { watch: 10, caution: 20, danger: 30 }
    });
    expect(result.level).toBe('safe');
    expect(result.text).toBe('안전');
  });

  it('주의 수준을 반환해야 함', () => {
    const result = calculateRiskLevel({
      value: 15,
      thresholds: { watch: 10, caution: 20, danger: 30 }
    });
    expect(result.level).toBe('watch');
    expect(result.text).toBe('주의');
  });

  it('경계 수준을 반환해야 함', () => {
    const result = calculateRiskLevel({
      value: 25,
      thresholds: { watch: 10, caution: 20, danger: 30 }
    });
    expect(result.level).toBe('caution');
    expect(result.text).toBe('경계');
  });

  it('위험 수준을 반환해야 함', () => {
    const result = calculateRiskLevel({
      value: 35,
      thresholds: { watch: 10, caution: 20, danger: 30 }
    });
    expect(result.level).toBe('danger');
    expect(result.text).toBe('위험');
  });

  it('경계값을 정확히 처리해야 함', () => {
    const thresholds = { watch: 10, caution: 20, danger: 30 };

    expect(calculateRiskLevel({ value: 10, thresholds }).level).toBe('watch');
    expect(calculateRiskLevel({ value: 20, thresholds }).level).toBe('caution');
    expect(calculateRiskLevel({ value: 30, thresholds }).level).toBe('danger');
  });
});

describe('getRiskColor - 위험도별 색상', () => {
  it('안전 수준의 색상을 반환해야 함', () => {
    const color = getRiskColor('safe');
    expect(color).toContain('green');
  });

  it('주의 수준의 색상을 반환해야 함', () => {
    const color = getRiskColor('watch');
    expect(color).toContain('blue');
  });

  it('경계 수준의 색상을 반환해야 함', () => {
    const color = getRiskColor('caution');
    expect(color).toContain('yellow');
  });

  it('위험 수준의 색상을 반환해야 함', () => {
    const color = getRiskColor('danger');
    expect(color).toContain('red');
  });

  it('알 수 없는 레벨은 기본 색상을 반환해야 함', () => {
    const color = getRiskColor('unknown');
    expect(color).toContain('gray');
  });
});

describe('getRiskText - 위험도별 텍스트', () => {
  it('위험도 레벨에 따른 한글 텍스트를 반환해야 함', () => {
    expect(getRiskText('safe')).toBe('안전');
    expect(getRiskText('watch')).toBe('주의');
    expect(getRiskText('caution')).toBe('경계');
    expect(getRiskText('danger')).toBe('위험');
  });

  it('알 수 없는 레벨은 기본 텍스트를 반환해야 함', () => {
    expect(getRiskText('unknown')).toBe('알 수 없음');
  });
});

describe('calculateWaterLevelRisk - 수위 위험도 계산', () => {
  it('주의수위 미만은 안전으로 판단해야 함', () => {
    const result = calculateWaterLevelRisk({
      current: 5.0,
      watch: 6.0,
      caution: 7.0,
      danger: 8.0
    });
    expect(result.level).toBe('safe');
  });

  it('주의수위 이상은 주의로 판단해야 함', () => {
    const result = calculateWaterLevelRisk({
      current: 6.5,
      watch: 6.0,
      caution: 7.0,
      danger: 8.0
    });
    expect(result.level).toBe('watch');
  });

  it('경계수위 이상은 경계로 판단해야 함', () => {
    const result = calculateWaterLevelRisk({
      current: 7.5,
      watch: 6.0,
      caution: 7.0,
      danger: 8.0
    });
    expect(result.level).toBe('caution');
  });

  it('홍수위 이상은 위험으로 판단해야 함', () => {
    const result = calculateWaterLevelRisk({
      current: 8.5,
      watch: 6.0,
      caution: 7.0,
      danger: 8.0
    });
    expect(result.level).toBe('danger');
  });

  it('퍼센트를 계산해야 함', () => {
    const result = calculateWaterLevelRisk({
      current: 6.0,
      watch: 6.0,
      caution: 7.0,
      danger: 8.0
    });
    expect(result.percent).toBe(75); // 6 / 8 * 100 = 75%
  });
});

describe('calculateRainfallRisk - 강수량 위험도 계산', () => {
  it('1시간 강수량에 따라 위험도를 계산해야 함', () => {
    expect(calculateRainfallRisk({ rainfall1h: 5 }).level).toBe('safe');
    expect(calculateRainfallRisk({ rainfall1h: 15 }).level).toBe('watch');
    expect(calculateRainfallRisk({ rainfall1h: 35 }).level).toBe('caution');
    expect(calculateRainfallRisk({ rainfall1h: 60 }).level).toBe('danger');
  });

  it('24시간 강수량에 따라 위험도를 계산해야 함', () => {
    expect(calculateRainfallRisk({ rainfall24h: 50 }).level).toBe('safe');
    expect(calculateRainfallRisk({ rainfall24h: 100 }).level).toBe('watch');
    expect(calculateRainfallRisk({ rainfall24h: 200 }).level).toBe('caution');
    expect(calculateRainfallRisk({ rainfall24h: 300 }).level).toBe('danger');
  });

  it('1시간과 24시간 중 높은 위험도를 반환해야 함', () => {
    const result = calculateRainfallRisk({
      rainfall1h: 10,  // watch
      rainfall24h: 250 // danger
    });
    expect(result.level).toBe('danger');
  });

  it('강수량이 0이면 안전으로 판단해야 함', () => {
    const result = calculateRainfallRisk({ rainfall1h: 0, rainfall24h: 0 });
    expect(result.level).toBe('safe');
  });
});
