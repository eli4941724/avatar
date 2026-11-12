"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("האימייל או הסיסמה אינם נכונים.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link href="/" className={styles.logo}>
          <span>A</span>

          <div>
            <strong>Avatar</strong>
            <small>המשחק של החיים שלך</small>
          </div>
        </Link>

        <div className={styles.brandContent}>
          <span className={styles.brandBadge}>🎮 ממשיכים מאיפה שעצרת</span>

          <h1>
            העולם שלך
            <br />
            מחכה לך.
          </h1>

          <p>
            המשימות, ה־Coins, ה־XP והדמות שלך יהיו מחוברים לחשבון שלך.
          </p>

          <div className={styles.avatarPreview}>
            <span>✨</span>
            <div>🙂</div>
            <span>⭐</span>
          </div>
        </div>

        <div className={styles.decorations}>
          <span>⭐</span>
          <span>🪙</span>
          <span>🚀</span>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeading}>
            <span className={styles.eyebrow}>טוב שחזרת</span>
            <h2>כניסה ל־Avatar</h2>
            <p>התחבר לחשבון שלך והמשך להתקדם.</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">אימייל</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                dir="ltr"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">סיסמה</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="הסיסמה שלך"
                autoComplete="current-password"
                required
                dir="ltr"
              />
            </div>

            {errorMessage && (
              <div className={styles.errorMessage}>⚠️ {errorMessage}</div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "מתחברים..." : "כניסה לחשבון"}
            </button>
          </form>

          <div className={styles.bottomText}>
            עדיין אין לך חשבון?{" "}
            <Link href="/signup">להרשמה</Link>
          </div>
        </div>
      </section>
    </main>
  );
}