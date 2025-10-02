# Cloudflare Pages 환경변수 설정 가이드

## 🔐 필수 환경변수 목록

Cloudflare Pages 대시보드에서 다음 환경변수들을 설정해야 합니다:

### 1. 기상청 API
- **변수명**: `VITE_KMA_API_KEY`
- **설명**: 기상청 단기예보 API 키
- **발급처**: https://www.data.go.kr/ (공공데이터포털)
- **필요 API**:
  - 동네예보 조회서비스 (VilageFcstInfoService_2.0)
  - 기상특보 조회서비스 (WthrWrnInfoService)
  - 생활기상지수 조회서비스 (LivingWthrIdxServiceV4)
  - 중기예보 조회서비스 (MidFcstInfoService)

### 2. OpenWeatherMap API
- **변수명**: `VITE_OPENWEATHER_API_KEY`
- **설명**: 현재 날씨 및 대기질 API 키
- **발급처**: https://openweathermap.org/api
- **필요 API**:
  - Current Weather Data API
  - 5 Day / 3 Hour Forecast API
  - Air Pollution API

### 3. 한강홍수통제소 API (선택)
- **변수명**: `VITE_HANRIVER_API_KEY`
- **설명**: 한강 수위 및 강수량 데이터 API 키
- **발급처**: https://www.data.go.kr/
- **필요 API**: 한강홍수통제소_실시간 수위 정보 조회 서비스

## 📋 Cloudflare Pages 설정 방법

### 1. Cloudflare Pages 대시보드 접속
1. https://dash.cloudflare.com/ 로그인
2. **Pages** 메뉴 클릭
3. `uijeongbu-weather` 프로젝트 선택

### 2. 환경변수 설정
1. **Settings** 탭 클릭
2. **Environment variables** 섹션으로 스크롤
3. **Add variable** 버튼 클릭

### 3. Production 환경 변수 추가
각 변수를 다음 형식으로 추가:

```
Variable name: VITE_KMA_API_KEY
Value: [여기에_발급받은_API_키_붙여넣기]
Environment: Production
```

```
Variable name: VITE_OPENWEATHER_API_KEY
Value: [여기에_발급받은_API_키_붙여넣기]
Environment: Production
```

```
Variable name: VITE_HANRIVER_API_KEY
Value: [여기에_발급받은_API_키_붙여넣기]
Environment: Production
```

### 4. Preview 환경 변수 추가 (선택사항)
같은 변수를 **Preview** 환경에도 추가하면 PR 미리보기에서도 실제 데이터를 볼 수 있습니다.

### 5. 재배포
환경변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **...** 메뉴 클릭
3. **Retry deployment** 클릭

## ⚠️ 주의사항

### VITE_ Prefix 필수
- Vite 빌드 시스템에서는 `VITE_` prefix가 있는 환경변수만 클라이언트 코드에 포함됩니다
- `VITE_`가 없는 변수는 빌드 시 제거됩니다

### 보안
- API 키는 절대 git에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- Cloudflare Pages 대시보드에서만 환경변수를 관리하세요

### 디버깅
환경변수가 제대로 주입되었는지 확인하려면:
1. 브라우저 콘솔(F12) 열기
2. 다음 명령어 실행:
```javascript
console.log('API Keys configured:', {
  kma: !!import.meta.env.VITE_KMA_API_KEY && import.meta.env.VITE_KMA_API_KEY !== 'demo_key',
  openweather: !!import.meta.env.VITE_OPENWEATHER_API_KEY && import.meta.env.VITE_OPENWEATHER_API_KEY !== 'demo_key'
});
```

## 🔄 로컬 개발 환경 설정

로컬에서 개발할 때는 `.env` 파일을 생성:

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

```.env
# 기상청 API
VITE_KMA_API_KEY=여기에_발급받은_키_입력

# OpenWeatherMap API
VITE_OPENWEATHER_API_KEY=여기에_발급받은_키_입력

# 한강홍수통제소 API (선택)
VITE_HANRIVER_API_KEY=여기에_발급받은_키_입력
```

## 🧪 환경변수 없이 테스트

API 키가 없어도 앱은 작동합니다:
- 자동으로 목업(Mock) 데이터로 전환
- 모든 위젯이 샘플 데이터로 표시됨
- 실제 데이터를 보려면 API 키 필수

## 📊 현재 상태 확인

콘솔에서 다음 로그 확인:
- ✅ **실제 API 사용**: `[API명] 조회 성공`
- ⚠️ **목업 데이터 사용**: `개발 모드: 목업 데이터 사용`
- ❌ **API 키 오류**: `401 Unauthorized` 또는 `Invalid API key`
