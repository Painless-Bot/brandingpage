const API_BASE_URL = 'http://localhost:8080';

/**
 * JWT 토큰을 자동으로 헤더에 추가하는 fetch 래퍼
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 토큰 있으면 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 401 (만료/위조) 시 자동 로그아웃
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  }

  return response;
}

/** 로그아웃 - 토큰 제거 */
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
}

/** 현재 로그인 여부 */
export function isLoggedIn() {
  return !!localStorage.getItem('authToken');
}

/** 현재 로그인한 사용자 정보 */
export function getCurrentUser() {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;
  try {
    return JSON.parse(userInfoStr);
  } catch {
    return null;
  }
}

/** 현재 사용자 이메일 */
export function getCurrentUserEmail() {
  const user = getCurrentUser();
  return user ? user.email : null;
}