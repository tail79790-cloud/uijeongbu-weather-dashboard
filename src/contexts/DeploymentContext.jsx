import { createContext, useContext, useState, useEffect } from 'react';
import { UNDERPASSES } from '../constants/locations';

/**
 * 경찰관 배치 관리 Context
 * - localStorage를 통한 데이터 영속성
 * - 배치 현황 실시간 업데이트
 * - 엑셀 업로드/다운로드 지원
 */

const DeploymentContext = createContext();

const STORAGE_KEY = 'uijeongbu_police_deployment';
const LOCATIONS_KEY = 'deployment_locations';

export function DeploymentProvider({ children }) {
  // 오늘 가용 인원 (총 인원)
  const [totalAvailable, setTotalAvailable] = useState(0);

  // 위치 목록 관리 (지하차도/다리)
  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCATIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      // 기본값: UNDERPASSES에 isCustom 플래그 추가
      return UNDERPASSES.map(u => ({ ...u, isCustom: false }));
    } catch (error) {
      console.error('Failed to load locations from localStorage:', error);
      return UNDERPASSES.map(u => ({ ...u, isCustom: false }));
    }
  });

  // 지하차도별 배치 수 { 'up_1': 2, 'up_2': 1, ... }
  const [deployments, setDeployments] = useState({});

  // 배치 메모 (선택사항)
  const [memo, setMemo] = useState('');

  // 엑셀에서 업로드된 경찰관 명단 (선택사항, 참고용)
  const [officerList, setOfficerList] = useState([]);

  // 마지막 업데이트 시간
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  // localStorage에서 데이터 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTotalAvailable(data.totalAvailable || 0);
        setDeployments(data.deployments || {});
        setMemo(data.memo || '');
        setOfficerList(data.officerList || []);
        setLastUpdate(data.lastUpdate || new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to load deployment data from localStorage:', error);
    }
  }, []);

  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      const data = {
        totalAvailable,
        deployments,
        memo,
        officerList,
        lastUpdate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save deployment data to localStorage:', error);
    }
  }, [totalAvailable, deployments, memo, officerList, lastUpdate]);

  // 위치 목록 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error('Failed to save locations to localStorage:', error);
    }
  }, [locations]);

  // 특정 지하차도의 배치 인원 수 업데이트
  const updateDeployment = (underpassId, count) => {
    setDeployments((prev) => ({
      ...prev,
      [underpassId]: Math.max(0, count),
    }));
    setLastUpdate(new Date().toISOString());
  };

  // 배치 인원 증가
  const incrementDeployment = (underpassId) => {
    const currentCount = deployments[underpassId] || 0;
    const totalDeployed = Object.values(deployments).reduce((sum, n) => sum + n, 0);

    // 가용 인원 초과 방지
    if (totalDeployed < totalAvailable) {
      updateDeployment(underpassId, currentCount + 1);
    }
  };

  // 배치 인원 감소
  const decrementDeployment = (underpassId) => {
    const currentCount = deployments[underpassId] || 0;
    if (currentCount > 0) {
      updateDeployment(underpassId, currentCount - 1);
    }
  };

  // 모든 배치 초기화
  const resetDeployments = () => {
    setDeployments({});
    setLastUpdate(new Date().toISOString());
  };

  // 엑셀 데이터로부터 배치 정보 로드
  const loadFromExcel = (officers) => {
    setOfficerList(officers);

    // 엑셀 데이터에서 지하차도별 인원 수 계산
    const newDeployments = {};
    officers.forEach((officer) => {
      const location = officer.배치장소;
      if (location) {
        // 지하차도 이름을 ID로 변환 (간단한 매핑)
        const underpassId = location.includes('수락') ? 'up_1' :
                           location.includes('신곡') ? 'up_2' :
                           location.includes('가능') ? 'up_3' :
                           location.includes('의정부역') ? 'up_4' :
                           location.includes('회룡') ? 'up_5' :
                           location.includes('녹양') ? 'up_6' :
                           location.includes('송산') ? 'up_7' :
                           location.includes('장암') ? 'up_8' :
                           location.includes('민락') ? 'up_9' :
                           location.includes('용현') ? 'up_10' : null;

        if (underpassId) {
          newDeployments[underpassId] = (newDeployments[underpassId] || 0) + 1;
        }
      }
    });

    setDeployments(newDeployments);
    setTotalAvailable(officers.length);
    setLastUpdate(new Date().toISOString());
  };

  // 새 위치 추가
  const addLocation = (newLocation) => {
    const locationWithId = {
      ...newLocation,
      id: `custom_${Date.now()}`, // 고유 ID 생성
      isCustom: true, // 사용자 추가 위치 표시
    };
    setLocations((prev) => [...prev, locationWithId]);
    setLastUpdate(new Date().toISOString());
    return locationWithId.id;
  };

  // 위치 정보 수정
  const updateLocation = (locationId, updates) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId
          ? { ...loc, ...updates }
          : loc
      )
    );
    setLastUpdate(new Date().toISOString());
  };

  // 위치 삭제 (사용자 추가 위치만 삭제 가능)
  const deleteLocation = (locationId) => {
    setLocations((prev) => {
      const locationToDelete = prev.find((loc) => loc.id === locationId);

      // 기본 위치는 삭제 불가
      if (!locationToDelete || !locationToDelete.isCustom) {
        console.warn('Cannot delete default location:', locationId);
        return prev;
      }

      // 해당 위치의 배치 정보도 삭제
      setDeployments((prevDeployments) => {
        const { [locationId]: removed, ...rest } = prevDeployments;
        return rest;
      });

      setLastUpdate(new Date().toISOString());
      return prev.filter((loc) => loc.id !== locationId);
    });
  };

  // 엑셀 다운로드용 데이터 생성
  const getExportData = () => {
    return officerList.map((officer, index) => ({
      연번: index + 1,
      배치장소: officer.배치장소 || '',
      소속: officer.소속 || '의정부경찰서',
      계급: officer.계급 || '',
      성명: officer.성명 || '',
      연락처: officer.연락처 || '',
      비고: officer.비고 || '',
    }));
  };

  // 현재 배치된 총 인원
  const totalDeployed = Object.values(deployments).reduce((sum, n) => sum + n, 0);

  // 대기 인원
  const remaining = totalAvailable - totalDeployed;

  const value = {
    // 상태
    totalAvailable,
    deployments,
    memo,
    officerList,
    lastUpdate,
    totalDeployed,
    remaining,
    locations,

    // 업데이트 함수
    setTotalAvailable,
    updateDeployment,
    incrementDeployment,
    decrementDeployment,
    resetDeployments,
    setMemo,
    loadFromExcel,
    getExportData,

    // 위치 관리 함수
    addLocation,
    updateLocation,
    deleteLocation,
  };

  return (
    <DeploymentContext.Provider value={value}>
      {children}
    </DeploymentContext.Provider>
  );
}

export function useDeployment() {
  const context = useContext(DeploymentContext);
  if (!context) {
    throw new Error('useDeployment must be used within DeploymentProvider');
  }
  return context;
}

export default DeploymentContext;
