import { useState } from 'react'

const API_KEY = '2CA2FF38-AAED-4277-8DB9-BDBF4C6C1092'

// 의정부시 주요 관측소 코드
const UIJEONGBU_STATIONS = {
  '백석천': '2018662',
  '중랑천': '1012200',
  '도봉천': '1012000'
}

export default function APITester() {
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])
    const results = []

    // 테스트 1: 직접 호출 (CORS 에러 예상)
    console.log('🧪 테스트 1: 직접 API 호출 시작...')
    try {
      const response = await fetch(
        `http://apis.data.go.kr/B500001/rwis/waterLevel/list?serviceKey=${API_KEY}&stationCode=2018662&format=json`
      )
      const data = await response.json()
      results.push({
        name: '테스트 1: 직접 API 호출',
        status: 'success',
        message: '성공! (예상 밖)',
        data: JSON.stringify(data, null, 2)
      })
    } catch (error) {
      results.push({
        name: '테스트 1: 직접 API 호출',
        status: 'error',
        message: `CORS 에러 (정상): ${error.message}`,
        data: null
      })
    }

    // 테스트 2: Vite 프록시를 통한 호출 (이게 작동해야 함!)
    console.log('🧪 테스트 2: 프록시 통한 호출 시작...')
    try {
      const response = await fetch(
        `/api/hanriver?serviceKey=${API_KEY}&stationCode=2018662&format=json`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      results.push({
        name: '테스트 2: Vite 프록시 호출 ⭐',
        status: 'success',
        message: '✅ 성공! 프록시 작동 중',
        data: JSON.stringify(data, null, 2)
      })
    } catch (error) {
      results.push({
        name: '테스트 2: Vite 프록시 호출 ⭐',
        status: 'error',
        message: `프록시 오류: ${error.message}`,
        data: null
      })
    }

    // 테스트 3: XML 형식으로 요청
    console.log('🧪 테스트 3: XML 형식 요청...')
    try {
      const response = await fetch(
        `/api/hanriver?serviceKey=${API_KEY}&stationCode=2018662&format=xml`
      )
      
      const text = await response.text()
      
      results.push({
        name: '테스트 3: XML 형식',
        status: response.ok ? 'success' : 'warning',
        message: response.ok ? 'XML 데이터 수신' : 'XML 파싱 필요',
        data: text.substring(0, 500) + '...'
      })
    } catch (error) {
      results.push({
        name: '테스트 3: XML 형식',
        status: 'error',
        message: `XML 오류: ${error.message}`,
        data: null
      })
    }

    // 테스트 4: 중랑천 관측소
    console.log('🧪 테스트 4: 중랑천 관측소...')
    try {
      const response = await fetch(
        `/api/hanriver?serviceKey=${API_KEY}&stationCode=1012200&format=json`
      )
      
      const data = await response.json()
      
      results.push({
        name: '테스트 4: 중랑천 관측소',
        status: 'success',
        message: '중랑천 데이터 수신',
        data: JSON.stringify(data, null, 2)
      })
    } catch (error) {
      results.push({
        name: '테스트 4: 중랑천 관측소',
        status: 'error',
        message: `중랑천 오류: ${error.message}`,
        data: null
      })
    }

    // 테스트 5: 모든 관측소 조회
    console.log('🧪 테스트 5: 의정부 전체 관측소...')
    try {
      const allStations = await Promise.all(
        Object.entries(UIJEONGBU_STATIONS).map(async ([name, code]) => {
          const response = await fetch(
            `/api/hanriver?serviceKey=${API_KEY}&stationCode=${code}&format=json`
          )
          const data = await response.json()
          return { name, code, data }
        })
      )
      
      results.push({
        name: '테스트 5: 의정부 전체 관측소',
        status: 'success',
        message: `${allStations.length}개 관측소 데이터 수신`,
        data: JSON.stringify(allStations, null, 2)
      })
    } catch (error) {
      results.push({
        name: '테스트 5: 의정부 전체 관측소',
        status: 'error',
        message: `전체 조회 오류: ${error.message}`,
        data: null
      })
    }

    setTestResults(results)
    setIsLoading(false)
    console.log('✅ 모든 테스트 완료!')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            🌊 한강홍수통제소 API 테스트
          </h1>
          <p className="text-gray-600 mb-4">
            의정부시 수위 관측소 API 연결 테스트
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">📍 의정부시 관측소</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              {Object.entries(UIJEONGBU_STATIONS).map(([name, code]) => (
                <li key={code}>• {name}: {code}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={runTests}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? '테스트 진행 중...' : 'API 테스트 시작 🚀'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">테스트 결과</h2>
            
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  result.status === 'success'
                    ? 'border-green-500'
                    : result.status === 'warning'
                    ? 'border-yellow-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status === 'success' ? '✅ 성공' : 
                     result.status === 'warning' ? '⚠️ 경고' : '❌ 실패'}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-2">{result.message}</p>
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                      데이터 보기
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                      {result.data}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-700">성공</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {testResults.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-700">경고</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-700">실패</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 중요 안내</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 개발 서버 실행: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
            <li>• vite.config.js의 프록시 설정이 필요합니다</li>
            <li>• API 키: 2CA2FF38-AAED-4277-8DB9-BDBF4C6C1092</li>
          </ul>
        </div>
      </div>
    </div>
  )
}