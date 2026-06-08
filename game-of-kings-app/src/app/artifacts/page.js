"use client";

import { useEffect, useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";
import { artifactCatalog, staticArtifactPossessions } from "../../lib/artifacts";
import { loadRealmActivity } from "../../lib/realm-activity";
import { STORAGE_KEY } from "../../lib/realm-identity";

function buildPossessionLedger(activities) {
  return activities.reduce((ledger, activity) => {
    const artifact = activity.meta?.artifact || activity.meta?.rareArtifact;
    if (!artifact || ledger[artifact]) return ledger;

    return {
      ...ledger,
      [artifact]: activity.actor || "An unknown house",
    };
  }, { ...staticArtifactPossessions });
}

export default function ArtifactsPage() {
  const [activities, setActivities] = useState([]);
  const [realm] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    loadRealmActivity(300).then(({ activities: loaded }) => setActivities(loaded));
  }, []);

  const possessionLedger = useMemo(() => buildPossessionLedger(activities), [activities]);
  const playerArtifacts = useMemo(
    () => artifactCatalog.filter((artifact) => (realm.artifactInventory || []).includes(artifact.name)),
    [realm.artifactInventory]
  );
  const possessedCount = Object.keys(possessionLedger).length;

  return (
    <main className="min-h-screen bg-[#070504] text-stone-100">
      <SiteNav />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="gok-panel p-5">
          <p className="gok-eyebrow">Your House Relics</p>
          <h1 className="mt-3 text-4xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Artifacts
          </h1>
          <p className="gok-copy mt-4 text-sm leading-6">
            Artifacts are cosmetic, lore-first, and singular. The full vault stays compact until we add proper relic images.
          </p>
          <div className="mt-5 grid gap-3">
            <StatCard label="Your Artifacts" value={playerArtifacts.length} />
            <StatCard label="Known Relics" value={artifactCatalog.length} />
            <StatCard label="Possessed Realmwide" value={possessedCount} />
          </div>
        </aside>

        <div className="space-y-5">
          <section className="gok-panel p-5">
            <p className="gok-eyebrow">House Collection</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {playerArtifacts.length ? (
                playerArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.name} artifact={artifact} possessor={`House ${realm.houseName || "Unknown"}`} compact={false} />
                ))
              ) : (
                <div className="border border-[var(--gok-line)] bg-black/45 p-5 text-sm leading-6 text-[var(--gok-dim)]">
                  No artifacts in your house archive yet. Rare relics can come from special events, quests, battles, or giveaways.
                </div>
              )}
            </div>
          </section>

          <section className="gok-panel p-5">
            <p className="gok-eyebrow">Compact Realm Ledger</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {artifactCatalog.map((artifact) => (
                <ArtifactCard key={artifact.name} artifact={artifact} possessor={possessionLedger[artifact.name]} compact />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-[var(--gok-line)] bg-black/45 p-4">
      <p className="text-3xl font-black text-[var(--gok-silver)]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">{label}</p>
    </div>
  );
}

function ArtifactCard({ artifact, possessor, compact }) {
  return (
    <article className="border border-[var(--gok-line)] bg-black/45 p-4">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">{artifact.type}</p>
      <h2 className={`${compact ? "text-lg" : "text-2xl"} mt-2 font-serif font-black text-[var(--gok-silver)]`}>{artifact.name}</h2>
      {!compact && <p className="mt-3 text-sm leading-6 text-[rgba(210,205,194,0.66)]">{artifact.lore}</p>}
      <p className="mt-3 border-t border-[var(--gok-line)] pt-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--gok-dim)]">
        {possessor ? `Possession of ${possessor}` : "Unclaimed"}
      </p>
    </article>
  );
}
