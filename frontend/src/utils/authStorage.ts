import type { UserResponse } from "../api/client";

const STORAGE_KEY = "meeting_notes_auth_v1";

interface StoredAuth {
  token: string;
  user: UserResponse;
}

export function loadStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
