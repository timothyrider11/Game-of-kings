export const STORAGE_KEY = "game_of_kings_living_realm";
export const ROYAL_EMAIL = "timothyrider11@gmail.com";
export const PUBLIC_TITLES = ["Lord", "Lady", "Ser"];
export const ROYAL_TITLES = ["King", ...PUBLIC_TITLES];

export function isRoyalEmail(email = "") {
  return email.trim().toLowerCase() === ROYAL_EMAIL;
}

export function normalizeRulerTitle(title = "Lord", email = "") {
  if (isRoyalEmail(email)) return ROYAL_TITLES.includes(title) ? title : "King";
  return PUBLIC_TITLES.includes(title) ? title : "Lord";
}

export function clearLocalRealm() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("gok:realm-cleared"));
}
