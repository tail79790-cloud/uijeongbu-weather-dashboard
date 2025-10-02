/**
 * 위험도 게이지 컴포넌트
 * 수위, 강수량 등의 위험도를 시각적으로 표시
 */

function RiskGauge({
  value,
  max,
  level,
  label,
  showValues = false,
  showPercent = false,
}) {
  // 퍼센트 계산 (0-100 사이로 제한)
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  // 레벨별 색상
  const colors = {
    safe: 'bg-green-500',
    watch: 'bg-blue-500',
    caution: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const bgColors = {
    safe: 'bg-green-100',
    watch: 'bg-blue-100',
    caution: 'bg-yellow-100',
    danger: 'bg-red-100',
  };

  const gaugeColor = colors[level] || 'bg-gray-500';
  const backgroundColor = bgColors[level] || 'bg-gray-100';

  return (
    <div className="space-y-2">
      {/* 레이블과 값 */}
      {(label || showValues || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          <div className="flex items-center gap-2">
            {showValues && (
              <span className="text-gray-600">
                {value.toFixed(1)} / {max.toFixed(1)}
              </span>
            )}
            {showPercent && (
              <span className="font-semibold text-gray-800">
                {percent.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* 게이지 바 */}
      <div
        className={`w-full h-4 ${backgroundColor} rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full ${gaugeColor} transition-all duration-300 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default RiskGauge;
