import LandingSearch from "../components/LandingSearch/LandingSearch";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <LandingSearch />
    </main>
  );
}
