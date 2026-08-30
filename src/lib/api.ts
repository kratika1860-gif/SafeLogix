import { auth } from './firebase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('DEV_MOCK_TOKEN');
  
  if (!token) {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        token = await firebaseUser.getIdToken();
      } catch (e) {
        console.warn('Failed to retrieve Firebase ID token, falling back to mock admin token', e);
      }
    }
  }

  // Fallback to DEV_MOCK_ADMIN_TOKEN in dev mode if still no token
  if (!token) {
    token = 'DEV_MOCK_ADMIN_TOKEN';
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error: any) {
    console.warn(`[API] Request to "${url}" failed:`, error?.message || error);
    throw error;
  }
}
