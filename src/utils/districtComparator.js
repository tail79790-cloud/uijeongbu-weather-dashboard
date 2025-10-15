/**
 * District Comparator Utility
 * 의정부시 8개 행정구역 날씨 비교 분석
 */

/**
 * 의정부시 행정구역 정보
 */
export const DISTRICTS = {
  UIJEONGBU: {
    id: 'uijeongbu',
    name: '의정부동',
    lat: 37.738,
    lon: 127.033,
    description: '시청 소재지'
  },
  GABANG: {
    id: 'gabang',
    name: '가능동',
    lat: 37.750,
    lon: 127.050,
    description: '북부 지역'
  },
  HOWON: {
    id: 'howon',
    name: '호원동',
    lat: 37.720,
    lon: 127.040,
    description: '남부 지역'
  },
  GEUMO: {
    id: 'geumo',
    name: '금오동',
    lat: 37.760,
    lon: 127.020,
    description: '서북부 지역'
  },
  SINGOK: {
    id: 'singok',
    name: '신곡동',
    lat: 37.740,
    lon: 127.010,
    description: '서부 지역'
  },
  SONGSAN: {
    id: 'songsan',
    name: '송산동',
    lat: 37.730,
    lon: 127.060,
    description: '동부 지역'
  },
  JANGAM: {
    id: 'jangam',
    name: '장암동',
    lat: 37.750,
    lon: 127.030,
    description: '중북부 지역'
  },
  NOGYANG: {
    id: 'nogyang',
    name: '녹양동',
    lat: 37.720,
    lon: 127.020,
    description: '남서부 지역'
  }
};

/**
 * 온도 기반 색상 계산 (히트맵용)
 * @param {number} temp - 온도 (°C)
 * @param {number} minTemp - 최저 온도
 * @param {number} maxTemp - 최고 온도
 * @returns {string} RGB 색상 문자열
 */
export function getTempColor(temp, minTemp, maxTemp) {
  if (maxTemp === minTemp) {
    return 'rgb(100, 180, 255)'; // 기본 파란색
  }

  // 정규화 (0-1 범위)
  const normalized = (temp - minTemp) / (maxTemp - minTemp);

  // 파란색(차가움) -> 녹색(보통) -> 빨간색(더움)
  let r, g, b;

  if (normalized < 0.5) {
    // 파란색 -> 녹색
    const ratio = normalized * 2;
    r = Math.round(100 * ratio);
    g = Math.round(180 + 75 * ratio);
    b = Math.round(255 - 155 * ratio);
  } else {
    // 녹색 -> 빨간색
    const ratio = (normalized - 0.5) * 2;
    r = Math.round(100 + 155 * ratio);
    g = Math.round(255 - 155 * ratio);
    b = Math.round(100 - 100 * ratio);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 습도 기반 색상 계산
 * @param {number} humidity - 습도 (%)
 * @returns {string} RGB 색상 문자열
 */
export function getHumidityColor(humidity) {
  // 낮은 습도(건조) -> 노란색
  // 높은 습도(습함) -> 파란색
  const normalized = humidity / 100;

  const r = Math.round(255 - 155 * normalized);
  const g = Math.round(200 + 55 * normalized);
  const b = Math.round(100 + 155 * normalized);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 강수량 기반 색상 계산
 * @param {number} precipitation - 강수량 (mm)
 * @returns {string} RGB 색상 문자열
 */
export function getPrecipitationColor(precipitation) {
  if (precipitation === 0) {
    return 'rgb(230, 230, 230)'; // 회색 (비 없음)
  }

  // 강수량에 따라 연한 파란색 -> 진한 파란색
  const intensity = Math.min(precipitation / 50, 1); // 50mm 이상은 최대

  const r = Math.round(200 - 150 * intensity);
  const g = Math.round(220 - 150 * intensity);
  const b = 255;

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 극값 찾기
 * @param {Array} districtsData - 행정구역 날씨 데이터 배열
 * @param {string} metric - 측정 항목 ('temp', 'humidity', 'wind', 'precipitation')
 * @returns {Object} { min, max, minDistrict, maxDistrict }
 */
export function findExtremes(districtsData, metric) {
  if (!districtsData || districtsData.length === 0) {
    return { min: 0, max: 0, minDistrict: null, maxDistrict: null };
  }

  let min = Infinity;
  let max = -Infinity;
  let minDistrict = null;
  let maxDistrict = null;

  districtsData.forEach(district => {
    const weather = district.weather;
    if (!weather) return;

    let value;
    switch (metric) {
      case 'temp':
        value = weather.temp;
        break;
      case 'humidity':
        value = weather.humidity;
        break;
      case 'wind':
        value = weather.wind || weather.windSpeed;
        break;
      case 'precipitation':
        value = weather.precipitation || weather.rain || 0;
        break;
      default:
        return;
    }

    if (value < min) {
      min = value;
      minDistrict = district.district;
    }
    if (value > max) {
      max = value;
      maxDistrict = district.district;
    }
  });

  return { min, max, minDistrict, maxDistrict };
}

/**
 * 평균 계산
 * @param {Array} districtsData - 행정구역 날씨 데이터 배열
 * @param {string} metric - 측정 항목
 * @returns {number} 평균값
 */
export function calculateAverage(districtsData, metric) {
  if (!districtsData || districtsData.length === 0) return 0;

  const values = districtsData
    .map(district => {
      const weather = district.weather;
      if (!weather) return null;

      switch (metric) {
        case 'temp':
          return weather.temp;
        case 'humidity':
          return weather.humidity;
        case 'wind':
          return weather.wind || weather.windSpeed;
        case 'precipitation':
          return weather.precipitation || weather.rain || 0;
        default:
          return null;
      }
    })
    .filter(v => v !== null);

  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * 날씨 데이터 요약 생성
 * @param {Array} districtsData - 행정구역 날씨 데이터 배열
 * @returns {Object} 요약 정보
 */
export function generateSummary(districtsData) {
  if (!districtsData || districtsData.length === 0) {
    return {
      tempRange: { min: 0, max: 0 },
      avgTemp: 0,
      avgHumidity: 0,
      avgWind: 0,
      totalPrecipitation: 0,
      extremes: {
        hottestDistrict: null,
        coldestDistrict: null,
        mostHumidDistrict: null,
        driestDistrict: null,
        windiestDistrict: null
      }
    };
  }

  const tempExtremes = findExtremes(districtsData, 'temp');
  const humidityExtremes = findExtremes(districtsData, 'humidity');
  const windExtremes = findExtremes(districtsData, 'wind');

  return {
    tempRange: {
      min: tempExtremes.min,
      max: tempExtremes.max
    },
    avgTemp: calculateAverage(districtsData, 'temp'),
    avgHumidity: calculateAverage(districtsData, 'humidity'),
    avgWind: calculateAverage(districtsData, 'wind'),
    totalPrecipitation: districtsData.reduce((sum, d) => {
      const precip = d.weather?.precipitation || d.weather?.rain || 0;
      return sum + precip;
    }, 0),
    extremes: {
      hottestDistrict: tempExtremes.maxDistrict,
      coldestDistrict: tempExtremes.minDistrict,
      mostHumidDistrict: humidityExtremes.maxDistrict,
      driestDistrict: humidityExtremes.minDistrict,
      windiestDistrict: windExtremes.maxDistrict
    }
  };
}

/**
 * 날씨 설명을 이모지로 변환
 * @param {string} description - 날씨 설명
 * @returns {string} 이모지
 */
export function getWeatherEmoji(description) {
  if (!description) return '🌤️';

  const desc = description.toLowerCase();

  if (desc.includes('맑') || desc.includes('clear')) return '☀️';
  if (desc.includes('구름') || desc.includes('cloud')) return '☁️';
  if (desc.includes('비') || desc.includes('rain')) return '🌧️';
  if (desc.includes('눈') || desc.includes('snow')) return '❄️';
  if (desc.includes('안개') || desc.includes('fog') || desc.includes('mist')) return '🌫️';
  if (desc.includes('천둥') || desc.includes('thunder')) return '⛈️';

  return '🌤️';
}

/**
 * 데이터 품질 검증
 * @param {Array} districtsData - 행정구역 날씨 데이터 배열
 * @returns {Object} { valid: boolean, validCount: number, totalCount: number }
 */
export function validateData(districtsData) {
  if (!districtsData || districtsData.length === 0) {
    return { valid: false, validCount: 0, totalCount: 0 };
  }

  const validData = districtsData.filter(d => {
    return d.weather &&
           typeof d.weather.temp === 'number' &&
           typeof d.weather.humidity === 'number';
  });

  return {
    valid: validData.length >= districtsData.length * 0.5, // 50% 이상 유효
    validCount: validData.length,
    totalCount: districtsData.length
  };
}

/**
 * 데이터를 그리드 형태로 변환 (히트맵용)
 * @param {Array} districtsData - 행정구역 날씨 데이터 배열
 * @param {string} metric - 측정 항목
 * @returns {Array} 그리드 데이터
 */
export function prepareHeatmapData(districtsData, metric) {
  if (!districtsData || districtsData.length === 0) return [];

  const extremes = findExtremes(districtsData, metric);

  return districtsData.map(district => {
    const weather = district.weather;
    if (!weather) {
      return {
        district: district.district,
        value: 0,
        color: 'rgb(200, 200, 200)',
        formattedValue: 'N/A'
      };
    }

    let value, formattedValue, color;

    switch (metric) {
      case 'temp':
        value = weather.temp;
        formattedValue = `${value.toFixed(1)}°C`;
        color = getTempColor(value, extremes.min, extremes.max);
        break;
      case 'humidity':
        value = weather.humidity;
        formattedValue = `${value.toFixed(0)}%`;
        color = getHumidityColor(value);
        break;
      case 'wind':
        value = weather.wind || weather.windSpeed;
        formattedValue = `${value.toFixed(1)} m/s`;
        color = `rgba(100, 150, 255, ${Math.min(value / 15, 1)})`;
        break;
      case 'precipitation':
        value = weather.precipitation || weather.rain || 0;
        formattedValue = `${value.toFixed(1)} mm`;
        color = getPrecipitationColor(value);
        break;
      default:
        value = 0;
        formattedValue = 'N/A';
        color = 'rgb(200, 200, 200)';
    }

    return {
      district: district.district,
      value,
      color,
      formattedValue
    };
  });
}
