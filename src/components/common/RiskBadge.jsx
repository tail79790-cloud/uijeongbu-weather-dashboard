/**
 * 위험도 배지 컴포넌트
 * 위험도 레벨을 배지 형태로 표시
 */

function RiskBadge({
  level,
  text,
  icon,
  size = 'md',
  className = '',
}) {
  // 레벨별 색상
  const colors = {
    safe: 'bg-green-100 text-green-800 border-green-200',
    watch: 'bg-blue-100 text-blue-800 border-blue-200',
    caution: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  };

  // 크기별 스타일
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const colorClass = colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClass} ${sizeClass} ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
}

export default RiskBadge;
