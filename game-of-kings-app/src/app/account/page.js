"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import NobleKnightSelector from "../../components/NobleKnightSelector";
import SiteNav from "../../components/SiteNav";
import { buildActivity, recordRealmActivity } from "../../lib/realm-activity";
import {
  loadCloudRealm,
  loadProfile,
  saveCloudRealm,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  upsertProfile,
} from "../../lib/realm-cloud";
import { applyRoyalAccountDefaults, clearLocalRealm, getRoyalAccount, isRoyalEmail, normalizeRulerTitle, PUBLIC_TITLES, ROYAL_TITLES, STORAGE_KEY } from "../../lib/realm-identity";
import { supabase } from "../../lib/supabase";

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
      if (event === "SIGNED_OUT") setMessage("Signed out.");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    loadProfile().then(({ profile }) => {
      if (!profile) return;

      setUsername(profile.username || "");
      const royalAccount = getRoyalAccount(user.email);
      setRulerName(profile.ruler_name || (royalAccount ? royalAccount.rulerName : ""));
      setRulerTitle(normalizeRulerTitle(profile.ruler_title || "Lord", user.email));
      setAvatarUrl(profile.avatar_url || "");
    });
  }, [user]);

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
        const { realm } = await loadCloudRealm();
        const royalAccount = getRoyalAccount(email);
        const realmData = realm ? applyRoyalAccountDefaults(realm, email) : royalAccount ? applyRoyalAccountDefaults({}, email) : null;
        if (realmData) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(realmData));
          setRealm(realmData);
          if (!realm) await saveCloudRealm(realmData);
        }
      }
      setMessage(mode === "sign-up" ? "Account created. Check your raven cage and send the raven back with verification." : "Signed in. Your account realm has been restored.");
    }

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

      <section className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Realm Account</p>
          <h1 className="mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Keep your house.
          </h1>
          <p className="gok-copy mt-4 text-sm leading-6">
            Sign in so your castle, house, gold, renown, sigil, and event progress follow your account across devices.
          </p>

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
                  Update Account Realm
                </button>
                <button onClick={loadCloudToLocal} disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50">
                  Load Account Realm
                </button>
                <button onClick={handleSignOut} disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50">
                  Sign Out
                </button>
              </div>
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
              {realm.selectedKnightImage && (
                <span className="gok-knight-frame block h-24 w-20">
                  <img src={realm.selectedKnightImage} alt={realm.selectedKnightTitle || "Selected knight"} className="gok-knight-image h-full w-full object-cover" />
                </span>
              )}
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
