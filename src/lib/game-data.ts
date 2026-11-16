import { createClient } from "@/lib/supabase/client";

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

export type GameData = {
  tasks: Task[];
  coins: number;
  xp: number;
  totalXp: number;
  completedTasks: number;
  ownedItems: string[];
  equippedItems: EquippedItems;
  name: string;
  nickname: string;
};

export type GameProgress = {
  coins: number;
  xp: number;
  totalXp: number;
  completedTasks: number;
};

export type PurchaseResult = {
  coins: number;
  ownedItems: string[];
};

export type ItemType = keyof EquippedItems;

export const defaultEquippedItems: EquippedItems = {
  clothing: null,
  shoes: null,
  accessory: null,
  hair: null,
  special: null,
};

function normalizeEquippedItems(
  value: unknown
): EquippedItems {
  if (!value || typeof value !== "object") {
    return { ...defaultEquippedItems };
  }

  const data = value as Partial<EquippedItems>;

  return {
    clothing:
      typeof data.clothing === "string"
        ? data.clothing
        : null,

    shoes:
      typeof data.shoes === "string"
        ? data.shoes
        : null,

    accessory:
      typeof data.accessory === "string"
        ? data.accessory
        : null,

    hair:
      typeof data.hair === "string"
        ? data.hair
        : null,

    special:
      typeof data.special === "string"
        ? data.special
        : null,
  };
}

function normalizeTask(
  value: unknown
): Task | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const task = value as Record<string, unknown>;

  if (
    typeof task.id !== "number" ||
    typeof task.title !== "string" ||
    typeof task.category !== "string" ||
    typeof task.reward !== "number" ||
    typeof task.xp !== "number" ||
    typeof task.icon !== "string"
  ) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    category: task.category,
    reward: task.reward,
    xp: task.xp,
    icon: task.icon,
  };
}

function firstRow<T>(
  data: T | T[] | null
): T | null {
  if (!data) {
    return null;
  }

  return Array.isArray(data)
    ? data[0] ?? null
    : data;
}

export async function getGameData(): Promise<GameData | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [profileResult, tasksResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "name, nickname, coins, xp, total_xp, completed_tasks, owned_items, equipped_items"
        )
        .eq("id", user.id)
        .single(),

      supabase
        .from("tasks")
        .select(
          "id, title, category, reward, xp, icon"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),
    ]);

  if (
    profileResult.error ||
    !profileResult.data
  ) {
    console.error(
      "Error loading profile game data:",
      profileResult.error
    );

    return null;
  }

  if (tasksResult.error) {
    console.error(
      "Error loading tasks:",
      tasksResult.error
    );

    return null;
  }

  const tasks = (tasksResult.data ?? [])
    .map(normalizeTask)
    .filter(
      (task): task is Task =>
        task !== null
    );

  const profile = profileResult.data;

  return {
    tasks,

    coins:
      profile.coins ?? 0,

    xp:
      profile.xp ?? 0,

    totalXp:
      profile.total_xp ?? 0,

    completedTasks:
      profile.completed_tasks ?? 0,

    ownedItems:
      Array.isArray(profile.owned_items)
        ? profile.owned_items.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [],

    equippedItems:
      normalizeEquippedItems(
        profile.equipped_items
      ),

    name:
      profile.name ||
      "שחקן חדש",

    nickname:
      profile.nickname ||
      "שחקן מתחיל",
  };
}

export async function createTask(
  title: string,
  category: string
): Promise<Task | null> {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "create_task",
      {
        p_title: title.trim(),
        p_category: category,
      }
    );

  if (error) {
    console.error(
      "Error creating task:",
      error
    );

    return null;
  }

  return normalizeTask(
    firstRow(data)
  );
}

export async function completeTask(
  taskId: number
): Promise<GameProgress | null> {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "complete_task",
      {
        p_task_id: taskId,
      }
    );

  if (error) {
    console.error(
      "Error completing task:",
      error
    );

    return null;
  }

  const row = firstRow(data) as
    | {
        coins?: number;
        xp?: number;
        total_xp?: number;
        completed_tasks?: number;
      }
    | null;

  if (!row) {
    return null;
  }

  return {
    coins:
      row.coins ?? 0,

    xp:
      row.xp ?? 0,

    totalXp:
      row.total_xp ?? 0,

    completedTasks:
      row.completed_tasks ?? 0,
  };
}

export async function purchaseItem(
  itemId: string
): Promise<PurchaseResult | null> {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "purchase_item",
      {
        p_item_id: itemId,
      }
    );

  if (error) {
    console.error(
      "Error purchasing item:",
      error
    );

    return null;
  }

  const row = firstRow(data) as
    | {
        coins?: number;
        owned_items?: unknown;
      }
    | null;

  if (!row) {
    return null;
  }

  return {
    coins:
      row.coins ?? 0,

    ownedItems:
      Array.isArray(row.owned_items)
        ? row.owned_items.filter(
            (item): item is string =>
              typeof item === "string"
          )
        : [],
  };
}

export async function toggleEquippedItem(
  itemId: string,
  itemType: ItemType
): Promise<EquippedItems | null> {
  const supabase = createClient();

  const { data, error } =
    await supabase.rpc(
      "toggle_equipped_item",
      {
        p_item_id: itemId,
        p_item_type: itemType,
      }
    );

  if (error) {
    console.error(
      "Error equipping item:",
      error
    );

    return null;
  }

  return normalizeEquippedItems(data);
}