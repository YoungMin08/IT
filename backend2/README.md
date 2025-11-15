# EchoChamber 백엔드 교육용 버전 2

## 개요
이 프로젝트는 고등학생을 위한 교육용 백엔드 프로젝트입니다.
각 API의 구현 부분을 직접 작성하면서 HTTP 서버와 JSON 데이터 처리 방법을 학습할 수 있습니다.

## 목표
1. HTTP 요청(GET, POST) 처리 방법 이해
2. JSON 파일 읽기/쓰기 방법 학습
3. 데이터 검증 및 에러 처리 방법 학습
4. 간단한 API 서버 구현 경험

## 시작하기

### 1. 파일 구조
```
backend2/
├── data/              # JSON 데이터 파일들 (모양만 있는 예시 파일)
│   ├── game-state.json
│   ├── posts.json
│   ├── users.json
│   └── leaderboard.json
├── server.py          # 서버 코드 (구현 부분은 빈칸)
└── README.md          # 이 파일
```

### 2. JSON 파일 읽기/쓰기 방법

#### JSON 파일 읽기
```python
import json

# 파일 읽기
with open('data/game-state.json', 'r', encoding='utf-8') as f:
    data = json.load(f)  # JSON을 파이썬 딕셔너리/리스트로 변환
```

#### JSON 파일 쓰기
```python
import json

# 파일 쓰기
data = {"key": "value"}  # 파이썬 딕셔너리 또는 리스트
with open('data/game-state.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    # ensure_ascii=False: 한글이 깨지지 않게
    # indent=2: 들여쓰기로 보기 좋게
```

### 3. 서버 실행
```bash
python3 server.py
```

### 4. 과제
`server.py` 파일에서 `# TODO` 주석이 있는 부분을 찾아 구현하세요!
각 함수에 상세한 주석이 있어서 어떤 작업을 해야 하는지 알 수 있습니다.

### 5. posts.json 살펴보기
- `freedomImpact`: 게시글이 자유도에 주는 영향 (정수 또는 소수)
- `orderImpact`: 게시글이 질서도에 주는 영향
- `trustImpact`: 게시글이 신뢰도에 주는 영향
- `diversityImpact`: 게시글이 다양성에 주는 영향
- API를 구현할 때 이 네 가지 값을 활용해 지표를 조정하게 됩니다.

## API 목록
1. **GET /api/game-state** - 게임 상태 조회
2. **POST /api/game-state** - 게임 상태 업데이트
3. **GET /api/posts** - 게시글 목록 조회
4. **POST /api/posts/update** - 게시글 수정
5. **POST /api/action** - 게시글 액션 처리
6. **POST /api/reset** - 게임 리셋
7. **GET /api/leaderboard** - 리더보드 조회
8. **POST /api/auth/register** - 회원가입
9. **POST /api/auth/login** - 로그인
10. **GET /api/auth/check** - 인증 상태 확인

## 학습 순서 추천
1. **GET /api/game-state** - 가장 간단한 API부터 시작
2. **GET /api/posts** - 배열 반환 방법 학습
3. **POST /api/posts/update** - 데이터 수정 및 저장 흐름 이해
4. **POST /api/reset** - 데이터 저장 방법 학습
5. **POST /api/auth/register** - 데이터 검증 방법 학습
6. **POST /api/auth/login** - 데이터 찾기 방법 학습
7. **POST /api/action** - 복잡한 로직 구현

## 팁
- 에러가 나면 에러 메시지를 자세히 읽어보세요
- 각 함수의 주석을 꼼꼼히 읽으세요
- 예시 JSON 파일의 구조를 참고하세요
- 작은 단위로 하나씩 테스트하세요

