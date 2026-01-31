"use client";

import { useState } from "react";
import styles from "./SearchBar.module.css";

const MENU_ITEMS = ["主线剧情", "世界之外", "逆闻", "约会剧情", "手机剧情"];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);

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
            {MENU_ITEMS.map((item) => (
              <div key={item} className={styles.panelItem} role="listitem">
                <span className={styles.snowflake} aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path d="M12 2v20" />
                    <path d="M4.4 6.2l15.2 11.6" />
                    <path d="M4.4 17.8L19.6 6.2" />
                    <path d="M2 12h20" />
                  </svg>
                </span>
                <span className={styles.label}>{item}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
