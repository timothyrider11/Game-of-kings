import { supabase } from "./supabase";

export const ACTIVITY_STORAGE_KEY = "game_of_kings_realm_activity";

export function formatActivityTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function buildActivity({ type = "realm", title, body, actor = "The Realm", meta = {} }) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    title,
    body,
    actor,
    meta,
    createdAt: new Date().toISOString(),
  };
}

export function readLocalActivities() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeLocalActivity(activity) {
  if (typeof window === "undefined") return [];

  const nextActivities = [activity, ...readLocalActivities()].slice(0, 120);
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(nextActivities));
  window.dispatchEvent(new CustomEvent("gok:activity", { detail: activity }));
  return nextActivities;
}

export async function recordRealmActivity(activity) {
  const stored = writeLocalActivity(activity);

  if (!supabase) return { activity, activities: stored, error: null };

  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("realm_activity").insert({
    user_id: userData?.user?.id || null,
    type: activity.type,
    title: activity.title,
    body: activity.body,
    actor: activity.actor,
    meta: activity.meta || {},
  });

  return { activity, activities: stored, error: error?.message || null };
}

export async function loadRealmActivity(limit = 80) {
  const local = readLocalActivities();
  if (!supabase) return { activities: local, error: null };

  const { data, error } = await supabase
    .from("realm_activity")
    .select("id,type,title,body,actor,meta,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { activities: local, error: error.message };

  return {
    activities: (data || []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      actor: item.actor,
      meta: item.meta || {},
      createdAt: item.created_at,
    })),
    error: null,
  };
}
