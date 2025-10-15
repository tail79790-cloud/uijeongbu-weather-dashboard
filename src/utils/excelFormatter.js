/**
 * 엑셀 데이터 포맷 변환 유틸리티
 * - 엑셀 파일 파싱 및 검증
 * - 배치 데이터를 엑셀로 변환
 */

/**
 * 엑셀 열 이름 매핑
 * - 엑셀에서 사용하는 한글 열 이름
 */
export const EXCEL_COLUMNS = {
  NUMBER: '연번',
  LOCATION: '배치장소',
  DEPARTMENT: '소속',
  RANK: '계급',
  NAME: '성명',
  PHONE: '연락처',
  NOTE: '비고'
};

/**
 * 필수 컬럼 목록
 */
export const REQUIRED_COLUMNS = [
  EXCEL_COLUMNS.LOCATION,
  EXCEL_COLUMNS.RANK,
  EXCEL_COLUMNS.NAME
];

/**
 * 엑셀 데이터 검증
 * @param {Array} data - 파싱된 엑셀 데이터
 * @returns {Object} { valid, errors, warnings }
 */
export function validateExcelData(data) {
  const errors = [];
  const warnings = [];

  // 데이터가 비어있는지 확인
  if (!data || data.length === 0) {
    errors.push('엑셀 파일이 비어있습니다.');
    return { valid: false, errors, warnings };
  }

  // 첫 번째 행에서 필수 컬럼 확인
  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  REQUIRED_COLUMNS.forEach(requiredCol => {
    if (!columns.includes(requiredCol)) {
      errors.push(`필수 컬럼이 없습니다: ${requiredCol}`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // 각 행 검증
  data.forEach((row, index) => {
    const rowNum = index + 2; // 엑셀 행 번호 (헤더 제외)

    // 배치장소 검증
    if (!row[EXCEL_COLUMNS.LOCATION] || row[EXCEL_COLUMNS.LOCATION].trim() === '') {
      errors.push(`${rowNum}행: 배치장소가 비어있습니다.`);
    }

    // 계급 검증
    if (!row[EXCEL_COLUMNS.RANK] || row[EXCEL_COLUMNS.RANK].trim() === '') {
      errors.push(`${rowNum}행: 계급이 비어있습니다.`);
    }

    // 성명 검증
    if (!row[EXCEL_COLUMNS.NAME] || row[EXCEL_COLUMNS.NAME].trim() === '') {
      errors.push(`${rowNum}행: 성명이 비어있습니다.`);
    }

    // 연락처 형식 검증 (선택사항이지만 있으면 검증)
    if (row[EXCEL_COLUMNS.PHONE]) {
      const phone = row[EXCEL_COLUMNS.PHONE].toString().replace(/[^0-9]/g, '');
      if (phone.length < 10 || phone.length > 11) {
        warnings.push(`${rowNum}행: 연락처 형식이 올바르지 않을 수 있습니다. (${row[EXCEL_COLUMNS.PHONE]})`);
      }
    }
  });

  // 중복 확인 (선택사항)
  const names = data.map(row => row[EXCEL_COLUMNS.NAME]).filter(Boolean);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    warnings.push(`중복된 성명이 있습니다: ${[...new Set(duplicates)].join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 엑셀 데이터를 내부 형식으로 변환
 * @param {Array} data - 파싱된 엑셀 데이터
 * @returns {Array} 변환된 경찰관 목록
 */
export function parseExcelToOfficers(data) {
  return data.map((row, index) => ({
    id: `officer_${index + 1}`,
    배치장소: row[EXCEL_COLUMNS.LOCATION] || '',
    소속: row[EXCEL_COLUMNS.DEPARTMENT] || '의정부경찰서',
    계급: row[EXCEL_COLUMNS.RANK] || '',
    성명: row[EXCEL_COLUMNS.NAME] || '',
    연락처: row[EXCEL_COLUMNS.PHONE] || '',
    비고: row[EXCEL_COLUMNS.NOTE] || ''
  }));
}

/**
 * 내부 형식을 엑셀 데이터로 변환
 * @param {Array} officers - 경찰관 목록
 * @returns {Array} 엑셀 export용 데이터
 */
export function formatOfficersToExcel(officers) {
  return officers.map((officer, index) => ({
    [EXCEL_COLUMNS.NUMBER]: index + 1,
    [EXCEL_COLUMNS.LOCATION]: officer.배치장소 || '',
    [EXCEL_COLUMNS.DEPARTMENT]: officer.소속 || '의정부경찰서',
    [EXCEL_COLUMNS.RANK]: officer.계급 || '',
    [EXCEL_COLUMNS.NAME]: officer.성명 || '',
    [EXCEL_COLUMNS.PHONE]: officer.연락처 || '',
    [EXCEL_COLUMNS.NOTE]: officer.비고 || ''
  }));
}

/**
 * 빈 템플릿 데이터 생성
 * @param {number} rows - 생성할 행 수
 * @returns {Array} 빈 템플릿 데이터
 */
export function createEmptyTemplate(rows = 10) {
  return Array.from({ length: rows }, (_, index) => ({
    [EXCEL_COLUMNS.NUMBER]: index + 1,
    [EXCEL_COLUMNS.LOCATION]: '',
    [EXCEL_COLUMNS.DEPARTMENT]: '의정부경찰서',
    [EXCEL_COLUMNS.RANK]: '',
    [EXCEL_COLUMNS.NAME]: '',
    [EXCEL_COLUMNS.PHONE]: '',
    [EXCEL_COLUMNS.NOTE]: ''
  }));
}

/**
 * 전화번호 포맷팅
 * @param {string} phone - 전화번호
 * @returns {string} 포맷된 전화번호
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';

  const cleaned = phone.toString().replace(/[^0-9]/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
}

/**
 * 경찰 계급 검증
 */
export const VALID_RANKS = [
  '순경', '경장', '경사', '경위', '경감', '경정', '총경', '경무관', '치안감', '치안정감', '치안총감'
];

/**
 * 계급 검증
 * @param {string} rank - 계급
 * @returns {boolean} 유효 여부
 */
export function isValidRank(rank) {
  return VALID_RANKS.includes(rank);
}

export default {
  EXCEL_COLUMNS,
  REQUIRED_COLUMNS,
  VALID_RANKS,
  validateExcelData,
  parseExcelToOfficers,
  formatOfficersToExcel,
  createEmptyTemplate,
  formatPhoneNumber,
  isValidRank
};
