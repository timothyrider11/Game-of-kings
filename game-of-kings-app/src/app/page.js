"use client";

import Link from "next/link";

const realmStats = [
  { label: "Active Houses", value: "128" },
  { label: "Castles Claimed", value: "37" },
  { label: "Aid Sent Today", value: "2.4k" },
  { label: "Realm Points", value: "91k" },
];

const livingSystems = [
  ["37 Castle Map", "Explore a full Westeros map with major castles, settlements, panels, stats, and galleries."],
  ["Real-Time Economy", "Gold and renown continue updating while upgrades, wars, and events stay timestamped."],
  ["Live Wars", "Campaigns resolve over time instead of waiting for manual turns."],
  ["Discussion Boards", "Create categories, threads, replies, upvotes, house forums, and media-linked posts."],
  ["Daily Quizzes", "Answer trivia for gold, renown, collectibles, and event momentum."],
  ["Tournaments", "Join melees, archery contests, naval battles, and trivia championships."],
  ["Artifacts", "Collect relics like legendary blades, royal seals, dragon eggs, and ancient crowns."],
];

const leaderboard = [
  { house: "House Ashford", role: "Most Helpful", points: "12,840" },
  { house: "House Thornwake", role: "Best Defenders", points: "10,410" },
  { house: "House Ironvale", role: "Army Builder", points: "9,775" },
  { house: "House Rider", role: "Rising House", points: "8,120" },
];

const activities = [
  "House Ashford sent grain to a northern ally.",
  "Three new houses joined the Crownlands watch.",
  "A border skirmish ended with both sides signing a truce.",
  "The Riverlands awarded bonus points for scouting reports.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <section className="relative min-h-[92vh] overflow-hidden border-b border-stone-800">
        <img
          src="/LONG-MAP.png"
          alt="The realm map"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(146,64,14,0.28),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.42),#070707_88%)]" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            Game of Kings
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="#realm-life"
              className="hidden text-sm font-bold text-stone-300 hover:text-amber-200 sm:inline"
            >
              Realm Life
            </Link>
            <Link
              href="/map"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-amber-300"
            >
              Enter Realm
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-16 lg:grid-cols-[minmax(0,1fr)_390px] lg:pt-28">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
              A friendly realm strategy game
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-stone-50 md:text-7xl lg:text-8xl">
              Build your house. Help the realm. Grow your army.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-300">
              Game of Kings is a dark medieval realm where players control one castle, earn
              gold and renown by checking in, joining discussions, answering quizzes, and
              helping the realm, then use that progress to grow armies, collect artifacts,
              join tournaments, and shape the map together.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="rounded-md bg-amber-500 px-7 py-4 text-center text-lg font-black text-stone-950 transition hover:bg-amber-300"
              >
                Start Your House
              </Link>
              <a
                href="#realm-life"
                className="rounded-md border border-stone-600 bg-black/45 px-7 py-4 text-center text-lg font-black text-stone-100 transition hover:border-amber-300 hover:text-amber-200"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
              {realmStats.map((stat) => (
                <div key={stat.label} className="border border-stone-700 bg-black/55 p-4">
                  <p className="text-2xl font-black text-amber-300">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-stone-700 bg-black/70 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
                  Live Realm
                </p>
                <h2 className="mt-1 text-2xl font-black">Today&apos;s Activity</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
                Online
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {activities.map((activity) => (
                <p key={activity} className="border border-stone-800 bg-stone-950 p-3 text-sm text-stone-300">
                  {activity}
                </p>
              ))}
            </div>
            <Link
              href="/map"
              className="mt-5 block rounded-md bg-stone-100 px-5 py-3 text-center font-black text-stone-950 transition hover:bg-amber-300"
            >
              Clock In For Points
            </Link>
          </aside>
        </div>
      </section>

      <section id="realm-life" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
            Built for coming back
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-6xl">Small visits should still matter.</h2>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Players can browse the realm, read what happened, send aid, complete quick duties,
            and earn points even when they do not have time for a full battle.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Feature title="Daily Check-Ins" detail="Clock in, collect gold and renown, and keep your house visible." />
          <Feature title="Community Play" detail="Earn reputation through forums, replies, votes, quizzes, and events." />
          <Feature title="Army Growth" detail="Spend gold on troops, upgrades, tournaments, ships, and future market purchases." />
        </div>
      </section>

      <section className="border-y border-stone-800 bg-stone-950 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
              Living Systems
            </p>
            <h2 className="mt-3 text-4xl font-black">A world that keeps moving.</h2>
            <p className="mt-4 leading-7 text-stone-300">
              There are no player turns now. The realm runs continuously with timestamped
              actions, live wars, castle upgrades, economy updates, forums, quizzes, and events.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {livingSystems.map(([name, detail]) => (
              <div key={name} className="border border-stone-800 bg-black p-5">
                <h3 className="text-xl font-black text-stone-100">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
            Leaderboard
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-6xl">Win by being useful.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            The best houses are not only the strongest armies. Helpful houses can rise through
            aid, activity, scouting, and steady realm service.
          </p>
          <Link
            href="/map"
            className="mt-8 inline-block rounded-md bg-amber-500 px-7 py-4 font-black text-stone-950 transition hover:bg-amber-300"
          >
            Join The Board
          </Link>
        </div>

        <div className="border border-stone-700 bg-stone-950 p-5">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.house}
              className="flex items-center justify-between gap-4 border-b border-stone-800 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 font-black text-stone-950">
                  {index + 1}
                </span>
                <div>
                  <p className="font-black">{entry.house}</p>
                  <p className="text-sm text-stone-400">{entry.role}</p>
                </div>
              </div>
              <p className="font-black text-amber-300">{entry.points}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-800 px-5 py-10 text-center text-sm font-bold uppercase tracking-[0.22em] text-stone-500">
        Game of Kings - Realm Strategy Simulator
      </footer>
    </main>
  );
}

function Feature({ title, detail }) {
  return (
    <div className="border border-stone-800 bg-stone-950 p-6">
      <h3 className="text-2xl font-black text-stone-100">{title}</h3>
      <p className="mt-3 leading-7 text-stone-400">{detail}</p>
    </div>
  );
}
