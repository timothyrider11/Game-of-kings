export const STORAGE_KEY = "game_of_kings_living_realm";
export const ROYAL_EMAIL = "timothyrider11@gmail.com";
export const QUEEN_EMAIL = "baby_girl_wpg_2@hotmail.com";
export const PUBLIC_TITLES = ["Lord", "Lady", "Ser"];
export const ROYAL_TITLES = ["King", "Queen", ...PUBLIC_TITLES];
export const EXTRA_CASTLE_CLAIM_GRANTS = {};

export const ROYAL_ACCOUNTS = {
  [ROYAL_EMAIL]: {
    title: "King",
    rulerName: "Rider",
    lordName: "King Rider",
    houseName: "Rider",
    houseMotto: "Loyalty Never Dies",
    houseLabel: "House Rider",
    castleIds: ["kings-landing"],
    startingGold: 350,
    startingTroops: 1200,
    startingArtifacts: [],
  },
  [QUEEN_EMAIL]: {
    title: "Queen",
    rulerName: "Rider",
    lordName: "Queen Rider",
    houseName: "Rider",
    houseMotto: "Loyalty Never Dies",
    houseLabel: "House Rider",
    castleIds: ["kings-landing", "starpike"],
    startingGold: 10000,
    startingTroops: 4000,
    startingArtifacts: ["Dayne Falling Star", "Catspaw Dagger"],
  },
};

export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function getRoyalAccount(email = "") {
  return ROYAL_ACCOUNTS[normalizeEmail(email)] || null;
}

export function isRoyalEmail(email = "") {
  return Boolean(getRoyalAccount(email));
}

export function getCastleClaimLimit(email = "") {
  const normalizedEmail = normalizeEmail(email);
  const royalAccount = getRoyalAccount(normalizedEmail);
  const grantedExtraClaims = EXTRA_CASTLE_CLAIM_GRANTS[normalizedEmail] || 0;

  if (royalAccount) {
    return Math.max(1, royalAccount.castleIds.length, 1 + grantedExtraClaims);
  }

  return 1 + grantedExtraClaims;
}

export function normalizeRulerTitle(title = "Lord", email = "") {
  const royalAccount = getRoyalAccount(email);
  if (royalAccount) return royalAccount.title;
  return PUBLIC_TITLES.includes(title) ? title : "Lord";
}

export function applyRoyalAccountDefaults(realm = {}, email = "") {
  const royalAccount = getRoyalAccount(email);
  if (!royalAccount) return realm;

  return {
    ...realm,
    houseName: realm.houseName || royalAccount.houseName,
    houseMotto: realm.houseMotto || royalAccount.houseMotto,
    rulerName: realm.rulerName || royalAccount.rulerName,
    rulerTitle: royalAccount.title,
    gold: Math.max(realm.gold ?? 350, royalAccount.startingGold),
    artifactInventory: [...new Set([...(realm.artifactInventory || []), ...royalAccount.startingArtifacts])],
  };
}

export function clearLocalRealm() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("gok:realm-cleared"));
}
