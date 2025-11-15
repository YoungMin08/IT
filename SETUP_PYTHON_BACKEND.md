# Python 백엔드 사용 가이드

## 개요
Next.js 백엔드를 Python 백엔드로 교체하는 방법을 설명합니다.

## 1. Python 백엔드 실행

### 서버 시작
```bash
cd backend
python3 server.py
```

서버가 `http://localhost:8000`에서 실행됩니다.

## 2. 프론트엔드 설정 변경

### config/api.ts 파일 수정

**기존 (Next.js 백엔드):**
```typescript
export const BASE_URL = '';
```

**Python 백엔드 사용:**
```typescript
export const BASE_URL = 'http://localhost:8000';
```

### 변경 방법
1. `echochamber/config/api.ts` 파일을 엽니다.
2. 주석 처리된 Python 백엔드 설정의 주석을 해제합니다.
3. Next.js 백엔드 설정을 주석 처리합니다.

```typescript
// Next.js 백엔드 사용 시 (기본값)
// export const BASE_URL = '';

// Python 백엔드 사용 시
export const BASE_URL = 'http://localhost:8000';
```

## 3. 프론트엔드 실행

```bash
# 다른 터미널에서
npm run dev
```

## 4. 확인

브라우저에서 `http://localhost:3000`을 열어 게임이 정상 작동하는지 확인합니다.

## 5. 문제 해결

### CORS 오류가 발생하는 경우
- Python 서버가 CORS 헤더를 제대로 보내는지 확인하세요.
- `send_cors_headers()` 메서드가 모든 응답에 포함되어 있는지 확인하세요.

### API 연결 오류
- Python 서버가 `http://localhost:8000`에서 실행 중인지 확인하세요.
- `config/api.ts`의 `BASE_URL`이 올바른지 확인하세요.

### 데이터 파일 오류
- `backend/data/game-state.json` 파일이 존재하는지 확인하세요.
- `backend/data/posts.json` 파일이 존재하는지 확인하세요.

## 6. 학습 목표

이 프로젝트를 통해 다음을 학습할 수 있습니다:

1. **HTTP 서버 구현**: BaseHTTPRequestHandler를 사용한 간단한 HTTP 서버
2. **JSON 처리**: Python의 `json` 모듈 사용
3. **파일 입출력**: JSON 파일 읽기/쓰기
4. **CORS 설정**: 크로스 오리진 요청 처리
5. **에러 처리**: try-except를 사용한 예외 처리

