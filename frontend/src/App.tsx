import { useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { analyzeNotes, getCurrentUser, type NoteResponse, type OutputLanguage, type UserResponse } from "./api/client";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { getText } from "./i18n";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import { clearStoredAuth, loadStoredAuth, saveStoredAuth } from "./utils/authStorage";
import { toUserErrorMessage } from "./utils/errors";

export default function App() {
  const [language, setLanguage] = useState<OutputLanguage>("ru");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [analysisRawText, setAnalysisRawText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<NoteResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRunRef = useRef(0);
  const text = getText(language);

  useEffect(() => {
    async function restoreAuth() {
      const stored = loadStoredAuth();
      if (!stored) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const me = await getCurrentUser(stored.token);
        setToken(stored.token);
        setUser(me);
      } catch (error) {
        clearStoredAuth();
        const message = error instanceof Error ? error.message : "Request failed";
        setAuthError(toUserErrorMessage(message, language));
      } finally {
        setIsCheckingAuth(false);
      }
    }

    void restoreAuth();
    // Run once on app load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAuthenticated(nextToken: string, nextUser: UserResponse) {
    analysisRunRef.current += 1;
    setToken(nextToken);
    setUser(nextUser);
    setAuthError(null);
    setAnalysisRawText("");
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    saveStoredAuth({ token: nextToken, user: nextUser });
  }

  function handleLogout() {
    analysisRunRef.current += 1;
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setAnalysisRawText("");
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  }

  async function handleAnalyze(rawText: string, outputLanguage: OutputLanguage) {
    if (!token) {
      setAnalysisError(toUserErrorMessage("Unauthorized", outputLanguage));
      return;
    }

    if (!rawText.trim()) {
      setAnalysisError(getText(outputLanguage).errorEmptyNotes);
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);
    const runId = analysisRunRef.current + 1;
    analysisRunRef.current = runId;

    try {
      const data = await analyzeNotes({ raw_text: rawText, output_language: outputLanguage }, token);
      if (runId !== analysisRunRef.current) {
        return;
      }
      setAnalysisResult(data);
    } catch (submitError) {
      if (runId !== analysisRunRef.current) {
        return;
      }
      const message = submitError instanceof Error ? submitError.message : getText(outputLanguage).errorGeneric;
      setAnalysisError(toUserErrorMessage(message, outputLanguage));
    } finally {
      if (runId === analysisRunRef.current) {
        setIsAnalyzing(false);
      }
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="app-shell">
        <section className="panel">
          <p>{text.authCheckingSession}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>{text.appTitle}</h1>
            <p className="muted compact brand-subtitle">{text.appTagline}</p>
          </div>
        </div>
        <div className="topbar-right">
          {token && user ? (
            <>
              <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                  {text.navAnalyze}
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                  {text.navHistory}
                </NavLink>
              </nav>
              {isAnalyzing ? (
                <p className="status-chip">
                  <span className="status-dot" />
                  {text.analyzingButton}
                </p>
              ) : null}
              <p className="muted compact user-chip">{text.authLoggedAs}: <strong>{user.username}</strong></p>
              <button type="button" className="secondary-btn" onClick={handleLogout}>
                {text.authLogout}
              </button>
            </>
          ) : null}
          <LanguageSwitcher value={language} onChange={setLanguage} />
        </div>
      </header>

      <main className="content">
        {token && user ? (
          <Routes>
            <Route
              path="/"
              element={(
                <HomePage
                  token={token}
                  language={language}
                  rawText={analysisRawText}
                  onRawTextChange={(value) => {
                    setAnalysisRawText(value);
                    if (analysisError) {
                      setAnalysisError(null);
                    }
                  }}
                  onAnalyze={handleAnalyze}
                  isLoading={isAnalyzing}
                  error={analysisError}
                  result={analysisResult}
                />
              )}
            />
            <Route path="/history" element={<HistoryPage language={language} token={token} />} />
          </Routes>
        ) : (
          <>
            {authError && <p className="error-text">{authError}</p>}
            <AuthPage language={language} onAuthenticated={handleAuthenticated} />
          </>
        )}
      </main>
    </div>
  );
}
