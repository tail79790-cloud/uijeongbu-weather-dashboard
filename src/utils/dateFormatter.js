import { format, parse, addHours, startOfDay } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { ko } from 'date-fns/locale';

/**
 * 기상청 API 날짜 형식 변환 유틸리티
 * 모든 시간은 KST (Asia/Seoul, UTC+9) 기준
 */

const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 KST 시간 가져오기
 * @returns {Date} KST 시간대의 현재 시각
 */
export function getKSTNow() {
  return toZonedTime(new Date(), KST_TIMEZONE);
}

/**
 * 현재 날짜를 기상청 API 형식으로 변환 (YYYYMMDD)
 * @param {Date} date - 변환할 날짜 (기본값: 현재 KST)
 * @returns {string} YYYYMMDD 형식 문자열
 */
export function formatDateToKMA(date) {
  const kstDate = date ? toZonedTime(date, KST_TIMEZONE) : getKSTNow();
  return format(kstDate, 'yyyyMMdd');
}

/**
 * 현재 시간을 기상청 API 형식으로 변환 (HHmm)
 * @param {Date} date - 변환할 날짜 (기본값: 현재 KST)
 * @returns {string} HHmm 형식 문자열
 */
export function formatTimeToKMA(date) {
  const kstDate = date ? toZonedTime(date, KST_TIMEZONE) : getKSTNow();
  return format(kstDate, 'HHmm');
}

/**
 * 기상청 API 응답 날짜 파싱 (YYYYMMDD -> Date)
 * @param {string} dateStr - YYYYMMDD 형식 문자열
 * @returns {Date} 파싱된 날짜
 */
export function parseKMADate(dateStr) {
  return parse(dateStr, 'yyyyMMdd', new Date());
}

/**
 * 기상청 API 응답 시간 파싱 (HHmm -> Date)
 * @param {string} dateStr - YYYYMMDD 형식 문자열
 * @param {string} timeStr - HHmm 형식 문자열
 * @returns {Date} 파싱된 날짜시간
 */
export function parseKMADateTime(dateStr, timeStr) {
  return parse(`${dateStr}${timeStr}`, 'yyyyMMddHHmm', new Date());
}

/**
 * 발표 시각 계산 (기상청 API는 특정 시각에만 발표)
 * 초단기실황: 매 시간 40분에 발표
 * 초단기예보: 매 시간 30분에 발표
 * 단기예보: 02, 05, 08, 11, 14, 17, 20, 23시에 발표
 */

/**
 * 초단기실황 발표 시각 계산
 * @param {Date} date - 기준 날짜 (기본값: 현재 KST)
 * @returns {{baseDate: string, baseTime: string}} 발표 시각
 */
export function getUltraSrtNcstBase(date) {
  let baseDate = date ? toZonedTime(date, KST_TIMEZONE) : getKSTNow();
  let hour = baseDate.getHours();
  let minute = baseDate.getMinutes();

  // 40분 이전이면 이전 시간 사용
  if (minute < 40) {
    baseDate = addHours(baseDate, -1);
    hour = baseDate.getHours();
  }

  return {
    baseDate: formatDateToKMA(baseDate),
    baseTime: `${String(hour).padStart(2, '0')}00`
  };
}

/**
 * 초단기예보 발표 시각 계산
 * @param {Date} date - 기준 날짜 (기본값: 현재 KST)
 * @returns {{baseDate: string, baseTime: string}} 발표 시각
 */
export function getUltraSrtFcstBase(date) {
  let baseDate = date ? toZonedTime(date, KST_TIMEZONE) : getKSTNow();
  let hour = baseDate.getHours();
  let minute = baseDate.getMinutes();

  // 30분 이전이면 이전 시간 사용
  if (minute < 30) {
    baseDate = addHours(baseDate, -1);
    hour = baseDate.getHours();
  }

  return {
    baseDate: formatDateToKMA(baseDate),
    baseTime: `${String(hour).padStart(2, '0')}30`
  };
}

/**
 * 단기예보 발표 시각 계산
 * @param {Date} date - 기준 날짜 (기본값: 현재 KST)
 * @returns {{baseDate: string, baseTime: string}} 발표 시각
 */
export function getVilageFcstBase(date) {
  const baseDate = date ? toZonedTime(date, KST_TIMEZONE) : getKSTNow();
  const hour = baseDate.getHours();

  // 발표 시각: 02, 05, 08, 11, 14, 17, 20, 23시
  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];

  let baseHour = 23;
  for (let i = 0; i < baseHours.length; i++) {
    if (hour < baseHours[i]) {
      // 이전 발표 시각 사용
      baseHour = i === 0 ? 23 : baseHours[i - 1];
      if (i === 0) {
        baseDate.setDate(baseDate.getDate() - 1);
      }
      break;
    }
    baseHour = baseHours[i];
  }

  return {
    baseDate: formatDateToKMA(baseDate),
    baseTime: `${String(baseHour).padStart(2, '0')}00`
  };
}

/**
 * 한국어 날짜 포맷팅
 * @param {Date} date - 포맷팅할 날짜
 * @param {string} formatStr - 포맷 문자열 (date-fns 형식)
 * @returns {string} 포맷팅된 문자열
 */
export function formatKoreanDate(date, formatStr = 'yyyy년 MM월 dd일') {
  return format(date, formatStr, { locale: ko });
}

/**
 * 한국어 시간 포맷팅
 * @param {Date} date - 포맷팅할 날짜
 * @param {string} formatStr - 포맷 문자열
 * @returns {string} 포맷팅된 문자열
 */
export function formatKoreanTime(date, formatStr = 'HH:mm') {
  return format(date, formatStr, { locale: ko });
}

/**
 * 한국어 날짜시간 포맷팅
 * @param {Date} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 문자열
 */
export function formatKoreanDateTime(date) {
  return format(date, 'yyyy년 MM월 dd일 HH시 mm분', { locale: ko });
}

/**
 * 상대 시간 표시 (몇 분 전, 몇 시간 전 등)
 * @param {Date} date - 기준 날짜
 * @returns {string} 상대 시간 문자열
 */
export function getRelativeTime(date) {
  const now = getKSTNow();
  const kstDate = toZonedTime(date, KST_TIMEZONE);
  const diffInSeconds = Math.floor((now - kstDate) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  return formatKoreanDate(kstDate, 'MM월 dd일');
}

export default {
  getKSTNow,
  formatDateToKMA,
  formatTimeToKMA,
  parseKMADate,
  parseKMADateTime,
  getUltraSrtNcstBase,
  getUltraSrtFcstBase,
  getVilageFcstBase,
  formatKoreanDate,
  formatKoreanTime,
  formatKoreanDateTime,
  getRelativeTime
};
