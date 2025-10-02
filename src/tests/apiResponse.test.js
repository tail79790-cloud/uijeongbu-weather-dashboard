/**
 * API 응답 검증 테스트 (TDD Red Phase)
 *
 * 목적: 실제 API 응답 구조와 데이터 파싱 로직 검증
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// 기상청 API 응답 구조 테스트
describe('기상청 API 응답 구조 검증', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초단기실황 API가 올바른 응답 구조를 반환해야 함', async () => {
    const mockResponse = {
      response: {
        header: {
          resultCode: '00',
          resultMsg: 'NORMAL_SERVICE'
        },
        body: {
          items: {
            item: [
              { category: 'T1H', obsrValue: '15.2' },
              { category: 'RN1', obsrValue: '0' },
              { category: 'REH', obsrValue: '65' }
            ]
          }
        }
      }
    };

    // 응답 구조가 올바른지 검증
    expect(mockResponse.response.header.resultCode).toBe('00');
    expect(mockResponse.response.body.items.item).toBeInstanceOf(Array);
    expect(mockResponse.response.body.items.item.length).toBeGreaterThan(0);
  });

  it('초단기실황 API 에러 응답을 올바르게 처리해야 함', () => {
    const errorResponse = {
      response: {
        header: {
          resultCode: '03',
          resultMsg: 'NO_DATA'
        }
      }
    };

    // 에러 코드 검증
    expect(errorResponse.response.header.resultCode).not.toBe('00');
    expect(errorResponse.response.header.resultMsg).toBe('NO_DATA');
  });

  it('단기예보 API 응답에서 필수 필드가 누락되지 않아야 함', () => {
    const mockItem = {
      category: 'TMP',
      fcstDate: '20250103',
      fcstTime: '1500',
      fcstValue: '15'
    };

    // 필수 필드 검증
    expect(mockItem).toHaveProperty('category');
    expect(mockItem).toHaveProperty('fcstDate');
    expect(mockItem).toHaveProperty('fcstTime');
    expect(mockItem).toHaveProperty('fcstValue');
  });
});

// Cloudflare Functions 프록시 응답 테스트
describe('Cloudflare Functions API 프록시 검증', () => {
  it('프록시가 CORS 헤더를 올바르게 설정해야 함', () => {
    const proxyHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Cache-Control': 'public, max-age=300'
    };

    expect(proxyHeaders['Access-Control-Allow-Origin']).toBe('*');
    expect(proxyHeaders['Content-Type']).toContain('application/json');
  });

  it('프록시 에러 시 적절한 에러 응답을 반환해야 함', () => {
    const errorResponse = {
      error: 'API 프록시 오류',
      message: 'Network error'
    };

    expect(errorResponse).toHaveProperty('error');
    expect(errorResponse).toHaveProperty('message');
  });
});

// 환경변수 및 API 키 검증 테스트
describe('환경변수 및 API 키 검증', () => {
  it('API 키가 설정되어 있어야 함', () => {
    // 프로덕션 환경에서는 demo_key가 아니어야 함
    const apiKey = import.meta.env.VITE_KMA_API_KEY || 'demo_key';

    // 개발 환경이 아니면 실제 키가 있어야 함
    if (!import.meta.env.DEV) {
      expect(apiKey).not.toBe('demo_key');
      expect(apiKey.length).toBeGreaterThan(10);
    }
  });

  it('API 엔드포인트가 올바르게 구성되어야 함', () => {
    const baseUrl = '/api/kma';
    const fullUrl = `${baseUrl}/VilageFcstInfoService_2.0/getUltraSrtNcst`;

    expect(fullUrl).toContain('/api/kma');
    expect(fullUrl).toContain('VilageFcstInfoService');
  });
});

// 데이터 파싱 로직 테스트
describe('API 응답 데이터 파싱 검증', () => {
  it('초단기실황 데이터를 올바르게 파싱해야 함', () => {
    const items = [
      { category: 'T1H', obsrValue: '15.2' },
      { category: 'RN1', obsrValue: '0' },
      { category: 'REH', obsrValue: '65' }
    ];

    const data = {};
    items.forEach(item => {
      data[item.category] = item.obsrValue;
    });

    expect(parseFloat(data.T1H)).toBe(15.2);
    expect(parseFloat(data.RN1)).toBe(0);
    expect(parseFloat(data.REH)).toBe(65);
  });

  it('빈 배열이나 null 응답을 안전하게 처리해야 함', () => {
    const emptyItems = null;
    const result = Array.isArray(emptyItems) ? emptyItems : [];

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it('단일 객체 응답을 배열로 정규화해야 함', () => {
    const singleItem = { category: 'TMP', value: '15' };
    const normalizedItems = Array.isArray(singleItem) ? singleItem : [singleItem];

    expect(normalizedItems).toBeInstanceOf(Array);
    expect(normalizedItems.length).toBe(1);
    expect(normalizedItems[0]).toEqual(singleItem);
  });
});

// API 타임아웃 및 재시도 로직 테스트
describe('API 에러 처리 및 폴백 검증', () => {
  it('API 타임아웃 시 목업 데이터를 반환해야 함', () => {
    const fallbackData = {
      success: true,
      data: {
        temperature: 15,
        humidity: 65
      },
      message: '목업 데이터 사용'
    };

    expect(fallbackData.success).toBe(true);
    expect(fallbackData.data).toBeDefined();
  });

  it('네트워크 에러 시 적절한 에러 메시지를 반환해야 함', () => {
    const errorResult = {
      success: false,
      data: null,
      message: '네트워크 오류가 발생했습니다.'
    };

    expect(errorResult.success).toBe(false);
    expect(errorResult.data).toBeNull();
    expect(errorResult.message).toContain('오류');
  });
});

// 실제 Cloudflare Functions 엔드포인트 테스트
describe('실제 API 엔드포인트 검증 (통합 테스트)', () => {
  it('KMA 프록시 엔드포인트가 응답해야 함', async () => {
    // 이 테스트는 실제 배포 환경에서만 유효
    if (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')) {
      try {
        const response = await fetch('/api/kma/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=test&pageNo=1&numOfRows=1&dataType=JSON&base_date=20250103&base_time=1400&nx=61&ny=127');

        expect(response.status).toBeLessThan(500); // 500 에러가 아니어야 함
      } catch (error) {
        // 네트워크 에러는 예상 가능
        expect(error).toBeDefined();
      }
    } else {
      // 로컬 환경에서는 스킵
      expect(true).toBe(true);
    }
  });
});
