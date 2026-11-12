"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  defaultEquippedItems,
  EquippedItems,
  getGameData,
  ItemType,
  toggleEquippedItem,
} from "@/lib/game-data";
import styles from "./avatar.module.css";

type AvatarItem = {
  id: string;
  name: string;
  type: ItemType;
  emoji: string;
};

const avatarItems: AvatarItem[] = [
  {
    id: "purple-hoodie",
    name: "קפוצ׳ון סגול",
    type: "clothing",
    emoji: "👕",
  },
  {
    id: "black-jacket",
    name: "מעיל שחור",
    type: "clothing",
    emoji: "🧥",
  },
  {
    id: "cool-jeans",
    name: "ג׳ינס מגניב",
    type: "clothing",
    emoji: "👖",
  },
  {
    id: "purple-sneakers",
    name: "סניקרס סגולות",
    type: "shoes",
    emoji: "👟",
  },
  {
    id: "boots",
    name: "מגפיים מיוחדים",
    type: "shoes",
    emoji: "🥾",
  },
  {
    id: "sunglasses",
    name: "משקפי שמש",
    type: "accessory",
    emoji: "🕶️",
  },
  {
    id: "purple-cap",
    name: "כובע Avatar",
    type: "accessory",
    emoji: "🧢",
  },
  {
    id: "crown",
    name: "כתר הזהב",
    type: "accessory",
    emoji: "👑",
  },
  {
    id: "cool-hair",
    name: "שיער חדש",
    type: "hair",
    emoji: "💇",
  },
  {
    id: "pink-hair",
    name: "שיער ורוד",
    type: "hair",
    emoji: "🩷",
  },
  {
    id: "wings",
    name: "כנפיים קסומות",
    type: "special",
    emoji: "🪽",
  },
  {
    id: "pet",
    name: "חיית מחמד",
    type: "special",
    emoji: "🐶",
  },
];

const categoryNames: Record<
  ItemType,
  string
> = {
  clothing: "בגדים",
  shoes: "נעליים",
  accessory: "אביזרים",
  hair: "שיער",
  special: "מיוחדים",
};

export default function AvatarPage() {
  const [
    ownedItems,
    setOwnedItems,
  ] = useState<string[]>([]);

  const [
    equippedItems,
    setEquippedItems,
  ] = useState<EquippedItems>({
    ...defaultEquippedItems,
  });

  const [loaded, setLoaded] =
    useState(false);

  const [
    equippingItemId,
    setEquippingItemId,
  ] = useState<string | null>(
    null
  );

  const [message, setMessage] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<ItemType>(
      "clothing"
    );

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

      setOwnedItems(
        data.ownedItems
      );

      setEquippedItems(
        data.equippedItems
      );

      setLoaded(true);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  async function equipItem(
    item: AvatarItem
  ) {
    if (
      equippingItemId !== null
    ) {
      return;
    }

    setEquippingItemId(
      item.id
    );

    setMessage("");

    const updatedEquippedItems =
      await toggleEquippedItem(
        item.id,
        item.type
      );

    if (
      !updatedEquippedItems
    ) {
      setMessage(
        "לא הצלחנו לעדכן את הדמות. נסי שוב."
      );

      setEquippingItemId(
        null
      );

      return;
    }

    setEquippedItems(
      updatedEquippedItems
    );

    setEquippingItemId(null);
  }

  function goHome() {
    window.location.href = "/";
  }

  function goShop() {
    window.location.href =
      "/shop";
  }

  const ownedAvatarItems =
    avatarItems.filter((item) =>
      ownedItems.includes(item.id)
    );

  const categoryItems =
    ownedAvatarItems.filter(
      (item) =>
        item.type ===
        selectedCategory
    );

  const clothing =
    equippedItems.clothing;

  const shoes =
    equippedItems.shoes;

  const accessory =
    equippedItems.accessory;

  const hair =
    equippedItems.hair;

  const special =
    equippedItems.special;

  if (!loaded) {
    return (
      <main
        className={styles.loading}
        dir="rtl"
      >
        טוענים את הדמות...
      </main>
    );
  }

  return (
    <main
      className={styles.page}
      dir="rtl"
    >
      <header
        className={styles.topbar}
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
          className={styles.logo}
        >
          <div>A</div>
          Avatar
        </div>

        <button
          className={
            styles.shopButton
          }
          onClick={goShop}
        >
          🛍️ חנות
        </button>
      </header>

      <section
        className={
          styles.content
        }
      >
        {message && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 14px",
              borderRadius:
                "12px",
              background:
                "#fff5f5",
              color: "#a33c3c",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ⚠️ {message}
          </div>
        )}

        <div
          className={
            styles.heading
          }
        >
          <p>הדמות שלי</p>

          <h1>
            זה ה־Avatar שלך ✨
          </h1>

          <span>
            בחרי את הפריטים שקנית
            ועצבי את הדמות בדיוק כמו
            שאת רוצה.
          </span>
        </div>

        <div
          className={
            styles.mainGrid
          }
        >
          <section
            className={
              styles.avatarPanel
            }
          >
            <div
              className={
                styles.avatarBackground
              }
            >
              {special ===
                "wings" && (
                <div
                  className={
                    styles.wings
                  }
                >
                  🪽
                </div>
              )}

              <div
                className={
                  styles.character
                }
              >
                {accessory ===
                  "crown" && (
                  <div
                    className={
                      styles.crown
                    }
                  >
                    👑
                  </div>
                )}

                {accessory ===
                  "purple-cap" && (
                  <div
                    className={
                      styles.cap
                    }
                  >
                    🧢
                  </div>
                )}

                <div
                  className={`${
                    styles.hair
                  } ${
                    hair ===
                    "pink-hair"
                      ? styles.pinkHair
                      : hair ===
                          "cool-hair"
                        ? styles.coolHair
                        : ""
                  }`}
                />

                <div
                  className={
                    styles.head
                  }
                >
                  <div
                    className={
                      styles.eyeLeft
                    }
                  />

                  <div
                    className={
                      styles.eyeRight
                    }
                  />

                  <div
                    className={
                      styles.smile
                    }
                  />

                  {accessory ===
                    "sunglasses" && (
                    <div
                      className={
                        styles.sunglasses
                      }
                    >
                      🕶️
                    </div>
                  )}
                </div>

                <div
                  className={`${
                    styles.body
                  } ${
                    clothing ===
                    "purple-hoodie"
                      ? styles.purpleHoodie
                      : clothing ===
                          "black-jacket"
                        ? styles.blackJacket
                        : clothing ===
                            "cool-jeans"
                          ? styles.coolOutfit
                          : ""
                  }`}
                />

                <div
                  className={`${
                    styles.leg
                  } ${
                    styles.leftLeg
                  }`}
                />

                <div
                  className={`${
                    styles.leg
                  } ${
                    styles.rightLeg
                  }`}
                />

                {shoes && (
                  <>
                    <div
                      className={`${
                        styles.shoe
                      } ${
                        styles.leftShoe
                      } ${
                        shoes ===
                        "boots"
                          ? styles.boot
                          : styles.sneaker
                      }`}
                    />

                    <div
                      className={`${
                        styles.shoe
                      } ${
                        styles.rightShoe
                      } ${
                        shoes ===
                        "boots"
                          ? styles.boot
                          : styles.sneaker
                      }`}
                    />
                  </>
                )}
              </div>

              {special ===
                "pet" && (
                <div
                  className={
                    styles.pet
                  }
                >
                  🐶
                </div>
              )}

              <div
                className={
                  styles.floorShadow
                }
              />
            </div>

            <div
              className={
                styles.avatarInfo
              }
            >
              <div>
                <strong>
                  ה־Avatar שלך
                </strong>

                <p>
                  כל שינוי נשמר
                  אוטומטית בענן.
                </p>
              </div>

              <span>
                {
                  Object.values(
                    equippedItems
                  ).filter(Boolean)
                    .length
                }{" "}
                פריטים בשימוש
              </span>
            </div>
          </section>

          <section
            className={
              styles.wardrobe
            }
          >
            <div
              className={
                styles.wardrobeTitle
              }
            >
              <div>
                <p>
                  חדר ההלבשה
                </p>

                <h2>
                  הפריטים שלי
                </h2>
              </div>

              <span>
                {
                  ownedAvatarItems.length
                }{" "}
                פריטים
              </span>
            </div>

            <div
              className={
                styles.categories
              }
            >
              {(
                Object.keys(
                  categoryNames
                ) as ItemType[]
              ).map(
                (category) => (
                  <button
                    key={
                      category
                    }
                    className={
                      selectedCategory ===
                      category
                        ? styles.activeCategory
                        : styles.category
                    }
                    onClick={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                  >
                    {
                      categoryNames[
                        category
                      ]
                    }
                  </button>
                )
              )}
            </div>

            {categoryItems.length >
            0 ? (
              <div
                className={
                  styles.itemsGrid
                }
              >
                {categoryItems.map(
                  (item) => {
                    const equipped =
                      equippedItems[
                        item.type
                      ] === item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        className={
                          equipped
                            ? styles.equippedItem
                            : styles.item
                        }
                        onClick={() =>
                          equipItem(
                            item
                          )
                        }
                        disabled={
                          equippingItemId !==
                          null
                        }
                      >
                        <div
                          className={
                            styles.itemPreview
                          }
                        >
                          {
                            item.emoji
                          }
                        </div>

                        <div
                          className={
                            styles.itemText
                          }
                        >
                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          <span>
                            {equippingItemId ===
                            item.id
                              ? "שומר..."
                              : equipped
                                ? "✓ בשימוש"
                                : "לחצי כדי ללבוש"}
                          </span>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                className={
                  styles.empty
                }
              >
                <div>🛍️</div>

                <h3>
                  עדיין אין לך
                  פריטים בקטגוריה
                  הזאת
                </h3>

                <p>
                  השלימי משימות,
                  צברי מטבעות וקני
                  פריטים בחנות.
                </p>

                <button
                  onClick={goShop}
                >
                  ללכת לחנות
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}