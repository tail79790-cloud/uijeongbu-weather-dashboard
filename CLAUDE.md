# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time disaster response weather dashboard for Uijeongbu City (의정부시), South Korea. Built with React + Vite, integrates multiple Korean government weather APIs to provide comprehensive meteorological data for emergency management.

## Essential Commands

```bash
# Development
npm run dev              # Start Vite dev server with API proxies
npm run build            # Production build with code splitting
npm run preview          # Preview production build locally
npm run lint             # ESLint with React-specific rules

# Testing
npm run test             # Vitest in watch mode (TDD)
npm run test:ui          # Vitest UI dashboard
npm run test:run         # Single test run (CI mode)
npm run test:coverage    # Coverage report (text/json/html)
```

## Architecture

### API Integration Pattern

This project uses **three-tier API strategy** with automatic fallbacks:

1. **Primary**: Korean government APIs via Vite proxy (`/api/kma`, `/api/hanriver`)
2. **Fallback**: Development mock data when API keys are missing
3. **Proxy Configuration**: [vite.config.js:30-64](vite.config.js#L30-L64) handles CORS and request logging

**Critical**: All API services in [src/services/](src/services/) follow this pattern:
- Check real API first
- Catch errors gracefully
- Return mock data in development mode (`import.meta.env.DEV`)
- Always return `{ success, data, message }` structure

### Korean Meteorological Administration (KMA) API System

**Grid Coordinate System** ([src/utils/gridConverter.js](src/utils/gridConverter.js)):
- KMA uses Lambert Conformal Conic (LCC) projection grid coordinates (nx, ny)
- **Never use lat/lng directly** with KMA APIs - always convert first
- Uijeongbu coordinates: `{ nx: 61, ny: 127 }` (pre-calculated constant)

**API Timing Requirements** ([src/utils/dateFormatter.js](src/utils/dateFormatter.js)):
- **초단기실황 (Ultra-Short Realtime)**: Published hourly at :40 minutes
- **초단기예보 (Ultra-Short Forecast)**: Published hourly at :30 minutes
- **단기예보 (Short-term Forecast)**: Published at 02, 05, 08, 11, 14, 17, 20, 23 hours

**Critical**: Always use `getUltraSrtNcstBase()`, `getUltraSrtFcstBase()`, `getVilageFcstBase()` helper functions to calculate correct base times. API requests with wrong base times will return empty data.

### Data Flow Architecture

```
Widget Component (React Query)
    ↓ useQuery with refetchInterval
API Service (axios)
    ↓ Vite Proxy (/api/kma, /api/hanriver)
Korean Government APIs
    ↓ Response processing
Data Transformation (processUltraSrtNcst, etc.)
    ↓ Standardized format
Widget Display (Tailwind UI)
```

**Key Pattern**: All widgets use TanStack Query (React Query) with automatic refetch intervals:
- Weather alerts: 60 seconds
- Current weather: 5 minutes (300,000ms)
- Rainfall/flood: 5 minutes
- Hourly forecast: 10 minutes
- Daily forecast: 30 minutes

### Code Splitting & Performance

**Lazy Loading** ([src/App.jsx:10-17](src/App.jsx#L10-L17)):
- Critical widgets (alerts, current weather) load immediately
- Secondary widgets (forecasts, air quality) use `React.lazy()`
- Reduces initial bundle size by ~40%

**Vendor Chunking** ([vite.config.js:11-21](vite.config.js#L11-L21)):
- React/React-DOM → `react-vendor` chunk
- TanStack Query → `query-vendor` chunk
- Recharts → `charts-vendor` chunk (largest dependency)
- date-fns → `date-vendor` chunk

### Theme System

**Dark Mode Implementation** ([src/contexts/ThemeContext.jsx](src/contexts/ThemeContext.jsx)):
- Uses Tailwind's `dark:` variant system
- Persists preference to localStorage
- Respects system preference on first load
- All widgets support both themes via `dark:bg-gray-800` patterns

## Environment Configuration

Required API keys in `.env`:

```env
VITE_KMA_API_KEY=<기상청 API 인증키>
VITE_HANRIVER_API_KEY=<한강홍수통제소 API 인증키>
VITE_OPENWEATHER_API_KEY=<선택사항>
```

**Note**: All environment variables **must** use `VITE_` prefix to be exposed to browser code via `import.meta.env`.

## PWA Support

**Progressive Web App** configured via:
- [public/manifest.json](public/manifest.json) - Korean language, weather category
- [public/service-worker.js](public/service-worker.js) - Offline caching
- [index.html](index.html) - Service worker registration

Installable on mobile devices for offline emergency access.

## Testing Strategy

**Vitest Configuration** ([vite.config.js:66-78](vite.config.js#L66-L78)):
- `jsdom` environment for browser API simulation
- Setup file: [src/tests/setup.js](src/tests/setup.js)
- Coverage excludes `node_modules/` and test files
- CSS imports enabled for component testing

**Testing Pattern**:
- Test files: `src/tests/*.test.js`
- Use `@testing-library/react` for component tests
- Mock API responses, don't call real endpoints

## Korean Localization

**Full Korean UI**:
- All user-facing text in Korean (날씨, 강수량, 특보, etc.)
- Date formatting uses `date-fns` with `ko` locale
- Weather terminology follows KMA standards
- Region codes: Uijeongbu = 109, Seoul region = 11B00000

## Critical Development Notes

### When Adding New Widgets

1. Check if data needs grid coordinates → use `UIJEONGBU_GRID` from [src/utils/gridConverter.js](src/utils/gridConverter.js)
2. Check API publish schedule → use correct base time calculator from [src/utils/dateFormatter.js](src/utils/dateFormatter.js)
3. Add React Query hook with appropriate `refetchInterval`
4. Support both light/dark themes with Tailwind `dark:` variants
5. Consider lazy loading for non-critical widgets

### When Debugging API Issues

1. Check Vite dev server console for proxy logs (configured in [vite.config.js](vite.config.js))
2. Verify base date/time calculation matches API publish schedule
3. Confirm grid coordinates (nx, ny) are integers, not floats
4. Check API response structure: `response.header.resultCode === '00'` means success
5. Development mode auto-switches to mock data if API fails

### Weather Constants Mapping

[src/constants/weatherConstants.js](src/constants/weatherConstants.js) contains critical mappings:
- SKY codes (1=맑음, 3=구름많음, 4=흐림)
- PTY codes (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
- Wind directions (0-360 degrees → 16-point compass in Korean)
- Rainfall categories (text parsing to numeric values)

**Always use these constants** - never hardcode weather text or icons.

## Git Workflow

Current branch: `main` (no separate main branch configured)

Modified files show staged/unstaged changes - use standard git workflow:
```bash
git status          # Check current changes
git add <files>     # Stage changes
git commit -m "..."  # Commit with message
```

## Project File Organization

```
src/
├── components/
│   ├── widgets/          # Weather widget components
│   └── NotificationSettings.jsx
├── services/             # API integration layer
│   ├── kmaApi.js         # KMA weather APIs + mock data
│   ├── hanRiverApi.js    # Han River flood control
│   └── openWeatherApi.js # Backup weather source
├── utils/                # Core utilities
│   ├── gridConverter.js  # Lat/lng ↔ Grid coordinate math
│   ├── dateFormatter.js  # KMA date/time calculations
│   └── notifications.js  # Browser notifications
├── constants/
│   └── weatherConstants.js  # KMA code mappings
├── contexts/
│   └── ThemeContext.jsx  # Dark mode state
└── tests/
    └── setup.js          # Vitest configuration
```

**Important**: Keep API logic in `services/`, coordinate/time math in `utils/`, UI code in `components/`. Don't mix concerns.
