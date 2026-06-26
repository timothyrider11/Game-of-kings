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

      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="gok-panel overflow-hidden">
          <div
            className="relative min-h-[180px] bg-cover bg-center px-6 py-8 sm:min-h-[230px] sm:px-10"
            style={{ backgroundImage: 'url("/banners/Artifacts.png")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
            <div className="relative z-10 max-w-3xl">
              <p className="gok-eyebrow text-red-200">Vault of the Realm</p>
              <h1 className="gok-title mt-4 text-5xl sm:text-7xl">Artifacts</h1>
              <p className="gok-copy mt-4 max-w-2xl text-sm leading-6 sm:text-base">
                Singular relics, remembered possessions, and rare trophies. Each artifact now has a visual seal until dedicated artwork is added.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="gok-panel p-5">
          <p className="gok-eyebrow">Your House Relics</p>
          <h1 className="mt-3 text-4xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Relic Ledger
          </h1>
          <p className="gok-copy mt-4 text-sm leading-6">
            Artifacts are cosmetic, lore-first, and singular. When you add dedicated relic images later, they can replace these illustrated vault seals.
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
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="gok-eyebrow">Ancient Book of Relics</p>
                <h2 className="mt-2 font-serif text-3xl font-black text-[var(--gok-silver)]">The Realm Vault</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--gok-dim)]">
                Claimed relics show their recorded possessor. Unclaimed relics remain sealed in the archive.
              </p>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
  const visual = getArtifactVisual(artifact);

  return (
    <article className={`group relative overflow-hidden border border-[var(--gok-line)] bg-black/45 ${compact ? "p-3" : "p-4"}`}>
      <div
        className={`relative overflow-hidden border border-[var(--gok-line)] bg-[#050505] ${
          compact ? "mb-3 aspect-[4/3]" : "mb-4 aspect-[16/10]"
        }`}
      >
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              `radial-gradient(circle at 50% 36%, ${visual.glow}, transparent 28%), radial-gradient(circle at 50% 88%, rgba(0,0,0,.86), transparent 42%), linear-gradient(145deg, #050505, ${visual.backdrop} 58%, #030303)`,
          }}
        />
        <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.05)_0_1px,transparent_1px_8px)]" />
        <div className="absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-[var(--gok-line-strong)] to-transparent" />
        <div className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-[var(--gok-line-strong)] to-transparent" />
        <ArtifactIllustration kind={visual.kind} compact={compact} accent={visual.accent} metal={visual.metal} />
        <div className="absolute left-3 top-3 rounded-none border border-[var(--gok-line)] bg-black/55 px-2 py-1 text-[0.56rem] font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">
          {visual.mark}
        </div>
      </div>

      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-red-300">{artifact.type}</p>
      <h2 className={`${compact ? "text-lg" : "text-2xl"} mt-2 font-serif font-black text-[var(--gok-silver)]`}>
        {artifact.name}
      </h2>
      {!compact && <p className="mt-3 text-sm leading-6 text-[rgba(210,205,194,0.66)]">{artifact.lore}</p>}
      <p className="mt-3 border-t border-[var(--gok-line)] pt-3 text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--gok-dim)]">
        {possessor ? `Possession of ${possessor}` : "Unclaimed"}
      </p>
    </article>
  );
}

function getArtifactVisual(artifact) {
  const text = `${artifact.name} ${artifact.type}`.toLowerCase();

  let kind = "seal";
  if (text.includes("sword") || text.includes("blade") || text.includes("dawn") || text.includes("longclaw") || text.includes("blackfyre") || text.includes("ice") || text.includes("needle") || text.includes("heartsbane")) kind = "sword";
  if (text.includes("crown")) kind = "crown";
  if (text.includes("egg")) kind = "egg";
  if (text.includes("horn")) kind = "horn";
  if (text.includes("book") || text.includes("scroll") || text.includes("contract") || text.includes("treaty") || text.includes("map")) kind = "scroll";
  if (text.includes("key")) kind = "key";
  if (text.includes("banner") || text.includes("standard") || text.includes("cloak") || text.includes("veil")) kind = "banner";
  if (text.includes("ring") || text.includes("pin") || text.includes("brooch") || text.includes("clasp") || text.includes("medal") || text.includes("charm") || text.includes("coin")) kind = "jewel";
  if (text.includes("hammer") || text.includes("axe") || text.includes("spear") || text.includes("arakh") || text.includes("warhammer") || text.includes("bow")) kind = "weapon";
  if (text.includes("candle") || text.includes("amulet") || text.includes("dragonglass") || text.includes("shadow")) kind = "arcane";
  if (text.includes("chair") || text.includes("throne") || text.includes("table") || text.includes("lantern") || text.includes("glass") || text.includes("lens")) kind = "relic";

  const palette = pickPalette(artifact.type);
  return {
    kind,
    mark: kind,
    ...palette,
  };
}

function pickPalette(type) {
  const lower = type.toLowerCase();
  if (lower.includes("valyrian") || lower.includes("steel") || lower.includes("blade")) {
    return { accent: "#c9d3d3", metal: "#d8d6cc", glow: "rgba(190,210,215,.32)", backdrop: "#111819" };
  }
  if (lower.includes("royal") || lower.includes("crown") || lower.includes("seal")) {
    return { accent: "#9a6d2f", metal: "#d0b36d", glow: "rgba(170,111,35,.32)", backdrop: "#171108" };
  }
  if (lower.includes("dornish") || lower.includes("sun") || lower.includes("faith")) {
    return { accent: "#7d2525", metal: "#c5a663", glow: "rgba(143,40,34,.30)", backdrop: "#170908" };
  }
  if (lower.includes("northern") || lower.includes("old gods") || lower.includes("watch")) {
    return { accent: "#87969a", metal: "#c5c2b8", glow: "rgba(140,160,166,.25)", backdrop: "#0c1214" };
  }
  if (lower.includes("ironborn") || lower.includes("sea")) {
    return { accent: "#2f6670", metal: "#9fb1ad", glow: "rgba(46,92,105,.28)", backdrop: "#071315" };
  }
  if (lower.includes("arcane") || lower.includes("magic") || lower.includes("mythic")) {
    return { accent: "#49355d", metal: "#b8bcc0", glow: "rgba(87,55,113,.34)", backdrop: "#0d0913" };
  }
  return { accent: "#5e1114", metal: "#beb9ad", glow: "rgba(145,132,108,.24)", backdrop: "#12100d" };
}

function ArtifactIllustration({ kind, compact, accent, metal }) {
  const sizeClass = compact ? "h-[76%] w-[76%]" : "h-[82%] w-[82%]";

  return (
    <svg
      aria-hidden="true"
      className={`absolute left-1/2 top-1/2 ${sizeClass} -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_22px_rgba(0,0,0,.7)] transition-transform duration-300 group-hover:scale-105`}
      viewBox="0 0 220 220"
      fill="none"
    >
      <defs>
        <linearGradient id={`metal-${kind}`} x1="45" y1="12" x2="176" y2="203" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff8df" stopOpacity="0.96" />
          <stop offset="0.45" stopColor={metal} stopOpacity="0.92" />
          <stop offset="1" stopColor="#4f504b" />
        </linearGradient>
        <linearGradient id={`accent-${kind}`} x1="40" y1="22" x2="180" y2="202" gradientUnits="userSpaceOnUse">
          <stop stopColor={accent} stopOpacity="0.95" />
          <stop offset="1" stopColor="#120607" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      <circle cx="110" cy="110" r="88" stroke={metal} strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="110" cy="110" r="66" stroke={accent} strokeOpacity="0.22" strokeWidth="1" />

      {kind === "sword" && (
        <>
          <path d="M118 18 104 122l8 42 14-42L118 18Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="4" />
          <path d="M76 145h75l13 15H63l13-15Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="4" />
          <path d="M104 160h18v37l-9 11-9-11v-37Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="4" />
        </>
      )}

      {kind === "weapon" && (
        <>
          <path d="M112 30v152" stroke={`url(#metal-${kind})`} strokeWidth="10" strokeLinecap="round" />
          <path d="M112 31c34 20 44 52 32 79-19-6-31-22-32-79Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="4" />
          <path d="M112 31c-34 20-44 52-32 79 19-6 31-22 32-79Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="4" />
          <circle cx="112" cy="184" r="12" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="4" />
        </>
      )}

      {kind === "crown" && (
        <>
          <path d="M47 128 63 70l31 42 18-58 22 58 31-42 12 58H47Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M54 130h115v30H54z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          {[64, 112, 160].map((x) => (
            <circle key={x} cx={x} cy={66} r="9" fill={accent} stroke="#050505" strokeWidth="3" />
          ))}
        </>
      )}

      {kind === "egg" && (
        <>
          <path d="M110 30c42 36 60 77 55 113-4 31-26 51-55 51s-51-20-55-51c-5-36 13-77 55-113Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M80 106c20-19 43-19 63 0M72 139c26-22 50-22 76 0M95 73c11-9 22-9 33 0" stroke={metal} strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {kind === "horn" && (
        <>
          <path d="M54 139c48-5 92-36 112-87 18 35 3 83-32 108-28 20-62 19-80-21Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M50 130c16 4 25 12 28 28l-21 14c-12-11-17-25-7-42Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M102 131c19-16 32-36 42-61" stroke={accent} strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {kind === "scroll" && (
        <>
          <path d="M54 53h104c13 0 22 10 22 22v91H66c-14 0-24-10-24-24V65c0-7 5-12 12-12Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M154 53c-14 4-20 14-20 29v86" stroke={accent} strokeWidth="7" />
          <path d="M70 89h45M70 111h70M70 133h50" stroke="#181512" strokeOpacity=".62" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {kind === "key" && (
        <>
          <circle cx="80" cy="82" r="31" fill="none" stroke={`url(#metal-${kind})`} strokeWidth="14" />
          <path d="M104 104 169 169" stroke={`url(#metal-${kind})`} strokeWidth="16" strokeLinecap="round" />
          <path d="M142 143h29M154 155h25" stroke={accent} strokeWidth="11" strokeLinecap="round" />
        </>
      )}

      {kind === "banner" && (
        <>
          <path d="M74 35v157" stroke={`url(#metal-${kind})`} strokeWidth="9" strokeLinecap="round" />
          <path d="M82 45h78v96l-39-20-39 20V45Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M101 68h39M101 91h26" stroke={metal} strokeOpacity=".62" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {kind === "jewel" && (
        <>
          <path d="M110 36 166 73l-21 83-35 31-35-31-21-83 56-37Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M55 74h110M75 156l35-120 35 120M78 76l32 111 32-111" stroke={metal} strokeOpacity=".55" strokeWidth="4" />
        </>
      )}

      {kind === "arcane" && (
        <>
          <path d="M110 30 135 90 200 99 153 141 165 204 110 171 55 204 67 141 20 99 85 90 110 30Z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <circle cx="110" cy="116" r="34" fill="none" stroke={metal} strokeOpacity=".68" strokeWidth="6" />
          <path d="M110 82v68M76 116h68" stroke={metal} strokeOpacity=".68" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {kind === "relic" && (
        <>
          <path d="M63 64h94v109H63z" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M77 50h66l14 14H63l14-14Z" fill={`url(#metal-${kind})`} stroke="#050505" strokeWidth="5" />
          <path d="M84 88h52v62H84z" fill="rgba(0,0,0,.32)" stroke={metal} strokeOpacity=".5" strokeWidth="4" />
          <path d="M97 102h26M97 119h26M97 136h26" stroke={metal} strokeOpacity=".52" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {kind === "seal" && (
        <>
          <circle cx="110" cy="110" r="54" fill={`url(#accent-${kind})`} stroke="#050505" strokeWidth="5" />
          <circle cx="110" cy="110" r="35" fill="rgba(0,0,0,.22)" stroke={metal} strokeOpacity=".7" strokeWidth="5" />
          <path d="M110 71v78M80 110h60" stroke={metal} strokeOpacity=".72" strokeWidth="6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
