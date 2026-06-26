"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import SigilMark from "./SigilMark";
import { formatDragonCountdown, getNextDragonEpisode } from "../lib/dragon-countdown";
import { STORAGE_KEY } from "../lib/realm-identity";

const navItems = [
  ["Map", "/map"],
  ["House", "/house"],
  ["Events", "/events"],
  ["Tournaments", "/tournaments"],
  ["Artifacts", "/artifacts"],
  ["Three Eyed Raven", "/three-eyed-raven"],
  ["Songs of War", "/songs-of-war"],
  ["Forum", "/forum"],
];

export default function SiteNav({ className = "" }) {
  const [realm, setRealm] = useState({});
  const [now, setNow] = useState(() => Date.now());
  const nextDragonEpisode = getNextDragonEpisode(now);
  const nextDragonEpisodeTime = nextDragonEpisode ? new Date(nextDragonEpisode.at).getTime() : null;
  const dragonCountdown = nextDragonEpisodeTime ? formatDragonCountdown(nextDragonEpisodeTime, now) : "Season complete";

  useEffect(() => {
    function loadRealm() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setRealm({});
        return;
      }
      try {
        setRealm(JSON.parse(stored));
      } catch {
        setRealm({});
      }
    }

    loadRealm();
    window.addEventListener("storage", loadRealm);
    window.addEventListener("gok:realm-cleared", loadRealm);
    return () => {
      window.removeEventListener("storage", loadRealm);
      window.removeEventListener("gok:realm-cleared", loadRealm);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className={`border-b border-[rgba(196,193,184,0.14)] bg-black/88 px-4 py-4 text-stone-100 backdrop-blur ${className}`}>
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href="/" className="gok-brand block text-xl">
            Game of Kings
          </Link>
          <div className="mt-2 w-fit border-y border-[rgba(196,193,184,0.18)] bg-black/40 px-3 py-1 font-serif text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--gok-silver)] shadow-[0_0_18px_rgba(120,16,22,0.18)]">
            <span className="text-red-300">Dragon Hour</span>
            <span className="mx-2 text-[var(--gok-dim)]">Episode {nextDragonEpisode?.episode || "-"}</span>
            <span>{dragonCountdown}</span>
          </div>
        </div>
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:pb-0">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 snap-start border border-[var(--gok-line)] bg-black/50 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--gok-dim)] transition hover:border-[var(--gok-line-strong)] hover:text-[var(--gok-silver)]"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/account"
            className="flex shrink-0 snap-start items-center gap-2 border border-[var(--gok-line)] bg-black/60 px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--gok-dim)] transition hover:border-[var(--gok-line-strong)] hover:text-[var(--gok-silver)]"
          >
            {realm.houseSigil?.layers?.length ? (
              <span className="block h-9 w-8">
                <SigilMark sigil={realm.houseSigil} label={`${realm.houseName || "House"} sigil`} />
              </span>
            ) : realm.selectedKnightImage ? (
              <span className="gok-knight-frame block h-9 w-8">
                <img src={realm.selectedKnightImage} alt="" className="gok-knight-image h-full w-full object-cover grayscale" />
              </span>
            ) : (
              <span className="flex h-9 w-8 items-center justify-center border border-[rgba(196,193,184,0.2)] text-[var(--gok-silver)]">
                {(realm.rulerName || realm.houseName || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="max-w-32 truncate">{realm.rulerName || realm.houseName || "Account"}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
