import axios from 'axios';

// OpenWeatherMap API 설정
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// API 인스턴스 생성
const openWeatherApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 에러 처리
openWeatherApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('OpenWeatherMap API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 현재 날씨 정보 조회
export const getCurrentWeather = async (lat = 37.738, lon = 127.034) => {
  try {
    console.log('현재 날씨 데이터 요청:', { lat, lon });

    const response = await openWeatherApi.get('/weather', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric', // 섭씨 온도
        lang: 'kr' // 한국어
      }
    });

    if (response.data) {
      return {
        success: true,
        data: processCurrentWeatherData(response.data),
        message: '현재 날씨 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('현재 날씨 조회 오류:', error);

    // API 키 문제 상세 에러 메시지
    if (error.response?.status === 401) {
      return {
        success: false,
        data: null,
        message: `OpenWeatherMap API 인증 실패 (401): API 키를 확인하세요. 현재 키: ${API_KEY === 'demo_key' ? 'demo_key (유효하지 않음)' : '설정됨'}`
      };
    }

    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || '현재 날씨 조회 중 오류가 발생했습니다.'
    };
  }
};

// 5일 예보 정보 조회
export const getForecast = async (lat = 37.738, lon = 127.034) => {
  try {
    console.log('예보 데이터 요청:', { lat, lon });

    const response = await openWeatherApi.get('/forecast', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr'
      }
    });

    if (response.data) {
      return {
        success: true,
        data: processForecastData(response.data),
        message: '예보 데이터 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('예보 데이터 조회 오류:', error);

    if (error.response?.status === 401) {
      return {
        success: false,
        data: [],
        message: `OpenWeatherMap API 인증 실패 (401): API 키를 확인하세요.`
      };
    }

    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || '예보 데이터 조회 중 오류가 발생했습니다.'
    };
  }
};

// 대기질 정보 조회
export const getAirPollution = async (lat = 37.738, lon = 127.034) => {
  try {
    console.log('대기질 데이터 요청:', { lat, lon });

    const response = await openWeatherApi.get('/air_pollution', {
      params: {
        lat,
        lon,
        appid: API_KEY
      }
    });

    if (response.data) {
      return {
        success: true,
        data: processAirPollutionData(response.data),
        message: '대기질 정보 조회 성공'
      };
    } else {
      throw new Error('응답 데이터가 없습니다');
    }
  } catch (error) {
    console.error('대기질 정보 조회 오류:', error);

    if (error.response?.status === 401) {
      return {
        success: false,
        data: null,
        message: `OpenWeatherMap API 인증 실패 (401): API 키를 확인하세요.`
      };
    }

    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || '대기질 정보 조회 중 오류가 발생했습니다.'
    };
  }
};

// 현재 날씨 데이터 처리
const processCurrentWeatherData = (data) => {
  return {
    temperature: Math.round(data.main.temp * 10) / 10,
    feelsLike: Math.round(data.main.feels_like * 10) / 10,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDirection: getWindDirection(data.wind.deg),
    visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
    precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
    sky: data.weather[0].description,
    skyIcon: getWeatherIcon(data.weather[0].icon),
    cloudiness: data.clouds.all,
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    lastUpdate: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    location: `${data.name}, ${data.sys.country}`
  };
};

// 예보 데이터 처리
const processForecastData = (data) => {
  return data.list.map(item => ({
    datetime: new Date(item.dt * 1000),
    temperature: Math.round(item.main.temp * 10) / 10,
    feelsLike: Math.round(item.main.feels_like * 10) / 10,
    humidity: item.main.humidity,
    windSpeed: item.wind.speed,
    precipitation: item.rain ? (item.rain['3h'] || 0) : 0,
    sky: item.weather[0].description,
    skyIcon: getWeatherIcon(item.weather[0].icon),
    pop: Math.round(item.pop * 100) // 강수 확률
  }));
};

// 대기질 데이터 처리
const processAirPollutionData = (data) => {
  const aqi = data.list[0];
  return {
    aqi: aqi.main.aqi,
    aqiText: getAQIText(aqi.main.aqi),
    co: aqi.components.co,
    no: aqi.components.no,
    no2: aqi.components.no2,
    o3: aqi.components.o3,
    so2: aqi.components.so2,
    pm2_5: aqi.components.pm2_5,
    pm10: aqi.components.pm10,
    nh3: aqi.components.nh3,
    lastUpdate: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

// 유틸리티 함수들
const getWindDirection = (deg) => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  return directions[Math.round(deg / 45) % 8];
};

const getWeatherIcon = (iconCode) => {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '🌨️', '13n': '🌨️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '🌤️';
};

const getAQIText = (aqi) => {
  const levels = {
    1: '매우 좋음',
    2: '좋음',
    3: '보통',
    4: '나쁨',
    5: '매우 나쁨'
  };
  return levels[aqi] || '알 수 없음';
};

// 목업 데이터 함수들 (개발/테스트용)
const getMockCurrentWeatherData = () => ({
  success: true,
  data: {
    temperature: 15.2 + (Math.random() - 0.5) * 4,
    feelsLike: 14.8 + (Math.random() - 0.5) * 4,
    humidity: 45 + Math.round((Math.random() - 0.5) * 20),
    pressure: 1013 + Math.round((Math.random() - 0.5) * 20),
    windSpeed: 3.2 + (Math.random() - 0.5) * 2,
    windDirection: "북서",
    visibility: 10,
    precipitation: Math.random() < 0.3 ? Math.random() * 2 : 0,
    sky: "맑음",
    skyIcon: "☀️",
    cloudiness: Math.round(Math.random() * 30),
    sunrise: "06:42",
    sunset: "17:28",
    lastUpdate: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    location: "의정부시, KR"
  },
  message: '목업 현재 날씨 데이터'
});

const getMockForecastData = () => ({
  success: true,
  data: Array.from({ length: 40 }, (_, i) => {
    const datetime = new Date();
    datetime.setHours(datetime.getHours() + i * 3);

    return {
      datetime,
      temperature: 15 + Math.sin(i * 0.2) * 8 + (Math.random() - 0.5) * 3,
      feelsLike: 14 + Math.sin(i * 0.2) * 8 + (Math.random() - 0.5) * 3,
      humidity: 50 + Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 10,
      windSpeed: 2 + Math.random() * 4,
      precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
      sky: Math.random() < 0.7 ? "맑음" : "흐림",
      skyIcon: Math.random() < 0.7 ? "☀️" : "☁️",
      pop: Math.round(Math.random() * 100)
    };
  }),
  message: '목업 예보 데이터'
});

const getMockAirPollutionData = () => ({
  success: true,
  data: {
    aqi: Math.ceil(Math.random() * 3) + 1, // 1-4 범위
    aqiText: ['매우 좋음', '좋음', '보통', '나쁨'][Math.floor(Math.random() * 4)],
    co: 200 + Math.random() * 100,
    no: 0.1 + Math.random() * 0.5,
    no2: 10 + Math.random() * 20,
    o3: 50 + Math.random() * 50,
    so2: 5 + Math.random() * 10,
    pm2_5: 15 + Math.random() * 20,
    pm10: 25 + Math.random() * 25,
    nh3: 1 + Math.random() * 5,
    lastUpdate: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  },
  message: '목업 대기질 데이터'
});

// 환경 변수 확인 함수
export const checkApiConfiguration = () => {
  const config = {
    apiKey: !!API_KEY && API_KEY !== 'demo_key',
    baseUrl: BASE_URL,
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE
  };

  console.log('OpenWeatherMap API 설정 상태:', config);
  return config;
};

export default {
  getCurrentWeather,
  getForecast,
  getAirPollution,
  checkApiConfiguration
};