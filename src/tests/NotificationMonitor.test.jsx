/**
 * 실시간 알림 모니터링 시스템 테스트 (TDD Red Phase)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationMonitor } from '../hooks/useNotificationMonitor';

// Notification API Mock
const mockNotification = vi.fn();
global.Notification = mockNotification;
global.Notification.permission = 'granted';

describe('실시간 알림 모니터링 시스템', () => {
  beforeEach(() => {
    mockNotification.mockClear();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('위험도 기반 자동 알림', () => {
    it('강수량 50mm 초과 시 위험 알림 발송', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(true);
      expect(result.current.riskLevel).toBe('danger');
    });

    it('수위 홍수위 초과 시 긴급 알림 발송', () => {
      const waterLevelData = {
        current: 5.8,
        danger: 5.5, // 홍수위
      };

      const settings = {
        enabled: true,
        waterLevelAlerts: true,
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'waterLevel',
          data: waterLevelData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(true);
      expect(result.current.riskLevel).toBe('danger');
    });

    it('안전 수준일 때는 알림 발송 안 함', () => {
      const rainfallData = {
        rainfall1h: 5,
        rainfall24h: 20,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(false);
      expect(result.current.riskLevel).toBe('safe');
    });
  });

  describe('중복 알림 방지', () => {
    it('5분 이내 같은 알림은 발송하지 않음', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      // 첫 번째 알림
      const { result, rerender } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      const firstCheck = result.current.shouldNotify;

      // 3분 경과
      act(() => {
        vi.advanceTimersByTime(3 * 60 * 1000);
      });

      // 같은 데이터로 재렌더링
      rerender();

      expect(firstCheck).toBe(true);
      expect(result.current.shouldNotify).toBe(false); // 중복 방지
      expect(result.current.reason).toBe('duplicate_within_5min');
    });

    it('5분 경과 후에는 다시 알림 발송 가능', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      const { result, rerender } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      const firstCheck = result.current.shouldNotify;

      // 6분 경과
      act(() => {
        vi.advanceTimersByTime(6 * 60 * 1000);
      });

      rerender();

      expect(firstCheck).toBe(true);
      expect(result.current.shouldNotify).toBe(true); // 재발송 가능
    });
  });

  describe('사용자 설정 필터링', () => {
    it('알림 전체 OFF 시 발송 안 함', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: false, // 전체 OFF
        rainfallAlerts: true,
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(false);
      expect(result.current.reason).toBe('notifications_disabled');
    });

    it('강수량 알림 OFF 시 강수량 위험도 무시', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: false, // 강수량 알림 OFF
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(false);
      expect(result.current.reason).toBe('type_disabled');
    });

    it('threshold 커스터마이징 반영', () => {
      const rainfallData = {
        rainfall1h: 40, // 기본 50mm보다 낮음
        rainfall24h: 120,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
        thresholds: {
          rainfall1h: 35, // 사용자 지정 threshold
        },
      };

      const { result } = renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      expect(result.current.shouldNotify).toBe(true); // 커스텀 기준 초과
      expect(result.current.riskLevel).toBe('danger');
    });
  });

  describe('알림 히스토리 관리', () => {
    it('발송된 알림을 localStorage에 저장', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      renderHook(() =>
        useNotificationMonitor({
          type: 'rainfall',
          data: rainfallData,
          settings
        })
      );

      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');

      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        type: 'rainfall',
        level: 'danger',
      });
      expect(history[0].timestamp).toBeDefined();
    });

    it('최근 10개 알림만 유지', () => {
      const rainfallData = {
        rainfall1h: 55,
        rainfall24h: 180,
      };

      const settings = {
        enabled: true,
        rainfallAlerts: true,
      };

      // 15개 알림 발송 (5분 간격)
      for (let i = 0; i < 15; i++) {
        renderHook(() =>
          useNotificationMonitor({
            type: 'rainfall',
            data: { ...rainfallData, timestamp: Date.now() + i },
            settings
          })
        );

        act(() => {
          vi.advanceTimersByTime(6 * 60 * 1000);
        });
      }

      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');

      expect(history).toHaveLength(10); // 최근 10개만
    });
  });
});
