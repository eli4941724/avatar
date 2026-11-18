"use client";

import {
  CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AvatarAppearance,
  AvatarEyeColor,
  AvatarEyeShape,
  AvatarEyebrowStyle,
  AvatarFaceShape,
  AvatarGender,
  AvatarHairColor,
  AvatarHairStyle,
  AvatarLipStyle,
  AvatarSkinTone,
  defaultAvatarAppearance,
  defaultEquippedItems,
  EquippedItems,
  getGameData,
  ItemType,
  toggleEquippedItem,
  updateAvatarAppearance,
} from "@/lib/game-data";
import styles from "./avatar.module.css";

type AvatarItem = {
  id: string;
  name: string;
  type: ItemType;
  emoji: string;
};

type Option<T extends string> = {
  value: T;
  label: string;
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
    name: "לוק ג׳ינס",
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
    name: "מגפיים",
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
    name: "כתר",
    type: "accessory",
    emoji: "👑",
  },
  {
    id: "cool-hair",
    name: "שיער קצר מיוחד",
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
    name: "כנפיים",
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
  hair: "שיער מיוחד",
  special: "מיוחדים",
};

const genderOptions: Option<AvatarGender>[] = [
  { value: "girl", label: "בת" },
  { value: "boy", label: "בן" },
];

const faceShapeOptions: Option<AvatarFaceShape>[] = [
  { value: "soft", label: "רכה" },
  { value: "round", label: "עגולה" },
  { value: "heart", label: "לב" },
];

const skinToneOptions: Option<AvatarSkinTone>[] = [
  { value: "fair", label: "בהיר מאוד" },
  { value: "light", label: "בהיר" },
  { value: "medium", label: "בינוני" },
  { value: "tan", label: "שזוף" },
  { value: "deep", label: "כהה" },
];

const eyeShapeOptions: Option<AvatarEyeShape>[] = [
  { value: "round", label: "עגולות" },
  { value: "almond", label: "שקד" },
  { value: "smile", label: "מחייכות" },
];

const eyeColorOptions: Option<AvatarEyeColor>[] = [
  { value: "brown", label: "חום" },
  { value: "hazel", label: "דבש" },
  { value: "green", label: "ירוק" },
  { value: "blue", label: "כחול" },
  { value: "gray", label: "אפור" },
];

const eyebrowOptions: Option<AvatarEyebrowStyle>[] = [
  { value: "soft", label: "רכות" },
  { value: "arched", label: "קשת" },
  { value: "straight", label: "ישרות" },
];

const lipStyleOptions: Option<AvatarLipStyle>[] = [
  { value: "soft", label: "עדינות" },
  { value: "full", label: "מלאות" },
  { value: "smile", label: "מחייכות" },
];

const hairStyleOptions: Option<AvatarHairStyle>[] = [
  { value: "short", label: "קצר" },
  { value: "bob", label: "קארה" },
  { value: "long", label: "ארוך" },
  { value: "ponytail", label: "קוקו" },
];

const hairColorOptions: Option<AvatarHairColor>[] = [
  { value: "black", label: "שחור" },
  { value: "dark-brown", label: "חום כהה" },
  { value: "brown", label: "חום" },
  { value: "blonde", label: "בלונד" },
  { value: "ginger", label: "ג׳ינג׳י" },
];

const skinToneColors: Record<
  AvatarSkinTone,
  string
> = {
  fair: "#f7dccf",
  light: "#efc3a7",
  medium: "#d79a73",
  tan: "#b87449",
  deep: "#7d4a30",
};

const eyeColors: Record<
  AvatarEyeColor,
  string
> = {
  brown: "#5a3727",
  hazel: "#7b6830",
  green: "#447348",
  blue: "#5380b7",
  gray: "#66707e",
};

const hairColors: Record<
  AvatarHairColor,
  string
> = {
  black: "#1e1d24",
  "dark-brown": "#3b2a24",
  brown: "#65432f",
  blonde: "#d0ad5d",
  ginger: "#b76233",
};

const lipColors: Record<
  AvatarLipStyle,
  string
> = {
  soft: "#d48b8d",
  full: "#cb6d78",
  smile: "#c56d6b",
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

  const [
    appearance,
    setAppearance,
  ] = useState<AvatarAppearance>({
    ...defaultAvatarAppearance,
  });

  const [
    draftAppearance,
    setDraftAppearance,
  ] = useState<AvatarAppearance>({
    ...defaultAvatarAppearance,
  });

  const [loaded, setLoaded] =
    useState(false);

  const [
    savingAppearance,
    setSavingAppearance,
  ] = useState(false);

  const [
    equippingItemId,
    setEquippingItemId,
  ] = useState<string | null>(
    null
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState<"success" | "error">(
    "success"
  );

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
      setAppearance(
        data.avatarAppearance
      );
      setDraftAppearance(
        data.avatarAppearance
      );
      setLoaded(true);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  function updateDraft<
    K extends keyof AvatarAppearance
  >(
    key: K,
    value: AvatarAppearance[K]
  ) {
    setDraftAppearance((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveAppearance() {
    setSavingAppearance(true);
    setMessage("");

    const updated =
      await updateAvatarAppearance(
        draftAppearance
      );

    if (!updated) {
      setMessageType("error");
      setMessage(
        "לא הצלחנו לשמור את עיצוב הדמות. נסי שוב."
      );
      setSavingAppearance(false);
      return;
    }

    setAppearance(updated);
    setDraftAppearance(updated);
    setMessageType("success");
    setMessage(
      "העיצוב נשמר בהצלחה ✨"
    );
    setSavingAppearance(false);
  }

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
      setMessageType("error");
      setMessage(
        "לא הצלחנו לעדכן את הפריט על הדמות."
      );
      setEquippingItemId(
        null
      );
      return;
    }

    setEquippedItems(
      updatedEquippedItems
    );
    setMessageType("success");
    setMessage(
      "הפריט עודכן על הדמות."
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

  const hasChanges =
    JSON.stringify(
      appearance
    ) !==
    JSON.stringify(
      draftAppearance
    );

  const clothing =
    equippedItems.clothing;
  const shoes =
    equippedItems.shoes;
  const accessory =
    equippedItems.accessory;
  const hairItem =
    equippedItems.hair;
  const special =
    equippedItems.special;

  const effectiveHairColor =
    hairItem === "pink-hair"
      ? "#ec73b4"
      : hairItem === "cool-hair"
        ? "#171724"
        : hairColors[
            draftAppearance.hairColor
          ];

  const effectiveHairStyle =
    hairItem === "cool-hair"
      ? "short"
      : draftAppearance.hairStyle;

  const avatarStyle =
    useMemo(() => {
      return {
        ["--avatar-skin" as string]:
          skinToneColors[
            draftAppearance.skinTone
          ],
        ["--avatar-eye" as string]:
          eyeColors[
            draftAppearance.eyeColor
          ],
        ["--avatar-hair" as string]:
          effectiveHairColor,
        ["--avatar-lip" as string]:
          lipColors[
            draftAppearance.lipStyle
          ],
      } as CSSProperties;
    }, [
      draftAppearance.eyeColor,
      draftAppearance.lipStyle,
      draftAppearance.skinTone,
      effectiveHairColor,
    ]);

  const faceShapeClass =
    draftAppearance.faceShape ===
    "round"
      ? styles.faceRound
      : draftAppearance.faceShape ===
          "heart"
        ? styles.faceHeart
        : styles.faceSoft;

  const eyeShapeClass =
    draftAppearance.eyeShape ===
    "almond"
      ? styles.eyeAlmond
      : draftAppearance.eyeShape ===
          "smile"
        ? styles.eyeSmile
        : styles.eyeRound;

  const eyebrowClass =
    draftAppearance.eyebrowStyle ===
    "arched"
      ? styles.eyebrowArched
      : draftAppearance
            .eyebrowStyle ===
          "straight"
        ? styles.eyebrowStraight
        : styles.eyebrowSoft;

  const lipsClass =
    draftAppearance.lipStyle ===
    "full"
      ? styles.lipsFull
      : draftAppearance.lipStyle ===
          "smile"
        ? styles.lipsSmile
        : styles.lipsSoft;

  const hairClass =
    effectiveHairStyle ===
    "short"
      ? styles.hairShort
      : effectiveHairStyle ===
          "long"
        ? styles.hairLong
        : effectiveHairStyle ===
            "ponytail"
          ? styles.hairPonytail
          : styles.hairBob;

  const bodyClass =
    clothing === "purple-hoodie"
      ? styles.purpleHoodie
      : clothing === "black-jacket"
        ? styles.blackJacket
        : clothing === "cool-jeans"
          ? styles.coolOutfit
          : styles.whiteShirt;

  const shoeClass =
    shoes === "boots"
      ? styles.boot
      : styles.sneaker;

  function renderOptions<
    T extends string
  >(
    title: string,
    options: Option<T>[],
    value: T,
    onChange: (next: T) => void
  ) {
    return (
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>
          {title}
        </span>

        <div className={styles.optionRow}>
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={
                value === option.value
                  ? styles.activeOptionButton
                  : styles.optionButton
              }
              onClick={() =>
                onChange(
                  option.value
                )
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

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
        className={styles.content}
      >
        {message && (
          <div
            className={
              messageType === "error"
                ? styles.errorMessage
                : styles.successMessage
            }
          >
            {messageType === "error"
              ? "⚠️ "
              : "✨ "}
            {message}
          </div>
        )}

        <div
          className={styles.heading}
        >
          <p>Avatar Studio</p>
          <h1>
            מעצבים את הדמות שלך
          </h1>
          <span>
            גרסה ראשונה של
            דמות בסגנון סמסונג:
            בסיס נקי, לבוש התחלתי
            לבן, ואפשרויות עיצוב
            אישיות.
          </span>
        </div>

        <div
          className={
            styles.designerGrid
          }
        >
          <section
            className={
              styles.previewPanel
            }
          >
            <div
              className={
                styles.previewHeader
              }
            >
              <div>
                <p>תצוגה מקדימה</p>
                <h2>
                  איך הדמות נראית
                </h2>
              </div>

              <span
                className={
                  styles.previewBadge
                }
              >
                {
                  Object.values(
                    equippedItems
                  ).filter(Boolean)
                    .length
                }{" "}
                פריטים בשימוש
              </span>
            </div>

            <div
              className={
                styles.previewStage
              }
            >
              <div
                className={
                  styles.previewGlow
                }
              />

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
                className={`${styles.character} ${
                  draftAppearance.gender ===
                  "boy"
                    ? styles.boy
                    : styles.girl
                }`}
                style={avatarStyle}
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
                  className={`${styles.hair} ${hairClass}`}
                >
                  <div
                    className={
                      styles.hairShine
                    }
                  />
                  {effectiveHairStyle ===
                    "ponytail" && (
                    <div
                      className={
                        styles.ponytail
                      }
                    />
                  )}
                </div>

                <div
                  className={`${styles.face} ${faceShapeClass}`}
                >
                  <div
                    className={
                      styles.eyebrowsRow
                    }
                  >
                    <div
                      className={`${styles.eyebrow} ${eyebrowClass}`}
                    />
                    <div
                      className={`${styles.eyebrow} ${eyebrowClass}`}
                    />
                  </div>

                  <div
                    className={
                      styles.eyesRow
                    }
                  >
                    <div
                      className={`${styles.eye} ${eyeShapeClass}`}
                    >
                      {draftAppearance.eyeShape !==
                        "smile" && (
                        <div
                          className={
                            styles.pupil
                          }
                        />
                      )}
                    </div>

                    <div
                      className={`${styles.eye} ${eyeShapeClass}`}
                    >
                      {draftAppearance.eyeShape !==
                        "smile" && (
                        <div
                          className={
                            styles.pupil
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      styles.nose
                    }
                  />

                  {draftAppearance
                    .freckles && (
                    <div
                      className={
                        styles.freckles
                      }
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  )}

                  <div
                    className={`${styles.lips} ${lipsClass}`}
                  />
                  <div
                    className={
                      styles.faceGlow
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
                  className={
                    styles.neck
                  }
                />

                <div
                  className={`${styles.torso} ${bodyClass}`}
                >
                  <div
                    className={
                      styles.shirtCenter
                    }
                  />
                </div>

                <div
                  className={`${styles.arm} ${styles.leftArm}`}
                />

                <div
                  className={`${styles.arm} ${styles.rightArm}`}
                />

                <div
                  className={`${styles.leg} ${styles.leftLeg}`}
                />

                <div
                  className={`${styles.leg} ${styles.rightLeg}`}
                />

                <div
                  className={`${styles.shoe} ${styles.leftShoe} ${shoeClass}`}
                />

                <div
                  className={`${styles.shoe} ${styles.rightShoe} ${shoeClass}`}
                />
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
                styles.previewFooter
              }
            >
              <strong>
                בסיס הדמות
              </strong>
              <p>
                מתחילים נקי:
                חולצה לבנה, בלי
                תכשיטים ובלי עגילים.
              </p>
            </div>
          </section>

          <section
            className={
              styles.editorPanel
            }
          >
            <div
              className={
                styles.editorHeader
              }
            >
              <div>
                <p>
                  עיצוב בסיסי
                </p>
                <h2>
                  התאמה אישית
                </h2>
              </div>

              <span
                className={
                  styles.editorHint
                }
              >
                כל האפשרויות כאן
                נשמרות ל־Supabase
              </span>
            </div>

            {renderOptions(
              "בן / בת",
              genderOptions,
              draftAppearance.gender,
              (value) =>
                updateDraft(
                  "gender",
                  value
                )
            )}

            {renderOptions(
              "צורת פנים",
              faceShapeOptions,
              draftAppearance.faceShape,
              (value) =>
                updateDraft(
                  "faceShape",
                  value
                )
            )}

            {renderOptions(
              "צבע עור",
              skinToneOptions,
              draftAppearance.skinTone,
              (value) =>
                updateDraft(
                  "skinTone",
                  value
                )
            )}

            {renderOptions(
              "סוג עיניים",
              eyeShapeOptions,
              draftAppearance.eyeShape,
              (value) =>
                updateDraft(
                  "eyeShape",
                  value
                )
            )}

            {renderOptions(
              "צבע עיניים",
              eyeColorOptions,
              draftAppearance.eyeColor,
              (value) =>
                updateDraft(
                  "eyeColor",
                  value
                )
            )}

            {renderOptions(
              "גבות",
              eyebrowOptions,
              draftAppearance.eyebrowStyle,
              (value) =>
                updateDraft(
                  "eyebrowStyle",
                  value
                )
            )}

            {renderOptions(
              "שפתיים",
              lipStyleOptions,
              draftAppearance.lipStyle,
              (value) =>
                updateDraft(
                  "lipStyle",
                  value
                )
            )}

            {renderOptions(
              "סוג שיער",
              hairStyleOptions,
              draftAppearance.hairStyle,
              (value) =>
                updateDraft(
                  "hairStyle",
                  value
                )
            )}

            {renderOptions(
              "צבע שיער",
              hairColorOptions,
              draftAppearance.hairColor,
              (value) =>
                updateDraft(
                  "hairColor",
                  value
                )
            )}

            <div
              className={
                styles.fieldGroup
              }
            >
              <span
                className={
                  styles.fieldLabel
                }
              >
                נמשים
              </span>

              <div
                className={
                  styles.optionRow
                }
              >
                <button
                  type="button"
                  className={
                    draftAppearance.freckles
                      ? styles.activeOptionButton
                      : styles.optionButton
                  }
                  onClick={() =>
                    updateDraft(
                      "freckles",
                      true
                    )
                  }
                >
                  כן
                </button>

                <button
                  type="button"
                  className={
                    !draftAppearance.freckles
                      ? styles.activeOptionButton
                      : styles.optionButton
                  }
                  onClick={() =>
                    updateDraft(
                      "freckles",
                      false
                    )
                  }
                >
                  לא
                </button>
              </div>
            </div>

            <div
              className={
                styles.actionsRow
              }
            >
              <button
                type="button"
                className={
                  styles.primaryAction
                }
                onClick={saveAppearance}
                disabled={
                  !hasChanges ||
                  savingAppearance
                }
              >
                {savingAppearance
                  ? "שומר..."
                  : "שמירת העיצוב"}
              </button>

              <button
                type="button"
                className={
                  styles.secondaryAction
                }
                onClick={() =>
                  setDraftAppearance(
                    appearance
                  )
                }
                disabled={
                  !hasChanges ||
                  savingAppearance
                }
              >
                ביטול שינויים
              </button>
            </div>
          </section>
        </div>

        <section
          className={
            styles.wardrobeSection
          }
        >
          <div
            className={
              styles.wardrobeHeader
            }
          >
            <div>
              <p>חדר הלבשה</p>
              <h2>
                פריטי החנות שלך
              </h2>
            </div>

            <span>
              {ownedAvatarItems.length}{" "}
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
                  key={category}
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
                      key={item.id}
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
                        {item.emoji}
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
                עדיין אין פריטים
                בקטגוריה הזאת
              </h3>
              <p>
                אפשר להמשיך לחנות,
                לקנות פריטים חדשים
                ואז לחזור לעצב את
                הדמות.
              </p>
              <button
                onClick={goShop}
              >
                לחנות
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}