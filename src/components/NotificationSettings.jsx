import { useState, useEffect } from 'react';
import { useWidgetSize } from '../hooks/useWidgetSize';
import {
  requestNotificationPermission,
  getNotificationPermission,
  loadNotificationSettings,
  saveNotificationSettings,
  testNotification
} from '../utils/notifications';

const NotificationSettings = () => {
  const { size } = useWidgetSize('notification-settings');

  const [permission, setPermission] = useState('default');
  const [settings, setSettings] = useState({
    enabled: false,
    weatherAlerts: true,
    rainfallAlerts: true,
    waterLevelAlerts: true,
    dailyUpdates: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setSettings(loadNotificationSettings());
  }, []);

  const handleEnableNotifications = async () => {
    if (permission === 'unsupported') {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (permission === 'denied') {
      alert('알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
      testNotification();
    }
  };

  const handleSettingChange = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleDisableNotifications = () => {
    const newSettings = { ...settings, enabled: false };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  return (
    <div className="weather-card border-l-4 border-blue-500">
      <div className="weather-card-header">
        <span>🔔 알림 설정</span>
        {size !== 'small' && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showSettings ? '닫기' : '설정'}
          </button>
        )}
      </div>

      <div className="p-4">
        {/* 알림 권한 상태 */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className={`flex ${size === 'small' ? 'flex-col' : 'items-center justify-between'}`}>
            <div className={size === 'small' ? 'mb-3' : ''}>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                알림 상태
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {permission === 'granted' && '✅ 알림 활성화'}
                {permission === 'denied' && '❌ 알림 차단됨'}
                {permission === 'default' && '⚪ 알림 비활성화'}
                {permission === 'unsupported' && '🚫 지원되지 않음'}
              </div>
            </div>
            {!settings.enabled && permission !== 'denied' && permission !== 'unsupported' && (
              <button
                onClick={handleEnableNotifications}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm ${size === 'small' ? 'w-full' : ''}`}
              >
                알림 켜기
              </button>
            )}
            {settings.enabled && (
              <button
                onClick={handleDisableNotifications}
                className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm ${size === 'small' ? 'w-full' : ''}`}
              >
                알림 끄기
              </button>
            )}
          </div>
        </div>

        {/* 상세 설정 - medium 이상에서만 표시 */}
        {size !== 'small' && showSettings && settings.enabled && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              알림 종류 선택
            </div>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  🚨 기상 특보
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  기상청 발령 긴급 특보
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.weatherAlerts}
                onChange={() => handleSettingChange('weatherAlerts')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  🌧️ 강수량 알림
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  시간당 10mm 이상 강수 시
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.rainfallAlerts}
                onChange={() => handleSettingChange('rainfallAlerts')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  🌊 수위 경보
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  홍수 위험 수위 도달 시
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.waterLevelAlerts}
                onChange={() => handleSettingChange('waterLevelAlerts')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  🌤️ 일일 요약
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  매일 아침 8시 날씨 요약
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyUpdates}
                onChange={() => handleSettingChange('dailyUpdates')}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <button
              onClick={testNotification}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              테스트 알림 보내기
            </button>
          </div>
        )}

        {/* 안내 메시지 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 <strong>알림 안내</strong><br />
              • 기상 특보 발령 시 즉시 알림<br />
              • 강수량/수위 임계치 초과 시 경보<br />
              • 모바일 홈 화면에 추가하면 앱처럼 사용 가능
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
