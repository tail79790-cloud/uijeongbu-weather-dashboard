# 중랑천 수위 정보 불일치 해결 방안 계획서

## 📋 문제 요약

현재 대시보드에는 **두 개의 독립적인 수위 모니터링 시스템**이 존재하며, 각각 **다른 임계값(threshold)**을 사용하여 **동일한 수위에 대해 서로 다른 위험도를 표시**하는 문제가 발생하고 있습니다.

### 🔍 발견된 불일치 사항

#### 시스템 A: RainfallFloodWidget (공식 한강홍수통제소 API)
- **파일**: `src/services/hanRiverApi.js`
- **API 출처**: 한강홍수통제소 공식 API (api.hrfco.go.kr)
- **임계값** (lines 16-21):
  ```javascript
  WATER_LEVEL_THRESHOLDS = {
    ATTENTION: 2.5,  // 관심 수위
    CAUTION: 5.1,    // 주의 수위 (경보)
    WARNING: 6.0,    // 경계 수위 (위험)
    DANGER: 6.5      // 심각 수위 (홍수)
  }
  ```

#### 시스템 B: RiverMonitoringWidget (Cloudflare Worker 프록시)
- **파일**: `src/services/riverApi.js`
- **API 출처**: Cloudflare Worker 커스텀 엔드포인트
- **임계값** (lines 12-35):
  ```javascript
  thresholds: {
    normal: 1.0,   // ❌ 잘못된 값
    caution: 1.5,  // ❌ 잘못된 값
    warning: 2.0,  // ❌ 잘못된 값
    danger: 2.5    // ❌ 잘못된 값
  }
  ```

### 🚨 문제의 심각성

**예시 시나리오**: 현재 수위가 **3.0m**일 때
- ✅ **RainfallFloodWidget**: "관심" 단계 (2.5m 초과, 5.1m 미만)
- ❌ **RiverMonitoringWidget**: "위험" 단계 (2.5m 초과)

→ 사용자에게 혼란을 주며, 재난 대응 판단에 오류 발생 가능

---

## 🔎 근본 원인 분석

### 1. 이중 API 아키텍처
프로젝트에 두 개의 독립적인 강 수위 API 서비스가 존재:
- `hanRiverApi.js` - 한강홍수통제소 공식 API (올바른 임계값)
- `riverApi.js` - Cloudflare Worker 프록시 (잘못된 임계값)

### 2. 임계값 출처 검증

**공식 임계값 확인**:
- `src/utils/riskCalculator.js` (lines 187-199)의 `calculateWaterLevelScore()` 함수에서 **동일한 공식 임계값 사용 확인**:
  ```javascript
  if (maxLevel >= 6.5) { score = 25; description = '위험'; }
  else if (maxLevel >= 6.0) { score = 20; description = '경보'; }
  else if (maxLevel >= 5.1) { score = 15; description = '경계'; }
  else if (maxLevel >= 2.5) { score = 10; description = '주의'; }
  ```

→ **결론**: `hanRiverApi.js`의 임계값이 **공식 정부 표준**이며, `riverApi.js`의 값은 잘못됨

### 3. 영향을 받는 컴포넌트
- ✅ **RainfallFloodWidget.jsx** - 올바른 임계값 사용 (hanRiverApi.js 사용)
- ❌ **RiverMonitoringWidget.jsx** - 잘못된 임계값 사용 (riverApi.js 사용)
- ❌ **riverLevelCalculator.js** - 잘못된 기본값 사용 (lines 67-72)

---

## ✅ 해결 방안

### 옵션 A: 임계값 통합 (권장)
**장점**:
- 최소한의 코드 변경
- 기존 API 구조 유지
- 빠른 적용 가능

**단점**:
- 이중 API 구조는 그대로 유지됨

**구현 단계**:
1. `riverApi.js` 임계값을 공식 값으로 수정
2. `riverLevelCalculator.js` 기본값을 공식 값으로 수정
3. 테스트 실행 및 검증

### 옵션 B: 단일 API 서비스로 통합 (장기 솔루션)
**장점**:
- 단일 진실 공급원(Single Source of Truth)
- 유지보수 용이
- 향후 불일치 문제 방지

**단점**:
- 더 많은 리팩토링 필요
- 테스트 범위 확대
- 개발 시간 증가

**구현 단계**:
1. `hanRiverApi.js`를 표준 API 서비스로 선정
2. `riverApi.js` 의존성 제거
3. RiverMonitoringWidget을 hanRiverApi로 마이그레이션
4. riverApi.js 파일 삭제 또는 deprecated 처리

---

## 📝 권장 실행 계획: 옵션 A (임계값 통합)

### Phase 1: 임계값 수정 (15분)

#### 1.1 riverApi.js 수정
**파일**: `src/services/riverApi.js` (lines 12-35)

**변경 전**:
```javascript
export const RIVER_STATIONS = {
  SINGOK: {
    thresholds: {
      normal: 1.0,
      caution: 1.5,
      warning: 2.0,
      danger: 2.5
    }
  },
  GEUMSIN: {
    thresholds: {
      normal: 1.0,
      caution: 1.5,
      warning: 2.0,
      danger: 2.5
    }
  }
};
```

**변경 후**:
```javascript
export const RIVER_STATIONS = {
  SINGOK: {
    thresholds: {
      normal: 2.5,   // 관심 수위 (한강홍수통제소 공식)
      caution: 5.1,  // 주의 수위 (한강홍수통제소 공식)
      warning: 6.0,  // 경계 수위 (한강홍수통제소 공식)
      danger: 6.5    // 심각 수위 (한강홍수통제소 공식)
    }
  },
  GEUMSIN: {
    thresholds: {
      normal: 2.5,   // 관심 수위 (한강홍수통제소 공식)
      caution: 5.1,  // 주의 수위 (한강홍수통제소 공식)
      warning: 6.0,  // 경계 수위 (한강홍수통제소 공식)
      danger: 6.5    // 심각 수위 (한강홍수통제소 공식)
    }
  }
};
```

#### 1.2 riverLevelCalculator.js 기본값 수정
**파일**: `src/utils/riverLevelCalculator.js` (lines 67-72)

**변경 전**:
```javascript
export function getRiskLevel(level, thresholds = {}) {
  const {
    normal = 1.0,
    caution = 1.5,
    warning = 2.0,
    danger = 2.5
  } = thresholds;
```

**변경 후**:
```javascript
export function getRiskLevel(level, thresholds = {}) {
  const {
    normal = 2.5,   // 관심 수위 (한강홍수통제소 공식)
    caution = 5.1,  // 주의 수위 (한강홍수통제소 공식)
    warning = 6.0,  // 경계 수위 (한강홍수통제소 공식)
    danger = 6.5    // 심각 수위 (한강홍수통제소 공식)
  } = thresholds;
```

**추가 수정 필요**: lines 88, 245, 257에서 하드코딩된 기본값도 함께 수정

### Phase 2: 레이블 일관성 확보 (5분)

현재 두 시스템이 사용하는 레이블이 다름:
- `hanRiverApi`: ATTENTION, CAUTION, WARNING, DANGER
- `riverApi`: normal, caution, warning, danger

**해결 방안**:
- `riverApi.js`의 키 이름을 변경하거나
- RiverMonitoringWidget에서 레이블 매핑 추가

**권장**: 레이블 매핑 추가 (기존 코드 호환성 유지)

### Phase 3: 테스트 및 검증 (10분)

#### 3.1 단위 테스트 실행
```bash
npm run test -- src/tests/utils/riskCalculator.test.js
npm run test -- src/tests/common/RiskComponents.test.jsx
```

#### 3.2 수동 검증
1. 개발 서버 실행: `npm run dev`
2. RainfallFloodWidget와 RiverMonitoringWidget 동시 확인
3. 동일한 수위에 대해 동일한 위험도가 표시되는지 확인
4. 다양한 수위 시나리오 테스트:
   - 1.0m: 정상
   - 3.0m: 관심 (normal)
   - 5.5m: 주의 (caution)
   - 6.2m: 경계 (warning)
   - 7.0m: 위험 (danger)

#### 3.3 브라우저 콘솔 확인
- API 호출 로그 확인
- 에러 없이 데이터 로드되는지 확인

### Phase 4: 문서화 (5분)

#### 4.1 코드 주석 추가
각 임계값 옆에 출처 명시:
```javascript
// 한강홍수통제소 공식 임계값 (2024년 기준)
// 출처: api.hrfco.go.kr
```

#### 4.2 README 업데이트
`README.md`에 수위 임계값 정보 추가

---

## 🧪 테스트 계획

### 테스트 시나리오

| 수위 (m) | 예상 위험도 | RainfallFloodWidget | RiverMonitoringWidget | 일치 여부 |
|---------|------------|--------------------|-----------------------|----------|
| 0.5     | 정상       | 정상               | 정상                  | ✅       |
| 2.8     | 관심       | 관심               | 관심                  | ✅       |
| 5.3     | 주의       | 주의               | 주의                  | ✅       |
| 6.2     | 경계       | 경계               | 경계                  | ✅       |
| 7.0     | 위험       | 위험               | 위험                  | ✅       |

### 자동화된 테스트 추가 권장

새로운 테스트 파일 생성: `src/tests/services/riverThresholds.test.js`

```javascript
import { RIVER_STATIONS } from '../../services/riverApi';
import { WATER_LEVEL_THRESHOLDS } from '../../services/hanRiverApi';

describe('River Water Level Thresholds Consistency', () => {
  it('should have matching thresholds between riverApi and hanRiverApi', () => {
    expect(RIVER_STATIONS.SINGOK.thresholds.normal).toBe(WATER_LEVEL_THRESHOLDS.ATTENTION);
    expect(RIVER_STATIONS.SINGOK.thresholds.caution).toBe(WATER_LEVEL_THRESHOLDS.CAUTION);
    expect(RIVER_STATIONS.SINGOK.thresholds.warning).toBe(WATER_LEVEL_THRESHOLDS.WARNING);
    expect(RIVER_STATIONS.SINGOK.thresholds.danger).toBe(WATER_LEVEL_THRESHOLDS.DANGER);
  });
});
```

---

## 📊 예상 결과

### Before (현재)
```
수위 3.0m일 때:
- RainfallFloodWidget: 🟡 관심 (2.5-5.1m 범위)
- RiverMonitoringWidget: 🔴 위험 (2.5m 초과)
→ 불일치!
```

### After (수정 후)
```
수위 3.0m일 때:
- RainfallFloodWidget: 🟡 관심 (2.5-5.1m 범위)
- RiverMonitoringWidget: 🟡 관심 (2.5-5.1m 범위)
→ 일치! ✅
```

---

## ⏱️ 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|----------|
| 1     | 임계값 수정 | 15분 |
| 2     | 레이블 일관성 | 5분 |
| 3     | 테스트 및 검증 | 10분 |
| 4     | 문서화 | 5분 |
| **총합** | | **35분** |

---

## 🚀 배포 전 체크리스트

- [ ] `riverApi.js` 임계값 수정 완료
- [ ] `riverLevelCalculator.js` 기본값 수정 완료
- [ ] 단위 테스트 통과 확인
- [ ] 두 위젯 모두 동일한 위험도 표시 확인
- [ ] 브라우저 콘솔 에러 없음 확인
- [ ] 코드 주석 및 문서 업데이트 완료
- [ ] Git commit 및 push

---

## 📚 참고 자료

### 공식 API 문서
- 한강홍수통제소 API: https://api.hrfco.go.kr
- Cloudflare Pages Functions: `/functions/api/hanriver/[[path]].js`

### 영향받는 파일 목록
1. ✏️ **수정 필요**:
   - `src/services/riverApi.js` (lines 12-35)
   - `src/utils/riverLevelCalculator.js` (lines 67-72, 88, 245, 257)

2. ✅ **정상 작동** (변경 불필요):
   - `src/services/hanRiverApi.js`
   - `src/utils/riskCalculator.js`
   - `src/components/widgets/RainfallFloodWidget.jsx`

3. 🧪 **테스트 대상**:
   - `src/components/widgets/RiverMonitoringWidget.jsx`

### 관련 이슈 히스토리
- 초기 설정 시 잘못된 임계값이 `riverApi.js`에 하드코딩됨
- 공식 API인 `hanRiverApi.js`는 처음부터 올바른 값 사용
- 두 시스템이 병행 운영되면서 불일치 발생

---

## 💡 장기 개선 제안

### 1. 상수 파일 통합
새 파일 생성: `src/constants/riverConstants.js`
```javascript
/**
 * 한강홍수통제소 공식 수위 임계값
 * 출처: api.hrfco.go.kr
 * 최종 업데이트: 2024년
 */
export const OFFICIAL_WATER_LEVEL_THRESHOLDS = {
  ATTENTION: 2.5,  // 관심 수위
  CAUTION: 5.1,    // 주의 수위 (경보)
  WARNING: 6.0,    // 경계 수위 (위험)
  DANGER: 6.5      // 심각 수위 (홍수)
};
```

모든 파일에서 이 상수를 import하여 사용

### 2. TypeScript 전환 고려
타입 정의로 임계값 구조 강제:
```typescript
interface WaterLevelThresholds {
  normal: number;
  caution: number;
  warning: number;
  danger: number;
}
```

### 3. 환경 변수로 임계값 관리
`.env` 파일에서 관리하여 운영 중 조정 가능하도록:
```env
VITE_WATER_LEVEL_ATTENTION=2.5
VITE_WATER_LEVEL_CAUTION=5.1
VITE_WATER_LEVEL_WARNING=6.0
VITE_WATER_LEVEL_DANGER=6.5
```

---

## 👤 작성 정보

- **작성일**: 2025년 10월 16일
- **작성자**: Claude (AI Assistant)
- **문서 버전**: 1.0
- **우선순위**: 🔴 긴급 (재난 대응 시스템의 정확성 문제)

---

## ✅ 승인 및 실행

**계획 검토자**: ___________________
**승인 일시**: ___________________
**실행 담당자**: ___________________
**완료 일시**: ___________________
