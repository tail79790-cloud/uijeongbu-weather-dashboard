import { memo } from 'react'

/**
 * GridOverlay - 편집 모드에서 그리드 가이드라인을 표시하는 컴포넌트
 *
 * 기능:
 * - 12컬럼 그리드 가이드 라인 표시 (lg 브레이크포인트 기준)
 * - 반투명 배경으로 실제 위젯 내용을 가리지 않음
 * - 정렬을 돕는 시각적 기준점 제공
 */
const GridOverlay = memo(() => {
  // 12컬럼 그리드 생성
  const columns = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* 배경 그리드 패턴 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 80px,
              rgba(59, 130, 246, 0.05) 80px,
              rgba(59, 130, 246, 0.05) 81px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent calc(100% / 12),
              rgba(59, 130, 246, 0.1) calc(100% / 12),
              rgba(59, 130, 246, 0.1) calc(100% / 12 + 1px)
            )
          `
        }}
      />

      {/* 12컬럼 가이드 라인 (데스크톱) */}
      <div className="hidden lg:flex absolute inset-0 max-w-7xl mx-auto px-0">
        {columns.map((col) => (
          <div
            key={col}
            className="flex-1 border-r border-blue-300 dark:border-blue-700 border-dashed opacity-20"
          />
        ))}
      </div>

      {/* 상단 컬럼 번호 표시 (선택적) */}
      <div className="hidden lg:flex absolute top-20 left-0 right-0 max-w-7xl mx-auto px-0">
        {columns.map((col) => (
          <div
            key={col}
            className="flex-1 flex items-center justify-center"
          >
            <span className="text-xs font-mono text-blue-400 dark:text-blue-600 opacity-50">
              {col + 1}
            </span>
          </div>
        ))}
      </div>

      {/* 가운데 가이드 라인 */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-400 dark:bg-blue-600 opacity-20" />

      {/* 1/3, 2/3 지점 가이드 라인 */}
      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-blue-300 dark:bg-blue-700 opacity-10" />
      <div className="absolute top-0 bottom-0 left-2/3 w-px bg-blue-300 dark:bg-blue-700 opacity-10" />
    </div>
  )
})

GridOverlay.displayName = 'GridOverlay'

export default GridOverlay
