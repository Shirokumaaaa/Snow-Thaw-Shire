"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResults from "../../components/SearchResults/SearchResults";
import styles from "./page.module.css";

function SearchClient() {
  const params = useSearchParams();
  const keyword = params.get("q") || "";
  const typesParam = params.get("types") || "";
  const types = typesParam
    ? typesParam.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return <SearchResults initialQuery={keyword} initialTypes={types} />;
}

export default function SearchPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={null}>
        <SearchClient />
      </Suspense>
    </main>
  );
}
