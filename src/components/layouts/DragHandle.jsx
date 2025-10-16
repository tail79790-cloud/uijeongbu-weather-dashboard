import { memo } from 'react'

/**
 * DragHandle - 위젯 드래그 핸들 컴포넌트
 *
 * 기능:
 * - 명확한 드래그 가능 영역 표시
 * - 위젯 이름 표시
 * - 호버 시 시각적 피드백
 * - 40px 높이로 충분한 클릭 영역 제공
 */
const DragHandle = memo(({ widgetName, isStatic = false }) => {
  if (isStatic) {
    // 고정된 위젯 (드래그 불가)
    return (
      <div className="absolute top-0 left-0 right-0 h-10 bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 rounded-t-lg flex items-center justify-between px-3 z-20">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {widgetName}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">고정됨</span>
      </div>
    )
  }

  return (
    <div
      className="
        drag-handle
        absolute top-0 left-0 right-0 h-10
        bg-gradient-to-r from-blue-50 to-blue-100
        dark:from-blue-900/30 dark:to-blue-800/30
        border-b-2 border-blue-300 dark:border-blue-700
        rounded-t-lg
        flex items-center justify-between px-3
        cursor-move
        opacity-0 group-hover:opacity-100
        transition-all duration-200
        z-20
        hover:from-blue-100 hover:to-blue-200
        dark:hover:from-blue-900/50 dark:hover:to-blue-800/50
      "
    >
      {/* 왼쪽: 드래그 아이콘 + 위젯 이름 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        </div>
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          {widgetName}
        </span>
      </div>

      {/* 오른쪽: 드래그 안내 */}
      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span className="hidden sm:inline">드래그</span>
      </div>
    </div>
  )
})

DragHandle.displayName = 'DragHandle'

export default DragHandle
