import { useDeployment } from '../../contexts/DeploymentContext';
import { UNDERPASSES } from '../../constants/locations';

/**
 * 경찰관 배치 대시보드
 * - 지하차도별 간편 배치 (+/- 버튼)
 * - 전체 배치 현황 요약
 * - 배치 메모 기능
 * - 반응형: small(카드), medium(2열), large(테이블)
 * - 글래스모피즘 UI 적용
 */
export default function DeploymentDashboard({ size = 'large' }) {
  const {
    totalAvailable,
    deployments,
    memo,
    totalDeployed,
    remaining,
    locations,
    setTotalAvailable,
    incrementDeployment,
    decrementDeployment,
    resetDeployments,
    setMemo
  } = useDeployment();

  // 공통 컴포넌트: 현황 요약 카드
  const SummaryCards = () => (
    <div className={`grid grid-cols-3 widget-grid-gap ${size === 'small' ? 'text-xs' : ''}`}>
      {/* 가용 인원 */}
      <div className="glass-card widget-padding text-center">
        <div className="widget-text-sm text-gray-600 dark:text-gray-400 mb-1">
          가용 인원
        </div>
        <div className="widget-text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
          {totalAvailable}명
        </div>
        <input
          type="number"
          min="0"
          max="100"
          value={totalAvailable}
          onChange={(e) => setTotalAvailable(Number(e.target.value))}
          className="glass-input w-16 text-center widget-text-sm"
        />
      </div>

      {/* 배치 완료 */}
      <div className="glass-card widget-padding text-center glass-glow-green">
        <div className="widget-text-sm text-gray-600 dark:text-gray-400 mb-1">
          배치 완료
        </div>
        <div className="widget-text-lg font-bold text-green-600 dark:text-green-400">
          {totalDeployed}명
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {totalAvailable > 0 ? `${Math.round((totalDeployed / totalAvailable) * 100)}%` : '0%'}
        </div>
      </div>

      {/* 대기 중 */}
      <div className="glass-card widget-padding text-center">
        <div className="widget-text-sm text-gray-600 dark:text-gray-400 mb-1">
          대기 중
        </div>
        <div className="widget-text-lg font-bold text-gray-600 dark:text-gray-300">
          {remaining}명
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {totalAvailable > 0 ? `${Math.round((remaining / totalAvailable) * 100)}%` : '0%'}
        </div>
      </div>
    </div>
  );

  // Small 레이아웃: 카드 기반, 간소화된 정보
  if (size === 'small') {
    return (
      <div className="space-y-3">
        <SummaryCards />

        {totalDeployed > 0 && (
          <button
            onClick={resetDeployments}
            className="glass-button w-full text-red-600 dark:text-red-400"
          >
            초기화
          </button>
        )}

        <div className="space-y-2">
          {locations.map((location) => {
            const count = deployments[location.id] || 0;
            return (
              <div key={location.id} className="glass-card-interactive widget-padding">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold widget-text-sm text-gray-800 dark:text-gray-200">
                    {location.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrementDeployment(location.id)}
                      disabled={count === 0}
                      className="w-7 h-7 rounded-full bg-red-500 text-white font-bold disabled:bg-gray-300 dark:disabled:bg-gray-600"
                    >
                      −
                    </button>
                    <span className="widget-text font-bold w-12 text-center text-gray-800 dark:text-gray-200">
                      {count}명
                    </span>
                    <button
                      onClick={() => incrementDeployment(location.id)}
                      disabled={remaining === 0}
                      className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold disabled:bg-gray-300 dark:disabled:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalDeployed > totalAvailable && (
          <div className="glass-card glass-glow-red widget-padding">
            <p className="widget-text-sm text-red-700 dark:text-red-400 font-medium">
              ⚠️ 배치 인원 초과!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Medium 레이아웃: 2열 그리드
  if (size === 'medium') {
    return (
      <div className="space-y-4">
        <SummaryCards />

        {totalDeployed > 0 && (
          <div className="flex justify-end">
            <button
              onClick={resetDeployments}
              className="glass-button text-red-600 dark:text-red-400"
            >
              전체 배치 초기화
            </button>
          </div>
        )}

        <div>
          <h3 className="widget-heading text-gray-700 dark:text-gray-300 mb-3">
            지하차도별 배치 현황
          </h3>
          <div className="grid grid-cols-2 widget-grid-gap">
            {locations.map((location) => {
              const count = deployments[location.id] || 0;
              const priorityColor =
                location.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                location.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400';

              return (
                <div key={location.id} className="glass-card widget-padding">
                  <div className="mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-semibold widget-text-sm text-gray-800 dark:text-gray-200">
                        {location.name}
                      </span>
                      {location.priority !== 'low' && (
                        <span className={`text-xs font-medium ${priorityColor}`}>
                          {location.priority === 'high' ? '⭐' : '⚠️'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {location.road}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => decrementDeployment(location.id)}
                      disabled={count === 0}
                      className="widget-button rounded-full bg-red-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 w-8 h-8"
                    >
                      −
                    </button>
                    <div className="widget-text-lg font-bold w-16 text-center text-gray-800 dark:text-gray-200">
                      {count}명
                    </div>
                    <button
                      onClick={() => incrementDeployment(location.id)}
                      disabled={remaining === 0}
                      className="widget-button rounded-full bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 w-8 h-8"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            📝 배치 메모
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 김경사-의정부역..."
            className="glass-input w-full resize-none"
            rows="2"
          />
        </div>

        {totalDeployed > totalAvailable && (
          <div className="glass-card glass-glow-red widget-padding">
            <p className="widget-text-sm text-red-700 dark:text-red-400 font-medium">
              ⚠️ 배치 인원이 가용 인원을 초과했습니다!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Large 레이아웃: 테이블 형식
  return (
    <div className="space-y-6">
      <SummaryCards />

      {totalDeployed > 0 && (
        <div className="flex justify-end">
          <button
            onClick={resetDeployments}
            className="glass-button text-red-600 dark:text-red-400"
          >
            전체 배치 초기화
          </button>
        </div>
      )}

      <div>
        <h3 className="widget-heading text-gray-700 dark:text-gray-300 mb-3">
          지하차도별 배치 현황
        </h3>

        <table className="glass-table">
          <thead className="glass-table-header">
            <tr>
              <th className="widget-padding text-left widget-text-sm text-gray-700 dark:text-gray-300">지하차도명</th>
              <th className="widget-padding text-left widget-text-sm text-gray-700 dark:text-gray-300">도로명</th>
              <th className="widget-padding text-center widget-text-sm text-gray-700 dark:text-gray-300">우선순위</th>
              <th className="widget-padding text-center widget-text-sm text-gray-700 dark:text-gray-300">배치 인원</th>
              <th className="widget-padding text-center widget-text-sm text-gray-700 dark:text-gray-300">관리</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => {
              const count = deployments[location.id] || 0;
              const priorityColor =
                location.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                location.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-blue-600 dark:text-blue-400';

              return (
                <tr key={location.id} className="glass-table-row">
                  <td className="widget-padding widget-text font-semibold text-gray-800 dark:text-gray-200">
                    {location.name}
                  </td>
                  <td className="widget-padding widget-text-sm text-gray-600 dark:text-gray-400">
                    {location.road}
                  </td>
                  <td className="widget-padding text-center">
                    <span className={`glass-badge ${priorityColor}`}>
                      {location.priority === 'high' ? '⭐ 우선' :
                       location.priority === 'medium' ? '⚠️ 중요' : '일반'}
                    </span>
                  </td>
                  <td className="widget-padding text-center">
                    <span className="widget-text-lg font-bold text-gray-800 dark:text-gray-200">
                      {count}명
                    </span>
                  </td>
                  <td className="widget-padding">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => decrementDeployment(location.id)}
                        disabled={count === 0}
                        className="w-8 h-8 rounded-full bg-red-500 text-white font-bold disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-red-600 transition-colors"
                        title="인원 감소"
                      >
                        −
                      </button>
                      <button
                        onClick={() => incrementDeployment(location.id)}
                        disabled={remaining === 0}
                        className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold disabled:bg-gray-300 dark:disabled:bg-gray-600 hover:bg-blue-600 transition-colors"
                        title="인원 증가"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <label className="block widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          📝 배치 메모 (선택사항)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 김경사-의정부역, 이순경-신곡지하차도..."
          className="glass-input w-full resize-none"
          rows="3"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          간단한 메모를 작성할 수 있습니다 (경찰관 이름, 특이사항 등)
        </p>
      </div>

      {totalDeployed > totalAvailable && (
        <div className="glass-card glass-glow-red widget-padding">
          <p className="widget-text-sm text-red-700 dark:text-red-400 font-medium">
            ⚠️ 배치 인원이 가용 인원을 초과했습니다!
          </p>
        </div>
      )}

      {totalAvailable === 0 && (
        <div className="glass-card glass-glow-yellow widget-padding">
          <p className="widget-text-sm text-yellow-700 dark:text-yellow-400 font-medium">
            💡 가용 인원을 먼저 입력하거나 엑셀로 명단을 업로드하세요.
          </p>
        </div>
      )}
    </div>
  );
}
