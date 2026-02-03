"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type StoryData = {
  id: string;
  type: string;
  name: string;
  story: string;
};

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storyId = params.id;

  const [query, setQuery] = useState("");
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`${API_BASE}/articles/${storyId}`);
        if (!response.ok) {
          setError("内容不存在或已删除。");
          setStory(null);
          return;
        }
        const data = (await response.json()) as StoryData;
        setStory(data);
      } catch (err) {
        setError("无法连接后端服务。");
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchStory();
  }, [storyId]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const keyword = query.trim();
      if (!keyword) {
        return;
      }
      router.push(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topPanel}>
        <h1 className={styles.brand}>雪绒镇</h1>
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
        </div>
      </header>

      <div className={styles.contentWrap}>
        <Link className={styles.back} href="/search">
          ← 返回
        </Link>

        {loading ? <p className={styles.status}>加载中...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {story ? (
          <article className={styles.storyCard}>
            <h2 className={styles.storyTitle}>{story.name}</h2>
            <div className={styles.storyText}>
              {story.story.split("\n").map((line, index) => (
                <p key={`${story.id}-${index}`}>{line}</p>
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}
