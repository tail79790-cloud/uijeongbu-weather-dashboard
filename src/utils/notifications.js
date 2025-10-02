// 브라우저 알림 유틸리티

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 알림 권한 상태 확인
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

// 기상 특보 알림 전송
export const sendWeatherAlert = (alertData) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: alertData.content || '새로운 기상 특보가 발령되었습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'weather-alert',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // 특보 레벨에 따른 알림 우선순위
  if (alertData.level === 'danger') {
    options.requireInteraction = true;
    options.vibrate = [300, 100, 300, 100, 300];
  }

  const notification = new Notification(
    alertData.title || '🚨 기상 특보',
    options
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// 일반 날씨 알림 (정기 업데이트)
export const sendWeatherUpdate = (weatherData) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: `현재 ${weatherData.temperature}°C, ${weatherData.condition}`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'weather-update',
    requireInteraction: false,
    silent: true,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  const notification = new Notification(
    '🌤️ 날씨 업데이트',
    options
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // 5초 후 자동 닫기
  setTimeout(() => notification.close(), 5000);

  return notification;
};

// 강수량 알림
export const sendRainfallAlert = (rainfallData) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: `1시간 강수량: ${rainfallData.rainfall1h}mm\n24시간 강수량: ${rainfallData.rainfall24h}mm`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'rainfall-alert',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  const notification = new Notification(
    '🌧️ 강수량 알림',
    options
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// 수위 경보 알림
export const sendWaterLevelAlert = (levelData) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: `${levelData.stationName}: ${levelData.waterLevel}m (경계 ${levelData.warningLevel}m)`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'water-level-alert',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  const notification = new Notification(
    '🌊 수위 경보',
    options
  );

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// 알림 설정 저장/불러오기
export const saveNotificationSettings = (settings) => {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
};

export const loadNotificationSettings = () => {
  const saved = localStorage.getItem('notificationSettings');
  if (saved) {
    return JSON.parse(saved);
  }

  // 기본 설정
  return {
    enabled: false,
    weatherAlerts: true,
    rainfallAlerts: true,
    waterLevelAlerts: true,
    dailyUpdates: false
  };
};

// 알림 테스트
export const testNotification = () => {
  if (Notification.permission !== 'granted') {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        new Notification('✅ 알림 테스트', {
          body: '알림이 정상적으로 작동합니다!',
          icon: '/icon-192.png'
        });
      }
    });
  } else {
    new Notification('✅ 알림 테스트', {
      body: '알림이 정상적으로 작동합니다!',
      icon: '/icon-192.png'
    });
  }
};
