import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

describe('ThemeContext - localStorage 안전성', () => {
  let originalLocalStorage;
  let originalMatchMedia;

  beforeEach(() => {
    // 원본 저장
    originalLocalStorage = global.localStorage;
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    // 복원
    if (originalLocalStorage) {
      global.localStorage = originalLocalStorage;
    }
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('localStorage가 없는 환경에서도 크래시하지 않아야 함', () => {
    // localStorage 제거
    delete global.localStorage;

    // ThemeProvider 렌더링 - 오류 없이 작동해야 함
    expect(() => {
      const TestComponent = () => {
        const { isDark } = useTheme();
        return <div>{isDark ? 'dark' : 'light'}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
    }).not.toThrow();
  });

  it('window.matchMedia가 없는 환경에서도 작동해야 함', () => {
    // matchMedia 제거
    delete window.matchMedia;

    expect(() => {
      const TestComponent = () => {
        const { isDark } = useTheme();
        return <div>{isDark ? 'dark' : 'light'}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
    }).not.toThrow();
  });

  it('localStorage에서 오류가 발생해도 기본값을 반환해야 함', () => {
    // localStorage에서 오류 발생하도록 설정
    Object.defineProperty(global, 'localStorage', {
      get: () => {
        throw new Error('localStorage access denied');
      },
      configurable: true,
    });

    const TestComponent = () => {
      const { isDark, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{isDark ? 'dark' : 'light'}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // 기본값(false)으로 렌더링됨
    expect(getByTestId('theme')).toHaveTextContent('light');
  });

  it('SSR 환경(window undefined)에서도 작동해야 함', () => {
    // window를 undefined로 모킹
    const originalWindow = global.window;
    delete global.window;

    expect(() => {
      const TestComponent = () => {
        const { isDark } = useTheme();
        return <div>{isDark ? 'dark' : 'light'}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
    }).not.toThrow();

    // window 복원
    global.window = originalWindow;
  });
});
