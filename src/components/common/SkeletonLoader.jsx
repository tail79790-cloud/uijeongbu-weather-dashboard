import { memo } from 'react';

/**
 * 기본 스켈레톤 요소
 */
const SkeletonBase = memo(({ className = '', animate = true }) => (
  <div 
    className={`
      bg-gray-200 dark:bg-gray-700 rounded
      ${animate ? 'animate-pulse' : ''}
      ${className}
    `}
  />
));

SkeletonBase.displayName = 'SkeletonBase';

/**
 * 날씨 위젯용 스켈레톤 로더
 */
export const WeatherSkeleton = memo(() => (
  <div className="weather-card">
    <div className="weather-card-header">
      <SkeletonBase className="h-6 w-32" />
      <SkeletonBase className="h-8 w-8 rounded-full" />
    </div>
    <div className="p-6 space-y-4">
      {/* 메인 온도 영역 */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonBase className="h-10 w-24" />
          <SkeletonBase className="h-4 w-16" />
        </div>
      </div>
      
      {/* 상세 정보 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonBase className="h-20 rounded-lg" />
        <SkeletonBase className="h-20 rounded-lg" />
      </div>
      
      {/* 하단 정보 */}
      <div className="flex justify-center">
        <SkeletonBase className="h-6 w-40 rounded-full" />
      </div>
    </div>
  </div>
));

WeatherSkeleton.displayName = 'WeatherSkeleton';

/**
 * 특보 위젯용 스켈레톤 로더
 */
export const AlertSkeleton = memo(() => (
  <div className="weather-card border-l-4 border-gray-300">
    <div className="weather-card-header">
      <SkeletonBase className="h-6 w-36" />
      <SkeletonBase className="h-8 w-8 rounded-full" />
    </div>
    <div className="p-6">
      {/* 탭 영역 */}
      <div className="flex space-x-2 mb-4">
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
      </div>
      
      {/* 콘텐츠 영역 */}
      <div className="space-y-3">
        <SkeletonBase className="h-32 rounded-lg" />
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-4 w-1/2" />
      </div>
    </div>
  </div>
));

AlertSkeleton.displayName = 'AlertSkeleton';

/**
 * 예보 차트용 스켈레톤 로더
 */
export const ChartSkeleton = memo(() => (
  <div className="weather-card">
    <div className="weather-card-header">
      <SkeletonBase className="h-6 w-28" />
      <SkeletonBase className="h-8 w-8 rounded-full" />
    </div>
    <div className="p-6 space-y-4">
      {/* 차트 영역 */}
      <div className="h-64 relative">
        <div className="absolute inset-0 flex items-end justify-around gap-2">
          {[...Array(8)].map((_, i) => (
            <SkeletonBase
              key={i}
              className="flex-1"
              style={{
                height: `${Math.random() * 60 + 40}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* 범례 */}
      <div className="flex justify-center space-x-6">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-20" />
      </div>
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * 리스트용 스켈레톤 로더
 */
export const ListSkeleton = memo(({ items = 3 }) => (
  <div className="weather-card">
    <div className="weather-card-header">
      <SkeletonBase className="h-6 w-32" />
      <SkeletonBase className="h-8 w-8 rounded-full" />
    </div>
    <div className="p-6">
      <div className="space-y-3">
        {[...Array(items)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <SkeletonBase className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <SkeletonBase className="h-4 w-24" />
                <SkeletonBase className="h-3 w-16" />
              </div>
            </div>
            <SkeletonBase className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
));

ListSkeleton.displayName = 'ListSkeleton';

/**
 * 테이블용 스켈레톤 로더
 */
export const TableSkeleton = memo(({ rows = 5, cols = 4 }) => (
  <div className="weather-card">
    <div className="weather-card-header">
      <SkeletonBase className="h-6 w-32" />
      <SkeletonBase className="h-8 w-8 rounded-full" />
    </div>
    <div className="p-6">
      <table className="w-full">
        <thead>
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="p-2">
                <SkeletonBase className="h-4 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(cols)].map((_, colIndex) => (
                <td key={colIndex} className="p-2">
                  <SkeletonBase className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

/**
 * 작은 카드용 스켈레톤 로더
 */
export const MiniCardSkeleton = memo(() => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <SkeletonBase className="h-4 w-16" />
      <SkeletonBase className="h-4 w-4 rounded-full" />
    </div>
    <SkeletonBase className="h-8 w-24 mb-1" />
    <SkeletonBase className="h-3 w-32" />
  </div>
));

MiniCardSkeleton.displayName = 'MiniCardSkeleton';

/**
 * 위젯 타입별 스켈레톤 선택기
 */
const SkeletonLoader = memo(({ type = 'default', ...props }) => {
  switch (type) {
    case 'weather':
      return <WeatherSkeleton {...props} />;
    case 'alert':
      return <AlertSkeleton {...props} />;
    case 'chart':
      return <ChartSkeleton {...props} />;
    case 'list':
      return <ListSkeleton {...props} />;
    case 'table':
      return <TableSkeleton {...props} />;
    case 'mini':
      return <MiniCardSkeleton {...props} />;
    default:
      return <WeatherSkeleton {...props} />;
  }
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;