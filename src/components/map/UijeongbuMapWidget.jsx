import { useQuery } from '@tanstack/react-query';
import { useDeployment } from '../../contexts/DeploymentContext';
import { calculateDisasterRisk, getRiskBgColor, getRiskLevel } from '../../utils/riskCalculator';
import { UNDERPASSES, CCTV_LINKS } from '../../constants/locations';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';

/**
 * 의정부시 배치 현황 지도 위젯
 * - SVG 기반 간단한 지도
 * - 지하차도별 배치 인원 표시
 * - 위험도별 색상 구분
 * - CCTV 링크 (선택사항)
 */
export default function UijeongbuMapWidget() {
  const { deployments } = useDeployment();

  // 실시간 위험도 데이터 (1분마다 갱신)
  const { data: riskData, isLoading, error } = useQuery({
    queryKey: ['disasterRisk'],
    queryFn: calculateDisasterRisk,
    refetchInterval: 60000, // 1분
    staleTime: 50000,
  });

  // 위험도 점수를 마커 색상으로 변환
  const getMarkerColor = (score) => {
    if (score >= 70) return 'bg-red-600 hover:bg-red-700 shadow-red-500/50';
    if (score >= 50) return 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/50';
    if (score >= 30) return 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/50';
    return 'bg-green-500 hover:bg-green-600 shadow-green-500/50';
  };

  // 우선순위별 테두리 색상
  const getPriorityBorderColor = (priority) => {
    if (priority === 'high') return 'ring-2 ring-red-300';
    if (priority === 'medium') return 'ring-2 ring-yellow-300';
    return 'ring-1 ring-gray-300';
  };

  if (isLoading) {
    return (
      <WidgetCard title="🗺️ 의정부시 배치 현황 지도" borderColor="purple">
        <WidgetLoader />
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="🗺️ 의정부시 배치 현황 지도" borderColor="purple">
        <WidgetError message={error.message} />
      </WidgetCard>
    );
  }

  const score = riskData?.totalScore || 0;
  const markerColor = getMarkerColor(score);

  return (
    <WidgetCard
      title="🗺️ 의정부시 배치 현황 지도"
      subtitle={`위험도: ${getRiskLevel(score)} (${score}점)`}
      borderColor="purple"
    >
      <div className="space-y-4">
        {/* SVG 기반 지도 영역 */}
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* 배경 SVG (간단한 의정부시 형태) */}
          <svg
            viewBox="0 0 400 500"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 의정부 행정구역 외곽선 (간략화) */}
            <path
              d="M100,50 L150,40 L250,50 L300,70 L340,150 L350,250 L330,350 L300,420 L250,460 L150,470 L100,450 L60,350 L50,250 L60,150 Z"
              fill="rgba(255, 255, 255, 0.3)"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* 주요 도로 표시 */}
            <line
              x1="100"
              y1="250"
              x2="300"
              y2="250"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-300 dark:text-gray-700"
              opacity="0.6"
            />
            <line
              x1="200"
              y1="70"
              x2="200"
              y2="450"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-300 dark:text-gray-700"
              opacity="0.6"
            />

            {/* 경의중앙선 (대각선) */}
            <line
              x1="150"
              y1="100"
              x2="280"
              y2="400"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="text-blue-400 dark:text-blue-600"
              opacity="0.5"
            />
          </svg>

          {/* 지하차도 마커 오버레이 */}
          {UNDERPASSES.map((underpass) => {
            const deployed = deployments[underpass.id] || 0;
            const hasCctv = CCTV_LINKS[underpass.id];

            return (
              <div
                key={underpass.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${underpass.x}%`,
                  top: `${underpass.y}%`,
                }}
              >
                {/* 배치 인원 마커 */}
                <div
                  className={`
                    ${markerColor}
                    ${getPriorityBorderColor(underpass.priority)}
                    w-12 h-12 rounded-full flex items-center justify-center
                    text-white font-bold text-sm shadow-lg
                    transition-all duration-300 hover:scale-110
                    cursor-pointer group
                  `}
                  title={`${underpass.name} - 배치인원: ${deployed}명`}
                >
                  <div className="text-center">
                    <div className="text-lg">{deployed}</div>
                    <div className="text-[8px] -mt-1">명</div>
                  </div>
                </div>

                {/* 호버 시 상세 정보 툴팁 */}
                <div
                  className="
                    absolute left-1/2 -translate-x-1/2 top-14
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    px-3 py-2 rounded-lg shadow-xl
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    pointer-events-none
                    z-10 min-w-max
                    border border-gray-200 dark:border-gray-700
                  "
                >
                  <div className="text-xs font-semibold">{underpass.name}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400">
                    {underpass.road}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                    배치: {deployed}명
                    {underpass.priority === 'high' && ' ⚠️ 최우선'}
                  </div>
                </div>

                {/* CCTV 버튼 (있는 경우) */}
                {hasCctv && (
                  <a
                    href={CCTV_LINKS[underpass.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      absolute left-full ml-2 top-0
                      bg-blue-500 hover:bg-blue-600
                      text-white text-xs px-2 py-1 rounded
                      transition-colors duration-200
                      shadow-md
                    "
                    onClick={(e) => e.stopPropagation()}
                  >
                    📹
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            범례
          </div>

          {/* 위험도 색상 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">안전</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">주의</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">위험</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">매우 위험</span>
            </div>
          </div>

          {/* 우선순위 표시 */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400 ring-2 ring-red-300"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">최우선 (침수 취약)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400 ring-2 ring-yellow-300"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">중요 (교통 요충지)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400 ring-1 ring-gray-300"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">일반</span>
            </div>
          </div>
        </div>

        {/* 전체 통계 요약 */}
        <div className={`p-3 rounded-lg border ${getRiskBgColor(score)}`}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">전체 지하차도</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {UNDERPASSES.length}개소
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">배치 지점</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Object.values(deployments).filter(n => n > 0).length}개소
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">배치 인원</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {Object.values(deployments).reduce((sum, n) => sum + n, 0)}명
              </div>
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
