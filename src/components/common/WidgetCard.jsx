/**
 * 통일된 카드 래퍼 컴포넌트
 * 모든 위젯에서 일관된 카드 스타일을 제공
 */

function WidgetCard({
  title,
  subtitle,
  children,
  borderColor = 'gray',
  className = '',
  headerAction
}) {
  // 테두리 색상 매핑
  const borderColorClass = {
    gray: 'border-gray-200',
    blue: 'border-blue-400',
    red: 'border-red-400',
    yellow: 'border-yellow-400',
    green: 'border-green-400',
    orange: 'border-orange-400',
    purple: 'border-purple-400',
  }[borderColor] || 'border-gray-200';

  return (
    <div className={`weather-card border-l-4 ${borderColorClass} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="weather-card-header">
          <div>
            {title && <span>{title}</span>}
            {subtitle && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                {subtitle}
              </span>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default WidgetCard;
