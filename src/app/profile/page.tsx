"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./profile.module.css";
import { getGameProgress } from "@/lib/game-progress";

type Task = {
  id?: string | number;
  title?: string;
  text?: string;
  category?: string;
  completed?: boolean;
  isCompleted?: boolean;
};

type EquippedItems = {
  clothing?: string | null;
  shoes?: string | null;
  accessory?: string | null;
  hair?: string | null;
  special?: string | null;
};

type Profile = {
  id: string;
  name: string | null;
  nickname: string | null;
};

const STORAGE_KEYS = {
  tasks: "tasks",
  coins: "coins",
  xp: "xp",
  totalXp: "totalXp",
  completedTasks: "completedTasks",
  ownedItems: "ownedItems",
  equippedItems: "equippedItems",
  profile: "avatarProfile",
};

function readNumber(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "number") {
      return parsed;
    }
  } catch {
    // הערך אולי נשמר כמחרוזת רגילה
  }

  const number = Number(raw);

  return Number.isFinite(number) ? number : fallback;
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(key);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object") {
      return parsed as T;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export default function ProfilePage() {
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const [loaded, setLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [name, setName] = useState("האווטאר שלי");
  const [nickname, setNickname] = useState("שחקן מתחיל");

  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [ownedItems, setOwnedItems] = useState<unknown[]>([]);

  const [equippedItems, setEquippedItems] = useState<EquippedItems>({
    clothing: null,
    shoes: null,
    accessory: null,
    hair: null,
    special: null,
  });

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftNickname, setDraftNickname] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const savedTasks = readArray<Task>(STORAGE_KEYS.tasks);
      const savedOwnedItems = readArray<unknown>(STORAGE_KEYS.ownedItems);

      const savedEquippedItems = readObject<EquippedItems>(
        STORAGE_KEYS.equippedItems,
        {
          clothing: null,
          shoes: null,
          accessory: null,
          hair: null,
          special: null,
        }
      );

      const progress = await getGameProgress();

      setCoins(progress.coins);
      setXp(progress.xp);
      setTotalXp(progress.totalXp);
      setCompletedTasks(progress.completedTasks);

      setTasks(savedTasks);
      setOwnedItems(savedOwnedItems);
      setEquippedItems(savedEquippedItems);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoaded(true);
        setProfileLoading(false);
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, nickname")
        .eq("id", user.id)
        .single<Profile>();

      if (error) {
        console.error("Error loading profile:", error);

        const fallbackName =
          typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : "האווטאר שלי";

        setName(fallbackName);
        setNickname("שחקן מתחיל");
      } else if (data) {
        setName(data.name || "האווטאר שלי");
        setNickname(data.nickname || "שחקן מתחיל");
      }

      setProfileLoading(false);
      setLoaded(true);
    }

    void loadProfile();
  }, [router, supabase]);

  const completedFromTasks = useMemo(() => {
    return tasks.filter((task) => task.completed || task.isCompleted).length;
  }, [tasks]);

  const actualCompletedTasks = Math.max(
    completedTasks,
    completedFromTasks
  );

  const level = Math.max(1, Math.floor(totalXp / 250) + 1);

  const xpInsideLevel = totalXp % 250;
  const xpNeededForLevel = 250;

  const progressPercentage = Math.min(
    100,
    Math.round((xpInsideLevel / xpNeededForLevel) * 100)
  );

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};

    tasks.forEach((task) => {
      if (!task.completed && !task.isCompleted) return;

      const category = task.category || "אחר";

      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [tasks]);

  const equippedCount = Object.values(equippedItems).filter(Boolean).length;

  const achievements = useMemo(() => {
    return [
      {
        icon: "🌟",
        title: "התחלה מצוינת",
        description: "השלמת משימה ראשונה",
        unlocked: actualCompletedTasks >= 1,
      },
      {
        icon: "🔥",
        title: "בדרך למעלה",
        description: "השלמת 5 משימות",
        unlocked: actualCompletedTasks >= 5,
      },
      {
        icon: "🏆",
        title: "אלוף המשימות",
        description: "השלמת 20 משימות",
        unlocked: actualCompletedTasks >= 20,
      },
      {
        icon: "🛍️",
        title: "שופינג ראשון",
        description: "קנית פריט ראשון בחנות",
        unlocked: ownedItems.length >= 1,
      },
      {
        icon: "👑",
        title: "אספן",
        description: "בבעלותך לפחות 5 פריטים",
        unlocked: ownedItems.length >= 5,
      },
      {
        icon: "⚡",
        title: "עולים שלב",
        description: "הגעת לרמה 2",
        unlocked: level >= 2,
      },
    ];
  }, [actualCompletedTasks, ownedItems.length, level]);

  function startEditing() {
    setDraftName(name);
    setDraftNickname(
      nickname === "שחקן מתחיל" ? "" : nickname
    );
    setSaveError("");
    setEditing(true);
  }

  function cancelEditing() {
    setSaveError("");
    setEditing(false);
  }

  async function saveProfile() {
    if (!userId) return;

    const cleanName = draftName.trim() || "האווטאר שלי";
    const cleanNickname =
      draftNickname.trim() || "שחקן מתחיל";

    setSaving(true);
    setSaveError("");

    const { error } = await supabase
      .from("profiles")
      .update({
        name: cleanName,
        nickname: cleanNickname,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error saving profile:", error);
      setSaveError("לא הצלחנו לשמור את הפרופיל. נסי שוב.");
      setSaving(false);
      return;
    }

    setName(cleanName);
    setNickname(cleanNickname);

    localStorage.setItem(
      STORAGE_KEYS.profile,
      JSON.stringify({
        name: cleanName,
        nickname: cleanNickname,
      })
    );

    setSaving(false);
    setEditing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (!loaded || profileLoading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingAvatar}>🙂</div>
          <p>טוען את הפרופיל...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>A</span>

            <div>
              <strong>Avatar</strong>
              <small>המשחק של החיים שלך</small>
            </div>
          </Link>

          <nav className={styles.navigation}>
            <Link href="/" className={styles.navItem}>
              <span>🏠</span>
              בית
            </Link>

            <Link href="/tasks" className={styles.navItem}>
              <span>✅</span>
              משימות
            </Link>

            <Link href="/avatar" className={styles.navItem}>
              <span>🧍</span>
              הדמות שלי
            </Link>

            <Link href="/shop" className={styles.navItem}>
              <span>🛍️</span>
              חנות
            </Link>

            <Link
              href="/profile"
              className={`${styles.navItem} ${styles.activeNavItem}`}
            >
              <span>👤</span>
              פרופיל
            </Link>
          </nav>
        </div>

        <div className={styles.sidebarWallet}>
          <span className={styles.walletLabel}>הארנק שלי</span>

          <div className={styles.walletAmount}>
            <span>🪙</span>
            <strong>{coins.toLocaleString("he-IL")}</strong>
          </div>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topBar}>
          <div>
            <span className={styles.eyebrow}>הפרופיל שלי</span>
            <h1>היי, {name} 👋</h1>
            <p>
              כאן אפשר לראות כמה התקדמת במשימות, במשחק ובבניית הדמות שלך.
            </p>
          </div>

          <Link href="/tasks" className={styles.primaryButton}>
            + משימה חדשה
          </Link>
        </header>

        <section className={styles.profileHero}>
          <div className={styles.avatarArea}>
            <div className={styles.avatarGlow} />

            <div className={styles.avatar}>
              <div className={styles.avatarHair}>
                {equippedItems.hair ? "💇" : "〰️"}
              </div>

              <div className={styles.avatarFace}>
                <span className={styles.avatarEyes}>•‿•</span>
              </div>

              <div className={styles.avatarBody}>
                {equippedItems.clothing ? "👕" : "🟣"}
              </div>

              <div className={styles.avatarShoes}>
                {equippedItems.shoes ? "👟 👟" : "● ●"}
              </div>

              {equippedItems.accessory && (
                <div className={styles.avatarAccessory}>✨</div>
              )}

              {equippedItems.special && (
                <div className={styles.avatarSpecial}>⭐</div>
              )}
            </div>

            <Link href="/avatar" className={styles.secondaryButton}>
              לחדר ההלבשה
            </Link>
          </div>

          <div className={styles.profileInfo}>
            {!editing ? (
              <div className={styles.profileTitleRow}>
                <div>
                  <span className={styles.profileLabel}>
                    הדמות שלי
                  </span>

                  <h2>{name}</h2>

                  <p className={styles.nickname}>
                    @{nickname}
                  </p>

                  {email && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#9997a8",
                        fontSize: "12px",
                        direction: "ltr",
                        textAlign: "right",
                      }}
                    >
                      {email}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={startEditing}
                  >
                    ✏️ עריכת פרופיל
                  </button>

                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={handleLogout}
                  >
                    יציאה
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.editCard}>
                <div className={styles.field}>
                  <label htmlFor="profile-name">שם</label>

                  <input
                    id="profile-name"
                    value={draftName}
                    onChange={(event) =>
                      setDraftName(event.target.value)
                    }
                    placeholder="איך קוראים לך?"
                    maxLength={30}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="profile-nickname">
                    כינוי במשחק
                  </label>

                  <input
                    id="profile-nickname"
                    value={draftNickname}
                    onChange={(event) =>
                      setDraftNickname(event.target.value)
                    }
                    placeholder="בחר כינוי"
                    maxLength={24}
                  />
                </div>

                {saveError && (
                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "#b42318",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ {saveError}
                  </p>
                )}

                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? "שומר..." : "שמירה"}
                  </button>

                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}

            <div className={styles.levelCard}>
              <div className={styles.levelHeader}>
                <div>
                  <span>Level</span>
                  <strong>{level}</strong>
                </div>

                <span>
                  {xpInsideLevel} / {xpNeededForLevel} XP
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p>
                עוד {xpNeededForLevel - xpInsideLevel} XP עד לרמה הבאה
              </p>
            </div>

            <div className={styles.quickLinks}>
              <Link href="/tasks">
                <span>✅</span>

                <div>
                  <strong>המשימות שלי</strong>
                  <small>להמשיך לצבור XP</small>
                </div>
              </Link>

              <Link href="/shop">
                <span>🛍️</span>

                <div>
                  <strong>לחנות</strong>
                  <small>לקנות דברים חדשים</small>
                </div>
              </Link>

              <Link href="/avatar">
                <span>✨</span>

                <div>
                  <strong>לעצב את הדמות</strong>
                  <small>
                    {equippedCount} פריטים כרגע על הדמות
                  </small>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span className={styles.statIcon}>🪙</span>

            <div>
              <span>Coins</span>
              <strong>{coins.toLocaleString("he-IL")}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>

            <div>
              <span>XP נוכחי</span>
              <strong>{xp.toLocaleString("he-IL")}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statIcon}>🚀</span>

            <div>
              <span>סה״כ XP</span>
              <strong>{totalXp.toLocaleString("he-IL")}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statIcon}>✅</span>

            <div>
              <span>משימות שהושלמו</span>
              <strong>{actualCompletedTasks}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statIcon}>🎒</span>

            <div>
              <span>פריטים בבעלותך</span>
              <strong>{ownedItems.length}</strong>
            </div>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statIcon}>🏅</span>

            <div>
              <span>הישגים שנפתחו</span>
              <strong>
                {
                  achievements.filter(
                    (achievement) => achievement.unlocked
                  ).length
                }
              </strong>
            </div>
          </article>
        </section>

        <section className={styles.lowerGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>
                  התקדמות
                </span>
                <h3>המשימות שלי</h3>
              </div>

              <Link href="/tasks">לכל המשימות ←</Link>
            </div>

            {categoryStats.length > 0 ? (
              <div className={styles.categoryList}>
                {categoryStats.map(([category, count]) => {
                  const maxCount = Math.max(
                    ...categoryStats.map(
                      ([, currentCount]) => currentCount
                    )
                  );

                  const width =
                    maxCount > 0
                      ? Math.round((count / maxCount) * 100)
                      : 0;

                  return (
                    <div
                      className={styles.categoryRow}
                      key={category}
                    >
                      <div className={styles.categoryTitle}>
                        <span>{category}</span>
                        <strong>{count}</strong>
                      </div>

                      <div className={styles.categoryTrack}>
                        <div
                          className={styles.categoryFill}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span>🎯</span>
                <h4>המסע שלך רק מתחיל</h4>

                <p>
                  אחרי שתשלים משימות, כאן תראה באילו תחומים אתה
                  הכי פעיל.
                </p>

                <Link href="/tasks">
                  קדימה למשימה הראשונה
                </Link>
              </div>
            )}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelEyebrow}>אוסף</span>
                <h3>הישגים</h3>
              </div>

              <span className={styles.achievementCounter}>
                {
                  achievements.filter(
                    (achievement) => achievement.unlocked
                  ).length
                }
                /{achievements.length}
              </span>
            </div>

            <div className={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className={`${styles.achievement} ${
                    achievement.unlocked
                      ? styles.achievementUnlocked
                      : styles.achievementLocked
                  }`}
                >
                  <span className={styles.achievementIcon}>
                    {achievement.icon}
                  </span>

                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.description}</p>
                  </div>

                  <span className={styles.achievementStatus}>
                    {achievement.unlocked ? "✓" : "🔒"}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.comingSoon}>
          <div>
            <span className={styles.comingSoonBadge}>
              בקרוב
            </span>

            <h3>🏡 הבית שלך בעולם של Avatar</h3>

            <p>
              ככל שתתקדם במשחק, תוכל לקנות בית, לפתוח חדרים,
              לרכוש רהיטים ולעצב עולם משלך.
            </p>
          </div>

          <div className={styles.housePreview}>
            <span>☁️</span>
            <span className={styles.house}>🏡</span>
            <span>🌳</span>
          </div>
        </section>
      </section>
    </main>
  );
}