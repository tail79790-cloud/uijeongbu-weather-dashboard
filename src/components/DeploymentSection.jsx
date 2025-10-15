import { useState } from 'react';
import { useWidgetSize } from '../hooks/useWidgetSize';
import ExcelManager from './deployment/ExcelManager';
import DeploymentDashboard from './deployment/DeploymentDashboard';
import DeploymentStatusWidget from './deployment/DeploymentStatusWidget';

/**
 * 경찰관 배치 관리 섹션
 * - 엑셀 관리
 * - 배치 대시보드
 * - 배치 현황 요약
 * - 반응형: 크기에 따라 탭 표시 방식 변경
 * - 글래스모피즘 UI 적용
 */
export default function DeploymentSection() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'excel', 'status'
  const { size } = useWidgetSize('deployment-section');

  const tabs = [
    { id: 'dashboard', icon: '👮', label: '배치 관리' },
    { id: 'status', icon: '📊', label: '배치 현황' },
    { id: 'excel', icon: '📁', label: '엑셀 관리' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* 탭 네비게이션 - 글래스모피즘 */}
      <div className="glass-panel border-b-0 rounded-b-none">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 widget-text-sm transition-all duration-200
                ${activeTab === tab.id ? 'glass-tab-active' : 'glass-tab'}
              `}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                {/* 작은 크기에서는 아이콘만, 중간 이상에서는 텍스트도 표시 */}
                {size !== 'small' && <span>{tab.label}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 - 글래스모피즘 */}
      <div className="glass-panel rounded-t-none flex-1 overflow-auto widget-padding">
        {activeTab === 'dashboard' && <DeploymentDashboard size={size} />}
        {activeTab === 'status' && <DeploymentStatusWidget size={size} />}
        {activeTab === 'excel' && <ExcelManager size={size} />}
      </div>
    </div>
  );
}
