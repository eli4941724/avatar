"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  completeTask as completeTaskInCloud,
  createTask as createTaskInCloud,
  getGameData,
  Task,
} from "@/lib/game-data";
import styles from "./tasks.module.css";

const categories = [
  { name: "הכול", icon: "✨" },
  { name: "לימודים", icon: "📚" },
  { name: "בית", icon: "🧹" },
  { name: "אישי", icon: "🌟" },
  { name: "ספורט", icon: "🏃" },
  { name: "משפחה", icon: "❤️" },
  { name: "אחר", icon: "✨" },
];

function calculateReward(title: string) {
  const length = title.trim().length;

  if (length > 35) {
    return { coins: 100, xp: 70 };
  }

  if (length > 20) {
    return { coins: 70, xp: 50 };
  }

  return { coins: 40, xp: 30 };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [loaded, setLoaded] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [completingTaskId, setCompletingTaskId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("הכול");

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] =
    useState("לימודים");

  useEffect(() => {
    let active = true;

    async function loadData() {
      const data = await getGameData();

      if (!active) {
        return;
      }

      if (!data) {
        window.location.href = "/login";
        return;
      }

      setTasks(data.tasks);
      setCoins(data.coins);
      setXp(data.xp);
      setTotalXp(data.totalXp);
      setCompletedTasks(data.completedTasks);
      setLoaded(true);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    if (selectedCategory === "הכול") {
      return tasks;
    }

    return tasks.filter(
      (task) => task.category === selectedCategory
    );
  }, [tasks, selectedCategory]);

  async function addTask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanTitle = taskTitle.trim();

    if (!cleanTitle || creatingTask) {
      return;
    }

    setCreatingTask(true);
    setErrorMessage("");

    const newTask = await createTaskInCloud(
      cleanTitle,
      taskCategory
    );

    if (!newTask) {
      setErrorMessage(
        "לא הצלחנו ליצור את המשימה. נסי שוב."
      );
      setCreatingTask(false);
      return;
    }

    setTasks((currentTasks) => [
      newTask,
      ...currentTasks,
    ]);

    setTaskTitle("");
    setTaskCategory("לימודים");
    setShowTaskModal(false);
    setCreatingTask(false);
  }

  async function completeTask(task: Task) {
    if (completingTaskId !== null) {
      return;
    }

    setCompletingTaskId(task.id);
    setErrorMessage("");

    const updatedProgress =
      await completeTaskInCloud(task.id);

    if (!updatedProgress) {
      setErrorMessage(
        "לא הצלחנו להשלים את המשימה. נסי שוב."
      );
      setCompletingTaskId(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter(
        (currentTask) =>
          currentTask.id !== task.id
      )
    );

    setCoins(updatedProgress.coins);
    setXp(updatedProgress.xp);
    setTotalXp(updatedProgress.totalXp);
    setCompletedTasks(
      updatedProgress.completedTasks
    );

    setCompletingTaskId(null);
  }

  function goHome() {
    window.location.href = "/";
  }

  if (!loaded) {
    return (
      <main
        className={styles.loading}
        dir="rtl"
      >
        טוענים את המשימות...
      </main>
    );
  }

  return (
    <main
      className={styles.page}
      dir="rtl"
    >
      <header className={styles.topbar}>
        <button
          className={styles.backButton}
          onClick={goHome}
        >
          → חזרה לבית
        </button>

        <div className={styles.logo}>
          <div>A</div>
          Avatar
        </div>

        <div className={styles.coinBox}>
          <span>🪙</span>

          <strong>
            {coins.toLocaleString("he-IL")}
          </strong>
        </div>
      </header>

      <section className={styles.content}>
        {errorMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#fff5f5",
              color: "#a33c3c",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <div className={styles.hero}>
          <div>
            <p>המשימות שלי</p>

            <h1>מה עושים היום? ✅</h1>

            <span>
              כל משימה שסיימת מקדמת אותך,
              נותנת XP ומוסיפה מטבעות לחנות.
            </span>
          </div>

          <button
            className={styles.newTaskButton}
            onClick={() =>
              setShowTaskModal(true)
            }
          >
            ＋ משימה חדשה
          </button>
        </div>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <span>📌</span>

            <div>
              <small>משימות פעילות</small>
              <strong>{tasks.length}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <span>✅</span>

            <div>
              <small>הושלמו</small>
              <strong>
                {completedTasks}
              </strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <span>⚡</span>

            <div>
              <small>סה״כ XP</small>

              <strong>
                {totalXp.toLocaleString(
                  "he-IL"
                )}
              </strong>
            </div>
          </div>
        </section>

        <div className={styles.filters}>
          {categories.map((category) => (
            <button
              key={category.name}
              className={
                selectedCategory ===
                category.name
                  ? styles.activeFilter
                  : styles.filterButton
              }
              onClick={() =>
                setSelectedCategory(
                  category.name
                )
              }
            >
              {category.icon}{" "}
              {category.name}
            </button>
          ))}
        </div>

        <section
          className={styles.tasksSection}
        >
          <div
            className={styles.sectionHeading}
          >
            <div>
              <p>
                {selectedCategory === "הכול"
                  ? "כל המשימות"
                  : selectedCategory}
              </p>

              <h2>
                {filteredTasks.length > 0
                  ? "קדימה, מתחילים"
                  : "אין כאן משימות כרגע"}
              </h2>
            </div>

            <span>
              {filteredTasks.length} משימות
            </span>
          </div>

          {filteredTasks.length > 0 ? (
            <div className={styles.taskList}>
              {filteredTasks.map((task) => (
                <article
                  key={task.id}
                  className={styles.taskCard}
                >
                  <button
                    className={
                      styles.checkButton
                    }
                    onClick={() =>
                      completeTask(task)
                    }
                    aria-label={`סיום המשימה ${task.title}`}
                    disabled={
                      completingTaskId !== null
                    }
                  >
                    ✓
                  </button>

                  <div
                    className={styles.taskIcon}
                  >
                    {task.icon}
                  </div>

                  <div
                    className={styles.taskInfo}
                  >
                    <h3>{task.title}</h3>

                    <p>
                      {task.category} · +
                      {task.xp} XP
                    </p>
                  </div>

                  <div
                    className={styles.reward}
                  >
                    <span>🪙</span>
                    <strong>
                      {task.reward}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div>🎉</div>

              <h3>
                אין משימות בקטגוריה
                הזאת
              </h3>

              <p>
                אפשר לבחור קטגוריה אחרת
                או ליצור משימה חדשה.
              </p>

              <button
                onClick={() =>
                  setShowTaskModal(true)
                }
              >
                ＋ משימה חדשה
              </button>
            </div>
          )}
        </section>
      </section>

      {showTaskModal && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={() =>
            setShowTaskModal(false)
          }
        >
          <div
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className={
                styles.closeButton
              }
              onClick={() =>
                setShowTaskModal(false)
              }
            >
              ×
            </button>

            <div
              className={styles.modalIcon}
            >
              ✨
            </div>

            <p
              className={styles.modalLabel}
            >
              משימה חדשה
            </p>

            <h2>מה צריך לעשות?</h2>

            <form onSubmit={addTask}>
              <label>המשימה</label>

              <input
                type="text"
                value={taskTitle}
                onChange={(event) =>
                  setTaskTitle(
                    event.target.value
                  )
                }
                placeholder="לדוגמה: לסיים את העבודה במדעים"
                autoFocus
                maxLength={100}
              />

              <label>קטגוריה</label>

              <select
                value={taskCategory}
                onChange={(event) =>
                  setTaskCategory(
                    event.target.value
                  )
                }
              >
                {categories
                  .filter(
                    (category) =>
                      category.name !==
                      "הכול"
                  )
                  .map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.icon}{" "}
                      {category.name}
                    </option>
                  ))}
              </select>

              {taskTitle.trim() && (
                <div
                  className={
                    styles.rewardPreview
                  }
                >
                  <span>
                    התגמול המשוער
                  </span>

                  <div>
                    <strong>
                      🪙{" "}
                      {
                        calculateReward(
                          taskTitle
                        ).coins
                      }
                    </strong>

                    <strong>
                      ⚡{" "}
                      {
                        calculateReward(
                          taskTitle
                        ).xp
                      }{" "}
                      XP
                    </strong>
                  </div>
                </div>
              )}

              <button
                className={
                  styles.createButton
                }
                type="submit"
                disabled={
                  !taskTitle.trim() ||
                  creatingTask
                }
              >
                {creatingTask
                  ? "יוצרים..."
                  : "ליצור משימה"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}