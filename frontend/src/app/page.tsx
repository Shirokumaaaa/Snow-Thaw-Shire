import SearchBar from "../components/SearchBar/SearchBar";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <SearchBar />
    </main>
  );
}