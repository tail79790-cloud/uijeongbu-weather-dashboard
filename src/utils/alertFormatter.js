/**
 * 기상특보 텍스트 포맷팅 유틸리티
 */

/**
 * 기상특보 텍스트 포맷팅
 * - 'ㅇ' 또는 'ㅁ' 기호 앞에 줄바꿈 추가
 * - 연속된 줄바꿈 정리
 *
 * @param {string} text - 원본 텍스트
 * @returns {string} 포맷팅된 텍스트
 */
export function formatAlertText(text) {
  // null, undefined, 빈 문자열 처리
  if (!text || typeof text !== 'string') {
    return '';
  }

  // 공백만 있는 경우
  if (text.trim() === '') {
    return '';
  }

  let formatted = text;

  // 'ㅇ' 기호 앞에 줄바꿈 추가 (모든 'ㅇ' 앞에 추가)
  formatted = formatted.replace(/ㅇ /g, '\nㅇ ');

  // 'ㅁ' 기호 앞에 줄바꿈 추가 (모든 'ㅁ' 앞에 추가)
  formatted = formatted.replace(/ㅁ /g, '\nㅁ ');

  // 연속된 줄바꿈을 하나로 정리 (2개 이상 → 1개)
  formatted = formatted.replace(/\n{2,}/g, '\n');

  // 뒤쪽 공백만 제거 (앞의 줄바꿈은 유지)
  formatted = formatted.trimEnd();

  return formatted;
}

/**
 * 지역 코드 매핑
 */
export const REGION_CODES = {
  nationwide: null,      // 전국 (stnId 없이 조회)
  sudogwon: '108',       // 수도권 (서울)
  uijeongbu: '109'       // 의정부
};

/**
 * 지역 이름 매핑
 */
export const REGION_NAMES = {
  nationwide: '전국',
  sudogwon: '수도권',
  uijeongbu: '의정부시'
};

export default {
  formatAlertText,
  REGION_CODES,
  REGION_NAMES
};
