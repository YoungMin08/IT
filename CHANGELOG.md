# 변경사항 (Changelog)

## 버전 2.0.0 - 영향값 배열 구조 변경 (2025)

### 주요 변경사항

이번 업데이트에서는 게시글의 영향값 구조를 단일 숫자에서 **액션별 배열** 형태로 변경했습니다. 이를 통해 각 액션(통과/경고/삭제)에 대한 영향값을 JSON에서 직접 제어할 수 있게 되었습니다.

---

## 📋 변경 상세

### 1. 데이터 구조 변경

#### 이전 구조 (v1.x)
```json
{
  "id": 1,
  "type": "허위정보",
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자",
  "freedomImpact": -5,
  "orderImpact": 10,
  "trustImpact": 7,
  "diversityImpact": -3
}
```

#### 새로운 구조 (v2.0)
```json
{
  "id": 1,
  "type": "허위정보",
  "title": "게시글 제목",
  "content": "게시글 내용",
  "author": "작성자",
  "freedomImpact": [-5, -2, -8],    // [통과, 경고, 삭제]
  "orderImpact": [10, 5, 12],
  "trustImpact": [7, 3, -6],
  "diversityImpact": [-3, -1, 2]
}
```

**변경 내용:**
- 각 영향값(`freedomImpact`, `orderImpact`, `trustImpact`, `diversityImpact`)이 **3개 요소의 배열**로 변경
- 배열 인덱스 의미:
  - `[0]`: **통과 (approve)** 액션 시 적용되는 값
  - `[1]`: **경고 (warn)** 액션 시 적용되는 값
  - `[2]`: **삭제 (delete)** 액션 시 적용되는 값

---

### 2. 타입 정의 변경

#### `types/game.ts`

**변경 전:**
```typescript
export interface Post {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  freedomImpact: number;
  orderImpact: number;
  trustImpact: number;
  diversityImpact: number;
}
```

**변경 후:**
```typescript
export interface Post {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  freedomImpact: number[]; // [approve, warn, delete]
  orderImpact: number[];    // [approve, warn, delete]
  trustImpact: number[];    // [approve, warn, delete]
  diversityImpact: number[]; // [approve, warn, delete]
}
```

---

### 3. 게임 액션 처리 로직 변경

#### 이전 로직 (v1.x)
액션에 따라 영향값을 계산식으로 변환:
- **통과**: 원본 값 그대로
- **경고**: 원본 값 × 0.5
- **삭제**: 복잡한 계산식 (자유도: -abs × 1.5, 질서도: abs × 1.2 등)

#### 새로운 로직 (v2.0)
배열에서 직접 값을 가져옴:
- **통과**: `impactArray[0]` 사용
- **경고**: `impactArray[1]` 사용
- **삭제**: `impactArray[2]` 사용

**파일:**
- `app/api/action/route.ts`
- `backend/server.py`

**코드 예시:**
```typescript
// 액션에 따른 배열 인덱스 결정
let actionIndex = 0; // approve
if (action === 'warn') {
  actionIndex = 1;
} else if (action === 'delete') {
  actionIndex = 2;
}

// 배열에서 직접 값 가져오기
const freedomChange = getImpactValue(currentPost.freedomImpact, actionIndex);
```

---

### 4. 관리자 페이지 UI 변경

#### `components/AdminPanel.tsx`

**변경 전:**
- 각 영향값을 단일 입력 필드로 표시
- 예: "자유도 영향: -5"

**변경 후:**
- 각 영향값을 **3개의 입력 필드**로 분리
- 각 필드는 [통과, 경고, 삭제] 순서로 배치
- 게시글 목록에서도 배열 형태로 표시

**UI 구조:**
```
자유도 영향
[통과 입력] [경고 입력] [삭제 입력]

질서도 영향
[통과 입력] [경고 입력] [삭제 입력]

신뢰도 영향
[통과 입력] [경고 입력] [삭제 입력]

다양성 영향
[통과 입력] [경고 입력] [삭제 입력]
```

---

### 5. API 엔드포인트 변경

#### POST `/api/posts/update`
**변경 전:**
```json
{
  "id": 1,
  "freedomImpact": -5,
  "orderImpact": 10
}
```

**변경 후:**
```json
{
  "id": 1,
  "freedomImpact": [-5, -2, -8],
  "orderImpact": [10, 5, 12],
  "trustImpact": [7, 3, -6],
  "diversityImpact": [-3, -1, 2]
}
```

**유효성 검사:**
- 배열이 아니거나 길이가 3이 아니면 400 에러 반환
- 각 요소가 숫자가 아니면 400 에러 반환

#### POST `/api/posts/create`
동일하게 배열 형태로 변경

**파일:**
- `app/api/posts/update/route.ts`
- `app/api/posts/create/route.ts`
- `backend/server.py` (handle_post_update_post, handle_post_create_post)

---

### 6. 데이터 마이그레이션

기존 `posts.json` 파일의 모든 게시글을 자동으로 배열 형태로 변환했습니다.

**변환 규칙:**
- 기존 단일 값을 `[0]` (통과) 값으로 사용
- `[1]` (경고) = 기존 값 × 0.5
- `[2]` (삭제) = 기존 값에 따라 계산 (자유도: -abs × 1.5, 질서도: abs × 1.2 등)

**변환된 파일:**
- `data/posts.json`
- `backend/data/posts.json`

---

### 7. 호환성 유지

기존 단일 값 형태의 데이터도 처리할 수 있도록 호환성 코드를 추가했습니다.

**호환성 처리:**
```typescript
const getImpactValue = (impact: any, index: number): number => {
  if (Array.isArray(impact)) {
    return impact[index] || 0;
  }
  // 기존 단일 값 형태와 호환
  const singleValue = Number(impact) || 0;
  if (index === 0) return singleValue;      // approve
  if (index === 1) return singleValue * 0.5; // warn
  return -Math.abs(singleValue) * 1.5;     // delete
};
```

---

## 🔄 마이그레이션 가이드

### 기존 데이터를 사용 중인 경우

1. **자동 변환 스크립트 실행** (이미 완료됨)
   ```bash
   # Python 스크립트로 posts.json 변환 완료
   ```

2. **수동 변환이 필요한 경우**
   - 각 게시글의 영향값을 배열 형태로 변경
   - 형식: `[통과값, 경고값, 삭제값]`

### 코드 업데이트 필요 사항

1. **프론트엔드**
   - `types/game.ts`의 Post 인터페이스 업데이트
   - AdminPanel 컴포넌트의 입력 필드 수정

2. **백엔드**
   - 액션 처리 로직에서 배열 인덱스 사용
   - API 엔드포인트의 유효성 검사 업데이트

---

## ✨ 개선 효과

### 1. 유연성 향상
- 각 액션에 대한 영향값을 **독립적으로** 설정 가능
- 더 정교한 게임 밸런스 조정 가능

### 2. 명확성 향상
- JSON 파일에서 각 액션의 효과를 **직관적으로** 확인 가능
- 계산식 대신 명시적인 값으로 관리

### 3. 관리 편의성
- 관리자 페이지에서 각 액션별 값을 **개별적으로** 수정 가능
- 게임 디자인 변경이 더 쉬워짐

---

## 📝 참고사항

### 배열 인덱스 규칙
- **인덱스 0**: 통과 (approve) 액션
- **인덱스 1**: 경고 (warn) 액션
- **인덱스 2**: 삭제 (delete) 액션

### 유효성 검사
- 모든 영향값은 **반드시 3개의 요소**를 가진 배열이어야 함
- 각 요소는 **숫자**여야 함
- 배열이 아니거나 길이가 다르면 API 에러 반환

### 백엔드 호환성
- Python 백엔드 (`backend/server.py`)도 동일하게 업데이트됨
- 교육용 백엔드 (`backend2/server.py`)의 TODO 주석도 업데이트됨

---

## 🔗 관련 파일

### 변경된 파일 목록
- `types/game.ts`
- `data/posts.json`
- `backend/data/posts.json`
- `app/api/action/route.ts`
- `app/api/posts/update/route.ts`
- `app/api/posts/create/route.ts`
- `components/AdminPanel.tsx`
- `backend/server.py`
- `backend2/server.py`

---

## 📅 버전 히스토리

- **v2.0.0** (2025): 영향값 배열 구조 변경
- **v1.x**: 단일 숫자 형태의 영향값 사용

---

## ⚠️ 주의사항

1. **기존 게임 진행 중인 경우**
   - 게임 상태는 영향받지 않음
   - 새 게시글부터 배열 형태 사용

2. **API 호출 시**
   - 반드시 배열 형태로 전송해야 함
   - 단일 숫자 형태는 더 이상 지원하지 않음 (호환성 코드는 있으나 권장하지 않음)

3. **데이터 백업**
   - 변경 전 `posts.json` 파일을 백업하는 것을 권장
   - 변환 후 값이 예상과 다를 수 있으므로 확인 필요

---

## 🐛 알려진 이슈

없음

---

## 📚 추가 문서

- API 문서: `backend/API_DEFINITION.md`
- API 요약: `backend/API_SUMMARY.md`
- 교육용 가이드: `backend2/README.md`

