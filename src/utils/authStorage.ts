import type { User } from '../types';

const keys = ['accessToken', 'refreshToken', 'user'] as const;

export const getAuthStorage = (): Storage =>
  localStorage.getItem('accessToken') ? localStorage : sessionStorage;

export const getAccessToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

export const getStoredUser = (): User | null => {
  try {
    const value = getAuthStorage().getItem('user');
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
};

export const saveAuth = (
  auth: { accessToken: string; refreshToken: string; user: User },
  remember: boolean,
) => {
  clearAuth();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('accessToken', auth.accessToken);
  storage.setItem('refreshToken', auth.refreshToken);
  storage.setItem('user', JSON.stringify(auth.user));
};

export const saveUser = (user: User) => {
  getAuthStorage().setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) storage.removeItem(key);
  }
};
