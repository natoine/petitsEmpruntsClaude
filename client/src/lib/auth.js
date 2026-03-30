import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const SESSION_KEY = 'pea_session';

function loadSession() {
  if (!browser) return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function createAuthStore() {
  const { subscribe, set } = writable(loadSession());

  return {
    subscribe,
    login(token, email) {
      const session = { token, email, username: email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      set(session);
    },
    updateUsername(username) {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!session) return;
      session.username = username;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      set(session);
    },
    logout() {
      localStorage.removeItem(SESSION_KEY);
      set(null);
    },
  };
}

export const auth = createAuthStore();
