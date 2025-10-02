/**
 * 통일된 새로고침 버튼 컴포넌트
 * 모든 위젯에서 일관된 새로고침 UI를 제공
 */

function RefreshButton({ onRefresh, isLoading = false, tooltip = '새로고침' }) {
  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      aria-label="새로고침"
      title={tooltip}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}

export default RefreshButton;
