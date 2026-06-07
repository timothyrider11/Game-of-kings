"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RealmAudio from "../components/RealmAudio";
import { formatActivityTime, loadRealmActivity, readLocalActivities } from "../lib/realm-activity";

const STORAGE_KEY = "game_of_kings_living_realm";

const livingSystems = [
  ["37 Castle Map", "Explore a full Westeros map with major castles, settlements, panels, stats, and galleries."],
  ["Real-Time Economy", "Gold and renown continue updating while upgrades, wars, and events stay timestamped."],
  ["Live Wars", "Campaigns resolve over time instead of waiting for manual turns."],
  ["Discussion Boards", "Create categories, threads, replies, upvotes, house forums, and media-linked posts."],
  ["Daily Quizzes", "Answer trivia for gold, renown, collectibles, and event momentum."],
  ["Tournaments", "Join melees, archery contests, naval battles, and trivia championships."],
  ["Artifacts", "Collect relics like legendary blades, royal seals, dragon eggs, and ancient crowns."],
];

const mapNames = [
  ["White Harbor", "48%", "26%"],
  ["Oldcastle", "59%", "39%"],
  ["Heart's Home", "63%", "63%"],
  ["Eyrie", "61%", "73%"],
  ["Harrenhal", "52%", "88%"],
  ["Ramsgate", "70%", "18%"],
];

export default function HomePage() {
  const [realm, setRealm] = useState({});
  const [activities, setActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRealm(JSON.parse(stored));
      } catch {
        setRealm({});
      }
    }

    setActivities(readLocalActivities());
    loadRealmActivity(80).then(({ activities: loaded }) => setActivities(loaded));

    function refreshActivity() {
      setCurrentTime(Date.now());
      loadRealmActivity(80).then(({ activities: loaded }) => setActivities(loaded));
    }

    setCurrentTime(Date.now());
    window.addEventListener("gok:activity", refreshActivity);
    const timer = setInterval(refreshActivity, 60_000);
    return () => {
      window.removeEventListener("gok:activity", refreshActivity);
      clearInterval(timer);
    };
  }, []);

  const realmStats = useMemo(
    () => [
      { label: "Your House", value: realm.houseName ? `House ${realm.houseName}` : "Unfounded" },
      { label: "Gold", value: (realm.gold ?? 350).toLocaleString() },
      { label: "Renown", value: (realm.renown ?? 0).toLocaleString() },
      { label: "Logged Actions", value: activities.length.toLocaleString() },
    ],
    [activities.length, realm.gold, realm.houseName, realm.renown]
  );
  const recentActors = useMemo(() => {
    const cutoff = currentTime - 30 * 60 * 1000;
    return [...new Set(activities.filter((activity) => new Date(activity.createdAt).getTime() >= cutoff).map((activity) => activity.actor))]
      .filter(Boolean)
      .slice(0, 6);
  }, [activities, currentTime]);

  return (
    <main className="gok-page">
      <RealmAudio />
      <section className="gok-hero">
        <div className="gok-coast" />
        <div className="gok-map" />

        {mapNames.map(([name, left, top]) => (
          <span key={name} className="gok-map-name hidden md:block" style={{ left, top }}>
            {name}
          </span>
        ))}

        <nav className="relative z-10 mx-auto flex max-w-[1680px] flex-col items-start justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center md:px-10 lg:px-16">
          <Link href="/" className="gok-brand">
            Game of Kings
          </Link>

          <div className="flex items-center gap-5 md:gap-8">
            <Link href="/house" className="gok-nav-link hidden sm:inline">
              House
            </Link>
            <Link href="/events" className="gok-nav-link hidden sm:inline">
              Events
            </Link>
            <Link href="/tournaments" className="gok-nav-link hidden sm:inline">
              Tournaments
            </Link>
            <Link href="/forum" className="gok-nav-link hidden sm:inline">
              Forum
            </Link>
            <Link href="/account" className="gok-nav-link hidden sm:inline">
              Account
            </Link>
            <Link href="#realm-life" className="gok-nav-link hidden md:inline">
              Realm Life
            </Link>
            <Link href="/map" className="gok-btn px-3 py-3 text-xs md:px-8 md:text-sm">
              Enter Realm
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-[1420px] gap-10 px-5 pb-12 pt-16 md:px-10 md:pt-24 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-16 xl:pt-28">
          <div className="max-w-4xl">
            <p className="gok-eyebrow mb-6">A friendly realm strategy game</p>
            <h1 className="gok-title max-w-4xl text-4xl sm:text-6xl md:text-7xl xl:text-8xl">
              Build your house. Help the realm. Grow your army.
            </h1>

            <div className="gok-rule mt-6" />

            <p className="gok-copy mt-6 max-w-2xl text-base leading-8 md:text-lg">
              Game of Kings is a dark medieval realm where players control one castle, earn
              gold and renown by checking in, joining discussions, answering quizzes, and
              helping the realm, then use that progress to grow armies, collect artifacts,
              join tournaments, and shape the map together.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/house" className="gok-btn gok-btn-blood px-7 py-4 text-sm md:text-base">
                <span className="gok-shield" />
                Create Your House
              </Link>
              <a href="#realm-life" className="gok-btn px-7 py-4 text-sm md:text-base">
                <span className="gok-shield" />
                See How It Works
              </a>
            </div>
          </div>

          <aside className="gok-panel p-5 md:p-6 lg:mt-14">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="gok-eyebrow text-[0.68rem]">Live Realm</p>
                <h2 className="mt-4 text-3xl font-normal text-[var(--gok-silver)]">
                  Today&apos;s Activity
                </h2>
              </div>
              <span className="gok-status px-3 py-1 text-xs">Online</span>
            </div>

            <div className="gok-activity-scroll relative z-10 mt-6 border border-[rgba(196,193,184,0.13)]">
              {activities.length === 0 ? (
                <article className="border-b border-[rgba(196,193,184,0.1)] bg-black/25 p-4 text-sm leading-6 text-[rgba(210,205,194,0.78)]">
                  <p className="font-bold text-[var(--gok-silver)]">No realm activity yet.</p>
                  <p className="mt-1 text-[var(--gok-dim)]">Claim a castle, check in, post in the forum, or enter a tournament to write the first notice.</p>
                </article>
              ) : (
                activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="border-b border-[rgba(196,193,184,0.1)] bg-black/25 p-4 text-sm leading-6 text-[rgba(210,205,194,0.78)] last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-[var(--gok-silver)]">{activity.title}</p>
                      <span className="shrink-0 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--gok-dim)]">
                        {formatActivityTime(activity.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[var(--gok-parchment)]">{activity.actor}</p>
                    {activity.body && <p className="mt-1 text-[var(--gok-dim)]">{activity.body}</p>}
                  </article>
                ))
              )}
            </div>

            <Link href="/map" className="gok-btn relative z-10 mt-6 flex w-full px-5 py-4">
              <span className="gok-shield" />
              Clock In For Points
            </Link>

            <div className="relative z-10 mt-5 border border-[rgba(196,193,184,0.13)] bg-black/25 p-4">
              <p className="gok-eyebrow text-[0.62rem]">Who&apos;s In The Realm</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentActors.length === 0 ? (
                  <span className="text-sm text-[var(--gok-dim)]">No recent banners spotted.</span>
                ) : (
                  recentActors.map((actor) => (
                    <span key={actor} className="border border-[var(--gok-line)] bg-black/45 px-3 py-2 text-xs text-[var(--gok-parchment)]">
                      {actor}
                    </span>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="realm-life" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <p className="gok-eyebrow">Built for coming back</p>
          <h2 className="mt-4 text-4xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)] md:text-6xl">
            Small visits should still matter.
          </h2>
          <p className="gok-copy mt-5 text-lg leading-8">
            Players can browse the realm, read what happened, send aid, complete quick duties,
            and earn points even when they do not have time for a full battle.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature title="Daily Check-Ins" detail="Clock in, collect gold and renown, and keep your house visible." />
          <Feature title="Community Play" detail="Earn reputation through forums, replies, votes, quizzes, and events." />
          <Feature title="Army Growth" detail="Spend gold on troops, upgrades, tournaments, ships, and future market purchases." />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {realmStats.map((stat) => (
            <div key={stat.label} className="gok-card p-4">
              <p className="relative z-10 text-2xl font-normal text-[var(--gok-silver)] md:text-3xl">{stat.value}</p>
              <p className="relative z-10 mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--gok-dim)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[rgba(196,193,184,0.14)] bg-[#090a09] px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="gok-eyebrow">Living Systems</p>
            <h2 className="mt-4 text-4xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
              A world that keeps moving.
            </h2>
            <p className="gok-copy mt-5 leading-7">
              There are no player turns now. The realm runs continuously with timestamped
              actions, live wars, castle upgrades, economy updates, forums, quizzes, and events.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {livingSystems.map(([name, detail]) => (
              <div key={name} className="gok-card p-5">
                <h3 className="relative z-10 text-xl font-normal text-[var(--gok-silver)]">{name}</h3>
                <p className="relative z-10 mt-2 text-sm leading-6 text-[rgba(210,205,194,0.62)]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(196,193,184,0.14)] px-5 py-10 text-center text-sm uppercase tracking-[0.28em] text-[var(--gok-dim)]">
        Game of Kings - Realm Strategy Simulator
      </footer>
    </main>
  );
}

function Feature({ title, detail }) {
  return (
    <div className="gok-card p-6">
      <h3 className="relative z-10 text-2xl font-normal text-[var(--gok-silver)]">{title}</h3>
      <p className="relative z-10 mt-3 leading-7 text-[rgba(210,205,194,0.64)]">{detail}</p>
    </div>
  );
}
