/**
 * 통일된 에러 UI 컴포넌트
 * 모든 위젯에서 일관된 에러 상태를 표시
 */

function WidgetError({ message = '오류가 발생했습니다', onRetry }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-4" aria-label="error-icon">
        ⚠️
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

export default WidgetError;
