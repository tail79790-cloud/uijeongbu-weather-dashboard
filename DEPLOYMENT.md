# Cloudflare Pages 배포 가이드

## 🚀 배포 단계별 가이드

### 1단계: GitHub 저장소 생성 및 푸시

```bash
# GitHub에서 새 저장소 생성 (예: uijeongbu-weather-dashboard)
# 저장소 주소를 복사 (예: https://github.com/username/uijeongbu-weather-dashboard.git)

# 로컬에서 원격 저장소 추가
git remote add origin https://github.com/username/uijeongbu-weather-dashboard.git

# 변경사항 커밋 및 푸시
git add .
git commit -m "feat: Cloudflare Pages 배포 설정 완료"
git push -u origin main
```

### 2단계: Cloudflare Pages 프로젝트 생성

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 로그인
   - 계정이 없다면 무료 가입

2. **Pages 프로젝트 생성**
   - 왼쪽 메뉴에서 "Workers & Pages" 클릭
   - "Create application" → "Pages" → "Connect to Git" 선택

3. **GitHub 연결**
   - GitHub 계정 연동
   - 저장소 선택 (`uijeongbu-weather-dashboard`)
   - "Begin setup" 클릭

### 3단계: 빌드 설정

**프로젝트 이름**: `uijeongbu-weather` (원하는 이름)
→ 배포 주소: `https://uijeongbu-weather.pages.dev`

**빌드 설정**:
```
Framework preset: None (또는 Vite)
Build command: npm run build
Build output directory: dist
Root directory: /
```

**환경 변수 (Environment variables)**:
- Production 환경에 추가:
  ```
  VITE_KMA_API_KEY = [기상청 API 키]
  VITE_HANRIVER_API_KEY = [한강홍수통제소 API 키]
  VITE_OPENWEATHER_API_KEY = [OpenWeatherMap API 키] (선택사항)
  ```

### 4단계: 배포 실행

1. "Save and Deploy" 클릭
2. 첫 빌드 시작 (1-2분 소요)
3. 빌드 완료 후 배포 URL 확인

### 5단계: 배포 확인 및 테스트

배포가 완료되면:

```
✅ 배포 완료!
주소: https://uijeongbu-weather.pages.dev
```

**테스트 체크리스트**:
- [ ] 페이지가 정상적으로 로드되는지 확인
- [ ] 기상청 API 데이터가 표시되는지 확인
- [ ] 한강홍수통제소 데이터가 표시되는지 확인
- [ ] 긴급 기상특보가 작동하는지 확인
- [ ] 다크 모드 전환이 정상 작동하는지 확인
- [ ] 모바일에서 정상 표시되는지 확인

## 📝 배포 후 자동화

### 자동 배포 워크플로우

이제부터 `main` 브랜치에 push할 때마다 자동으로 재배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "fix: 위젯 스타일 수정"
git push

# → Cloudflare Pages가 자동으로 빌드 및 배포
# → 1-2분 후 변경사항 반영
```

### 배포 상태 확인

- Cloudflare 대시보드 → Pages → 프로젝트 클릭
- "Deployments" 탭에서 배포 기록 확인
- 빌드 로그 확인 가능

## 🔧 커스텀 도메인 연결 (선택사항)

자신의 도메인이 있다면:

1. Cloudflare Pages 프로젝트 → "Custom domains" 탭
2. "Set up a custom domain" 클릭
3. 도메인 입력 (예: `weather.yourdomain.com`)
4. DNS 레코드 설정 (자동 안내)
5. SSL 인증서 자동 발급 (무료)

## 🛠️ 문제 해결

### 빌드 실패 시

**원인**: 환경변수 미설정 또는 의존성 문제

**해결**:
1. Cloudflare 대시보드 → Settings → Environment variables 확인
2. `VITE_` 접두사가 올바른지 확인
3. Build log에서 오류 메시지 확인

### API 데이터가 안 나올 때

**원인**: API 키 문제 또는 프록시 오류

**해결**:
1. 브라우저 개발자 도구 → Console 탭 확인
2. Network 탭에서 `/api/kma`, `/api/hanriver` 요청 확인
3. API 키가 올바른지 확인
4. 기상청/한강홍수통제소 API 키 유효 기간 확인

### CORS 오류 발생 시

**원인**: Cloudflare Functions 미작동

**확인사항**:
- `functions/api/kma/[[path]].js` 파일 존재 확인
- `functions/api/hanriver/[[path]].js` 파일 존재 확인
- GitHub에 functions 폴더가 푸시되었는지 확인

## 📊 생성된 파일 구조

```
weather-dashboard-uijeongbu/
├── functions/              # Cloudflare Functions (API 프록시)
│   └── api/
│       ├── kma/
│       │   └── [[path]].js     # 기상청 API 프록시
│       └── hanriver/
│           └── [[path]].js     # 한강홍수통제소 API 프록시
├── public/
│   ├── _redirects         # SPA 라우팅 설정
│   └── _headers          # 보안 헤더 설정
└── [기존 파일들...]
```

## 🌐 배포 URL 예시

**기본 URL**:
- `https://uijeongbu-weather.pages.dev`
- `https://[커밋해시].uijeongbu-weather.pages.dev` (각 배포마다 고유 URL)

**커스텀 도메인** (설정 시):
- `https://weather.yourdomain.com`
- `https://uipol.weather.dev` (도메인 구매 시)

## 📱 PWA 설치

배포 후 모바일 브라우저에서:

1. Chrome/Safari에서 사이트 접속
2. "홈 화면에 추가" 또는 "설치" 선택
3. 앱처럼 사용 가능 (오프라인 지원)

## 🔄 업데이트 배포

```bash
# 코드 수정
# 예: src/components/widgets/CurrentWeather.jsx 수정

# 커밋 및 푸시
git add .
git commit -m "feat: 현재 날씨 위젯 UI 개선"
git push

# 자동 배포 시작
# 1-2분 후 https://uijeongbu-weather.pages.dev 에 반영
```

## 💡 팁

1. **Preview 배포**: PR 생성 시 자동으로 미리보기 URL 생성
2. **Rollback**: Cloudflare 대시보드에서 이전 배포로 즉시 롤백 가능
3. **Analytics**: Cloudflare Web Analytics 무료 제공
4. **성능**: 전 세계 CDN으로 한국에서도 빠른 속도
5. **무제한**: 트래픽 제한 없음 (무료 플랜)

## 🆘 지원

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **문제 발생 시**: Cloudflare 대시보드 → Support
- **커뮤니티**: Cloudflare Community 포럼

---

**배포 완료 후 이 파일은 삭제하거나 보관용으로 유지하세요.**
