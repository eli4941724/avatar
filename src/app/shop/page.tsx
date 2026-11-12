"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getGameData,
  purchaseItem,
} from "@/lib/game-data";
import styles from "./shop.module.css";

type ShopItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  rarity:
    | "רגיל"
    | "נדיר"
    | "אפי"
    | "אגדי";
};

const shopItems: ShopItem[] = [
  {
    id: "purple-hoodie",
    name: "קפוצ׳ון סגול",
    category: "בגדים",
    price: 250,
    emoji: "👕",
    rarity: "רגיל",
  },
  {
    id: "black-jacket",
    name: "מעיל שחור",
    category: "בגדים",
    price: 500,
    emoji: "🧥",
    rarity: "נדיר",
  },
  {
    id: "cool-jeans",
    name: "ג׳ינס מגניב",
    category: "בגדים",
    price: 350,
    emoji: "👖",
    rarity: "רגיל",
  },
  {
    id: "purple-sneakers",
    name: "סניקרס סגולות",
    category: "נעליים",
    price: 300,
    emoji: "👟",
    rarity: "רגיל",
  },
  {
    id: "boots",
    name: "מגפיים מיוחדים",
    category: "נעליים",
    price: 650,
    emoji: "🥾",
    rarity: "נדיר",
  },
  {
    id: "sunglasses",
    name: "משקפי שמש",
    category: "אביזרים",
    price: 220,
    emoji: "🕶️",
    rarity: "רגיל",
  },
  {
    id: "purple-cap",
    name: "כובע Avatar",
    category: "אביזרים",
    price: 280,
    emoji: "🧢",
    rarity: "רגיל",
  },
  {
    id: "crown",
    name: "כתר הזהב",
    category: "אביזרים",
    price: 1800,
    emoji: "👑",
    rarity: "אגדי",
  },
  {
    id: "cool-hair",
    name: "שיער חדש",
    category: "שיער",
    price: 450,
    emoji: "💇",
    rarity: "נדיר",
  },
  {
    id: "pink-hair",
    name: "שיער ורוד",
    category: "שיער",
    price: 700,
    emoji: "🩷",
    rarity: "אפי",
  },
  {
    id: "wings",
    name: "כנפיים קסומות",
    category: "מיוחדים",
    price: 2400,
    emoji: "🪽",
    rarity: "אגדי",
  },
  {
    id: "pet",
    name: "חיית מחמד",
    category: "מיוחדים",
    price: 1500,
    emoji: "🐶",
    rarity: "אפי",
  },
];

const categories = [
  "הכול",
  "בגדים",
  "נעליים",
  "אביזרים",
  "שיער",
  "מיוחדים",
];

export default function ShopPage() {
  const [coins, setCoins] =
    useState(0);

  const [
    ownedItems,
    setOwnedItems,
  ] = useState<string[]>([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("הכול");

  const [message, setMessage] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);

  const [
    purchasingItemId,
    setPurchasingItemId,
  ] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const data =
        await getGameData();

      if (!active) {
        return;
      }

      if (!data) {
        window.location.href =
          "/login";
        return;
      }

      setCoins(data.coins);
      setOwnedItems(
        data.ownedItems
      );
      setLoaded(true);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredItems =
    useMemo(() => {
      if (
        selectedCategory ===
        "הכול"
      ) {
        return shopItems;
      }

      return shopItems.filter(
        (item) =>
          item.category ===
          selectedCategory
      );
    }, [selectedCategory]);

  async function buyItem(
    item: ShopItem
  ) {
    if (
      purchasingItemId !== null
    ) {
      return;
    }

    if (
      ownedItems.includes(item.id)
    ) {
      setMessage(
        "הפריט הזה כבר בבעלותך 😎"
      );
      return;
    }

    if (coins < item.price) {
      setMessage(
        `חסרים לך ${(
          item.price - coins
        ).toLocaleString(
          "he-IL"
        )} מטבעות 🪙`
      );

      return;
    }

    setPurchasingItemId(
      item.id
    );

    const purchase =
      await purchaseItem(
        item.id
      );

    if (!purchase) {
      setMessage(
        "לא הצלחנו להשלים את הקנייה. נסי שוב."
      );

      setPurchasingItemId(
        null
      );

      return;
    }

    setCoins(purchase.coins);

    setOwnedItems(
      purchase.ownedItems
    );

    setMessage(
      `🎉 קנית את "${item.name}"!`
    );

    setPurchasingItemId(null);
  }

  function goHome() {
    window.location.href = "/";
  }

  if (!loaded) {
    return (
      <main
        className={
          styles.loading
        }
        dir="rtl"
      >
        טוענים את החנות...
      </main>
    );
  }

  return (
    <main
      className={
        styles.shopPage
      }
      dir="rtl"
    >
      <header
        className={styles.header}
      >
        <div
          className={
            styles.headerTop
          }
        >
          <button
            className={
              styles.backButton
            }
            onClick={goHome}
          >
            → חזרה לבית
          </button>

          <div
            className={
              styles.balance
            }
          >
            <span>🪙</span>

            <strong>
              {coins.toLocaleString(
                "he-IL"
              )}
            </strong>
          </div>
        </div>

        <div
          className={styles.hero}
        >
          <div>
            <p
              className={
                styles.label
              }
            >
              AVATAR SHOP
            </p>

            <h1>
              החנות שלך 🛍️
            </h1>

            <p>
              סיימת משימות? עכשיו
              מגיע החלק הכיפי.
              השתמשי במטבעות כדי
              לשדרג את הדמות שלך.
            </p>
          </div>

          <div
            className={
              styles.heroDecoration
            }
          >
            <span>👟</span>
            <span>👑</span>
            <span>🕶️</span>
          </div>
        </div>
      </header>

      <section
        className={
          styles.shopContent
        }
      >
        {message && (
          <div
            className={
              styles.message
            }
          >
            <span>
              {message}
            </span>

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        <div
          className={
            styles.categoryBar
          }
        >
          {categories.map(
            (category) => (
              <button
                key={category}
                className={
                  selectedCategory ===
                  category
                    ? styles.activeCategory
                    : styles.categoryButton
                }
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              >
                {category}
              </button>
            )
          )}
        </div>

        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <p>
              {selectedCategory ===
              "הכול"
                ? "כל הפריטים"
                : selectedCategory}
            </p>

            <h2>
              מצאי משהו שאת אוהבת
              ✨
            </h2>
          </div>

          <span>
            {filteredItems.length}{" "}
            פריטים
          </span>
        </div>

        <div
          className={styles.grid}
        >
          {filteredItems.map(
            (item) => {
              const owned =
                ownedItems.includes(
                  item.id
                );

              const canAfford =
                coins >= item.price;

              return (
                <article
                  key={item.id}
                  className={
                    styles.itemCard
                  }
                >
                  <div
                    className={
                      styles.itemPreview
                    }
                  >
                    <span>
                      {item.emoji}
                    </span>

                    <div
                      className={`${
                        styles.rarity
                      } ${
                        styles[
                          `rarity${item.rarity}`
                        ]
                      }`}
                    >
                      {item.rarity}
                    </div>
                  </div>

                  <div
                    className={
                      styles.itemDetails
                    }
                  >
                    <span
                      className={
                        styles.itemCategory
                      }
                    >
                      {item.category}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <div
                      className={
                        styles.itemBottom
                      }
                    >
                      <div
                        className={
                          styles.itemPrice
                        }
                      >
                        <span>
                          🪙
                        </span>

                        <strong>
                          {item.price.toLocaleString(
                            "he-IL"
                          )}
                        </strong>
                      </div>

                      {owned ? (
                        <button
                          className={
                            styles.ownedButton
                          }
                          disabled
                        >
                          ✓ בבעלותך
                        </button>
                      ) : (
                        <button
                          className={
                            canAfford
                              ? styles.buyButton
                              : styles.expensiveButton
                          }
                          onClick={() =>
                            buyItem(
                              item
                            )
                          }
                          disabled={
                            purchasingItemId !==
                            null
                          }
                        >
                          {purchasingItemId ===
                          item.id
                            ? "קונה..."
                            : canAfford
                              ? "לקנות"
                              : "חסרים מטבעות"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>

        <section
          className={
            styles.inventory
          }
        >
          <div>
            <p
              className={
                styles.label
              }
            >
              האוסף שלי
            </p>

            <h2>
              יש לך{" "}
              {ownedItems.length}{" "}
              פריטים
            </h2>

            <p>
              כל הפריטים שקנית
              נשמרים עכשיו בחשבון
              שלך בענן ויופיעו בחדר
              ההלבשה.
            </p>
          </div>

          <div
            className={
              styles.inventoryIcon
            }
          >
            👤
          </div>
        </section>
      </section>
    </main>
  );
}