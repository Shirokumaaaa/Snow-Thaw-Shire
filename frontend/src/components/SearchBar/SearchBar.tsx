"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./SearchBar.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const MENU_ITEMS = ["主线剧情", "世界之外", "逆闻", "约会剧情", "手机剧情"];

type SearchHit = {
  id: string;
  type: string;
  name: string;
  snippet: string;
};

type SearchResponse = {
  query: string;
  total: number;
  results: SearchHit[];
};

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      void runSearch(keyword);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedTypes.join("|")]);

  const runSearch = async (keyword: string) => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("q", keyword);
    if (selectedTypes.length) {
      params.set("types", selectedTypes.join(","));
    }

    try {
      const response = await fetch(`${API_BASE}/articles/search?${params.toString()}`);
      if (!response.ok) {
        setError("搜索失败，请稍后再试。");
        setResults([]);
        return;
      }
      const data = (await response.json()) as SearchResponse;
      setResults(data.results ?? []);
    } catch (err) {
      setError("无法连接后端服务。");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const renderHighlighted = (text: string, keyword: string) => {
    if (!keyword) {
      return text;
    }
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "ig");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <mark key={`${part}-${index}`} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      )
    );
  };

  return (
    <div className={styles.stage}>
      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5l4.5 4.5" />
            </svg>
          </span>

          <input
            className={styles.input}
            placeholder="请输入关键词"
            aria-label="搜索关键词"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            type="button"
            className={styles.moreButton}
            aria-expanded={isOpen}
            aria-label="展开更多"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {isOpen ? (
          <div className={styles.panel} role="list">
            <button
              type="button"
              className={styles.closeButton}
              aria-label="收起分类"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            {MENU_ITEMS.map((item) => {
              const active = selectedSet.has(item);
              return (
                <button
                  type="button"
                  key={item}
                  className={`${styles.panelItem} ${active ? styles.panelItemActive : ""}`}
                  onClick={() => toggleType(item)}
                >
                  <span className={styles.snowflake} aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M12 2v20" />
                      <path d="M4.4 6.2l15.2 11.6" />
                      <path d="M4.4 17.8L19.6 6.2" />
                      <path d="M2 12h20" />
                    </svg>
                  </span>
                  <span className={styles.label}>{item}</span>
                  {active ? <span className={styles.check}>已选</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className={styles.resultHeader}>
        <span className={styles.keywordLabel}>关键词：</span>
        <span className={styles.keywordValue}>{query || "-"}</span>
        {selectedTypes.length ? (
          <span className={styles.typeTags}>
            {selectedTypes.map((type) => (
              <span key={type} className={styles.typeTag}>
                {type}
              </span>
            ))}
          </span>
        ) : (
          <span className={styles.typeHint}>（全局搜索）</span>
        )}
      </div>

      <div className={styles.results}>
        {loading ? <p className={styles.status}>搜索中...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
        {!loading && !error && query && results.length === 0 ? (
          <p className={styles.status}>没有找到匹配的内容。</p>
        ) : null}

        {results.map((item, index) => (
          <article key={`${item.id}-${index}`} className={styles.resultCard}>
            <div className={styles.resultIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M12 2v20" />
                <path d="M4.4 6.2l15.2 11.6" />
                <path d="M4.4 17.8L19.6 6.2" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className={styles.resultBody}>
              <div className={styles.resultTitleRow}>
                <h3 className={styles.resultTitle}>{item.name}</h3>
                {item.type ? <span className={styles.resultType}>{item.type}</span> : null}
              </div>
              <p className={styles.resultSnippet}>{renderHighlighted(item.snippet, query)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
