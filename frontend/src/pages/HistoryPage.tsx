import { useEffect, useState } from "react";

import { getHistory, type NoteResponse, type OutputLanguage } from "../api/client";
import ResultCard from "../components/ResultCard";
import { getText } from "../i18n";
import { toUserErrorMessage } from "../utils/errors";

interface HistoryPageProps {
  language: OutputLanguage;
  token: string;
}

export default function HistoryPage({ language, token }: HistoryPageProps) {
  const PAGE_SIZE = 10;
  const text = getText(language);
  const [items, setItems] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getHistory(PAGE_SIZE, 0, token);
        setItems(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : text.errorGeneric;
        setError(toUserErrorMessage(message, language));
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitial();
  }, [language, token, text.errorGeneric]);

  async function loadMore() {
    setIsLoadingMore(true);
    setError(null);
    try {
      const data = await getHistory(PAGE_SIZE, items.length, token);
      setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : text.errorGeneric;
      setError(toUserErrorMessage(message, language));
    } finally {
      setIsLoadingMore(false);
    }
  }

  const historyHero = (
    <article className="panel history-hero">
      <p className="eyebrow">{text.historyEyebrow}</p>
      <h2>{text.historyTitle}</h2>
      <p className="muted compact">{text.historyAccountHint}</p>
    </article>
  );

  if (isLoading) {
    return (
      <section className="history-page">
        {historyHero}
        <section className="panel"><p>{text.historyLoading}</p></section>
      </section>
    );
  }

  if (error) {
    return (
      <section className="history-page">
        {historyHero}
        <section className="panel"><p className="error-text">{error}</p></section>
      </section>
    );
  }

  return (
    <section className="history-page">
      {historyHero}
      {items.length === 0 ? (
        <section className="panel">
          <p className="muted">{text.historyEmpty}</p>
        </section>
      ) : (
        <>
          <div className="history-list">
            {items.map((item) => <ResultCard key={item.id} result={item} language={language} token={token} />)}
          </div>
          {hasMore && (
            <div className="history-actions">
              <button type="button" className="secondary-btn" disabled={isLoadingMore} onClick={() => void loadMore()}>
                {isLoadingMore ? text.historyLoadingMore : text.historyLoadMore}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
