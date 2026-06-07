"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadCloudRealm,
  loadProfile,
  saveCloudRealm,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  upsertProfile,
} from "../../lib/realm-cloud";
import { supabase } from "../../lib/supabase";

const STORAGE_KEY = "game_of_kings_living_realm";

export default function AccountPage() {
  const [mode, setMode] = useState("sign-in");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rulerName, setRulerName] = useState("");
  const [rulerTitle, setRulerTitle] = useState("Lord");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured for this deployment yet.");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

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
      setRulerName(profile.ruler_name || "");
      setRulerTitle(profile.ruler_title || "Lord");
    });
  }, [user]);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const result =
      mode === "sign-up"
        ? await signUpWithPassword({ email, password, username, rulerName, rulerTitle })
        : await signInWithPassword(email, password);

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(mode === "sign-up" ? "Account created. Check email if Supabase asks for confirmation." : "Signed in.");
    }

    setBusy(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await upsertProfile({ username, rulerName, rulerTitle });
    setMessage(error || "Profile saved.");
    setBusy(false);
  }

  async function saveLocalToCloud() {
    setBusy(true);
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setMessage("No local realm save found yet.");
      setBusy(false);
      return;
    }

    const realm = JSON.parse(stored);
    const { error } = await saveCloudRealm({
      ...realm,
      username,
      rulerName,
      rulerTitle,
    });

    setMessage(error || "Realm saved to your account.");
    setBusy(false);
  }

  async function loadCloudToLocal() {
    setBusy(true);
    const { realm, error } = await loadCloudRealm();

    if (error) {
      setMessage(error);
    } else if (!realm) {
      setMessage("No cloud realm save found yet.");
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(realm));
      setMessage("Cloud realm loaded onto this device.");
    }

    setBusy(false);
  }

  async function handleSignOut() {
    setBusy(true);
    const { error } = await signOut();
    setMessage(error || "Signed out.");
    setBusy(false);
  }

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <nav className="mx-auto flex max-w-5xl items-center justify-between border-b border-[rgba(196,193,184,0.14)] pb-4">
        <Link href="/" className="gok-brand text-xl">Game of Kings</Link>
        <div className="flex gap-3">
          <Link href="/house" className="gok-nav-link">House</Link>
          <Link href="/map" className="gok-nav-link">Map</Link>
        </div>
      </nav>

      <section className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Realm Account</p>
          <h1 className="mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Save your house.
          </h1>
          <p className="gok-copy mt-4 text-sm leading-6">
            Sign in to keep your castle, house, gold, renown, sigil, and event progress across devices.
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
                    <option>Lord</option>
                    <option>Lady</option>
                    <option>King</option>
                    <option>Queen</option>
                    <option>Ser</option>
                  </select>
                  <input
                    value={rulerName}
                    onChange={(event) => setRulerName(event.target.value)}
                    placeholder="Ruler name"
                    className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                    required
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
                <p className="mt-2 text-xl text-[var(--gok-silver)]">{user.email}</p>
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
                  <option>Lord</option>
                  <option>Lady</option>
                  <option>King</option>
                  <option>Queen</option>
                  <option>Ser</option>
                </select>
                <input
                  value={rulerName}
                  onChange={(event) => setRulerName(event.target.value)}
                  placeholder="Ruler name"
                  className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
                  required
                />
                <button disabled={busy} className="gok-btn min-h-12 px-4 py-3 disabled:opacity-50 md:col-span-3">
                  Save Profile
                </button>
              </form>

              <div className="grid gap-3 md:grid-cols-3">
                <button onClick={saveLocalToCloud} disabled={busy} className="gok-btn gok-btn-blood min-h-12 px-4 py-3 disabled:opacity-50">
                  Save Realm To Account
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
      </section>
    </main>
  );
}
