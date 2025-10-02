import { describe, it, expect } from 'vitest';
import { getLivingWeatherIndex } from '../services/kmaApi';

describe('KMA API - 생활기상지수 테스트', () => {
  it('생활기상지수 API가 데이터를 반환해야 함', async () => {
    const result = await getLivingWeatherIndex({ areaNo: '1100000000' });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // 자외선지수 검증
    if (result.data.uv) {
      expect(result.data.uv).toHaveProperty('value');
      expect(result.data.uv).toHaveProperty('text');
      expect(typeof result.data.uv.value).toBe('number');
      expect(['낮음', '보통', '높음', '매우 높음', '위험']).toContain(result.data.uv.text);
    }

    // 대기확산지수 검증
    if (result.data.airDiffusion) {
      expect(result.data.airDiffusion).toHaveProperty('value');
      expect(result.data.airDiffusion).toHaveProperty('text');
      expect(typeof result.data.airDiffusion.value).toBe('number');
      expect(['좋음', '보통', '나쁨', '매우 나쁨']).toContain(result.data.airDiffusion.text);
    }

    // 천식지수 검증
    if (result.data.asthma) {
      expect(result.data.asthma).toHaveProperty('value');
      expect(result.data.asthma).toHaveProperty('text');
      expect(typeof result.data.asthma.value).toBe('number');
      expect(['낮음', '보통', '높음', '매우 높음']).toContain(result.data.asthma.text);
    }
  }, 10000); // 10초 타임아웃

  it('잘못된 지역 코드로도 목업 데이터를 반환해야 함', async () => {
    const result = await getLivingWeatherIndex({ areaNo: '9999999999' });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
