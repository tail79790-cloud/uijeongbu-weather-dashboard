/**
 * Cloudflare Pages Function - 한강홍수통제소 API 프록시
 *
 * 경로: /api/hanriver/* → http://apis.data.go.kr/B500001/rwis/waterLevel/*
 * 용도: CORS 문제 해결 및 API 키 보호
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // /api/hanriver/list → http://apis.data.go.kr/B500001/rwis/waterLevel/list
  const pathSegments = url.pathname.split('/api/hanriver/')[1] || 'list';
  const targetUrl = `http://apis.data.go.kr/B500001/rwis/waterLevel/${pathSegments}${url.search}`;

  console.log('Han River API Proxy:', targetUrl);

  try {
    // 원본 API 호출
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 응답 데이터 가져오기
    const data = await response.text();

    // CORS 헤더를 포함한 응답 반환
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300', // 5분 캐싱
      },
    });
  } catch (error) {
    console.error('Han River API Proxy Error:', error);

    return new Response(
      JSON.stringify({
        error: 'API 프록시 오류',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
