import Link from "next/link";
import { artifactCatalog } from "../../lib/artifacts";

export default function ArtifactsPage() {
  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[rgba(196,193,184,0.14)] pb-4">
        <Link href="/" className="gok-brand text-xl">Game of Kings</Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Link href="/map" className="gok-nav-link">Map</Link>
          <Link href="/events" className="gok-nav-link">Events</Link>
          <Link href="/tournaments" className="gok-nav-link">Tournaments</Link>
          <Link href="/forum" className="gok-nav-link">Forum</Link>
        </div>
      </nav>

      <section className="mx-auto mt-6 max-w-7xl">
        <div className="gok-panel p-5 md:p-7">
          <p className="gok-eyebrow">Relic Vault</p>
          <h1 className="relative z-10 mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)] md:text-6xl">
            Artifacts of the Realm
          </h1>
          <p className="gok-copy relative z-10 mt-4 max-w-3xl text-sm leading-6 md:text-base">
            Artifacts are cosmetic and lore-first treasures. Each named artifact can only be discovered once across the realm, making every relic a true house trophy.
          </p>
          <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gok-dim)]">Known Relics</p>
              <p className="mt-1 text-2xl text-[var(--gok-silver)]">{artifactCatalog.length}</p>
            </div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gok-dim)]">Battle Effect</p>
              <p className="mt-1 text-2xl text-[var(--gok-silver)]">None</p>
            </div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gok-dim)]">Realm Rule</p>
              <p className="mt-1 text-2xl text-[var(--gok-silver)]">Unique</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {artifactCatalog.map((artifact, index) => (
            <article key={artifact.name} className="gok-card p-4">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--gok-dim)]">
                    {String(index + 1).padStart(3, "0")} / {artifact.type}
                  </p>
                  <h2 className="mt-2 text-2xl text-[var(--gok-silver)]">{artifact.name}</h2>
                </div>
                <span className="shrink-0 border border-[var(--gok-line)] bg-black/50 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--gok-parchment)]">
                  Unique
                </span>
              </div>
              <p className="relative z-10 mt-3 text-sm leading-6 text-[rgba(210,205,194,0.72)]">
                {artifact.lore}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
