// API 설정 파일
// Python 백엔드를 사용할 때는 BASE_URL을 변경하세요

// Next.js 백엔드 사용 시 (기본값)
// export const BASE_URL = '';

// Python 백엔드 사용 시
export const BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  GAME_STATE: `${BASE_URL}/api/game-state`,
  POSTS: `${BASE_URL}/api/posts`,
  UPDATE_POST: `${BASE_URL}/api/posts/update`,
  CREATE_POST: `${BASE_URL}/api/posts/create`,
  DELETE_POST: `${BASE_URL}/api/posts/delete`,
  ACTION: `${BASE_URL}/api/action`,
  RESET: `${BASE_URL}/api/reset`,
  // 인증 API
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  AUTH_CHECK: `${BASE_URL}/api/auth/check`,
  // 리더보드 API
  LEADERBOARD: `${BASE_URL}/api/leaderboard`,
};

