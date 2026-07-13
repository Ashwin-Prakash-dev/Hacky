const KEY_TOKEN = "st_access_token";
const KEY_EXP   = "st_token_expiry";
const KEY_USER  = "st_user";

export function saveAuth({ access_token, expires_in, user }) {
  localStorage.setItem(KEY_TOKEN, access_token);
  localStorage.setItem(KEY_EXP, String(Date.now() + expires_in * 1000));
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_EXP);
  localStorage.removeItem(KEY_USER);
}

export function getToken() {
  const token = localStorage.getItem(KEY_TOKEN);
  const expiry = Number(localStorage.getItem(KEY_EXP) || 0);
  if (!token || Date.now() >= expiry) {
    clearAuth();
    return null;
  }
  return token;
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY_USER));
  } catch {
    return null;
  }
}

export function updateUser(partial) {
  const merged = { ...getUser(), ...partial };
  localStorage.setItem(KEY_USER, JSON.stringify(merged));
  return merged;
}

export const isAuthed = () => getToken() !== null;
