
"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  completeTask as completeTaskInCloud,
  createTask as createTaskInCloud,
  defaultEquippedItems,
  getGameData,
} from "@/lib/game-data";
import type { EquippedItems, Task } from "@/lib/game-data";

const categories = [
  { name: "לימודים", icon: "📚" },
  { name: "בית", icon: "🧹" },
  { name: "אישי", icon: "🌟" },
  { name: "ספורט", icon: "🏃" },
  { name: "משפחה", icon: "❤️" },
  { name: "אחר", icon: "✨" },
];

function calculateReward(title: string) {
  const length = title.trim().length;
  if (length > 35) return { coins: 100, xp: 70 };
  if (length > 20) return { coins: 70, xp: 50 };
  return { coins: 40, xp: 30 };
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [name, setName] = useState("שחקן חדש");
  const [equippedItems, setEquippedItems] =
    useState<EquippedItems>({ ...defaultEquippedItems });
  const [creatingTask, setCreatingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completingTaskId, setCompletingTaskId] =
    useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("לימודים");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const data = await getGameData();
        if (!active) return;

        if (!data) {
          window.location.href = "/login";
          return;
        }

        setTasks(data.tasks);
        setCoins(data.coins);
        setXp(data.xp);
        setTotalXp(data.totalXp);
        setCompletedTasks(data.completedTasks);
        setName(data.name);
        setEquippedItems(data.equippedItems);
      } catch (error) {
        console.error("Error loading game data:", error);
        if (active) {
          setErrorMessage("לא הצלחנו לטעון את הנתונים. נסי לרענן.");
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const currentLevel = Math.floor(totalXp / 500) + 1;
  const xpForLevel = 500;
  const displayedXp = xp % xpForLevel;
  const progressPercent = Math.min(
    (displayedXp / xpForLevel) * 100,
    100
  );

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = taskTitle.trim();
    if (!cleanTitle || creatingTask) return;

    setCreatingTask(true);
    setErrorMessage("");

    try {
      const newTask = await createTaskInCloud(
        cleanTitle,
        taskCategory
      );

      if (!newTask) {
        setErrorMessage("לא הצלחנו ליצור את המשימה. נסי שוב.");
        return;
      }

      setTasks((current) => [newTask, ...current]);
      setTaskTitle("");
      setTaskCategory("לימודים");
      setShowTaskModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      setErrorMessage("לא הצלחנו ליצור את המשימה. נסי שוב.");
    } finally {
      setCreatingTask(false);
    }
  }

  async function completeTask(task: Task) {
    if (completingTaskId !== null) return;

    setCompletingTaskId(task.id);
    setErrorMessage("");

    try {
      const progress = await completeTaskInCloud(task.id);

      if (!progress) {
        setErrorMessage("לא הצלחנו להשלים את המשימה. נסי שוב.");
        return;
      }

      setTasks((current) =>
        current.filter((item) => item.id !== task.id)
      );
      setCoins(progress.coins);
      setXp(progress.xp);
      setTotalXp(progress.totalXp);
      setCompletedTasks(progress.completedTasks);
    } catch (error) {
      console.error("Error completing task:", error);
      setErrorMessage("לא הצלחנו להשלים את המשימה. נסי שוב.");
    } finally {
      setCompletingTaskId(null);
    }
  }

  function goToTasks() {
    window.location.href = "/tasks";
  }

  function goToShop() {
    window.location.href = "/shop";
  }

  function goToAvatar() {
    window.location.href = "/avatar";
  }

  function goToProfile() {
    window.location.href = "/profile";
  }

  const clothing = equippedItems.clothing;
  const shoes = equippedItems.shoes;
  const accessory = equippedItems.accessory;
  const hair = equippedItems.hair;
  const special = equippedItems.special;

  return (
    <main className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <span>Avatar</span>
        </div>

        <nav className="nav">
          <button className="nav-item active">
            <span>🏠</span>
            בית
          </button>
          <button className="nav-item" onClick={goToTasks}>
            <span>✅</span>
            משימות
          </button>
          <button className="nav-item" onClick={goToAvatar}>
            <span>👤</span>
            הדמות שלי
          </button>
          <button className="nav-item" onClick={goToShop}>
            <span>🛍️</span>
            חנות
          </button>
          <button className="nav-item" onClick={goToProfile}>
            <span>⚙️</span>
            פרופיל
          </button>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-icon">🔥</div>
          <div>
            <strong>רצף של 7 ימים!</strong>
            <p>ממשיכים ככה.</p>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">היום</p>
            <h1>היי, {name} 👋</h1>
            <p className="subtitle">
              מסיימים משימות, צוברים נקודות ובונים עולם משלך.
            </p>
          </div>

          <div className="top-actions">
            <div className="coin-pill">
              <span>🪙</span>
              <strong>{coins.toLocaleString("he-IL")}</strong>
            </div>
            <button
              className="profile-button"
              aria-label="פרופיל"
              onClick={goToProfile}
            >
              {name.charAt(0)}
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="avatar-card">
            <div className="avatar-card-top">
              <div>
                <p className="eyebrow light">הדמות שלך</p>
                <h2>שלב {currentLevel}</h2>
              </div>
              <button
                className="small-button"
                onClick={goToAvatar}
              >
                עיצוב הדמות
              </button>
            </div>

            <div className="avatar-stage">
              {special === "wings" && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "80px",
                    transform: "translateX(-50%)",
                    fontSize: "150px",
                    opacity: 0.8,
                    zIndex: 1,
                  }}
                >
                  🪽
                </div>
              )}

              <div className="avatar-shadow" />

              <div className="avatar">
                {accessory === "crown" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "52px",
                      zIndex: 20,
                    }}
                  >
                    👑
                  </div>
                )}

                {accessory === "purple-cap" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "55px",
                      zIndex: 20,
                    }}
                  >
                    🧢
                  </div>
                )}

                <div
                  className="avatar-hair"
                  style={{
                    background:
                      hair === "pink-hair"
                        ? "#ec73b4"
                        : hair === "cool-hair"
                          ? "#171724"
                          : "#2d2330",
                  }}
                />

                <div className="avatar-head">
                  <div className="eye left-eye" />
                  <div className="eye right-eye" />
                  <div className="smile" />

                  {accessory === "sunglasses" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "33px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "38px",
                        zIndex: 15,
                      }}
                    >
                      🕶️
                    </div>
                  )}
                </div>

                <div
                  className="avatar-body"
                  style={{
                    background:
                      clothing === "purple-hoodie"
                        ? "#6c4cff"
                        : clothing === "black-jacket"
                          ? "#171724"
                          : clothing === "cool-jeans"
                            ? "#5d7fae"
                            : "white",
                  }}
                >
                  <div
                    className="avatar-shirt"
                    style={{
                      background:
                        clothing === "purple-hoodie"
                          ? "#8067ff"
                          : clothing === "black-jacket"
                            ? "#262633"
                            : clothing === "cool-jeans"
                              ? "#e7e6eb"
                              : "#262633",
                    }}
                  />
                </div>

                <div className="avatar-leg left-leg" />
                <div className="avatar-leg right-leg" />

                {shoes && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        width: "48px",
                        height: shoes === "boots" ? "35px" : "22px",
                        left: "23px",
                        top: shoes === "boots" ? "245px" : "262px",
                        borderRadius: "10px",
                        background:
                          shoes === "boots" ? "#4d3a2c" : "#7656ff",
                        zIndex: 10,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: "48px",
                        height: shoes === "boots" ? "35px" : "22px",
                        right: "23px",
                        top: shoes === "boots" ? "245px" : "262px",
                        borderRadius: "10px",
                        background:
                          shoes === "boots" ? "#4d3a2c" : "#7656ff",
                        zIndex: 10,
                      }}
                    />
                  </>
                )}
              </div>

              {special === "pet" && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    bottom: "20px",
                    fontSize: "52px",
                    zIndex: 10,
                  }}
                >
                  🐶
                </div>
              )}
            </div>

            <div className="level-box">
              <div className="level-row">
                <span>התקדמות לשלב הבא</span>
                <strong>
                  {displayedXp} / {xpForLevel} XP
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p>
                עוד {Math.max(xpForLevel - displayedXp, 0)} XP
                לשלב הבא
              </p>
            </div>
          </section>

          <section className="stats-column">
            <div className="stat-card coins">
              <div className="stat-icon">🪙</div>
              <div>
                <span>מטבעות</span>
                <strong>{coins.toLocaleString("he-IL")}</strong>
                <p>לקניות בחנות</p>
              </div>
            </div>

            <div className="stat-card xp">
              <div className="stat-icon">⚡</div>
              <div>
                <span>סה״כ XP</span>
                <strong>{totalXp.toLocaleString("he-IL")}</strong>
                <p>שלב {currentLevel}</p>
              </div>
            </div>

            <div className="stat-card tasks">
              <div className="stat-icon">✅</div>
              <div>
                <span>הושלמו</span>
                <strong>{completedTasks}</strong>
                <p>משימות</p>
              </div>
            </div>
          </section>
        </div>

        {errorMessage && (
          <p
            role="alert"
            style={{ color: "#b91c1c", margin: "12px 0" }}
          >
            {errorMessage}
          </p>
        )}

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">המשימות להיום</p>
              <h2>המשימות שלך</h2>
            </div>

            <button
              className="add-task-button"
              onClick={() => setShowTaskModal(true)}
            >
              <span>＋</span>
              משימה חדשה
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="task-list">
              {tasks.slice(0, 3).map((task) => (
                <article className="task-card" key={task.id}>
                  <button
                    className="task-check"
                    aria-label={`סיום המשימה ${task.title}`}
                    onClick={() => completeTask(task)}
                    disabled={completingTaskId !== null}
                  >
                    ✓
                  </button>

                  <div className="task-icon">{task.icon}</div>

                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <p>
                      {task.category} · +{task.xp} XP
                    </p>
                  </div>

                  <div className="task-reward">
                    <span>🪙</span>
                    {task.reward}
                  </div>
                </article>
              ))}

              {tasks.length > 3 && (
                <button
                  className="shop-button"
                  onClick={goToTasks}
                  style={{ marginTop: "10px" }}
                >
                  לראות את כל {tasks.length} המשימות
                </button>
              )}
            </div>
          ) : (
            <div className="empty-tasks">
              <div className="empty-icon">🎉</div>
              <h3>סיימת את כל המשימות!</h3>
              <p>
                אפשר להוסיף משימה חדשה או פשוט ליהנות מההישג.
              </p>
              <button
                className="add-task-button"
                onClick={() => setShowTaskModal(true)}
              >
                ＋ משימה חדשה
              </button>
            </div>
          )}
        </section>

        <section className="shop-banner">
          <div>
            <p className="eyebrow light">החנות של Avatar</p>
            <h2>פריטים חדשים הגיעו לחנות ✨</h2>
            <p>
              השתמשי במטבעות שלך כדי לקנות בגדים,
              אביזרים ופריטים מיוחדים.
            </p>
            <button className="shop-button" onClick={goToShop}>
              לכניסה לחנות
            </button>
          </div>

          <div className="shop-items">
            <div className="floating-item item-one">👟</div>
            <div className="floating-item item-two">🕶️</div>
            <div className="floating-item item-three">🧢</div>
          </div>
        </section>
      </section>

      {showTaskModal && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowTaskModal(false)}
        >
          <div
            className="task-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowTaskModal(false)}
              aria-label="סגירת החלון"
            >
              ×
            </button>

            <div className="modal-icon">✨</div>
            <p className="eyebrow">משימה חדשה</p>
            <h2>מה המשימה שלך?</h2>
            <p className="modal-description">
              כתבי מה צריך לעשות. Avatar יקבע כרגע
              תגמול בסיסי לפי גודל המשימה.
            </p>

            <form onSubmit={addTask}>
              <label className="form-label" htmlFor="task-title">
                המשימה
              </label>

              <input
                id="task-title"
                className="task-input"
                type="text"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="לדוגמה: להכין את העבודה במדעים"
                autoFocus
                maxLength={100}
              />

              <label className="form-label" htmlFor="task-category">
                קטגוריה
              </label>

              <select
                id="task-category"
                className="task-input"
                value={taskCategory}
                onChange={(event) => setTaskCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option value={category.name} key={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>

              {taskTitle.trim() && (
                <div className="reward-preview">
                  <span>התגמול המשוער</span>
                  <div>
                    <strong>
                      🪙 {calculateReward(taskTitle).coins}
                    </strong>
                    <strong>
                      ⚡ {calculateReward(taskTitle).xp} XP
                    </strong>
                  </div>
                </div>
              )}

              <button
                className="create-task-button"
                type="submit"
                disabled={!taskTitle.trim() || creatingTask}
              >
                {creatingTask ? "שומרת..." : "ליצור משימה"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
