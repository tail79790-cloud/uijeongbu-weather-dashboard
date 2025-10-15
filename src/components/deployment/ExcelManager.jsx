import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useDeployment } from '../../contexts/DeploymentContext';
import {
  validateExcelData,
  parseExcelToOfficers,
  formatOfficersToExcel,
  createEmptyTemplate
} from '../../utils/excelFormatter';

/**
 * 엑셀 업로드/다운로드 관리 컴포넌트
 * - 드래그앤드롭 업로드
 * - 데이터 검증
 * - 템플릿 다운로드
 * - 반응형: small(간소화), medium/large(전체 표시)
 * - 글래스모피즘 UI 적용
 */
export default function ExcelManager({ size = 'large' }) {
  const { loadFromExcel, getExportData, officerList } = useDeployment();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // 엑셀 파일 파싱
  const parseExcelFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // 첫 번째 시트 읽기
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // JSON으로 변환
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'));
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);

  // 파일 업로드 처리
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setUploadStatus({ type: 'error', message: '파일을 선택해주세요.' });
      return;
    }

    const file = acceptedFiles[0];

    // 파일 형식 확인
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setUploadStatus({ type: 'error', message: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' });
      return;
    }

    setUploadStatus({ type: 'loading', message: '파일 처리 중...' });

    try {
      // 엑셀 파일 파싱
      const data = await parseExcelFile(file);

      // 데이터 검증
      const validation = validateExcelData(data);
      setValidationResult(validation);

      if (!validation.valid) {
        setUploadStatus({
          type: 'error',
          message: '엑셀 데이터 검증 실패'
        });
        return;
      }

      // 데이터 변환 및 로드
      const officers = parseExcelToOfficers(data);
      loadFromExcel(officers);

      setUploadStatus({
        type: 'success',
        message: `${officers.length}명의 경찰관 명단을 성공적으로 불러왔습니다.`
      });

      // 3초 후 상태 초기화
      setTimeout(() => {
        setUploadStatus(null);
        setValidationResult(null);
      }, 3000);
    } catch (error) {
      console.error('Excel upload error:', error);
      setUploadStatus({
        type: 'error',
        message: `파일 처리 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }, [parseExcelFile, loadFromExcel]);

  // 드롭존 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  // 현재 데이터 다운로드
  const handleDownloadCurrent = useCallback(() => {
    try {
      const data = getExportData();

      if (data.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      // 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(data);

      // 열 너비 설정
      worksheet['!cols'] = [
        { wch: 6 },  // 연번
        { wch: 20 }, // 배치장소
        { wch: 15 }, // 소속
        { wch: 10 }, // 계급
        { wch: 12 }, // 성명
        { wch: 15 }, // 연락처
        { wch: 20 }  // 비고
      ];

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '경찰관배치현황');

      // 파일 다운로드
      const date = new Date().toISOString().split('T')[0];
      const filename = `경찰관_배치현황_${date}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setUploadStatus({
        type: 'success',
        message: '배치 현황을 다운로드했습니다.'
      });

      setTimeout(() => setUploadStatus(null), 2000);
    } catch (error) {
      console.error('Download error:', error);
      setUploadStatus({
        type: 'error',
        message: `다운로드 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }, [getExportData]);

  // 빈 템플릿 다운로드
  const handleDownloadTemplate = useCallback(() => {
    try {
      const templateData = createEmptyTemplate(10);

      // 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // 열 너비 설정
      worksheet['!cols'] = [
        { wch: 6 },  // 연번
        { wch: 20 }, // 배치장소
        { wch: 15 }, // 소속
        { wch: 10 }, // 계급
        { wch: 12 }, // 성명
        { wch: 15 }, // 연락처
        { wch: 20 }  // 비고
      ];

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '경찰관배치명단');

      // 파일 다운로드
      XLSX.writeFile(workbook, '경찰관_배치명단_템플릿.xlsx');

      setUploadStatus({
        type: 'success',
        message: '템플릿을 다운로드했습니다.'
      });

      setTimeout(() => setUploadStatus(null), 2000);
    } catch (error) {
      console.error('Template download error:', error);
      setUploadStatus({
        type: 'error',
        message: `템플릿 다운로드 중 오류가 발생했습니다: ${error.message}`
      });
    }
  }, []);

  return (
    <div className="widget-gap flex flex-col">
      {/* 업로드 영역 */}
      <div>
        <h3 className="widget-heading text-gray-800 dark:text-gray-200 mb-3">
          📤 엑셀 업로드
        </h3>

        <div
          {...getRootProps()}
          className={`
            glass-card widget-padding text-center cursor-pointer
            border-2 border-dashed transition-all duration-200
            ${isDragActive
              ? 'border-blue-500 dark:border-blue-400 glass-glow-blue'
              : 'border-white/30 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="widget-gap flex flex-col items-center">
            <div className={size === 'small' ? 'text-3xl' : 'widget-icon'}>📁</div>
            {isDragActive ? (
              <p className="text-blue-600 dark:text-blue-400 font-medium widget-text">
                파일을 여기에 놓으세요...
              </p>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 font-medium widget-text">
                  {size === 'small' ? '파일 업로드' : '클릭하거나 파일을 드래그하여 업로드'}
                </p>
                <p className="widget-text-sm text-gray-500 dark:text-gray-400">
                  .xlsx 또는 .xls 파일만 지원
                </p>
              </>
            )}
          </div>
        </div>

        {/* 업로드 상태 메시지 */}
        {uploadStatus && (
          <div className={`
            mt-3 glass-card widget-padding
            ${uploadStatus.type === 'success' ? 'glass-glow-green' : ''}
            ${uploadStatus.type === 'error' ? 'glass-glow-red' : ''}
            ${uploadStatus.type === 'loading' ? 'glass-glow-blue' : ''}
          `}>
            <p className={`font-medium widget-text-sm
              ${uploadStatus.type === 'success' ? 'text-green-700 dark:text-green-400' : ''}
              ${uploadStatus.type === 'error' ? 'text-red-700 dark:text-red-400' : ''}
              ${uploadStatus.type === 'loading' ? 'text-blue-700 dark:text-blue-400' : ''}
            `}>{uploadStatus.message}</p>
          </div>
        )}

        {/* 검증 결과 */}
        {validationResult && !validationResult.valid && (
          <div className="mt-3 glass-card glass-glow-red widget-padding">
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 widget-text-sm">❌ 검증 오류</h4>
            <ul className="widget-text-sm text-red-600 dark:text-red-400 space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && validationResult.warnings.length > 0 && (
          <div className="mt-3 glass-card glass-glow-yellow widget-padding">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2 widget-text-sm">⚠️ 경고</h4>
            <ul className="widget-text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 다운로드 버튼들 */}
      <div>
        <h3 className="widget-heading text-gray-800 dark:text-gray-200 mb-3">
          📥 엑셀 다운로드
        </h3>

        <div className={`grid gap-3 ${size === 'small' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          <button
            onClick={handleDownloadCurrent}
            disabled={officerList.length === 0}
            className="glass-button widget-button bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 disabled:bg-gray-300/20 dark:disabled:bg-gray-600/20 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {size === 'small' ? '현황 다운로드' : '현재 배치 현황 다운로드'}
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="glass-button widget-button bg-gray-500/20 dark:bg-gray-500/30 text-gray-700 dark:text-gray-300"
          >
            {size === 'small' ? '템플릿' : '빈 템플릿 다운로드'}
          </button>
        </div>

        {officerList.length > 0 && (
          <p className="mt-2 widget-text-sm text-gray-600 dark:text-gray-400">
            현재 {officerList.length}명의 경찰관 명단이 로드되어 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}
