"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./LandingSearch.module.css";

const MENU_ITEMS = ["主线剧情", "世界之外", "逆闻", "约会剧情", "手机剧情"];

type LandingSearchProps = {
  initialTypes?: string[];
};

export default function LandingSearch({ initialTypes = [] }: LandingSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);

  const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);

  const submit = () => {
    const keyword = query.trim();
    if (!keyword) {
      return;
    }
    const params = new URLSearchParams();
    params.set("q", keyword);
    if (selectedTypes.length) {
      params.set("types", selectedTypes.join(","));
    }
    router.push(`/search?${params.toString()}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      submit();
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

  return (
    <div className={styles.searchWrap}>
      <div className={styles.searchBarWrap}>
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
            onKeyDown={onKeyDown}
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
    </div>
  );
}
