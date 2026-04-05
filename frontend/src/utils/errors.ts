import type { AppLanguage } from "../i18n";
import { getText } from "../i18n";

export function toUserErrorMessage(detail: string, language: AppLanguage): string {
  const text = getText(language);
  const normalized = detail.toLowerCase();

  if (normalized.includes("429") || normalized.includes("rate-limited")) {
    return text.errorRateLimited;
  }
  if (normalized.includes("llm_api_key")) {
    return text.errorApiKeyMissing;
  }
  if (
    normalized.includes("invalid username or password")
    || normalized.includes("credentials")
  ) {
    return text.errorInvalidCredentials;
  }
  if (normalized.includes("already taken")) {
    return text.errorUsernameTaken;
  }
  if (
    normalized.includes("not authenticated")
    || normalized.includes("invalid or expired token")
    || normalized.includes("http 401")
    || normalized.includes("unauthorized")
    || normalized.includes("user not found")
  ) {
    return text.errorUnauthorized;
  }
  if (normalized.includes("all configured llm models failed")) {
    return text.errorModelsUnavailable;
  }
  if (
    normalized.includes("invalid response")
    || normalized.includes("malformed json")
    || normalized.includes("non-json")
    || normalized.includes("no choices")
  ) {
    return text.errorInvalidModelResponse;
  }
  if (normalized.includes("network") || normalized.includes("connection")) {
    return text.errorNetwork;
  }

  return detail || text.errorGeneric;
}
