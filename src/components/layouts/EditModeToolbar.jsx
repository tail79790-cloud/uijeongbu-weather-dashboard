import { memo } from 'react'

const EditModeToolbar = memo(({ onExitEdit, onResetLayout }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 shadow-lg border-b-2 border-blue-700 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 제목 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="text-lg font-bold text-white">
                레이아웃 편집 모드
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-white font-medium">편집 중</span>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 프리셋 버튼 - Phase 2에서 구현 */}
            <button
              disabled
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium opacity-50 cursor-not-allowed"
              title="Phase 2에서 제공됩니다"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>프리셋</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 실행취소/다시실행 - Phase 2에서 구현 */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                disabled
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                title="Phase 2에서 제공됩니다"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                disabled
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                title="Phase 2에서 제공됩니다"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* 구분선 */}
            <div className="hidden sm:block w-px h-6 bg-white/30"></div>

            {/* 초기화 버튼 */}
            <button
              onClick={onResetLayout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium"
              title="기본 레이아웃으로 초기화"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>초기화</span>
            </button>

            {/* 편집 완료 버튼 */}
            <button
              onClick={onExitEdit}
              className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-100 rounded-lg transition-colors text-blue-600 font-bold shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>완료</span>
            </button>
          </div>
        </div>

        {/* 하단 안내 텍스트 */}
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-100">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            위젯을 드래그하여 위치를 변경하거나, 모서리를 잡아 크기를 조절하세요.
          </p>
        </div>
      </div>
    </div>
  )
})

EditModeToolbar.displayName = 'EditModeToolbar'

export default EditModeToolbar
