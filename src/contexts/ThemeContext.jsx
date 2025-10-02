import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      // 브라우저 환경인지 확인
      if (typeof window === 'undefined') {
        return false;
      }

      // localStorage 안전 접근
      if (typeof window.localStorage !== 'undefined') {
        const savedTheme = window.localStorage.getItem('theme');
        if (savedTheme) {
          return savedTheme === 'dark';
        }
      }

      // matchMedia 안전 접근
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      return false;
    } catch (error) {
      console.warn('Theme initialization error:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      // 브라우저 환경인지 확인
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      // 테마 변경 시 HTML 클래스와 로컬 스토리지 업데이트
      if (isDark) {
        document.documentElement.classList.add('dark');
        if (typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem('theme', 'dark');
        }
      } else {
        document.documentElement.classList.remove('dark');
        if (typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem('theme', 'light');
        }
      }
    } catch (error) {
      console.warn('Theme update error:', error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
