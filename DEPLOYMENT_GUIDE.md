# 🚀 Cloudflare Pages 배포 가이드

## ✅ 코드 준비 완료!

최신 코드가 GitHub에 성공적으로 푸시되었습니다:
- **저장소**: https://github.com/tail79790-cloud/uijeongbu-weather-dashboard
- **브랜치**: main
- **커밋**: d6539b9 (실시간 알림 시스템 및 성능 최적화)

---

## 📋 Cloudflare Pages 배포 단계별 가이드

### 1단계: Cloudflare 대시보드 접속

1. **Cloudflare 대시보드 열기**
   ```
   🔗 https://dash.cloudflare.com
   ```

2. **로그인**
   - 계정이 없다면 무료 가입 (이메일 인증 필요)
   - 기존 계정으로 로그인

---

### 2단계: Pages 프로젝트 생성

1. **왼쪽 메뉴에서 "Workers & Pages" 클릭**

2. **"Create application" 버튼 클릭**

3. **"Pages" 탭 선택**

4. **"Connect to Git" 클릭**

5. **GitHub 연결**
   - "Connect GitHub" 버튼 클릭
   - GitHub 로그인 및 권한 승인
   - Cloudflare에게 저장소 접근 권한 부여

6. **저장소 선택**
   - 목록에서 `uijeongbu-weather-dashboard` 찾기
   - 선택 후 "Begin setup" 클릭

---

### 3단계: 빌드 설정 (중요!)

**Set up builds and deployments** 페이지에서:

#### 프로젝트 설정
```yaml
Project name: uijeongbu-weather
→ 배포 URL: https://uijeongbu-weather.pages.dev

Production branch: main
```

#### 빌드 설정
```yaml
Framework preset: Vite
→ 자동으로 아래 설정이 채워집니다

Build command: npm run build
Build output directory: dist
Root directory: (비워둠)
```

#### ⚠️ 환경 변수 설정 (매우 중요!)

**"Add variable" 버튼을 클릭하여 다음 변수들을 추가:**

##### 필수 환경 변수
```
변수 이름: VITE_KMA_API_KEY
값: [기상청 API 키를 여기에 입력]
환경: Production

변수 이름: VITE_HANRIVER_API_KEY
값: [한강홍수통제소 API 키를 여기에 입력]
환경: Production
```

##### 선택 환경 변수
```
변수 이름: VITE_OPENWEATHER_API_KEY
값: [OpenWeatherMap API 키 - 있다면]
환경: Production
```

**주의사항:**
- ✅ 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다
- ✅ Production 환경에 추가하세요
- ❌ API 키는 절대 GitHub에 올리지 마세요 (이미 .gitignore에 포함됨)

---

### 4단계: 배포 시작

1. **"Save and Deploy" 버튼 클릭**

2. **빌드 진행 확인**
   - 빌드 로그가 실시간으로 표시됩니다
   - 예상 시간: 2-3분
   - 주요 단계:
     ```
     ✓ Cloning repository
     ✓ Installing dependencies (npm install)
     ✓ Building application (npm run build)
     ✓ Deploying to Cloudflare's global network
     ```

3. **성공 메시지 확인**
   ```
   ✅ Success: Deployment complete!
   ```

4. **배포 URL 확인**
   ```
   https://uijeongbu-weather.pages.dev
   ```
   또는 설정한 프로젝트 이름에 따라:
   ```
   https://[프로젝트명].pages.dev
   ```

---

### 5단계: 배포 확인 및 테스트

배포가 완료되면 다음을 확인하세요:

#### ✅ 기본 동작 확인
- [ ] 페이지가 정상적으로 로드되는가?
- [ ] 헤더에 "의정부시 재난대응 날씨 대시보드" 표시되는가?
- [ ] 다크모드 토글이 작동하는가?
- [ ] PWA 설치 배너가 표시되는가? (모바일)

#### ✅ API 데이터 확인
- [ ] 긴급 기상특보 위젯이 표시되는가?
- [ ] 탭 전환 (전국/수도권/의정부)이 작동하는가?
- [ ] 현재 날씨 데이터가 로드되는가?
- [ ] 강수량/수위 정보가 표시되는가?
- [ ] 위험도 게이지가 정상적으로 표시되는가?
- [ ] 시간별 예보가 표시되는가?
- [ ] 3일 예보가 표시되는가?

#### ✅ 성능 확인
- [ ] 초기 로딩 시간 < 3초
- [ ] 위젯 Lazy Loading 작동 (스크롤 시 로드)
- [ ] 새로고침 버튼 동작 확인
- [ ] 자동 갱신 작동 확인

#### ✅ 모바일 확인
- [ ] 모바일 브라우저에서 정상 작동하는가?
- [ ] 반응형 레이아웃이 올바른가?
- [ ] 터치 인터랙션이 부드러운가?
- [ ] PWA로 설치 가능한가? ("홈 화면에 추가")

---

## 🔧 문제 해결

### 빌드 실패 시

**증상**: 빌드 로그에 오류 메시지 표시

**해결 방법:**

1. **환경 변수 확인**
   - Settings → Environment variables 메뉴
   - `VITE_KMA_API_KEY`, `VITE_HANRIVER_API_KEY` 존재 확인
   - 값이 올바르게 입력되었는지 확인
   - Production 환경에 추가되었는지 확인

2. **빌드 명령어 확인**
   - Build command: `npm run build` (정확히 일치)
   - Build output directory: `dist` (정확히 일치)
   - Framework preset: Vite

3. **빌드 로그 분석**
   - 에러 메시지에서 구체적인 원인 파악
   - 의존성 설치 실패: `package.json` 확인
   - 빌드 실패: 코드 문법 오류 확인

4. **재배포**
   - "Retry deployment" 버튼 클릭

### API 데이터가 안 나올 때

**증상**: 위젯에 "데이터 로딩 중..." 또는 오류 메시지

**해결 방법:**

1. **브라우저 개발자 도구 확인**
   - F12 키 또는 우클릭 → "검사"
   - Console 탭에서 오류 확인
   - Network 탭에서 API 요청 확인

2. **환경 변수 재확인**
   ```
   Cloudflare 대시보드
   → Pages
   → 프로젝트 선택
   → Settings
   → Environment variables
   ```

3. **API 키 유효성 확인**
   - 공공데이터포털(data.go.kr)에서 API 키 활성화 상태 확인
   - 일일 트래픽 제한 확인
   - 승인 상태 확인

4. **환경 변수 수정 후 재배포**
   - 환경 변수 수정
   - "Retry deployment" 클릭

### CORS 오류 발생 시

**증상**: Console에 "CORS policy" 오류

**확인사항:**
- `functions/api/kma/[[path]].js` 파일 존재 확인
- `functions/api/hanriver/[[path]].js` 파일 존재 확인
- GitHub에 functions 폴더가 푸시되었는지 확인

**해결 방법:**
```bash
# 로컬에서 확인
ls -la functions/

# GitHub에 푸시
git add functions/
git commit -m "fix: Add Cloudflare Functions for CORS"
git push
```

---

## 🎉 배포 완료 후

### 자동 배포 설정됨

이제부터 `main` 브랜치에 푸시할 때마다 **자동으로 재배포**됩니다:

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# → 자동으로 Cloudflare Pages가 빌드 및 배포
# → 2-3분 후 변경사항이 https://uijeongbu-weather.pages.dev 에 반영
```

### 배포 내역 확인

- **Cloudflare 대시보드** → **Pages** → **프로젝트**
- **"Deployments" 탭**에서 배포 기록 확인
- 각 배포마다 고유 URL 제공 (롤백 가능)
- Git 커밋과 연동되어 버전 관리 쉬움

### 커스텀 도메인 연결 (선택사항)

자신의 도메인이 있다면 연결 가능:

1. **Pages → 프로젝트 → "Custom domains" 탭**
2. **"Set up a custom domain" 클릭**
3. **도메인 입력** (예: `weather.yourdomain.com`)
4. **DNS 설정** 안내 따라하기
   ```
   CNAME weather uijeongbu-weather.pages.dev
   ```
5. **자동 HTTPS 인증서 발급** (무료, Let's Encrypt)

---

## 📊 API 키 발급 안내

### 기상청 API 키

1. **공공데이터포털 접속**
   ```
   🔗 https://www.data.go.kr
   ```

2. **회원가입 및 로그인**

3. **API 신청**
   - 검색: "기상청 단기예보 조회서비스"
   - 활용신청 → 일반 인증키(Encoding)
   - 승인 대기 (보통 즉시~1시간)

4. **API 키 복사**
   - 마이페이지 → 오픈API → 개발계정
   - **일반 인증키(Encoding)** 복사 (Decoding 아님!)

### 한강홍수통제소 API 키

1. **공공데이터포털 접속**
   ```
   🔗 https://www.data.go.kr
   ```

2. **API 신청**
   - 검색: "한강홍수통제소 실시간 수위"
   - 활용신청 → 일반 인증키(Encoding)

3. **API 키 복사**
   - 마이페이지에서 확인

---

## 🌐 최종 배포 URL

배포가 완료되면 다음 주소로 접속 가능:

```
🔗 https://uijeongbu-weather.pages.dev
```

**이 주소를:**
- 북마크에 추가하세요
- 동료들과 공유하세요
- 모바일에서 "홈 화면에 추가"로 앱처럼 사용하세요

---

## 📈 배포 현황

### 구현된 기능
- ✅ 105개 테스트 통과
- ✅ TDD 기반 개발
- ✅ 실시간 알림 시스템
- ✅ 위험도 자동 계산
- ✅ 공통 컴포넌트 시스템
- ✅ 성능 최적화 (Tree-shaking)
- ✅ PWA 지원
- ✅ 다크모드
- ✅ 반응형 디자인

### 최신 커밋
```
d6539b9 feat: 실시간 알림 시스템 및 성능 최적화 완료
0199906 refactor: 모든 위젯에 공통 컴포넌트 및 디자인 시스템 적용
1057534 test: TDD 기반 위젯 및 공통 컴포넌트 테스트 추가
63b0e12 feat: 공통 컴포넌트 및 디자인 시스템 추가
```

---

## 📞 도움이 필요하신가요?

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **GitHub 저장소**: https://github.com/tail79790-cloud/uijeongbu-weather-dashboard
- **이슈 등록**: 저장소의 Issues 탭 활용

---

**성공적인 배포를 기원합니다! 🎉**

배포 완료 후 이 파일에 실제 배포 URL과 날짜를 기록하세요:
- 배포 URL: ___________________________
- 배포 날짜: ___________________________
- 담당자: _____________________________
