import { createClient } from "@/lib/supabase/client";

export type GameProgress = {
  coins: number;
  xp: number;
  totalXp: number;
  completedTasks: number;
};

const EMPTY_PROGRESS: GameProgress = {
  coins: 0,
  xp: 0,
  totalXp: 0,
  completedTasks: 0,
};

export async function getGameProgress(): Promise<GameProgress> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return EMPTY_PROGRESS;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("coins, xp, total_xp, completed_tasks")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    console.error("Error loading game progress:", error);
    return EMPTY_PROGRESS;
  }

  return {
    coins: data.coins ?? 0,
    xp: data.xp ?? 0,
    totalXp: data.total_xp ?? 0,
    completedTasks: data.completed_tasks ?? 0,
  };
}

export async function saveGameProgress(
  progress: GameProgress
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      coins: progress.coins,
      xp: progress.xp,
      total_xp: progress.totalXp,
      completed_tasks: progress.completedTasks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error saving game progress:", error);
    return false;
  }

  return true;
}

export async function addTaskReward(
  coinsReward: number,
  xpReward: number
): Promise<GameProgress | null> {
  const current = await getGameProgress();

  const updated: GameProgress = {
    coins: current.coins + coinsReward,
    xp: current.xp + xpReward,
    totalXp: current.totalXp + xpReward,
    completedTasks: current.completedTasks + 1,
  };

  const success = await saveGameProgress(updated);

  return success ? updated : null;
}

export async function spendCoins(
  amount: number
): Promise<GameProgress | null> {
  const current = await getGameProgress();

  if (amount <= 0 || current.coins < amount) {
    return null;
  }

  const updated: GameProgress = {
    ...current,
    coins: current.coins - amount,
  };

  const success = await saveGameProgress(updated);

  return success ? updated : null;
}