/**
 * 실시간 알림 모니터링 커스텀 훅
 * 위험도 기반 자동 알림 시스템
 */

import { useState, useEffect, useRef } from 'react';
import { calculateRainfallRisk, calculateWaterLevelRisk } from '../utils/riskCalculator';
import { sendRainfallAlert, sendWaterLevelAlert } from '../utils/notifications';

// 알림 히스토리 관리
const HISTORY_KEY = 'notificationHistory';
const MAX_HISTORY = 10;
const DUPLICATE_THRESHOLD = 5 * 60 * 1000; // 5분

function getNotificationHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function saveNotificationHistory(notification) {
  try {
    const history = getNotificationHistory();
    history.unshift(notification);

    // 최근 10개만 유지
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save notification history:', error);
  }
}

function findRecentNotification(type, level) {
  const history = getNotificationHistory();
  const now = Date.now();

  return history.find(
    (notification) =>
      notification.type === type &&
      notification.level === level &&
      now - notification.timestamp < DUPLICATE_THRESHOLD
  );
}

/**
 * 실시간 알림 모니터링 훅
 *
 * @param {Object} params
 * @param {string} params.type - 'rainfall' | 'waterLevel' | 'weatherAlert'
 * @param {Object} params.data - 모니터링할 데이터
 * @param {Object} params.settings - 사용자 알림 설정
 * @returns {Object} { shouldNotify, riskLevel, reason }
 */
export function useNotificationMonitor({ type, data, settings }) {
  const [result, setResult] = useState({
    shouldNotify: false,
    riskLevel: 'safe',
    reason: null,
  });

  const prevDataRef = useRef(null);

  useEffect(() => {
    // 알림 비활성화 시 종료
    if (!settings?.enabled) {
      setResult({
        shouldNotify: false,
        riskLevel: 'safe',
        reason: 'notifications_disabled',
      });
      return;
    }

    // 데이터 없을 시 종료
    if (!data) {
      setResult({
        shouldNotify: false,
        riskLevel: 'safe',
        reason: 'no_data',
      });
      return;
    }

    // 위험도 계산
    let risk;
    let shouldSend = false;

    if (type === 'rainfall') {
      // 타입별 설정 확인
      if (!settings.rainfallAlerts) {
        setResult({
          shouldNotify: false,
          riskLevel: 'safe',
          reason: 'type_disabled',
        });
        return;
      }

      // 커스텀 threshold 적용
      const thresholds = settings.thresholds || {};

      risk = calculateRainfallRisk({
        rainfall1h: data.rainfall1h || 0,
        rainfall24h: data.rainfall24h || 0,
      });

      // 커스텀 threshold가 있으면 재계산
      if (thresholds.rainfall1h && data.rainfall1h >= thresholds.rainfall1h) {
        risk = { level: 'danger', text: '위험' };
      }

      shouldSend = risk.level === 'danger' || risk.level === 'caution';
    } else if (type === 'waterLevel') {
      if (!settings.waterLevelAlerts) {
        setResult({
          shouldNotify: false,
          riskLevel: 'safe',
          reason: 'type_disabled',
        });
        return;
      }

      risk = calculateWaterLevelRisk({
        current: data.current || 0,
        watch: data.watch || 0,
        caution: data.caution || 0,
        danger: data.danger || 0,
      });

      shouldSend = risk.level === 'danger' || risk.level === 'caution';
    }

    if (!risk) {
      setResult({
        shouldNotify: false,
        riskLevel: 'safe',
        reason: 'unknown_type',
      });
      return;
    }

    // 안전 수준이면 알림 불필요
    if (risk.level === 'safe' || risk.level === 'watch') {
      setResult({
        shouldNotify: false,
        riskLevel: risk.level,
        reason: 'safe_level',
      });
      return;
    }

    // 중복 알림 체크 (5분 이내)
    const recentNotification = findRecentNotification(type, risk.level);
    if (recentNotification) {
      setResult({
        shouldNotify: false,
        riskLevel: risk.level,
        reason: 'duplicate_within_5min',
      });
      return;
    }

    // 알림 발송 가능
    if (shouldSend) {
      setResult({
        shouldNotify: true,
        riskLevel: risk.level,
        reason: 'threshold_exceeded',
      });

      // 실제 알림 발송
      try {
        if (type === 'rainfall') {
          sendRainfallAlert(data);
        } else if (type === 'waterLevel') {
          sendWaterLevelAlert(data);
        }

        // 히스토리 저장
        saveNotificationHistory({
          id: `${type}-${Date.now()}`,
          type,
          level: risk.level,
          message: risk.text,
          timestamp: Date.now(),
          data,
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    } else {
      setResult({
        shouldNotify: false,
        riskLevel: risk.level,
        reason: 'below_threshold',
      });
    }

    prevDataRef.current = data;
  }, [type, data, settings]);

  return result;
}

/**
 * 알림 히스토리 조회 훅
 */
export function useNotificationHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getNotificationHistory());

    // localStorage 변경 감지
    const handleStorageChange = () => {
      setHistory(getNotificationHistory());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return history;
}

/**
 * 알림 히스토리 초기화
 */
export function clearNotificationHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear notification history:', error);
  }
}
