import { useState } from "react";

import { exportNoteMarkdown, type NoteResponse, type OutputLanguage } from "../api/client";
import { getText } from "../i18n";
import { toUserErrorMessage } from "../utils/errors";

interface ResultCardProps {
  result: NoteResponse;
  language: OutputLanguage;
  token: string;
}

export default function ResultCard({ result, language, token }: ResultCardProps) {
  const text = getText(language);
  const locale = language === "ru" ? "ru-RU" : "en-US";
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportMarkdown() {
    setIsExporting(true);
    setExportError(null);
    try {
      const exported = await exportNoteMarkdown(result.id, token);
      const url = window.URL.createObjectURL(exported.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exported.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const detail = error instanceof Error ? error.message : text.errorGeneric;
      setExportError(toUserErrorMessage(detail, language));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <article className="result-card">
      <header className="result-top">
        <div>
          <p className="eyebrow">{text.resultCardEyebrow}</p>
          <h2>{text.summary}</h2>
        </div>
        <button type="button" className="secondary-btn small-btn result-export" onClick={handleExportMarkdown} disabled={isExporting}>
          {isExporting ? text.exporting : text.exportMarkdown}
        </button>
      </header>

      <div className="result-section">
        <p>{result.summary}</p>
      </div>

      <div className="result-section">
        <h3>{text.decisions}</h3>
        {result.decisions.length === 0 ? (
          <p className="muted">{text.noDecisions}</p>
        ) : (
          <ul>
            {result.decisions.map((decision, index) => (
              <li key={`${decision}-${index}`}>{decision}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="result-section">
        <h3>{text.actionItems}</h3>
        {result.action_items.length === 0 ? (
          <p className="muted">{text.noActionItems}</p>
        ) : (
          <ul>
            {result.action_items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="meta-chips">
        <span className="meta-chip">{text.createdAt}: {new Date(result.created_at).toLocaleString(locale)}</span>
        <span className="meta-chip">{text.model}: {result.llm_model}</span>
      </div>
      {exportError && <p className="error-text">{exportError}</p>}
    </article>
  );
}
