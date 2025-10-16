/**
 * Cloudflare Pages Functions - 기상청 API 프록시
 *
 * 역할:
 * - 브라우저에서 기상청 API 직접 호출 시 발생하는 CORS 문제 해결
 * - API 키를 서버 사이드에서 안전하게 관리
 * - 모든 기상청 API 엔드포인트를 프록시
 *
 * 경로 예시:
 * /api/kma/VilageFcstInfoService_2.0/getUltraSrtNcst
 * → http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);

    // API 키 가져오기 (환경 변수에서)
    const API_KEY = env.VITE_KMA_API_KEY || '';

    // 디버깅용 로그 (프로덕션에서는 제거 가능)
    console.log('🌦️  KMA API 프록시 요청:', url.pathname);

    // 프록시할 경로 추출 (/api/kma → /1360000)
    const apiPath = url.pathname.replace('/api/kma', '/1360000');

    // 기상청 API URL 구성
    const targetUrl = new URL(`http://apis.data.go.kr${apiPath}`);

    // 쿼리 파라미터 복사 (serviceKey 제외)
    url.searchParams.forEach((value, key) => {
      if (key !== 'serviceKey') {
        targetUrl.searchParams.set(key, value);
      }
    });

    // API 키 추가
    if (API_KEY) {
      targetUrl.searchParams.set('serviceKey', API_KEY);
    }

    console.log('📡 Target URL:', targetUrl.toString().replace(API_KEY, '***'));

    // 기상청 API 호출
    const apiResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Uijeongbu-Weather-Dashboard/1.0',
      },
    });

    // 응답 데이터
    const data = await apiResponse.text();

    console.log('✅ KMA API 응답:', apiResponse.status);

    // CORS 헤더와 함께 응답 반환
    return new Response(data, {
      status: apiResponse.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('❌ KMA API 프록시 에러:', error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: '기상청 API 프록시 오류가 발생했습니다.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
