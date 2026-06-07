"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

const STORAGE_KEY = "game_of_kings_living_realm";
const DAY_MS = 24 * 60 * 60 * 1000;

const tournaments = [
  { id: "royal-joust", name: "King's Landing Royal Joust", type: "Jousting", entryGold: 75, prizeGold: 240, prizeRenown: 45, startsInDays: 2 },
  { id: "winterfell-archery", name: "Winterfell Archery Championship", type: "Archery", entryGold: 45, prizeGold: 150, prizeRenown: 32, startsInDays: 4 },
  { id: "dragonstone-melee", name: "Dragonstone Grand Melee", type: "Melee", entryGold: 90, prizeGold: 300, prizeRenown: 58, startsInDays: 6 },
  { id: "blackwater-naval", name: "Blackwater Naval Trial", type: "Naval Battle", entryGold: 110, prizeGold: 360, prizeRenown: 62, startsInDays: 8 },
  { id: "oldtown-lore-cup", name: "Oldtown Lore Cup", type: "Trivia Championship", entryGold: 35, prizeGold: 120, prizeRenown: 28, startsInDays: 3 },
];

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function houseName(realm) {
  return realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "Unfounded House";
}

export default function TournamentsPage() {
  const [realm, setRealm] = useState({});
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    setRealm(parsed);

    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
    });
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  function saveRealm(nextRealm) {
    setRealm(nextRealm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    saveCloudRealm(nextRealm);
  }

  function signUp(tournament) {
    if (!realm.houseName) {
      setMessage("Found your house before entering a tournament.");
      return;
    }

    const startsAt = now + tournament.startsInDays * DAY_MS;
    const signupKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
    const signups = realm.tournamentSignups || {};

    if (signups[signupKey]) {
      setMessage(`${houseName(realm)} is already registered for ${tournament.name}.`);
      return;
    }

    if ((realm.gold ?? 350) < tournament.entryGold) {
      setMessage(`You need ${tournament.entryGold} gold to enter ${tournament.name}.`);
      return;
    }

    saveRealm({
      ...realm,
      gold: (realm.gold ?? 350) - tournament.entryGold,
      tournamentSignups: {
        ...signups,
        [signupKey]: {
          tournament: tournament.name,
          type: tournament.type,
          house: houseName(realm),
          paidGold: tournament.entryGold,
          startsAt: new Date(startsAt).toISOString(),
          signedAt: new Date(now).toISOString(),
          status: "registered",
        },
      },
    });

    setMessage(`${houseName(realm)} has entered ${tournament.name}. Entry paid: ${tournament.entryGold} gold.`);
  }

  if (!now) {
    return <main className="gok-page min-h-screen text-stone-100" />;
  }

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[rgba(196,193,184,0.14)] pb-4">
        <Link href="/" className="gok-brand text-xl">Game of Kings</Link>
        <div className="flex gap-3">
          <Link href="/events" className="gok-nav-link">Events</Link>
          <Link href="/forum" className="gok-nav-link">Forum</Link>
          <Link href="/map" className="gok-nav-link">Map</Link>
        </div>
      </nav>

      <section className="mx-auto mt-6 max-w-7xl">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Tournament Grounds</p>
          <h1 className="relative z-10 mt-3 text-5xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Sign up for the next tournament.
          </h1>
          <p className="gok-copy relative z-10 mt-4 max-w-3xl text-sm leading-6">
            Pay the entry gold now. Results stay hidden until the event concludes. Brackets will be even-odds faceoffs when the full format is finalized.
          </p>
          <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">House: {houseName(realm)}</div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">Gold: {(realm.gold ?? 350).toLocaleString()}</div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">Renown: {(realm.renown ?? 0).toLocaleString()}</div>
          </div>
          {message && <p className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">{message}</p>}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {tournaments.map((tournament) => {
            const startsAt = now + tournament.startsInDays * DAY_MS;
            const signupKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
            const registered = realm.tournamentSignups?.[signupKey];

            return (
              <article key={tournament.id} className="gok-card p-5">
                <p className="relative z-10 text-xs font-black uppercase tracking-[0.25em] text-red-300">{tournament.type}</p>
                <h2 className="relative z-10 mt-2 text-2xl text-[var(--gok-silver)]">{tournament.name}</h2>
                <div className="relative z-10 mt-4 grid gap-2 text-sm text-[rgba(210,205,194,0.72)]">
                  <p>Registration closes when the herald begins the bracket.</p>
                  <p>Starts: {formatDate(startsAt)}</p>
                  <p>Entry: {tournament.entryGold} gold.</p>
                  <p>Prize: {tournament.prizeGold} gold and {tournament.prizeRenown} renown.</p>
                </div>
                <button
                  onClick={() => signUp(tournament)}
                  disabled={Boolean(registered) || (realm.gold ?? 350) < tournament.entryGold}
                  className="gok-btn gok-btn-blood relative z-10 mt-5 min-h-12 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {registered ? "Registered" : `Sign Up - ${tournament.entryGold} Gold`}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
