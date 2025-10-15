import { useQuery } from '@tanstack/react-query';
import { getWeatherWarningMsg } from '../../services/kmaApi';
import { calculateDisasterRisk } from '../../utils/riskCalculator';
import { useDeployment } from '../../contexts/DeploymentContext';
import { UNDERPASS_GROUPS } from '../../constants/locations';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';

/**
 * 스마트 인사이트 위젯
 * - 기상특보 통보문 키워드 분석
 * - 위험도 기반 자동 배치 추천
 * - 상황별 실시간 알림
 */
export default function SmartInsightsWidget() {
  const { totalAvailable, totalDeployed, remaining } = useDeployment();

  // 기상특보 통보문 조회 (1분 갱신)
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['weatherWarningMsg', '109'],
    queryFn: () => getWeatherWarningMsg('109'),
    refetchInterval: 60000, // 1분
    staleTime: 50000,
  });

  // 통합 위험도 조회 (1분 갱신)
  const { data: riskData, isLoading: riskLoading } = useQuery({
    queryKey: ['disasterRisk'],
    queryFn: calculateDisasterRisk,
    refetchInterval: 60000,
    staleTime: 50000,
  });

  // 통보문 키워드 분석
  const analyzeMessages = () => {
    if (!messages?.data || messages.data.length === 0) return [];

    const insights = [];
    const allText = messages.data.map((m) => m.t1 || '').join(' ');

    // 침수/범람 위험
    if (allText.includes('침수') || allText.includes('범람') || allText.includes('하천')) {
      insights.push({
        type: 'danger',
        icon: '🌊',
        title: '침수 위험 감지',
        message: '지하차도 침수 가능성이 높습니다. 수락, 신곡, 가능 지하차도에 즉시 배치하세요.',
        action: '지하차도 긴급 배치',
        priority: 'high',
        recommendedLocations: UNDERPASS_GROUPS.HIGH_PRIORITY,
      });
    }

    // 강풍/돌풍 위험
    if (allText.includes('강풍') || allText.includes('돌풍') || allText.includes('바람')) {
      insights.push({
        type: 'warning',
        icon: '💨',
        title: '강풍 경보',
        message: '낙하물 및 전도 사고 위험. 교통 통제 및 보행자 안전 확보가 필요합니다.',
        action: '교통 통제 및 안전 조치',
        priority: 'medium',
        recommendedLocations: UNDERPASS_GROUPS.MEDIUM_PRIORITY,
      });
    }

    // 폭설/대설 위험
    if (allText.includes('폭설') || allText.includes('대설') || allText.includes('눈')) {
      insights.push({
        type: 'caution',
        icon: '❄️',
        title: '폭설 예상',
        message: '교통 체증 및 사고 증가 예상. 주요 도로 교차로 및 경사로 배치 권장.',
        action: '교차로 및 경사로 배치',
        priority: 'medium',
        recommendedLocations: UNDERPASS_GROUPS.MEDIUM_PRIORITY,
      });
    }

    // 대피/고립 위험
    if (allText.includes('대피') || allText.includes('고립') || allText.includes('위험')) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: '긴급 상황 발생',
        message: '대피 및 고립 위험. 전체 가용 인원 배치 및 주민 안전 확보가 필요합니다.',
        action: '전체 인원 비상 배치',
        priority: 'high',
        recommendedLocations: [...UNDERPASS_GROUPS.HIGH_PRIORITY, ...UNDERPASS_GROUPS.MEDIUM_PRIORITY],
      });
    }

    // 산사태/붕괴 위험
    if (allText.includes('산사태') || allText.includes('붕괴') || allText.includes('토사')) {
      insights.push({
        type: 'danger',
        icon: '⛰️',
        title: '산사태 위험',
        message: '산지 인근 지역 통제 및 대피 유도가 필요합니다.',
        action: '산지 인근 통제',
        priority: 'high',
        recommendedLocations: UNDERPASS_GROUPS.LOW_PRIORITY,
      });
    }

    return insights;
  };

  // 위험도 기반 배치 추천
  const getDeploymentRecommendation = () => {
    if (!riskData) return null;

    const score = riskData.totalScore;

    if (score >= 70) {
      return {
        level: 'critical',
        personnel: '전체 가용 인원 배치 (100%)',
        recommendedCount: Math.ceil(totalAvailable * 1.0),
        locations: ['모든 지하차도', '주요 교차로', '경사로'],
        reason: '매우 위험 단계: 최대 규모 비상 배치 필요',
        color: 'bg-red-50 dark:bg-red-900/20 border-red-500',
        textColor: 'text-red-700 dark:text-red-400',
      };
    } else if (score >= 50) {
      return {
        level: 'high',
        personnel: '70% 이상 배치',
        recommendedCount: Math.ceil(totalAvailable * 0.7),
        locations: ['수락/신곡/가능 지하차도', '의정부역 주변', '주요 교차로'],
        reason: '위험 단계: 침수 취약 지역 집중 배치',
        color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500',
        textColor: 'text-orange-700 dark:text-orange-400',
      };
    } else if (score >= 30) {
      return {
        level: 'medium',
        personnel: '50% 배치',
        recommendedCount: Math.ceil(totalAvailable * 0.5),
        locations: ['주요 지하차도 3곳', '의정부역'],
        reason: '주의 단계: 핵심 지점만 배치',
        color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500',
        textColor: 'text-yellow-700 dark:text-yellow-400',
      };
    } else {
      return {
        level: 'low',
        personnel: '최소 인원 대기',
        recommendedCount: Math.ceil(totalAvailable * 0.2),
        locations: ['경찰서 대기'],
        reason: '안전 단계: 통상 운영 유지',
        color: 'bg-green-50 dark:bg-green-900/20 border-green-500',
        textColor: 'text-green-700 dark:text-green-400',
      };
    }
  };

  if (messagesLoading || riskLoading) {
    return (
      <WidgetCard title="🧠 스마트 인사이트" borderColor="purple">
        <WidgetLoader />
      </WidgetCard>
    );
  }

  const insights = analyzeMessages();
  const recommendation = getDeploymentRecommendation();

  return (
    <WidgetCard title="🧠 스마트 인사이트" borderColor="purple">
      <div className="space-y-4">
        {/* 실시간 인사이트 (통보문 분석) */}
        {insights.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="text-lg">📢</span>
              <span>실시간 위험 분석</span>
            </h3>
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : insight.priority === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{insight.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {insight.title}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {insight.message}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        💡 {insight.action}
                      </span>
                      {insight.priority === 'high' && (
                        <span className="inline-block px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                          긴급
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <span className="text-xl">✅</span>
              <span className="font-medium">현재 특별한 위험 징후 없음</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">
              통보문에서 위험 키워드가 감지되지 않았습니다.
            </div>
          </div>
        )}

        {/* 배치 권장사항 */}
        {recommendation && (
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <span>배치 권장사항</span>
            </h3>
            <div className={`p-4 rounded-lg border-2 ${recommendation.color}`}>
              <div className="space-y-3">
                {/* 권장 인원 */}
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    권장 배치 인원
                  </div>
                  <div className={`text-2xl font-bold ${recommendation.textColor}`}>
                    {recommendation.recommendedCount}명
                    <span className="text-sm font-normal ml-2 text-gray-600 dark:text-gray-400">
                      ({recommendation.personnel})
                    </span>
                  </div>
                </div>

                {/* 현재 배치 상황 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">가용</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {totalAvailable}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">배치</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {totalDeployed}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                    <div className="text-xs text-gray-600 dark:text-gray-400">대기</div>
                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {remaining}
                    </div>
                  </div>
                </div>

                {/* 배치 부족/과잉 경고 */}
                {totalDeployed < recommendation.recommendedCount && (
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                          배치 인원 부족
                        </div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          {recommendation.recommendedCount - totalDeployed}명 추가 배치 권장
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {totalDeployed > recommendation.recommendedCount && recommendation.level === 'low' && (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-300 dark:border-blue-700">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">ℹ️</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                          배치 인원 충분
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          현재 위험도 대비 배치 인원이 충분합니다
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 권장 배치 위치 */}
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    우선 배치 위치
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.locations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs border border-gray-200 dark:border-gray-700"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 근거 */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    배치 근거
                  </div>
                  <div className={`text-sm font-medium ${recommendation.textColor}`}>
                    {recommendation.reason}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 위험도 세부 정보 (참고용) */}
        {riskData && riskData.details && riskData.details.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              위험 요소 분석
            </div>
            <div className="space-y-1">
              {riskData.details.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span>{detail.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">{detail.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{detail.reason}</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {detail.points}점
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
