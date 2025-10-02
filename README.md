# 의정부시 재난대응 날씨 대시보드

기상청 API와 한강홍수통제소 API를 활용한 실시간 재난대응 날씨 대시보드

## 🌟 주요 기능

### ✅ 구현 완료
- **🚨 긴급 기상특보 위젯**: 실시간 기상특보 + 통보문 전문 표시 (1분 자동 갱신)
- **🌤️ 현재 날씨**: 초단기실황 기반 실시간 날씨 (5분 자동 갱신)
- **💧 강수량 & 홍수 정보**: 한강홍수통제소 수위/강수량 데이터 (5분 자동 갱신)
- **📊 시간별 예보**: 초단기예보 + 단기예보 통합 24시간 예보 (10분 자동 갱신)
- **📅 3일간 예보**: 단기예보 기반 3일 날씨 예보 (30분 자동 갱신)

### 📊 데이터 소스
- **기상청 API**: 초단기실황, 초단기예보, 단기예보, 기상특보
- **한강홍수통제소 API**: 실시간 수위, 강수량, 홍수특보
- **OpenWeatherMap API**: 보조 데이터 (선택사항)

## 🚀 시작하기

### 필수 요구사항
- Node.js (v18 이상)
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력

# 개발 서버 시작
npm run dev
```

### 환경변수 설정

`.env` 파일에 다음 API 키를 설정하세요:

```env
VITE_KMA_API_KEY=your_kma_api_key
VITE_HANRIVER_API_KEY=your_hanriver_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_key (선택사항)
```

## 📁 프로젝트 구조

```
src/
├── components/
│   └── widgets/
│       ├── WeatherAlertWidget.jsx        # 긴급특보 위젯 🚨
│       ├── CurrentWeather.jsx            # 현재 날씨 위젯
│       ├── RainfallFloodWidget.jsx       # 강수량/홍수 위젯
│       ├── HourlyForecastWidget.jsx      # 시간별 예보 위젯
│       └── DailyForecastWidget.jsx       # 3일 예보 위젯
├── services/
│   ├── kmaApi.js                         # 기상청 API 서비스
│   ├── hanRiverApi.js                    # 한강홍수통제소 API
│   └── openWeatherApi.js                 # OpenWeatherMap API
├── utils/
│   ├── gridConverter.js                  # 위경도 ↔ 격자 변환
│   └── dateFormatter.js                  # 날짜/시간 포맷팅
├── constants/
│   └── weatherConstants.js               # 기상 상수 정의
└── tests/
    └── setup.js                          # 테스트 환경 설정
```

## 🧪 테스트

```bash
# TDD 모드 (Watch)
npm run test

# UI 대시보드
npm run test:ui

# 단일 실행
npm run test:run

# 커버리지
npm run test:coverage
```

## 🏗️ 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📊 기술 스택

- **프레임워크**: React 18
- **빌드 도구**: Vite 5
- **상태 관리**: TanStack Query (React Query)
- **HTTP 클라이언트**: Axios
- **스타일링**: Tailwind CSS
- **차트**: Recharts
- **날짜 처리**: date-fns
- **테스트**: Vitest + React Testing Library

## 🌐 API 정보

### 기상청 API
- **초단기실황**: 1시간마다 발표, 현재 관측값
- **초단기예보**: 30분마다 발표, 6시간 예보
- **단기예보**: 3시간마다 발표, 3일 예보
- **기상특보**: 실시간 특보 + 통보문

### 한강홍수통제소 API
- **실시간 수위**: 주요 하천 수위 데이터
- **실시간 강수량**: 누적 강수량 (1h, 3h, 6h, 12h, 24h)
- **홍수 특보**: 홍수 경보 및 주의보

## 🔄 자동 갱신 주기

| 위젯 | 갱신 주기 | 데이터 소스 |
|------|----------|------------|
| 긴급특보 | 1분 | 기상청 API |
| 현재 날씨 | 5분 | 기상청 초단기실황 |
| 강수량/수위 | 5분 | 한강홍수통제소 |
| 시간별 예보 | 10분 | 기상청 초단기/단기예보 |
| 3일 예보 | 30분 | 기상청 단기예보 |

## 📍 지역 정보

**의정부시 좌표**
- 위도/경도: 37.738, 127.034
- 격자 좌표: nx=61, ny=127
- 지역 코드: 109 (기상특보)

## 🛠️ 개발 가이드

### 격자 좌표 변환

기상청 API는 격자 좌표를 사용합니다:

```javascript
import { latLngToGrid } from './utils/gridConverter';

const grid = latLngToGrid(37.738, 127.034);
console.log(grid); // { nx: 61, ny: 127 }
```

### 날짜 포맷팅

```javascript
import { getUltraSrtNcstBase, formatKoreanDateTime } from './utils/dateFormatter';

// 초단기실황 발표 시각
const base = getUltraSrtNcstBase();
console.log(base); // { baseDate: '20251002', baseTime: '1400' }

// 한국어 날짜시간
const formatted = formatKoreanDateTime(new Date());
console.log(formatted); // '2025년 10월 02일 14시 30분'
```

## 📝 라이선스

MIT License

## 🤝 기여

이 프로젝트는 의정부시 재난담당실 전용 대시보드입니다.

## 📞 문의

프로젝트 관련 문의는 이슈를 통해 남겨주세요.

---

**🌤️ 의정부시 재난대응 날씨 대시보드**
실시간 기상 정보로 안전한 의정부를 만듭니다.