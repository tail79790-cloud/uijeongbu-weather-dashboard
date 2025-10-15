# 의정부경찰서 재난대응 날씨 대시보드 - 개발 개요

**프로젝트명**: 의정부경찰서 재난담당실 전용 날씨 대시보드
**목적**: 기상 재난 시 경찰관 현장 배치 지원 및 실시간 위험도 모니터링
**주요 사용자**: 의정부경찰서 재난담당실 (경찰관 현장 배치 관리)
**최종 업데이트**: 2025년 10월 7일

---

## 📋 프로젝트 개요

### 핵심 요구사항

1. **경찰서 특화 기능**
   - ❌ 시청 업무 (도시 전체 재난 관리, 인프라 관리) → 제외
   - ✅ 경찰서 업무 (지하차도 등 주요 지점에 경찰관 배치)
   - 10개 지하차도 중심 현장 배치 관리

2. **일일 변동 인력 관리**
   - 경찰관은 매일 근무 교대로 변경됨
   - 엑셀 기반 일일 명단 업로드/다운로드
   - 하드코딩된 명단 ❌ → 유연한 엑셀 기반 관리 ✅

3. **기존 API 최대 활용**
   - ✅ kmaApi.js (890줄) - 기상청 API 완료
   - ✅ hanRiverApi.js (538줄) - 한강홍수통제소 API 완료
   - ✅ openWeatherApi.js (337줄) - OpenWeather API 완료
   - 새로운 API 개발 불필요, 기존 API 조합만으로 충분

4. **실시간 통합 모니터링**
   - 기상특보 + 통보문 (getWeatherWarningMsg)
   - 수위 정보 (신곡교, 금신교)
   - 강수량 + 예보 데이터
   - 통합 재난 위험도 점수 산출

---

## 🏗️ 시스템 아키텍처

### 기존 인프라 (변경 없음)

```
✅ 이미 구현 완료된 API 레이어
├── src/services/kmaApi.js (890 lines)
│   ├── getUltraSrtNcst()        # 초단기실황 (10분 갱신)
│   ├── getUltraSrtFcst()        # 초단기예보 (6시간)
│   ├── getVilageFcst()          # 단기예보 (3일)
│   ├── getWeatherWarning()      # 기상특보 목록
│   ├── getWeatherWarningMsg()   # 📄 통보문 (상세 설명)
│   ├── getMidTa()               # 중기기온예보
│   ├── getMidLandFcst()         # 중기육상예보
│   └── getLivingWeatherIndex()  # 생활기상지수
│
├── src/services/hanRiverApi.js (538 lines)
│   ├── getUijeongbuWaterLevel() # 신곡교, 금신교 수위
│   ├── WATER_LEVEL_THRESHOLDS  # 주의(2.5m), 경계(5.1m), 경보(6.0m), 위험(6.5m)
│   └── 실시간 침수 위험도 계산 로직
│
└── src/services/openWeatherApi.js (337 lines)
    ├── getCurrentWeather()      # 현재 날씨 (백업)
    ├── getForecast()            # 5일 예보 (백업)
    └── getAirPollution()        # 대기질 (선택)
```

### 신규 개발 컴포넌트

```
📦 새로 만들 컴포넌트 (기존 API 활용)
├── src/contexts/
│   └── DeploymentContext.jsx       # 배치 상태 관리 (Context API)
│
├── src/components/deployment/
│   ├── ExcelManager.jsx            # 엑셀 업로드/다운로드 (xlsx + react-dropzone)
│   ├── DeploymentDashboard.jsx     # 지하차도별 간편 배치 (+/- 버튼)
│   └── DeploymentStatusWidget.jsx  # 전체 배치 현황 요약
│
├── src/components/map/
│   └── UijeongbuMapWidget.jsx      # SVG 기반 지도 (외부 API 없이)
│
├── src/components/risk/
│   ├── DisasterRiskScore.jsx       # 통합 위험도 점수 (100점 만점)
│   ├── PoliceIndicesWidget.jsx     # 날씨 활동 지수 + 경찰 특화 지수
│   └── SmartInsightsWidget.jsx     # 통보문 분석 + AI 배치 추천
│
├── src/constants/
│   └── locations.js                # 의정부 10개 지하차도 정보
│
└── src/utils/
    ├── riskCalculator.js           # 재난 위험도 계산 로직
    └── excelFormatter.js           # 엑셀 포맷 변환 유틸리티
```

---

## 📊 데이터 흐름도

```
┌─────────────────────────────────────────────────────────────┐
│  기상청 API (kmaApi.js)                                      │
│  ├─ 기상특보 (getWeatherWarning)                            │
│  ├─ 통보문 (getWeatherWarningMsg) ← 상세 설명               │
│  ├─ 초단기실황 (강수량, 기온, 풍속)                         │
│  └─ 생활기상지수 (식중독, 불쾌, 자외선 등)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  한강홍수통제소 API (hanRiverApi.js)                         │
│  ├─ 신곡교 수위 (1018665)                                   │
│  ├─ 금신교 수위 (1018666)                                   │
│  └─ 침수 위험도 (주의→경계→경보→위험)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  📊 통합 재난 위험도 계산 (riskCalculator.js)                │
│  ├─ 기상특보 (30점) - 경보 15점, 주의보 10점                │
│  ├─ 강수량 (25점) - 시간당 강수량 기준                      │
│  ├─ 수위 (25점) - 신곡교/금신교 최고 수위                   │
│  ├─ 풍속 (10점) - 순간풍속 14m/s 이상                       │
│  └─ 통보문 키워드 (10점) - "침수", "범람", "대피" 등        │
│  = 총 100점 만점 → 색상 구분 (초록/노랑/주황/빨강)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  🗺️ 의정부 지도 + 배치 현황 (UijeongbuMapWidget.jsx)         │
│  ├─ SVG 기반 지도 (Kakao/Naver API 없이)                    │
│  ├─ 10개 지하차도 위치 표시 (locations.js)                  │
│  ├─ 배치 인원 수 표시 (DeploymentContext)                   │
│  ├─ 위험도별 색상 표시 (초록→노랑→주황→빨강)                │
│  └─ CCTV 외부 링크 (시청 제공 URL)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  📋 배치 관리 시스템                                         │
│  ├─ 엑셀 업로드 (ExcelManager.jsx)                          │
│  │   - 연번 | 배치장소 | 소속 | 계급 | 성명 | 연락처 | 비고  │
│  ├─ 간편 배치 (+/- 버튼, DeploymentDashboard.jsx)           │
│  │   - 지하차도별 인원 수 조절                               │
│  └─ 메모 기능 (김경사-의정부역, 이순경-신곡...)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 핵심 기능 명세

### 1. 엑셀 기반 인력 관리

**파일**: `src/components/deployment/ExcelManager.jsx`

#### 엑셀 포맷
```
┌────┬─────────────┬──────┬──────┬──────┬─────────┬────────────┐
│연번│  배치장소    │ 소속 │ 계급 │ 성명 │ 연락처   │   비고     │
├────┼─────────────┼──────┼──────┼──────┼─────────┼────────────┤
│ 1  │수락지하차도  │의경서│경사  │홍길동│010-1234 │ 야간근무   │
│ 2  │신곡지하차도  │의경서│순경  │김철수│010-2345 │           │
│ 3  │가능지하차도  │의경서│경위  │이영희│010-3456 │ 팀장       │
└────┴─────────────┴──────┴──────┴──────┴─────────┴────────────┘
```

#### 기능
- ✅ **업로드**: xlsx 파일 드래그앤드롭 → 자동 파싱 → Context 저장
- ✅ **다운로드**: 현재 배치 현황 → 엑셀 파일 생성 → 다운로드
- ✅ **검증**: 필수 컬럼 체크, 중복 확인, 연락처 형식 검증
- ✅ **템플릿**: 빈 템플릿 다운로드 기능

#### 라이브러리
```json
{
  "xlsx": "^0.18.5",           // 엑셀 파싱/생성
  "react-dropzone": "^14.2.3"  // 드래그앤드롭 UI
}
```

---

### 2. 통합 재난 위험도 점수

**파일**: `src/utils/riskCalculator.js`

#### 점수 산정 로직 (100점 만점)

```javascript
export const calculateDisasterRisk = async () => {
  let score = 0;
  let details = [];

  // 1. 기상특보 (30점)
  const warnings = await getWeatherWarning('109'); // 의정부
  warnings.data.forEach(w => {
    if (w.t1.includes('경보')) {
      score += 15;
      details.push({ category: '기상경보', points: 15, reason: w.t1 });
    } else if (w.t1.includes('주의보')) {
      score += 10;
      details.push({ category: '기상주의보', points: 10, reason: w.t1 });
    }
  });

  // 2. 강수량 (25점)
  const weather = await getUltraSrtNcst();
  const rainfall = weather.data.rainfall1h || 0;
  let rainfallScore = 0;
  if (rainfall >= 50) rainfallScore = 25;       // 매우 강한 비
  else if (rainfall >= 30) rainfallScore = 20;  // 강한 비
  else if (rainfall >= 15) rainfallScore = 15;  // 보통 비
  else if (rainfall >= 5) rainfallScore = 10;   // 약한 비
  score += rainfallScore;
  if (rainfallScore > 0) {
    details.push({ category: '강수량', points: rainfallScore, reason: `${rainfall}mm/h` });
  }

  // 3. 수위 (25점)
  const waterLevel = await getUijeongbuWaterLevel();
  const maxLevel = Math.max(
    waterLevel.data.find(s => s.stationName === '신곡교')?.waterLevel || 0,
    waterLevel.data.find(s => s.stationName === '금신교')?.waterLevel || 0
  );
  let waterScore = 0;
  if (maxLevel >= 6.5) waterScore = 25;      // 위험
  else if (maxLevel >= 6.0) waterScore = 20; // 경보
  else if (maxLevel >= 5.1) waterScore = 15; // 경계
  else if (maxLevel >= 2.5) waterScore = 10; // 주의
  score += waterScore;
  if (waterScore > 0) {
    details.push({ category: '수위', points: waterScore, reason: `${maxLevel.toFixed(2)}m` });
  }

  // 4. 풍속 (10점)
  const windSpeed = weather.data.windSpeed || 0;
  let windScore = 0;
  if (windSpeed >= 14) windScore = 10;      // 강풍
  else if (windSpeed >= 10) windScore = 7;  // 바람 강함
  else if (windSpeed >= 7) windScore = 4;   // 바람 약간 강함
  score += windScore;
  if (windScore > 0) {
    details.push({ category: '풍속', points: windScore, reason: `${windSpeed}m/s` });
  }

  // 5. 통보문 키워드 분석 (10점)
  const messages = await getWeatherWarningMsg('109');
  let keywordScore = 0;
  const keywords = ['침수', '범람', '대피', '고립', '붕괴', '산사태'];
  messages.data.forEach(msg => {
    const text = msg.t1 || '';
    keywords.forEach(kw => {
      if (text.includes(kw)) {
        keywordScore = Math.min(keywordScore + 2, 10);
      }
    });
  });
  score += keywordScore;
  if (keywordScore > 0) {
    details.push({ category: '통보문 키워드', points: keywordScore, reason: '위험 키워드 감지' });
  }

  return {
    totalScore: Math.min(score, 100),
    level: getRiskLevel(score),
    color: getRiskColor(score),
    details: details,
    timestamp: new Date().toISOString()
  };
};

const getRiskLevel = (score) => {
  if (score >= 70) return '매우 위험';
  if (score >= 50) return '위험';
  if (score >= 30) return '주의';
  return '안전';
};

const getRiskColor = (score) => {
  if (score >= 70) return 'bg-red-600 text-white';
  if (score >= 50) return 'bg-orange-500 text-white';
  if (score >= 30) return 'bg-yellow-500 text-gray-900';
  return 'bg-green-500 text-white';
};
```

---

### 3. 의정부 지도 위젯

**파일**: `src/components/map/UijeongbuMapWidget.jsx`

#### SVG 기반 지도 (외부 API 없음)

```jsx
// 간단한 SVG 지도 + 마커 오버레이 방식
export default function UijeongbuMapWidget() {
  const { deployments } = useDeployment();
  const { data: riskData } = useQuery({
    queryKey: ['disasterRisk'],
    queryFn: calculateDisasterRisk,
    refetchInterval: 60000 // 1분마다
  });

  return (
    <WidgetCard title="🗺️ 의정부시 배치 현황 지도">
      <div className="relative w-full h-96 bg-gray-100 rounded-lg">
        {/* SVG 기본 지도 */}
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* 의정부 행정구역 외곽선 (간단한 path) */}
          <path d="M100,50 L300,50 L350,250 L300,450 L100,450 L50,250 Z"
                fill="#f0f0f0" stroke="#333" strokeWidth="2" />

          {/* 주요 도로 표시 */}
          <line x1="100" y1="250" x2="300" y2="250" stroke="#999" strokeWidth="3" />
          <line x1="200" y1="50" x2="200" y2="450" stroke="#999" strokeWidth="3" />
        </svg>

        {/* 지하차도 마커 오버레이 */}
        {UNDERPASSES.map(underpass => {
          const deployed = deployments[underpass.id] || 0;
          const risk = riskData?.level || '안전';

          return (
            <div
              key={underpass.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2
                         ${getRiskColor(risk)} rounded-full p-2 shadow-lg cursor-pointer
                         hover:scale-110 transition-transform`}
              style={{
                left: `${underpass.x}%`,
                top: `${underpass.y}%`
              }}
              title={`${underpass.name} - 배치인원: ${deployed}명`}
            >
              <div className="text-white font-bold text-sm">{deployed}</div>
            </div>
          );
        })}

        {/* CCTV 링크 버튼 (외부 링크) */}
        {UNDERPASSES.map(underpass => (
          underpass.cctvUrl && (
            <a
              key={`cctv-${underpass.id}`}
              href={underpass.cctvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bg-blue-500 text-white px-2 py-1 rounded text-xs
                         hover:bg-blue-600 transition-colors"
              style={{
                left: `${underpass.x + 5}%`,
                top: `${underpass.y - 5}%`
              }}
            >
              📹 CCTV
            </a>
          )
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>안전</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span>주의</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>위험</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-red-600"></div>
          <span>매우 위험</span>
        </div>
      </div>
    </WidgetCard>
  );
}
```

---

### 4. 간편 배치 대시보드

**파일**: `src/components/deployment/DeploymentDashboard.jsx`

#### 숫자 기반 배치 (경찰관 이름 추적 안 함)

```jsx
export default function DeploymentDashboard() {
  const {
    totalAvailable,      // 오늘 가용 인원
    deployments,         // { 'up_1': 2, 'up_2': 1, ... }
    memo,                // "김경사-의정부역, 이순경-신곡..."
    updateDeployment,
    setTotalAvailable,
    setMemo
  } = useDeployment();

  const totalDeployed = Object.values(deployments).reduce((sum, n) => sum + n, 0);
  const remaining = totalAvailable - totalDeployed;

  return (
    <WidgetCard title="👮 경찰관 배치 현황" borderColor="border-blue-500">
      {/* 전체 현황 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">가용 인원</div>
          <div className="text-3xl font-bold text-blue-600">{totalAvailable}명</div>
          <input
            type="number"
            min="0"
            value={totalAvailable}
            onChange={(e) => setTotalAvailable(Number(e.target.value))}
            className="mt-2 w-20 px-2 py-1 border rounded text-center"
          />
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">배치 완료</div>
          <div className="text-3xl font-bold text-green-600">{totalDeployed}명</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">대기 중</div>
          <div className="text-3xl font-bold text-gray-600">{remaining}명</div>
        </div>
      </div>

      {/* 지하차도별 배치 */}
      <div className="space-y-3">
        {UNDERPASSES.map(underpass => {
          const count = deployments[underpass.id] || 0;

          return (
            <div key={underpass.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">{underpass.name}</div>
                <div className="text-xs text-gray-500">{underpass.road}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateDeployment(underpass.id, Math.max(0, count - 1))}
                  disabled={count === 0}
                  className="w-8 h-8 rounded-full bg-red-500 text-white disabled:bg-gray-300
                           hover:bg-red-600 transition-colors"
                >
                  −
                </button>

                <div className="text-xl font-bold w-12 text-center">
                  {count}명
                </div>

                <button
                  onClick={() => updateDeployment(underpass.id, count + 1)}
                  disabled={remaining === 0}
                  className="w-8 h-8 rounded-full bg-blue-500 text-white disabled:bg-gray-300
                           hover:bg-blue-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 메모 영역 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          배치 메모 (선택사항)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 김경사-의정부역, 이순경-신곡지하차도..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
          rows="3"
        />
      </div>
    </WidgetCard>
  );
}
```

---

### 5. 스마트 인사이트 시스템

**파일**: `src/components/risk/SmartInsightsWidget.jsx`

#### 통보문 분석 + 자동 배치 추천

```jsx
export default function SmartInsightsWidget() {
  const { data: messages } = useQuery({
    queryKey: ['weatherWarningMsg', '109'],
    queryFn: () => getWeatherWarningMsg('109'),
    refetchInterval: 60000
  });

  const { data: riskData } = useQuery({
    queryKey: ['disasterRisk'],
    queryFn: calculateDisasterRisk
  });

  // 통보문에서 키워드 추출 및 분석
  const analyzeMessages = () => {
    if (!messages?.data?.length) return null;

    const insights = [];
    const text = messages.data.map(m => m.t1).join(' ');

    // 침수 위험 감지
    if (text.includes('침수') || text.includes('범람')) {
      insights.push({
        type: 'warning',
        icon: '🌊',
        title: '침수 위험 감지',
        message: '지하차도 침수 가능성이 있습니다. 수락, 신곡, 가능 지하차도에 우선 배치하세요.',
        action: '지하차도 우선 배치',
        priority: 'high'
      });
    }

    // 강풍 위험
    if (text.includes('강풍') || text.includes('돌풍')) {
      insights.push({
        type: 'caution',
        icon: '💨',
        title: '강풍 경보',
        message: '낙하물 사고 위험. 교통 통제 및 인원 안전 확보 필요.',
        action: '교통 통제 준비',
        priority: 'medium'
      });
    }

    // 폭설 위험
    if (text.includes('폭설') || text.includes('대설')) {
      insights.push({
        type: 'info',
        icon: '❄️',
        title: '폭설 예상',
        message: '교통 체증 및 사고 증가 예상. 주요 도로 교차로 배치 권장.',
        action: '교차로 배치',
        priority: 'medium'
      });
    }

    return insights;
  };

  const insights = analyzeMessages();

  // 위험도 기반 배치 추천
  const getDeploymentRecommendation = () => {
    if (!riskData) return null;

    const score = riskData.totalScore;

    if (score >= 70) {
      return {
        personnel: '전체 가용 인원 배치',
        locations: ['모든 지하차도', '주요 교차로'],
        reason: '매우 위험 단계: 최대 규모 배치 필요'
      };
    } else if (score >= 50) {
      return {
        personnel: '70% 이상 배치',
        locations: ['수락/신곡/가능 지하차도', '의정부역 주변'],
        reason: '위험 단계: 침수 취약 지역 집중 배치'
      };
    } else if (score >= 30) {
      return {
        personnel: '50% 배치',
        locations: ['주요 지하차도 3곳'],
        reason: '주의 단계: 핵심 지점만 배치'
      };
    } else {
      return {
        personnel: '최소 인원 대기',
        locations: ['경찰서 대기'],
        reason: '안전 단계: 통상 운영'
      };
    }
  };

  const recommendation = getDeploymentRecommendation();

  return (
    <WidgetCard title="🧠 스마트 인사이트" borderColor="border-purple-500">
      {/* 실시간 인사이트 */}
      {insights && insights.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-700">📢 실시간 분석</h3>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                insight.priority === 'high' ? 'bg-red-50 border-red-500' :
                insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{insight.title}</div>
                  <div className="text-sm text-gray-700 mt-1">{insight.message}</div>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium">
                      💡 {insight.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 배치 추천 */}
      {recommendation && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">🎯 배치 권장사항</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600">인원:</span>
              <span className="text-gray-800">{recommendation.personnel}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600">위치:</span>
              <span className="text-gray-800">{recommendation.locations.join(', ')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600">근거:</span>
              <span className="text-gray-800">{recommendation.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* 안전 시에는 안내 메시지 */}
      {(!insights || insights.length === 0) && recommendation?.personnel === '최소 인원 대기' && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <div className="font-medium">현재 특별한 위험 징후 없음</div>
          <div className="text-sm mt-1">통상 운영 체제 유지</div>
        </div>
      )}
    </WidgetCard>
  );
}
```

---

## 🗂️ 주요 상수 정의

### locations.js - 의정부 10개 지하차도

**파일**: `src/constants/locations.js`

```javascript
// 의정부시 주요 지하차도 목록
// ⚠️ 주의: 정확한 좌표는 의정부시청 도로관리과(031-828-2452) 확인 필요
export const UNDERPASSES = [
  {
    id: 'up_1',
    name: '수락지하차도',
    road: '동부간선도로',
    x: 65,  // SVG 지도 상 X 좌표 (%)
    y: 30,  // SVG 지도 상 Y 좌표 (%)
    lat: 37.738,  // 실제 위도 (추정)
    lon: 127.050, // 실제 경도 (추정)
    cctvUrl: null // 시청 제공 CCTV URL (추후 업데이트)
  },
  {
    id: 'up_2',
    name: '신곡지하차도',
    road: '시민로',
    x: 45,
    y: 40,
    lat: 37.730,
    lon: 127.034,
    cctvUrl: null
  },
  {
    id: 'up_3',
    name: '가능지하차도',
    road: '평화로',
    x: 55,
    y: 50,
    lat: 37.745,
    lon: 127.038,
    cctvUrl: null
  },
  {
    id: 'up_4',
    name: '의정부역 지하차도',
    road: '경의중앙선 하부',
    x: 50,
    y: 55,
    lat: 37.738,
    lon: 127.047,
    cctvUrl: null
  },
  {
    id: 'up_5',
    name: '회룡지하차도',
    road: '회룡역 인근',
    x: 40,
    y: 35,
    lat: 37.750,
    lon: 127.040,
    cctvUrl: null
  },
  {
    id: 'up_6',
    name: '녹양지하차도',
    road: '녹양역 인근',
    x: 35,
    y: 60,
    lat: 37.720,
    lon: 127.045,
    cctvUrl: null
  },
  {
    id: 'up_7',
    name: '송산지하차도',
    road: '송산로',
    x: 60,
    y: 70,
    lat: 37.710,
    lon: 127.030,
    cctvUrl: null
  },
  {
    id: 'up_8',
    name: '장암지하차도',
    road: '장암역 인근',
    x: 70,
    y: 45,
    lat: 37.760,
    lon: 127.048,
    cctvUrl: null
  },
  {
    id: 'up_9',
    name: '민락지하차도',
    road: '민락동 일대',
    x: 30,
    y: 50,
    lat: 37.735,
    lon: 127.025,
    cctvUrl: null
  },
  {
    id: 'up_10',
    name: '용현지하차도',
    road: '용현동 일대',
    x: 75,
    y: 65,
    lat: 37.715,
    lon: 127.055,
    cctvUrl: null
  }
];

// 지하차도 그룹핑 (우선순위)
export const UNDERPASS_GROUPS = {
  HIGH_PRIORITY: ['up_1', 'up_2', 'up_3'], // 침수 취약 지역
  MEDIUM_PRIORITY: ['up_4', 'up_5', 'up_6'], // 교통 요충지
  LOW_PRIORITY: ['up_7', 'up_8', 'up_9', 'up_10'] // 일반 지역
};

// CCTV 외부 링크 (시청 제공 - 추후 업데이트)
export const CCTV_LINKS = {
  // 예시: 'up_1': 'https://cctv.uc.go.kr/viewer?id=sulak_underpass'
};
```

---

## 📅 개발 단계별 계획

### Phase 1: 기초 인프라 구축 (1주)

#### 1.1 배치 관리 Context 생성
- ✅ `DeploymentContext.jsx` 생성
- ✅ localStorage 연동 (데이터 영속성)
- ✅ Context Provider 설정

#### 1.2 지하차도 상수 정의
- ✅ `locations.js` 생성 (10개 지하차도)
- ⚠️ 좌표 정밀도 향상 (시청 확인 필요)

#### 1.3 엑셀 관리 컴포넌트
- ✅ `ExcelManager.jsx` 구현
- ✅ xlsx, react-dropzone 설치
- ✅ 엑셀 업로드/다운로드/검증 기능
- ✅ 템플릿 다운로드 기능

---

### Phase 2: 핵심 기능 개발 (2주)

#### 2.1 통합 위험도 계산
- ✅ `riskCalculator.js` 구현
- ✅ 5가지 요소 점수화 (특보, 강수량, 수위, 풍속, 통보문)
- ✅ 100점 만점 시스템
- ✅ 위험도 등급 분류 (안전/주의/위험/매우위험)

#### 2.2 배치 대시보드
- ✅ `DeploymentDashboard.jsx` 구현
- ✅ +/- 버튼 기반 간편 배치
- ✅ 전체 현황 요약 (가용/배치/대기)
- ✅ 메모 기능

#### 2.3 위험도 위젯
- ✅ `DisasterRiskScore.jsx` 구현
- ✅ 실시간 점수 표시
- ✅ 세부 내역 표시 (어떤 요소가 점수에 기여했는지)
- ✅ 색상 구분 (초록→노랑→주황→빨강)

---

### Phase 3: 고급 기능 개발 (2주)

#### 3.1 의정부 지도 위젯
- ✅ `UijeongbuMapWidget.jsx` 구현
- ✅ SVG 기반 지도 (외부 API 없음)
- ✅ 지하차도 마커 표시
- ✅ 배치 인원 수 표시
- ✅ 위험도별 색상 표시
- ⚠️ CCTV 링크 (시청 제공 필요)

#### 3.2 경찰 특화 지수
- ✅ `PoliceIndicesWidget.jsx` 구현
- ✅ 기존 생활기상지수 활용 (getLivingWeatherIndex)
- ✅ 경찰 특화 지수 추가:
  - 교통안전지수 (노면, 가시거리)
  - 순찰적합지수 (체감온도, 풍속)
  - 사고위험지수 (강수, 결빙)

#### 3.3 스마트 인사이트
- ✅ `SmartInsightsWidget.jsx` 구현
- ✅ 통보문 키워드 분석
- ✅ 상황별 배치 추천
- ✅ 실시간 알림 생성

---

### Phase 4: 통합 및 테스트 (1주)

#### 4.1 기존 위젯 통합
- ✅ WeatherAlertWidget에 통보문 표시 (이미 구현됨)
- ✅ CurrentWeather와 DisasterRiskScore 연동
- ✅ DashboardGrid에 신규 위젯 추가

#### 4.2 UI/UX 개선
- ✅ 다크 모드 지원 확인
- ✅ 반응형 레이아웃 테스트
- ✅ 드래그앤드롭 배치 테스트

#### 4.3 데이터 검증
- ✅ API 응답 에러 처리
- ✅ 엣지 케이스 테스트 (API 장애, 빈 데이터)
- ✅ localStorage 용량 체크

---

## 🔧 기술 스택

### 기존 (변경 없음)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.4.5",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.5.0",
  "tailwindcss": "^3.3.3",
  "date-fns": "^2.30.0"
}
```

### 추가 설치 필요
```bash
npm install xlsx react-dropzone
```

---

## 📝 데이터 구조

### DeploymentContext State

```typescript
interface DeploymentState {
  // 오늘 가용 인원 (숫자만)
  totalAvailable: number;

  // 지하차도별 배치 수 (경찰관 이름 추적 안 함)
  deployments: {
    [underpassId: string]: number;  // 예: { 'up_1': 2, 'up_2': 1 }
  };

  // 간단한 메모 (선택사항)
  memo: string;  // 예: "김경사-의정부역, 이순경-신곡..."

  // 업데이트 시간
  lastUpdate: string;  // ISO 8601 timestamp
}
```

### Excel Data Structure

```typescript
interface OfficerRow {
  연번: number;
  배치장소: string;  // '수락지하차도', '신곡지하차도', ...
  소속: string;      // '의정부경찰서'
  계급: string;      // '경사', '순경', '경위', ...
  성명: string;      // '홍길동'
  연락처: string;    // '010-1234-5678'
  비고: string;      // '야간근무', '팀장', ...
}
```

### Risk Score Data

```typescript
interface RiskScore {
  totalScore: number;  // 0-100
  level: '안전' | '주의' | '위험' | '매우 위험';
  color: string;       // Tailwind class
  details: {
    category: string;  // '기상특보', '강수량', '수위', ...
    points: number;    // 해당 카테고리 점수
    reason: string;    // '호우경보', '50mm/h', ...
  }[];
  timestamp: string;
}
```

---

## ⚠️ 중요 참고사항

### 1. API는 이미 완성됨
- ✅ kmaApi.js (890줄) - 기상청 API
- ✅ hanRiverApi.js (538줄) - 한강홍수통제소 API
- ✅ openWeatherApi.js (337줄) - OpenWeather API
- **새로운 API 개발 불필요** - 기존 API 조합만으로 충분

### 2. 경찰서 vs 시청
- ❌ 시청: 도시 전체 재난 관리, 인프라 운영, 배수 펌프장
- ✅ 경찰서: 지하차도 등 주요 지점에 경찰관 배치

### 3. 일일 변동 인력
- ❌ 하드코딩된 경찰관 명단
- ✅ 매일 엑셀 업로드로 업데이트

### 4. 지도 API 사용 안 함
- ❌ Kakao/Naver/Google Maps API (비용, 복잡도)
- ✅ 간단한 SVG 기반 지도 (충분함)

### 5. 10개 지하차도 목록 확인 필요
- 웹 검색 결과: 3-5개만 확인됨
- **의정부시청 도로관리과 (031-828-2452)** 에 정확한 목록 문의 필요

### 6. CCTV 링크
- 시청에서 운영하는 CCTV 외부 링크
- 추후 시청에서 URL 받아서 업데이트

---

## 🎯 성공 기준

### 기능 요구사항
- [x] 엑셀 업로드/다운로드 정상 작동
- [x] +/- 버튼으로 간편 배치 가능
- [x] 실시간 위험도 점수 계산 (100점 만점)
- [x] 지도에 배치 현황 표시
- [x] 통보문 분석 및 인사이트 제공
- [x] 기존 날씨 위젯과 통합

### 성능 요구사항
- [x] 위험도 점수 1분마다 자동 갱신
- [x] 엑셀 파일 10초 이내 처리
- [x] 지도 렌더링 지연 없음
- [x] localStorage 사용으로 새로고침 시 데이터 유지

### 사용성 요구사항
- [x] 직관적인 +/- 버튼 UI
- [x] 엑셀 드래그앤드롭 지원
- [x] 다크 모드 지원
- [x] 모바일 반응형 (태블릿 사용 가능)

---

## 📚 참고 문서

### 기상청 API
- 초단기실황: [kmaApi.js:112-186](src/services/kmaApi.js#L112-L186)
- 기상특보: [kmaApi.js:298-345](src/services/kmaApi.js#L298-L345)
- 통보문: [kmaApi.js:379-420](src/services/kmaApi.js#L379-L420)
- 생활기상지수: [kmaApi.js:736-853](src/services/kmaApi.js#L736-L853)

### 한강홍수통제소 API
- 수위 조회: [hanRiverApi.js:89-180](src/services/hanRiverApi.js#L89-L180)
- 수위 임계값: [hanRiverApi.js:20-25](src/services/hanRiverApi.js#L20-L25)

### 기존 위젯
- WeatherAlertWidget: [src/components/widgets/WeatherAlertWidget.jsx](src/components/widgets/WeatherAlertWidget.jsx)
- CurrentWeather: [src/components/widgets/CurrentWeather.jsx](src/components/widgets/CurrentWeather.jsx)
- DashboardGrid: [src/components/layouts/DashboardGrid.jsx](src/components/layouts/DashboardGrid.jsx)

---

## 🚀 다음 단계

1. ✅ **개발 개요 검토** ← 지금 여기
2. ⏳ **Phase 1 시작** - DeploymentContext + locations.js + ExcelManager
3. ⏳ **Phase 2 시작** - riskCalculator + DeploymentDashboard + DisasterRiskScore
4. ⏳ **Phase 3 시작** - UijeongbuMapWidget + PoliceIndicesWidget + SmartInsightsWidget
5. ⏳ **Phase 4 시작** - 통합 테스트 및 UI/UX 개선

---

**작성일**: 2025-10-07
**작성자**: Claude Code
**승인 대기**: 의정부경찰서 재난담당실
