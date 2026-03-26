import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Simple Authentication App</h1>
          <p>Signup, signin, form validation, dashboard and logout.</p>
        </div>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/signup">
            Create Account
          </Link>
          <Link className={styles.secondary} href="/signin">
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
