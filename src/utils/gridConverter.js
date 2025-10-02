/**
 * 기상청 격자 좌표 변환 유틸리티
 * 위경도(lat, lng) ↔ 격자좌표(nx, ny) 변환
 * Lambert Conformal Conic (LCC) 투영법 사용
 */

// 변환 상수
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기준점 Y좌표(GRID)

const DEGRAD = Math.PI / 180.0;
const RADDEG = 180.0 / Math.PI;

/**
 * 위경도를 격자 좌표로 변환
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {{nx: number, ny: number}} 격자 좌표
 */
export function latLngToGrid(lat, lng) {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

/**
 * 격자 좌표를 위경도로 변환
 * @param {number} nx - 격자 X 좌표
 * @param {number} ny - 격자 Y 좌표
 * @returns {{lat: number, lng: number}} 위경도
 */
export function gridToLatLng(nx, ny) {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  const xn = nx - XO;
  const yn = ro - ny + YO;
  let ra = Math.sqrt(xn * xn + yn * yn);
  if (sn < 0.0) ra = -ra;
  let alat = Math.pow((re * sf) / ra, 1.0 / sn);
  alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

  let theta = 0.0;
  if (Math.abs(xn) <= 0.0) {
    theta = 0.0;
  } else {
    if (Math.abs(yn) <= 0.0) {
      theta = Math.PI * 0.5;
      if (xn < 0.0) theta = -theta;
    } else {
      theta = Math.atan2(xn, yn);
    }
  }
  const alon = theta / sn + olon;

  const lat = alat * RADDEG;
  const lng = alon * RADDEG;

  return { lat, lng };
}

/**
 * 의정부시 격자 좌표 (미리 계산된 값)
 */
export const UIJEONGBU_GRID = {
  lat: 37.738,
  lng: 127.034,
  nx: 61,
  ny: 127
};

/**
 * 주요 지역 격자 좌표
 */
export const MAJOR_LOCATIONS = {
  의정부: { lat: 37.738, lng: 127.034, nx: 61, ny: 127 },
  서울: { lat: 37.5665, lng: 126.978, nx: 60, ny: 127 },
  인천: { lat: 37.4563, lng: 126.7052, nx: 55, ny: 124 },
  수원: { lat: 37.2636, lng: 127.0286, nx: 60, ny: 121 },
  강릉: { lat: 37.7519, lng: 128.8761, nx: 92, ny: 131 },
  부산: { lat: 35.1796, lng: 129.0756, nx: 98, ny: 76 }
};

/**
 * 위경도에서 가장 가까운 격자 좌표 찾기
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {{nx: number, ny: number, distance: number}} 격자 좌표와 거리
 */
export function findNearestGrid(lat, lng) {
  const grid = latLngToGrid(lat, lng);
  const original = gridToLatLng(grid.nx, grid.ny);

  // 거리 계산 (단순 유클리드 거리)
  const distance = Math.sqrt(
    Math.pow(lat - original.lat, 2) + Math.pow(lng - original.lng, 2)
  );

  return {
    ...grid,
    distance: distance * 111 // km 단위로 변환 (대략)
  };
}

export default {
  latLngToGrid,
  gridToLatLng,
  findNearestGrid,
  UIJEONGBU_GRID,
  MAJOR_LOCATIONS
};
