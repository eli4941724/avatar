"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("צריך לבחור שם.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("הסיסמה צריכה להכיל לפחות 6 תווים.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("הסיסמאות אינן זהות.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      router.push("/profile");
      router.refresh();
      return;
    }

    setSuccessMessage(
      "החשבון נוצר! בדקי את תיבת המייל שלך ואשרי את כתובת המייל."
    );
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
          <span className={styles.brandBadge}>✨ העולם שלך מתחיל כאן</span>

          <h1>
            עושים משימות.
            <br />
            מתקדמים במשחק.
          </h1>

          <p>
            צוברים Coins ו־XP, משדרגים את הדמות ובונים עולם משלך באמצעות
            משימות אמיתיות.
          </p>

          <div className={styles.gamePreview}>
            <div>✅ משימות</div>
            <span>→</span>
            <div>🪙 Coins</div>
            <span>→</span>
            <div>🧍 Avatar</div>
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
            <span className={styles.eyebrow}>ברוכים הבאים</span>
            <h2>יוצרים Avatar חדש</h2>
            <p>כמה פרטים קטנים ואפשר להתחיל לשחק.</p>
          </div>

          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">איך קוראים לך?</label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="השם שלך"
                autoComplete="name"
                required
              />
            </div>

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
                placeholder="לפחות 6 תווים"
                autoComplete="new-password"
                required
                dir="ltr"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password">סיסמה שוב</label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="הקלידו שוב את הסיסמה"
                autoComplete="new-password"
                required
                dir="ltr"
              />
            </div>

            {errorMessage && (
              <div className={styles.errorMessage}>⚠️ {errorMessage}</div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                ✅ {successMessage}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "יוצרים את החשבון..." : "יצירת חשבון"}
            </button>
          </form>

          <div className={styles.bottomText}>
            כבר יש לך חשבון?{" "}
            <Link href="/login">להתחברות</Link>
          </div>
        </div>
      </section>
    </main>
  );
}