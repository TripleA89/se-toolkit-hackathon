export type OutputLanguage = "ru" | "en";

export interface AnalyzeRequest {
  raw_text: string;
  output_language: OutputLanguage;
}

export interface NoteResponse {
  id: string;
  raw_text: string;
  output_language: OutputLanguage;
  summary: string;
  decisions: string[];
  action_items: string[];
  llm_provider: string;
  llm_model: string;
  prompt_version: string;
  created_at: string;
}

export interface MarkdownExportResult {
  blob: Blob;
  filename: string;
}

export interface UserResponse {
  id: string;
  username: string;
  created_at: string;
}

export interface UserRegisterRequest {
  username: string;
  password: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed (HTTP ${response.status})`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (body.detail) {
        detail = JSON.stringify(body.detail);
      }
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function registerUser(payload: UserRegisterRequest): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<UserResponse>(response);
}

export async function loginUser(payload: UserLoginRequest): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthTokenResponse>(response);
}

export async function getCurrentUser(token: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: buildHeaders(token),
  });
  return handleResponse<UserResponse>(response);
}

export async function analyzeNotes(payload: AnalyzeRequest, token: string): Promise<NoteResponse> {
  const response = await fetch(`${API_BASE_URL}/notes/analyze`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse<NoteResponse>(response);
}

export async function getHistory(limit: number, offset: number, token: string): Promise<NoteResponse[]> {
  const response = await fetch(`${API_BASE_URL}/notes?limit=${limit}&offset=${offset}`, {
    headers: buildHeaders(token),
  });
  return handleResponse<NoteResponse[]>(response);
}

export async function exportNoteMarkdown(noteId: string, token: string): Promise<MarkdownExportResult> {
  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/export/markdown`, {
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    let detail = `Request failed (HTTP ${response.status})`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (body.detail) {
        detail = JSON.stringify(body.detail);
      }
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }

  const contentDisposition = response.headers.get("content-disposition") ?? "";
  const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? `meeting-note-${noteId}.md`;

  return {
    blob: await response.blob(),
    filename,
  };
}
