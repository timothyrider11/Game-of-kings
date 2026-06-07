import { supabase } from "./supabase";

export const CLOUD_DISABLED_MESSAGE =
  "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

export async function getSessionUser() {
  if (!supabase) return { user: null, error: CLOUD_DISABLED_MESSAGE };

  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error: error?.message || null };
}

export async function signInWithPassword(email, password) {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message || null };
}

export async function signUpWithPassword({ email, password, username, rulerName, rulerTitle }) {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        ruler_name: rulerName,
        ruler_title: rulerTitle,
      },
    },
  });

  if (error) return { error: error.message };

  if (data?.user) {
    await upsertProfile({
      userId: data.user.id,
      username,
      rulerName,
      rulerTitle,
    });
  }

  return { user: data?.user || null, error: null };
}

export async function signOut() {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

export async function loadProfile() {
  if (!supabase) return { profile: null, error: CLOUD_DISABLED_MESSAGE };

  const { user, error: userError } = await getSessionUser();
  if (userError || !user) return { profile: null, error: userError || "Not signed in." };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { profile: data || null, error: error?.message || null };
}

export async function upsertProfile({ userId, username, rulerName, rulerTitle }) {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const targetUserId = userId || (await getSessionUser()).user?.id;
  if (!targetUserId) return { error: "Not signed in." };

  const { error } = await supabase.from("profiles").upsert({
    user_id: targetUserId,
    username: username.trim(),
    ruler_name: rulerName.trim(),
    ruler_title: rulerTitle,
  });

  return { error: error?.message || null };
}

export async function loadCloudRealm() {
  if (!supabase) return { realm: null, error: CLOUD_DISABLED_MESSAGE };

  const { user, error: userError } = await getSessionUser();
  if (userError || !user) return { realm: null, error: userError || "Not signed in." };

  const { data, error } = await supabase
    .from("player_realms")
    .select("realm_data")
    .eq("user_id", user.id)
    .maybeSingle();

  return { realm: data?.realm_data || null, error: error?.message || null };
}

export async function saveCloudRealm(realmData) {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const { user, error: userError } = await getSessionUser();
  if (userError || !user) return { error: userError || "Not signed in." };

  const playerCastleId = Object.entries(realmData.castleState || {}).find(
    ([, state]) => state?.owner === "player"
  )?.[0];

  const { error } = await supabase.from("player_realms").upsert({
    user_id: user.id,
    realm_data: realmData,
    house_name: realmData.houseName || "",
    ruler_name: realmData.rulerName || "",
    claimed_castle_id: playerCastleId || null,
    gold: realmData.gold ?? 350,
    renown: realmData.renown ?? 0,
  });

  return { error: error?.message || null };
}

export async function claimCastleCloud({ castleId, houseName, rulerName }) {
  if (!supabase) return { error: CLOUD_DISABLED_MESSAGE };

  const { user, error: userError } = await getSessionUser();
  if (userError || !user) return { error: userError || "Not signed in." };

  const { error } = await supabase.from("castle_claims").insert({
    castle_id: castleId,
    user_id: user.id,
    house_name: houseName,
    ruler_name: rulerName || "",
  });

  return { error: error?.message || null };
}
