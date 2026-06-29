"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import NobleKnightSelector from "../../components/NobleKnightSelector";
import RealmTodoList from "../../components/RealmTodoList";
import SigilMark from "../../components/SigilMark";
import SiteNav from "../../components/SiteNav";
import { buildActivity, recordRealmActivity } from "../../lib/realm-activity";
import {
  loadCloudRealm,
  loadProfile,
  saveCloudRealm,
  sendPasswordReset,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  upsertProfile,
} from "../../lib/realm-cloud";
import { applyRoyalAccountDefaults, clearLocalRealm, getRoyalAccount, isRoyalEmail, normalizeRulerTitle, PUBLIC_TITLES, ROYAL_ACCOUNTS, ROYAL_TITLES, STORAGE_KEY } from "../../lib/realm-identity";
import { supabase } from "../../lib/supabase";

const CASTLE_NAMES = {
  "kings-landing": "King's Landing",
  starpike: "Starpike",
  winterfell: "Winterfell",
  dragonstone: "Dragonstone",
  "casterly-rock": "Casterly Rock",
  highgarden: "Highgarden",
  "storms-end": "Storm's End",
  sunspear: "Sunspear",
  pyke: "Pyke",
  riverrun: "Riverrun",
  harrenhal: "Harrenhal",
  oldtown: "Oldtown",
  "the-twins": "The Twins",
  "the-eyrie": "The Eyrie",
};

function castleNameFromId(castleId = "") {
  if (CASTLE_NAMES[castleId]) return CASTLE_NAMES[castleId];
  return castleId
    .split("-")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AccountPage() {
  const [mode, setMode] = useState("sign-in");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rulerName, setRulerName] = useState("");
  const [rulerTitle, setRulerTitle] = useState("Lord");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [realm, setRealm] = useState({});
  const userEmail = user?.email || "";
  const isRoyalUser = isRoyalEmail(userEmail);

  const ownedCastles = useMemo(() => {
    const localOwned = Object.entries(realm.castleState || {})
      .filter(([, state]) => state?.owner === "player")
      .map(([castleId, state]) => ({
        id: castleId,
        name: castleNameFromId(castleId),
        troops: state?.troops || 0,
        house: state?.claimedHouse || (realm.houseName ? `House ${realm.houseName}` : ""),
      }));
    const royalAccount = getRoyalAccount(userEmail);
    const royalOwned = (royalAccount?.castleIds || []).map((castleId) => ({
      id: castleId,
      name: castleNameFromId(castleId),
      troops: realm.castleState?.[castleId]?.troops || royalAccount.startingTroops || 0,
      house: royalAccount.houseLabel,
    }));

    return [...localOwned, ...royalOwned].filter((castle, index, all) => all.findIndex((entry) => entry.id === castle.id) === index);
  }, [realm, userEmail]);

  const inventoryItems = useMemo(
    () => [
      ...(realm.artifactInventory || []).map((name) => ({ name, type: "Artifact" })),
      ...(realm.trophies || []).map((name) => ({ name, type: "Trophy" })),
    ],
    [realm.artifactInventory, realm.trophies]
  );

  const royalRegistry = useMemo(() => Object.entries(ROYAL_ACCOUNTS).map(([accountEmail, account]) => ({
    email: accountEmail,
    title: account.title,
    rulerName: account.rulerName,
    houseLabel: account.houseLabel,
    castles: account.castleIds.map(castleNameFromId),
    gold: account.startingGold,
    troops: account.startingTroops,
    artifacts: account.startingArtifacts,
    image: account.selectedKnightImage,
  })), []);

  const loadAccountRealm = useCallback(async (accountEmail = userEmail) => {
    const { realm: cloudRealm } = await loadCloudRealm();
    const royalAccount = getRoyalAccount(accountEmail);
    const realmData = cloudRealm
      ? applyRoyalAccountDefaults(cloudRealm, accountEmail)
      : royalAccount
        ? applyRoyalAccountDefaults({}, accountEmail)
        : {};

    localStorage.setItem(STORAGE_KEY, JSON.stringify(realmData));
    setRealm(realmData);
    if (!cloudRealm && royalAccount) await saveCloudRealm(realmData);
    return realmData;
  }, [userEmail]);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured for this deployment yet.");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRealm(JSON.parse(stored));
      } catch {
        setRealm({});
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === "SIGNED_OUT") {
        setRealm({});
        setMessage("Signed out.");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    loadProfile().then(({ profile }) => {
      if (!profile) return;

      setUsername(profile.username || "");
      const royalAccount = getRoyalAccount(userEmail);
      setRulerName(profile.ruler_name || (royalAccount ? royalAccount.rulerName : ""));
      setRulerTitle(normalizeRulerTitle(profile.ruler_title || "Lord", userEmail));
      setAvatarUrl(profile.avatar_url || "");
    });

    loadAccountRealm(userEmail);
  }, [loadAccountRealm, userEmail]);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const result =
      mode === "sign-up"
        ? await signUpWithPassword({ email, password, username, rulerName, rulerTitle: normalizeRulerTitle(rulerTitle, email), avatarUrl })
        : await signInWithPassword(email, password);

    if (result.error) {
      setMessage(result.error);
    } else {
      if (mode === "sign-in") {
        await loadAccountRealm(email);
      }
      setMessage(mode === "sign-up" ? "Account created. Check your raven cage and send the raven back with verification." : "Signed in. Your account realm has been restored.");
    }

    setBusy(false);
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setMessage("Enter your email first, then request a password raven.");
      return;
    }

    setBusy(true);
    const { error } = await sendPasswordReset(email);
    setMessage(error || "Password raven sent. Check your raven cage for the reset link.");
    setBusy(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    const safeTitle = normalizeRulerTitle(rulerTitle, user?.email);
    const { error } = await upsertProfile({ username, rulerName, rulerTitle: safeTitle, avatarUrl });
    const stored = localStorage.getItem(STORAGE_KEY);
    const realm = stored ? JSON.parse(stored) : {};
    const nextRealm = applyRoyalAccountDefaults({
      ...realm,
      username,
      rulerName,
      rulerTitle: safeTitle,
      avatarUrl,
    }, user?.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    setRealm(nextRealm);
    await saveCloudRealm(nextRealm);
    await recordRealmActivity(buildActivity({
      type: "account",
      title: "A Profile Was Updated",
      actor: username || rulerName || "A realm player",
      body: `${safeTitle} ${rulerName || username || "Unknown"} refreshed their account banner.`,
    }));
    setRulerTitle(safeTitle);
    setMessage(error || "Profile updated.");
    setBusy(false);
  }

  async function saveLocalToCloud() {
    setBusy(true);
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setMessage("No local realm profile found yet.");
      setBusy(false);
      return;
    }

    const realm = JSON.parse(stored);
    const nextRealm = applyRoyalAccountDefaults({
      ...realm,
      username,
      rulerName,
      rulerTitle: normalizeRulerTitle(rulerTitle, user?.email),
      avatarUrl,
    }, user?.email);
    const { error } = await saveCloudRealm(nextRealm);
    setRealm(nextRealm);

    setMessage(error || "Account realm updated.");
    setBusy(false);
  }

  async function loadCloudToLocal() {
    setBusy(true);
    const { realm, error } = await loadCloudRealm();

    if (error) {
      setMessage(error);
    } else if (!realm) {
      setMessage("No account realm found yet.");
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applyRoyalAccountDefaults(realm, user?.email)));
      setRealm(applyRoyalAccountDefaults(realm, user?.email));
      setMessage("Cloud realm loaded onto this device.");
    }

    setBusy(false);
  }

  async function selectKnight(knight) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const nextRealm = applyRoyalAccountDefaults({
      ...current,
      ...knight,
    }, user?.email);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    setRealm(nextRealm);

    if (!user) {
      setMessage("Sign in to save your knight.");
      return;
    }

    const { error } = await saveCloudRealm(nextRealm);
    setMessage(error || "Realm Saved.");
  }

  async function handleSignOut() {
    setBusy(true);
    const { error } = await signOut();
    if (!error) {
      clearLocalRealm();
      setRealm({});
      setUser(null);
      setUsername("");
      setRulerName("");
      setRulerTitle("Lord");
      setAvatarUrl("");
      setEmail("");
      setPassword("");
    }
    setMessage(error || "Signed out.");
    setBusy(false);
  }

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-8 grid max-w-7xl gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Realm Account</p>
          <h1 className="mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Keep your house.
          </h1>
          <p className="gok-copy mt-4 text-sm leading-6">
            Sign in so your castle, house, gold, renown, sigil, and event progress follow your account across devices.
          </p>
          <RealmTodoList className="mt-5" />

          {message && (
            <p className="mt-5 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">
              {message}
            </p>
          )}
        </div>

        <div className="gok-panel p-5">
          {!user ? (
            <form onSubmit={submitAuth} className="relative z-10 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("sign-in")}
                  className={`gok-btn px-4 py-2 text-xs ${mode === "sign-in" ? "gok-btn-blood" : ""}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("sign-up")}
                  className={`gok-btn px-4 py-2 text-xs ${mode === "sign-up" ? "gok-btn-blood" : ""}`}
                >
                  Create Account
                </button>
              </div>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="min-h-12 w-full border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="min-h-12 w-full border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                required
              />

              {mode === "sign-up" && (
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Username"
                    className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                    required
                  />
                  <select
                    value={rulerTitle}
                    onChange={(event) => setRulerTitle(event.target.value)}
                    className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                  >
                    {PUBLIC_TITLES.map((title) => <option key={title}>{title}</option>)}
                  </select>
                  <input
                    value={rulerName}
                    onChange={(event) => setRulerName(event.target.value)}
                    placeholder="Ruler name"
                    className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                    required
                  />
                  <input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="Profile picture URL"
                    className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)] md:col-span-3"
                  />
                </div>
              )}

              <button disabled={busy} className="gok-btn gok-btn-blood min-h-12 w-full px-5 py-3 disabled:opacity-50">
                {busy ? "Working..." : mode === "sign-up" ? "Create Account" : "Sign In"}
              </button>
              {mode === "sign-in" && (
                <button type="button" onClick={handlePasswordReset} disabled={busy} className="gok-btn min-h-11 w-full px-5 py-3 text-xs disabled:opacity-50">
                  Send Password Raven
                </button>
              )}
            </form>
          ) : (
            <div className="relative z-10 space-y-5">
              <div>
                <p className="gok-eyebrow">Signed In</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-[var(--gok-line-strong)] bg-black text-xl text-[var(--gok-silver)]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={username || "Profile"} className="h-full w-full object-cover" />
                    ) : (
                      (username || user.email || "?").slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xl text-[var(--gok-silver)]">{user.email}</p>
                    <p className="text-sm text-[var(--gok-dim)]">Verified houses keep progress across the realm.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border border-[var(--gok-line)] bg-black/45 p-4 text-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">Account Ledger</p>
                <LedgerRow label="Email" value={user.email} />
                <LedgerRow label="Role" value={isRoyalUser ? getRoyalAccount(user.email).title : "Player"} />
                <LedgerRow label="Profile" value={username || "Not named yet"} />
                <LedgerRow label="Realm Save" value="Supabase player_realms + local device cache" />
              </div>

              <form onSubmit={saveProfile} className="grid gap-3 md:grid-cols-3">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                  className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                  required
                />
                <select
                  value={rulerTitle}
                  onChange={(event) => setRulerTitle(event.target.value)}
                  className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                >
                  {(isRoyalEmail(user.email) ? ROYAL_TITLES : PUBLIC_TITLES).map((title) => <option key={title}>{title}</option>)}
                </select>
                <input
                  value={rulerName}
                  onChange={(event) => setRulerName(event.target.value)}
                  placeholder="Ruler name"
                  className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                  required
                />
                <input
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="Profile picture URL"
                  className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)] md:col-span-3"
                />
                <button disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50 md:col-span-3">
                  Update Profile
                </button>
              </form>

              <div className="grid gap-3 md:grid-cols-3">
                <button onClick={saveLocalToCloud} disabled={busy} className="gok-btn gok-btn-blood min-h-12 px-4 py-3 disabled:opacity-50">
                  Update Realm
                </button>
                <button onClick={loadCloudToLocal} disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50">
                  Refresh Realm
                </button>
                <button onClick={handleSignOut} disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50">
                  Sign Out
                </button>
              </div>

              {isRoyalUser && (
                <div className="border border-[var(--gok-line-strong)] bg-black/55 p-4">
                  <p className="gok-eyebrow">Royal Account Registry</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--gok-dim)]">
                    These are the protected royal defaults written into the site. Supabase Auth still controls passwords and email verification.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {royalRegistry.map((entry) => (
                      <div key={entry.email} className="grid gap-3 border border-[rgba(196,193,184,0.14)] bg-black/55 p-3 sm:grid-cols-[64px_minmax(0,1fr)]">
                        <span className="gok-knight-frame block h-20 w-16">
                          <img src={entry.image} alt={`${entry.title} ${entry.rulerName}`} className="gok-knight-image h-full w-full object-cover" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-serif text-xl font-black text-[var(--gok-silver)]">{entry.title} {entry.rulerName}</p>
                          <p className="truncate text-xs uppercase tracking-[0.14em] text-[var(--gok-dim)]">{entry.email}</p>
                          <div className="mt-2 grid gap-1 text-sm text-[var(--gok-parchment)]">
                            <LedgerRow label="House" value={entry.houseLabel} compact />
                            <LedgerRow label="Castles" value={entry.castles.join(", ")} compact />
                            <LedgerRow label="Starting Assets" value={`${entry.gold.toLocaleString()} gold / ${entry.troops.toLocaleString()} troops`} compact />
                            <LedgerRow label="Artifacts" value={entry.artifacts.length ? entry.artifacts.join(", ") : "None"} compact />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="gok-panel mb-5 p-5">
            <p className="gok-eyebrow">Realm Identity</p>
            <div className="relative z-10 mt-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl text-[var(--gok-silver)]">
                  {normalizeRulerTitle(rulerTitle || realm.rulerTitle || "Lord", user?.email)} {rulerName || realm.rulerName || username || "Realm Founder"}
                </h2>
                <p className="text-sm text-[var(--gok-dim)]">
                  House {realm.houseName || "Unsworn"} {realm.selectedKnightTitle ? `- ${realm.selectedKnightTitle}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {realm.houseSigil?.layers?.length && (
                  <span className="block h-24 w-20">
                    <SigilMark sigil={realm.houseSigil} label={`${realm.houseName || "House"} sigil`} />
                  </span>
                )}
                {realm.selectedKnightImage && (
                  <span className="gok-knight-frame block h-24 w-20">
                    <img src={realm.selectedKnightImage} alt={realm.selectedKnightTitle || "Selected knight"} className="gok-knight-image h-full w-full object-cover" />
                  </span>
                )}
              </div>
            </div>
            <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-4">
              <LedgerStat label="Gold" value={(realm.gold ?? 350).toLocaleString()} />
              <LedgerStat label="Renown" value={(realm.renown ?? 0).toLocaleString()} />
              <LedgerStat label="Castles" value={ownedCastles.length.toLocaleString()} />
              <LedgerStat label="Inventory" value={inventoryItems.length.toLocaleString()} />
            </div>
            <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">Castle Seat</p>
                <div className="mt-3 grid gap-2">
                  {ownedCastles.length ? ownedCastles.map((castle) => (
                    <div key={castle.id} className="border border-[rgba(196,193,184,0.12)] bg-black/45 p-3">
                      <p className="font-serif text-xl font-black text-[var(--gok-silver)]">{castle.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[var(--gok-dim)]">{castle.house || "House seat"} / {castle.troops.toLocaleString()} troops</p>
                    </div>
                  )) : (
                    <p className="text-sm leading-6 text-[var(--gok-dim)]">No castle claimed yet. Claim one from the map while signed in.</p>
                  )}
                </div>
              </div>
              <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">Inventory</p>
                <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto">
                  {inventoryItems.length ? inventoryItems.map((item) => (
                    <div key={`${item.type}-${item.name}`} className="flex items-center justify-between border border-[rgba(196,193,184,0.12)] bg-black/45 p-3">
                      <span className="font-black text-[var(--gok-silver)]">{item.name}</span>
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gok-dim)]">{item.type}</span>
                    </div>
                  )) : (
                    <p className="text-sm leading-6 text-[var(--gok-dim)]">No artifacts or trophies yet. Tournaments, quests, and special events will fill this archive.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-4 grid gap-3 border border-[var(--gok-line)] bg-black/45 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">Account Storage</p>
                <p className="mt-2 text-sm leading-6 text-[var(--gok-parchment)]">
                  Profile names live in Supabase profiles. Castle, sigil, gold, renown, knight, trophies, and inventory live in player_realms.
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">Current Save Status</p>
                <p className="mt-2 text-sm leading-6 text-[var(--gok-parchment)]">
                  Use Update Realm after big changes, then Refresh Realm on another device to pull the latest saved copy.
                </p>
              </div>
            </div>
          </div>

          <NobleKnightSelector
            key={`${realm.selectedKnightGender || "male"}-${realm.selectedKnightIndex || 1}`}
            signedIn={Boolean(user)}
            initialGender={realm.selectedKnightGender || "male"}
            initialIndex={realm.selectedKnightIndex || 1}
            onSelect={selectKnight}
          />
        </div>
      </section>
    </main>
  );
}

function LedgerStat({ label, value }) {
  return (
    <div className="border border-[var(--gok-line)] bg-black/45 p-3">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">{label}</p>
      <p className="mt-1 font-serif text-2xl font-black text-[var(--gok-silver)]">{value}</p>
    </div>
  );
}

function LedgerRow({ label, value, compact = false }) {
  return (
    <div className={`flex min-w-0 justify-between gap-3 ${compact ? "text-xs" : ""}`}>
      <span className="shrink-0 font-black uppercase tracking-[0.14em] text-[var(--gok-dim)]">{label}</span>
      <span className="min-w-0 truncate text-right text-[var(--gok-silver)]">{value}</span>
    </div>
  );
}
