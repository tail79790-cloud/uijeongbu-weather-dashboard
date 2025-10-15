import { useDeployment } from '../../contexts/DeploymentContext';
import { UNDERPASSES, UNDERPASS_GROUPS } from '../../constants/locations';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 배치 현황 요약 위젯
 * - 전체 배치 통계
 * - 우선순위별 배치 현황
 * - 최근 업데이트 시간
 * - 반응형: small(간소화), medium/large(전체 표시)
 * - 글래스모피즘 UI 적용
 */
export default function DeploymentStatusWidget({ size = 'large' }) {
  const {
    totalAvailable,
    deployments,
    totalDeployed,
    remaining,
    lastUpdate
  } = useDeployment();

  // 우선순위별 배치 통계
  const getDeploymentByPriority = (priority) => {
    const underpassIds = UNDERPASSES
      .filter(u => u.priority === priority)
      .map(u => u.id);

    return underpassIds.reduce((sum, id) => sum + (deployments[id] || 0), 0);
  };

  const highPriorityDeployed = getDeploymentByPriority('high');
  const mediumPriorityDeployed = getDeploymentByPriority('medium');
  const lowPriorityDeployed = getDeploymentByPriority('low');

  // 배치 완료율
  const deploymentRate = totalAvailable > 0 ? (totalDeployed / totalAvailable) * 100 : 0;

  // 배치 상태 평가
  const getDeploymentStatus = () => {
    if (totalAvailable === 0) {
      return { status: 'none', text: '인원 미설정', color: 'text-gray-500' };
    }

    if (deploymentRate >= 90) {
      return { status: 'full', text: '전체 배치', color: 'text-green-600' };
    } else if (deploymentRate >= 50) {
      return { status: 'partial', text: '부분 배치', color: 'text-blue-600' };
    } else if (deploymentRate > 0) {
      return { status: 'minimal', text: '최소 배치', color: 'text-yellow-600' };
    } else {
      return { status: 'standby', text: '대기 중', color: 'text-gray-600' };
    }
  };

  const status = getDeploymentStatus();

  // 최근 업데이트 시간 포맷
  const formattedUpdateTime = lastUpdate
    ? format(new Date(lastUpdate), 'MM월 dd일 HH:mm', { locale: ko })
    : '-';

  return (
    <div className="widget-gap flex flex-col">
      {/* 전체 배치 상태 */}
      <div className="text-center glass-card widget-padding bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20">
        <div className="widget-text-sm text-gray-600 dark:text-gray-400 mb-1">
          배치 상태
        </div>
        <div className={`widget-text-lg font-bold ${status.color} dark:opacity-90 mb-1`}>
          {status.text}
        </div>
        <div className="widget-temp font-bold text-gray-800 dark:text-gray-200">
          {totalDeployed} / {totalAvailable}명
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200/50 dark:bg-gray-600/50 rounded-full h-2 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 shadow-glow-blue"
              style={{ width: `${Math.min(deploymentRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {deploymentRate.toFixed(0)}% 배치 완료
          </p>
        </div>
      </div>

      {/* 우선순위별 배치 현황 */}
      <div>
        <h3 className="widget-text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          우선순위별 배치
        </h3>

        <div className="widget-gap flex flex-col">
          {/* 고위험 (High Priority) */}
          <div className="glass-card widget-padding glass-glow-red">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-red-600 dark:text-red-400 font-bold">{size === 'small' ? '⭐' : '⭐'}</span>
                <div>
                  <div className="widget-text-sm font-semibold text-gray-800 dark:text-gray-200">
                    침수 취약 지역
                  </div>
                  {size !== 'small' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      수락/신곡/가능 지하차도
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-text-lg font-bold text-red-600 dark:text-red-400">
                {highPriorityDeployed}명
              </div>
            </div>
          </div>

          {/* 중위험 (Medium Priority) */}
          <div className="glass-card widget-padding glass-glow-yellow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠️</span>
                <div>
                  <div className="widget-text-sm font-semibold text-gray-800 dark:text-gray-200">
                    교통 요충지
                  </div>
                  {size !== 'small' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      의정부역/회룡/녹양 지하차도
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {mediumPriorityDeployed}명
              </div>
            </div>
          </div>

          {/* 저위험 (Low Priority) */}
          <div className="glass-card widget-padding glass-glow-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-blue-600 dark:text-blue-400 font-bold">📍</span>
                <div>
                  <div className="widget-text-sm font-semibold text-gray-800 dark:text-gray-200">
                    일반 지역
                  </div>
                  {size !== 'small' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      송산/장암/민락/용현 지하차도
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-text-lg font-bold text-blue-600 dark:text-blue-400">
                {lowPriorityDeployed}명
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 배치 통계 */}
      <div className="grid grid-cols-2 widget-grid-gap">
        <div className="glass-card widget-padding">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            배치 지점
          </div>
          <div className="widget-text-lg font-bold text-gray-800 dark:text-gray-200">
            {Object.values(deployments).filter(n => n > 0).length}개
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            / 총 {UNDERPASSES.length}개
          </div>
        </div>

        <div className="glass-card widget-padding">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            대기 인원
          </div>
          <div className="widget-text-lg font-bold text-gray-800 dark:text-gray-200">
            {remaining}명
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            미배치
          </div>
        </div>
      </div>

      {/* 최근 업데이트 시간 */}
      <div className="pt-3 border-t border-white/20 dark:border-white/10">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          마지막 업데이트: {formattedUpdateTime}
        </p>
      </div>

      {/* 안내 메시지 */}
      {totalAvailable === 0 && (
        <div className="glass-card widget-padding glass-glow-blue">
          <p className="widget-text-sm text-blue-700 dark:text-blue-400 text-center">
            💡 가용 인원을 입력하면 배치 현황이 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
}
