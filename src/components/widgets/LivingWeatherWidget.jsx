import { useQuery } from '@tanstack/react-query';
import { getLivingWeatherIndex } from '../../services/kmaApi';
import { useWidgetSize } from '../../hooks/useWidgetSize';
import WidgetCard from '../common/WidgetCard';
import WidgetLoader from '../common/WidgetLoader';
import WidgetError from '../common/WidgetError';
import RefreshButton from '../common/RefreshButton';
import { WIDGET_BORDER_COLORS, LOADING_MESSAGES } from '../../constants/designSystem';

const UV_INFO = {
  '낮음': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '🟢' },
  '보통': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔵' },
  '높음': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🟠' },
  '매우 높음': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' },
  '위험': { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: '🟣' }
};

const AIR_DIFFUSION_INFO = {
  '좋음': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '😊' },
  '보통': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '😐' },
  '나쁨': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '😷' },
  '매우 나쁨': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🤢' }
};

const ASTHMA_INFO = {
  '낮음': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
  '보통': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '⚠️' },
  '높음': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🚨' },
  '매우 높음': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🆘' }
};

const LivingWeatherWidget = () => {
  const { size } = useWidgetSize('living-weather');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['livingWeatherIndex'],
    queryFn: () => getLivingWeatherIndex({ areaNo: '1100000000' }),
    refetchInterval: 60 * 60 * 1000, // 1시간마다 갱신
    staleTime: 30 * 60 * 1000, // 30분 캐시
  });

  // 에러 상태
  if (error || !data?.success) {
    return (
      <WidgetCard
        title="🌡️ 생활기상지수"
        subtitle="KMA API 키 필요"
        borderColor={WIDGET_BORDER_COLORS.DEFAULT}
        headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
      >
        <WidgetError message="생활기상지수를 불러올 수 없습니다" onRetry={refetch} />
      </WidgetCard>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <WidgetCard
        title="🌡️ 생활기상지수"
        borderColor={WIDGET_BORDER_COLORS.INFO}
      >
        <WidgetLoader message={LOADING_MESSAGES.DEFAULT} />
      </WidgetCard>
    );
  }

  const indexData = data.data;
  const uvInfo = indexData.uv ? UV_INFO[indexData.uv.text] || UV_INFO['보통'] : UV_INFO['보통'];
  const airInfo = indexData.airDiffusion ? AIR_DIFFUSION_INFO[indexData.airDiffusion.text] || AIR_DIFFUSION_INFO['보통'] : AIR_DIFFUSION_INFO['보통'];
  const asthmaInfo = indexData.asthma ? ASTHMA_INFO[indexData.asthma.text] || ASTHMA_INFO['낮음'] : ASTHMA_INFO['낮음'];

  // 그리드 레이아웃 동적 설정
  const gridClass = size === 'small'
    ? 'grid grid-cols-1 gap-4'
    : size === 'medium'
    ? 'grid grid-cols-2 gap-4'
    : 'grid grid-cols-1 md:grid-cols-3 gap-4';

  return (
    <WidgetCard
      title="🌡️ 생활기상지수"
      subtitle={size !== 'small' ? indexData.lastUpdate : undefined}
      borderColor={WIDGET_BORDER_COLORS.INFO}
      headerAction={<RefreshButton onRefresh={refetch} isLoading={isLoading} />}
    >
        <div className={gridClass}>
          {/* 자외선지수 - 항상 표시 */}
          {indexData.uv && (
            <div className={`${uvInfo.bg} rounded-lg p-4 border ${uvInfo.border}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{uvInfo.icon}</div>
                <div className="text-sm text-gray-600 mb-1">자외선지수</div>
                <div className={`text-2xl font-bold ${uvInfo.color} mb-1`}>
                  {indexData.uv.value}
                </div>
                <div className={`text-sm font-medium ${uvInfo.color}`}>
                  {indexData.uv.text}
                </div>
                {size !== 'small' && (
                  <div className="text-xs text-gray-500 mt-2">
                    {indexData.uv.text === '낮음' && '외출 안전'}
                    {indexData.uv.text === '보통' && '자외선 차단제 권장'}
                    {indexData.uv.text === '높음' && '자외선 차단 필수'}
                    {indexData.uv.text === '매우 높음' && '외출 시 주의'}
                    {indexData.uv.text === '위험' && '야외활동 자제'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 대기확산지수 - medium 이상 */}
          {size !== 'small' && indexData.airDiffusion && (
            <div className={`${airInfo.bg} rounded-lg p-4 border ${airInfo.border}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{airInfo.icon}</div>
                <div className="text-sm text-gray-600 mb-1">대기확산지수</div>
                <div className={`text-2xl font-bold ${airInfo.color} mb-1`}>
                  {indexData.airDiffusion.value}
                </div>
                <div className={`text-sm font-medium ${airInfo.color}`}>
                  {indexData.airDiffusion.text}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {indexData.airDiffusion.text === '좋음' && '대기 청정'}
                  {indexData.airDiffusion.text === '보통' && '보통 수준'}
                  {indexData.airDiffusion.text === '나쁨' && '대기 정체'}
                  {indexData.airDiffusion.text === '매우 나쁨' && '대기 오염 심함'}
                </div>
              </div>
            </div>
          )}

          {/* 천식·폐질환 가능지수 - large에서만 */}
          {size === 'large' && indexData.asthma && (
            <div className={`${asthmaInfo.bg} rounded-lg p-4 border ${asthmaInfo.border}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{asthmaInfo.icon}</div>
                <div className="text-sm text-gray-600 mb-1">천식·폐질환지수</div>
                <div className={`text-2xl font-bold ${asthmaInfo.color} mb-1`}>
                  {indexData.asthma.value}
                </div>
                <div className={`text-sm font-medium ${asthmaInfo.color}`}>
                  {indexData.asthma.text}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {indexData.asthma.text === '낮음' && '외출 안전'}
                  {indexData.asthma.text === '보통' && '민감군 주의'}
                  {indexData.asthma.text === '높음' && '호흡기 환자 주의'}
                  {indexData.asthma.text === '매우 높음' && '외출 자제 권장'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 안내 메시지 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 <strong>생활기상지수란?</strong> 날씨가 생활에 미치는 영향을 지수화한 정보입니다.
              자외선, 대기확산, 천식·폐질환 등 다양한 지수를 제공합니다.
            </p>
          </div>
        )}

        {/* 갱신 정보 - medium 이상에서만 표시 */}
        {size !== 'small' && (
          <div className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
            자동 갱신: 1시간마다 • 출처: 기상청
          </div>
        )}
    </WidgetCard>
  );
};

export default LivingWeatherWidget;
