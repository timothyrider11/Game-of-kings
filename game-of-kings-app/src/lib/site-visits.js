import { supabase } from "./supabase";

const VISIT_SESSION_KEY = "game_of_kings_home_visit_recorded";
const VISIT_FALLBACK_COUNT_KEY = "game_of_kings_home_visit_count";
const VISITOR_ID_KEY = "game_of_kings_visitor_id";
const VISIT_TYPE = "site_visit";

function getVisitorId() {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const created = `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(VISITOR_ID_KEY, created);
  return created;
}

function readFallbackCount() {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(VISIT_FALLBACK_COUNT_KEY) || 0);
}

function incrementFallbackCount() {
  if (typeof window === "undefined") return 0;
  const nextCount = readFallbackCount() + 1;
  localStorage.setItem(VISIT_FALLBACK_COUNT_KEY, String(nextCount));
  return nextCount;
}

export async function loadSiteVisitCount() {
  if (!supabase) return readFallbackCount();

  const { count, error } = await supabase
    .from("realm_activity")
    .select("id", { count: "exact", head: true })
    .eq("type", VISIT_TYPE);

  if (error) return readFallbackCount();
  return count || 0;
}

export async function recordHomeVisitOnce() {
  if (typeof window === "undefined") return 0;

  if (sessionStorage.getItem(VISIT_SESSION_KEY)) {
    return loadSiteVisitCount();
  }

  sessionStorage.setItem(VISIT_SESSION_KEY, "1");
  const fallbackCount = incrementFallbackCount();

  if (!supabase) return fallbackCount;

  const visitorId = getVisitorId();
  await supabase.from("realm_activity").insert({
    user_id: null,
    type: VISIT_TYPE,
    title: "A Visitor Entered The Realm",
    body: "A front-page visit was recorded.",
    actor: "Realm Visitor",
    meta: { visitorId },
  });

  return loadSiteVisitCount();
}
