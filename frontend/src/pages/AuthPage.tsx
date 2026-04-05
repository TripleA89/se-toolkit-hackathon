import { FormEvent, useState } from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  type OutputLanguage,
  type UserResponse,
} from "../api/client";
import { getText } from "../i18n";
import { toUserErrorMessage } from "../utils/errors";

interface AuthPageProps {
  language: OutputLanguage;
  onAuthenticated: (token: string, user: UserResponse) => void;
}

export default function AuthPage({ language, onAuthenticated }: AuthPageProps) {
  const text = getText(language);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError(text.errorEmptyCredentials);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        await registerUser({ username: username.trim(), password });
      }

      const tokenResponse = await loginUser({ username: username.trim(), password });
      const user = await getCurrentUser(tokenResponse.access_token);
      onAuthenticated(tokenResponse.access_token, user);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : text.errorGeneric;
      setError(toUserErrorMessage(message, language));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <article className="panel auth-intro">
        <p className="eyebrow">{text.authEyebrow}</p>
        <h2>{text.authPromoTitle}</h2>
        <p className="muted">{text.authSubtitle}</p>
        <ul className="feature-list">
          <li>{text.authFeatureHistory}</li>
          <li>{text.authFeatureExport}</li>
          <li>{text.authFeatureLanguage}</li>
        </ul>
      </article>

      <section className="auth-panel panel">
        <h2>{mode === "login" ? text.authLoginTitle : text.authRegisterTitle}</h2>
        <p className="muted">{text.authHint}</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "secondary-btn active-tab" : "secondary-btn"}
            onClick={() => setMode("login")}
          >
            {text.authLoginTab}
          </button>
          <button
            type="button"
            className={mode === "register" ? "secondary-btn active-tab" : "secondary-btn"}
            onClick={() => setMode("register")}
          >
            {text.authRegisterTab}
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label htmlFor="auth-username">{text.authUsernameLabel}</label>
          <input
            id="auth-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={text.authUsernamePlaceholder}
            autoComplete="username"
          />

          <label htmlFor="auth-password">{text.authPasswordLabel}</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={text.authPasswordPlaceholder}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <div className="panel-row">
            <span className="muted compact">{text.authHint}</span>
            <button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "login"
                  ? text.authLoggingIn
                  : text.authRegistering
                : mode === "login"
                  ? text.authLoginButton
                  : text.authRegisterButton}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </form>
      </section>
    </section>
  );
}
