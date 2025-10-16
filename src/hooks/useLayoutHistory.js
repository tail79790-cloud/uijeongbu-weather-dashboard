import { useState, useCallback, useRef } from 'react'

/**
 * useLayoutHistory - 레이아웃 변경 히스토리 관리 훅
 *
 * 기능:
 * - 레이아웃 변경사항을 히스토리에 저장
 * - Undo/Redo 기능 제공
 * - 최대 히스토리 개수 제한
 * - 새 변경 시 이후 히스토리 제거
 *
 * @param {number} maxHistory - 최대 히스토리 개수 (기본: 20)
 * @returns {Object} - { undo, redo, canUndo, canRedo, addToHistory, clear }
 */
const useLayoutHistory = (maxHistory = 20) => {
  // 히스토리 배열
  const [history, setHistory] = useState([])

  // 현재 인덱스 (-1: 히스토리 없음, 0~N: 히스토리 위치)
  const [currentIndex, setCurrentIndex] = useState(-1)

  // 마지막 추가된 레이아웃 (중복 방지용)
  const lastLayoutRef = useRef(null)

  /**
   * 히스토리에 레이아웃 추가
   * @param {Object} layouts - 새로운 레이아웃
   */
  const addToHistory = useCallback((layouts) => {
    // null이나 undefined는 무시
    if (!layouts) return

    // 레이아웃을 JSON 문자열로 변환하여 비교 (깊은 비교)
    const layoutString = JSON.stringify(layouts)

    // 마지막 레이아웃과 동일하면 추가하지 않음 (중복 방지)
    if (lastLayoutRef.current === layoutString) {
      return
    }

    lastLayoutRef.current = layoutString

    setHistory(prev => {
      // 현재 인덱스 이후의 히스토리 제거 (새 분기 생성)
      const newHistory = prev.slice(0, currentIndex + 1)

      // 새 레이아웃 추가
      newHistory.push({
        layouts: JSON.parse(layoutString), // 깊은 복사
        timestamp: Date.now()
      })

      // 최대 히스토리 개수 초과 시 오래된 항목 제거
      if (newHistory.length > maxHistory) {
        newHistory.shift()
        // 인덱스는 그대로 유지 (가장 오래된 항목 제거했으므로)
        setCurrentIndex(prev => prev - 1)
      } else {
        // 인덱스 증가
        setCurrentIndex(newHistory.length - 1)
      }

      return newHistory
    })
  }, [currentIndex, maxHistory])

  /**
   * 실행 취소 (Undo)
   * @returns {Object|null} - 이전 레이아웃 또는 null
   */
  const undo = useCallback(() => {
    if (currentIndex <= 0) {
      return null // 더 이상 되돌릴 수 없음
    }

    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)

    const previousLayout = history[newIndex]

    // lastLayoutRef 업데이트 (중복 추가 방지)
    lastLayoutRef.current = JSON.stringify(previousLayout.layouts)

    return previousLayout.layouts
  }, [currentIndex, history])

  /**
   * 다시 실행 (Redo)
   * @returns {Object|null} - 다음 레이아웃 또는 null
   */
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) {
      return null // 더 이상 다시 실행할 수 없음
    }

    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)

    const nextLayout = history[newIndex]

    // lastLayoutRef 업데이트 (중복 추가 방지)
    lastLayoutRef.current = JSON.stringify(nextLayout.layouts)

    return nextLayout.layouts
  }, [currentIndex, history])

  /**
   * 히스토리 초기화
   */
  const clear = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
    lastLayoutRef.current = null
  }, [])

  /**
   * Undo 가능 여부
   */
  const canUndo = currentIndex > 0

  /**
   * Redo 가능 여부
   */
  const canRedo = currentIndex < history.length - 1

  /**
   * 현재 히스토리 정보
   */
  const historyInfo = {
    total: history.length,
    current: currentIndex,
    canUndo,
    canRedo,
    undoCount: currentIndex,
    redoCount: history.length - currentIndex - 1
  }

  return {
    // 액션
    addToHistory,
    undo,
    redo,
    clear,

    // 상태
    canUndo,
    canRedo,
    historyInfo,

    // 디버깅용
    history,
    currentIndex
  }
}

export default useLayoutHistory
