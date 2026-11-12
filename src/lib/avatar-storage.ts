export type Task = {
  id: number;
  title: string;
  category: string;
  reward: number;
  xp: number;
  icon: string;
};

export type EquippedItems = {
  clothing: string | null;
  shoes: string | null;
  accessory: string | null;
  hair: string | null;
  special: string | null;
};

export type AvatarData = {
  tasks: Task[];
  coins: number;
  xp: number;
  totalXp: number;
  completedTasks: number;
  ownedItems: string[];
  equippedItems: EquippedItems;
};

export const STORAGE_KEY = "avatar-app-data";

export const initialTasks: Task[] = [
  {
    id: 1,
    title: "להכין שיעורי בית במתמטיקה",
    category: "לימודים",
    reward: 60,
    xp: 40,
    icon: "📚",
  },
  {
    id: 2,
    title: "לסדר את החדר",
    category: "בית",
    reward: 80,
    xp: 50,
    icon: "🧹",
  },
  {
    id: 3,
    title: "לקרוא במשך 20 דקות",
    category: "אישי",
    reward: 40,
    xp: 30,
    icon: "📖",
  },
];

export const defaultEquippedItems: EquippedItems = {
  clothing: null,
  shoes: null,
  accessory: null,
  hair: null,
  special: null,
};

export const defaultAvatarData: AvatarData = {
  tasks: initialTasks,
  coins: 1280,
  xp: 340,
  totalXp: 2840,
  completedTasks: 34,
  ownedItems: [],
  equippedItems: defaultEquippedItems,
};

export function getAvatarData(): AvatarData {
  if (typeof window === "undefined") {
    return defaultAvatarData;
  }

  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return defaultAvatarData;
  }

  try {
    const parsedData = JSON.parse(savedData);

    return {
      tasks: Array.isArray(parsedData.tasks)
        ? parsedData.tasks
        : defaultAvatarData.tasks,

      coins:
        typeof parsedData.coins === "number"
          ? parsedData.coins
          : defaultAvatarData.coins,

      xp:
        typeof parsedData.xp === "number"
          ? parsedData.xp
          : defaultAvatarData.xp,

      totalXp:
        typeof parsedData.totalXp === "number"
          ? parsedData.totalXp
          : defaultAvatarData.totalXp,

      completedTasks:
        typeof parsedData.completedTasks === "number"
          ? parsedData.completedTasks
          : defaultAvatarData.completedTasks,

      ownedItems: Array.isArray(parsedData.ownedItems)
        ? parsedData.ownedItems
        : [],

      equippedItems: {
        clothing:
          parsedData.equippedItems?.clothing ?? null,

        shoes:
          parsedData.equippedItems?.shoes ?? null,

        accessory:
          parsedData.equippedItems?.accessory ?? null,

        hair:
          parsedData.equippedItems?.hair ?? null,

        special:
          parsedData.equippedItems?.special ?? null,
      },
    };
  } catch {
    return defaultAvatarData;
  }
}

export function saveAvatarData(data: Partial<AvatarData>) {
  if (typeof window === "undefined") {
    return;
  }

  const currentData = getAvatarData();

  const newData: AvatarData = {
    ...currentData,
    ...data,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(newData)
  );
}