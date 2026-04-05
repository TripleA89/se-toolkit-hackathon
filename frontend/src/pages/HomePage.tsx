import { FormEvent } from "react";

import { type NoteResponse, type OutputLanguage } from "../api/client";
import ResultCard from "../components/ResultCard";
import { getText } from "../i18n";

interface HomePageProps {
  token: string;
  language: OutputLanguage;
  rawText: string;
  onRawTextChange: (value: string) => void;
  onAnalyze: (rawText: string, outputLanguage: OutputLanguage) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  result: NoteResponse | null;
}

export default function HomePage({
  token,
  language,
  rawText,
  onRawTextChange,
  onAnalyze,
  isLoading,
  error,
  result,
}: HomePageProps) {
  const text = getText(language);
  const charactersCount = rawText.length;
  const sampleNotes = language === "ru"
    ? "Обсудили дедлайн релиза. Решили закончить backend к пятнице, frontend к понедельнику. Андрей готовит Docker Compose, Айдана отвечает за тесты API."
    : "Discussed release deadline. Decided to finish backend by Friday and frontend by Monday. Andrew will prepare Docker Compose, Aidan will own API testing.";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAnalyze(rawText, language);
  }

  function handleInsertSample() {
    onRawTextChange(sampleNotes);
  }

  return (
    <section className="page-grid">
      <form className="panel compose-panel" onSubmit={onSubmit}>
        <div className="panel-head">
          <p className="eyebrow">{text.analyzeEyebrow}</p>
          <h2>{text.analyzeTitle}</h2>
          <p className="muted">{text.analyzeSubtitle}</p>
        </div>

        <label htmlFor="raw-notes">{text.rawNotesLabel}</label>
        <textarea
          id="raw-notes"
          value={rawText}
          onChange={(event) => onRawTextChange(event.target.value)}
          placeholder={text.rawNotesPlaceholder}
          rows={14}
        />

        <div className="field-meta">
          <p className="muted compact">{text.charactersCount}: {charactersCount}</p>
          <button type="button" className="secondary-btn small-btn" onClick={handleInsertSample}>
            {text.insertSample}
          </button>
        </div>

        <div className="panel-row">
          <p className="muted compact">{text.outputLanguageLabel}: {language.toUpperCase()}</p>
          <button type="submit" disabled={isLoading}>
            {isLoading ? text.analyzingButton : text.analyzeButton}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>

      <div className="panel result-panel">
        <div className="panel-head">
          <p className="eyebrow">{text.resultEyebrow}</p>
          <h2>{text.resultTitle}</h2>
        </div>
        {result ? (
          <ResultCard result={result} language={language} token={token} />
        ) : (
          <div className="empty-state">
            <p className="empty-title">{text.noResultTitle}</p>
            <p className="muted">{text.noResultHint}</p>
          </div>
        )}
      </div>
    </section>
  );
}
