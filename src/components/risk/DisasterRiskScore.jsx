import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { calculateDisasterRisk, getRiskTextColor, getRiskBgColor } from '../../utils/riskCalculator';
import WidgetCard from '../common/WidgetCard';

/**
 * 통합 재난 위험도 점수 위젯
 * - 100점 만점 위험도 점수 표시
 * - 5가지 요소별 세부 점수
 * - 1분마다 자동 갱신
 */
export default function DisasterRiskScore() {
  const { data: riskData, isLoading, error } = useQuery({
    queryKey: ['disasterRisk'],
    queryFn: calculateDisasterRisk,
    refetchInterval: 60000, // 1분마다 자동 갱신
    staleTime: 30000, // 30초 동안 fresh 유지
    retry: 2
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard title="🚨 재난 위험도 점수" borderColor="border-red-500">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </WidgetCard>
    );
  }

  // 에러 상태
  if (error || !riskData?.success) {
    return (
      <WidgetCard title="🚨 재난 위험도 점수" borderColor="border-gray-500">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">
            위험도 데이터를 불러올 수 없습니다
          </p>
          {riskData?.error && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {riskData.error}
            </p>
          )}
        </div>
      </WidgetCard>
    );
  }

  const { totalScore, level, details, timestamp } = riskData;
  const scorePercentage = Math.round(totalScore);

  // 최근 업데이트 시간 포맷
  const formattedTime = timestamp
    ? format(new Date(timestamp), 'HH:mm', { locale: ko })
    : '-';

  return (
    <WidgetCard title="🚨 재난 위험도 점수" borderColor="border-red-500">
      <div className="space-y-6">
        {/* 메인 점수 표시 */}
        <div className={`
          text-center p-6 rounded-xl border-2
          ${getRiskBgColor(totalScore)}
        `}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            현재 위험도
          </div>
          <div className={`text-6xl font-bold mb-2 ${getRiskTextColor(totalScore)}`}>
            {totalScore}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            / 100점
          </div>

          {/* 위험도 레벨 */}
          <div className={`
            inline-block px-6 py-2 rounded-full text-lg font-bold
            ${riskData.color}
          `}>
            {level}
          </div>

          {/* 진행바 */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalScore >= 70 ? 'bg-red-600' :
                  totalScore >= 50 ? 'bg-orange-500' :
                  totalScore >= 30 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(scorePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {scorePercentage}% 위험도
            </p>
          </div>
        </div>

        {/* 세부 점수 내역 */}
        {details && details.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📊 세부 점수 내역
            </h3>

            <div className="space-y-2">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="
                    flex items-center justify-between p-3
                    bg-gray-50 dark:bg-gray-700/50 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors
                  "
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{detail.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {detail.category}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {detail.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    +{detail.points}
                  </div>
                </div>
              ))}
            </div>

            {/* 총 점수 요약 */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  총 위험 요소 점수
                </span>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                  {details.reduce((sum, d) => sum + d.points, 0)}점
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              현재 위험 요소 없음
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              모든 지표가 안전 범위 내에 있습니다
            </p>
          </div>
        )}

        {/* 최근 업데이트 시간 */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            마지막 업데이트: {formattedTime} (1분마다 자동 갱신)
          </p>
        </div>

        {/* 안내 메시지 */}
        {totalScore >= 50 && (
          <div className={`
            p-3 rounded-lg border-l-4
            ${totalScore >= 70
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-400'
            }
          `}>
            <p className="text-sm font-medium">
              {totalScore >= 70
                ? '⚠️ 긴급 상황: 전체 가용 인원 배치를 권장합니다'
                : '⚠️ 주의 요망: 침수 취약 지역 우선 배치를 권장합니다'
              }
            </p>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
