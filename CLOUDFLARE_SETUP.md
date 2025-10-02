# 🚀 Cloudflare Pages 배포 즉시 시작 가이드

## ✅ GitHub 푸시 완료!

코드가 GitHub에 성공적으로 업로드되었습니다:
**저장소**: https://github.com/tail79790-cloud/uijeongbu-weather-dashboard

---

## 📋 Cloudflare Pages 설정 단계

### 1단계: Cloudflare 계정 생성/로그인

1. **Cloudflare 대시보드 접속**
   - 🔗 https://dash.cloudflare.com
   - 계정이 없다면 무료 가입 (이메일 인증 필요)

2. **로그인 후 메인 대시보드 확인**

---

### 2단계: Pages 프로젝트 생성

1. **왼쪽 메뉴에서 "Workers & Pages" 클릭**

2. **"Create application" 버튼 클릭**

3. **"Pages" 탭 선택 → "Connect to Git" 클릭**

4. **GitHub 연결**
   - "Connect GitHub" 버튼 클릭
   - GitHub 로그인 및 권한 승인
   - Cloudflare에게 저장소 접근 권한 부여

5. **저장소 선택**
   - 목록에서 `uijeongbu-weather-dashboard` 선택
   - "Begin setup" 클릭

---

### 3단계: 빌드 설정 (중요!)

**Set up builds and deployments** 페이지에서:

```
Project name: uijeongbu-weather
→ 배포 URL이 됩니다: https://uijeongbu-weather.pages.dev

Production branch: main

Build settings:
  Framework preset: None (또는 Vite 선택)
  Build command: npm run build
  Build output directory: dist
  Root directory: (비워둠)
```

**Environment variables (환경 변수)** - 매우 중요!

"Add variable" 버튼을 클릭하여 다음 변수들을 추가:

```
변수 이름: VITE_KMA_API_KEY
값: [여기에 기상청 API 키 입력]

변수 이름: VITE_HANRIVER_API_KEY
값: [여기에 한강홍수통제소 API 키 입력]

변수 이름: VITE_OPENWEATHER_API_KEY (선택사항)
값: [OpenWeatherMap API 키 - 있다면]
```

⚠️ **주의**:
- 환경 변수는 반드시 `VITE_` 접두사로 시작해야 합니다
- Production 환경에 추가하세요
- API 키는 절대 GitHub에 올리지 마세요 (이미 .gitignore에 포함됨)

---

### 4단계: 배포 시작

1. **"Save and Deploy" 버튼 클릭**

2. **빌드 진행 확인**
   - 빌드 로그가 실시간으로 표시됩니다
   - 예상 시간: 1-2분
   - 성공 메시지: ✅ "Success: Deployment complete!"

3. **배포 URL 확인**
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

✅ **기본 동작 확인**
- [ ] 페이지가 정상적으로 로드되는가?
- [ ] 헤더에 "의정부시 재난대응 날씨 대시보드" 표시되는가?
- [ ] 다크모드 토글이 작동하는가?

✅ **API 데이터 확인**
- [ ] 긴급 기상특보 위젯이 표시되는가?
- [ ] 현재 날씨 데이터가 로드되는가?
- [ ] 강수량/수위 정보가 표시되는가?
- [ ] 시간별 예보가 표시되는가?
- [ ] 3일 예보가 표시되는가?

✅ **모바일 확인**
- [ ] 모바일 브라우저에서 정상 작동하는가?
- [ ] 반응형 레이아웃이 올바른가?

---

## 🔧 문제 해결

### 빌드 실패 시

**증상**: 빌드 로그에 오류 메시지 표시

**해결 방법**:
1. 빌드 로그에서 오류 메시지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Settings → Environment variables 에서 다시 확인

### API 데이터가 안 나올 때

**증상**: 위젯에 "데이터 로딩 중..." 또는 오류 메시지

**해결 방법**:
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 오류 확인
3. Network 탭에서 `/api/kma`, `/api/hanriver` 요청 확인
4. 환경 변수의 API 키가 올바른지 재확인

**환경 변수 수정 방법**:
- Cloudflare 대시보드 → Pages → 프로젝트 선택
- Settings → Environment variables
- 변수 수정 후 "Retry deployment" 클릭

### CORS 오류 발생 시

**증상**: Console에 "CORS policy" 오류

**확인사항**:
- `functions/api/kma/[[path]].js` 파일 존재 확인
- `functions/api/hanriver/[[path]].js` 파일 존재 확인
- GitHub에 functions 폴더가 푸시되었는지 확인

---

## 🎉 배포 완료 후

### 자동 배포 설정됨

이제부터 `main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "feat: 위젯 개선"
git push

# → 자동으로 Cloudflare Pages가 빌드 및 배포
# → 1-2분 후 변경사항이 https://uijeongbu-weather.pages.dev 에 반영
```

### 배포 내역 확인

- Cloudflare 대시보드 → Pages → 프로젝트
- "Deployments" 탭에서 배포 기록 확인
- 각 배포마다 고유 URL 제공 (롤백 가능)

### 커스텀 도메인 연결 (선택사항)

자신의 도메인이 있다면:

1. Pages → 프로젝트 → "Custom domains" 탭
2. "Set up a custom domain" 클릭
3. 도메인 입력 (예: `weather.yourdomain.com`)
4. DNS 설정 안내 따라하기
5. 자동 HTTPS 인증서 발급 (무료)

---

## 📊 API 키 발급 안내

### 기상청 API 키

1. **공공데이터포털 접속**
   - 🔗 https://www.data.go.kr
   - 회원가입 및 로그인

2. **API 신청**
   - 검색: "기상청 단기예보 조회서비스"
   - 활용신청 → 일반 인증키(Encoding)
   - 승인 대기 (보통 즉시~1시간)

3. **API 키 복사**
   - 마이페이지 → 오픈API → 개발계정
   - 일반 인증키(Encoding) 복사

### 한강홍수통제소 API 키

1. **공공데이터포털 접속**
   - 🔗 https://www.data.go.kr

2. **API 신청**
   - 검색: "한강홍수통제소 실시간 수위"
   - 활용신청 → 일반 인증키(Encoding)

3. **API 키 복사**
   - 마이페이지에서 확인

---

## 🌐 최종 배포 URL

배포가 완료되면 다음 주소로 접속 가능:

```
https://uijeongbu-weather.pages.dev
```

이 주소를 북마크하거나 공유하세요!

모바일에서는 "홈 화면에 추가"를 통해 앱처럼 사용할 수 있습니다.

---

## 📞 도움이 필요하신가요?

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **GitHub 저장소**: https://github.com/tail79790-cloud/uijeongbu-weather-dashboard
- **이슈 등록**: 저장소의 Issues 탭 활용

**성공적인 배포를 기원합니다! 🎉**
