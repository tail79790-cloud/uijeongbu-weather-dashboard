/**
 * 통일된 로딩 UI 컴포넌트
 * 모든 위젯에서 일관된 로딩 상태를 표시
 */

function WidgetLoader({ message = '로딩 중...' }) {
  return (
    <div className="flex items-center justify-center h-32" role="status">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default WidgetLoader;
