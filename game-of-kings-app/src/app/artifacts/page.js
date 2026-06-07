"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { artifactCatalog } from "../../lib/artifacts";
import { loadRealmActivity } from "../../lib/realm-activity";

function buildPossessionLedger(activities) {
  return activities.reduce((ledger, activity) => {
    const artifact = activity.meta?.artifact || activity.meta?.rareArtifact;
    if (!artifact || ledger[artifact]) return ledger;

    return {
      ...ledger,
      [artifact]: activity.actor || "An unknown house",
    };
  }, {});
}

export default function ArtifactsPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadRealmActivity(300).then(({ activities: loaded }) => setActivities(loaded));
  }, []);

  const possessionLedger = useMemo(() => buildPossessionLedger(activities), [activities]);
  const possessedCount = Object.keys(possessionLedger).length;

  return (
    <main className="min-h-screen bg-[#070504] px-4 py-6 text-[#2b2116]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[rgba(196,193,184,0.14)] pb-4 text-stone-100">
        <Link href="/" className="gok-brand text-xl">Game of Kings</Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Link href="/map" className="gok-nav-link">Map</Link>
          <Link href="/events" className="gok-nav-link">Events</Link>
          <Link href="/tournaments" className="gok-nav-link">Tournaments</Link>
          <Link href="/forum" className="gok-nav-link">Forum</Link>
        </div>
      </nav>

      <section className="mx-auto mt-6 max-w-7xl border border-[#4b3a25] bg-[#1a120b] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.72)]">
        <div className="grid overflow-hidden border border-[#7a6646] bg-[linear-gradient(90deg,#b69a68_0%,#ead9af_4%,#d3bd8e_48%,#8f7448_50%,#d1bb8d_52%,#ead7ab_96%,#a18454_100%)] md:grid-cols-[0.9fr_1.1fr]">
          <aside className="min-h-[520px] border-b border-[#8c744d] p-6 shadow-[inset_-18px_0_35px_rgba(57,35,16,0.28)] md:border-b-0 md:border-r md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#5c1d16]">Ancient Vault</p>
            <h1 className="mt-4 text-4xl uppercase tracking-[0.08em] text-[#2b2116] md:text-6xl">
              Artifacts of the Realm
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#493722] md:text-base">
              Every relic in this book is cosmetic, lore-first, and singular. Once one house uncovers a named artifact, the realm records it here as that house&apos;s possession.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="border border-[#8a7048] bg-[#e7d3a5]/60 p-4 shadow-[inset_0_0_18px_rgba(54,31,12,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6b1f17]">Known Relics</p>
                <p className="mt-1 text-3xl font-black text-[#2b2116]">{artifactCatalog.length}</p>
              </div>
              <div className="border border-[#8a7048] bg-[#e7d3a5]/60 p-4 shadow-[inset_0_0_18px_rgba(54,31,12,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6b1f17]">Possessed</p>
                <p className="mt-1 text-3xl font-black text-[#2b2116]">{possessedCount}</p>
              </div>
              <div className="border border-[#8a7048] bg-[#e7d3a5]/60 p-4 shadow-[inset_0_0_18px_rgba(54,31,12,0.18)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6b1f17]">Battle Effect</p>
                <p className="mt-1 text-3xl font-black text-[#2b2116]">None</p>
              </div>
            </div>
          </aside>

          <div className="max-h-[calc(100vh-150px)] min-h-[520px] overflow-y-auto p-5 shadow-[inset_18px_0_35px_rgba(57,35,16,0.22)] md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#5c1d16]">The Ledger</p>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {artifactCatalog.map((artifact, index) => {
                const possessor = possessionLedger[artifact.name];

                return (
                  <article
                    key={artifact.name}
                    className="border border-[#8a7048] bg-[#e9d5a7]/55 p-4 shadow-[inset_0_0_24px_rgba(73,45,18,0.18)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#6b1f17]">
                          {String(index + 1).padStart(3, "0")} / {artifact.type}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-[#2b2116]">{artifact.name}</h2>
                      </div>
                      <span className="shrink-0 border border-[#7c6240] bg-[#2b2116] px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#ead9af]">
                        Unique
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4c3a25]">{artifact.lore}</p>
                    <p className="mt-4 border-t border-[#9c8053] pt-3 text-xs font-black uppercase tracking-[0.18em] text-[#5c1d16]">
                      {possessor ? `Possession of ${possessor}` : "Unclaimed relic"}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
