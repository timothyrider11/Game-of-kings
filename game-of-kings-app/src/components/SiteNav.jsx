import Link from "next/link";

const navItems = [
  ["Map", "/map"],
  ["House", "/house"],
  ["Events", "/events"],
  ["Tournaments", "/tournaments"],
  ["Artifacts", "/artifacts"],
  ["Three Eyed Raven", "/three-eyed-raven"],
  ["Forum", "/forum"],
  ["Account", "/account"],
];

export default function SiteNav({ className = "" }) {
  return (
    <nav className={`border-b border-[rgba(196,193,184,0.14)] bg-black/88 px-4 py-4 text-stone-100 backdrop-blur ${className}`}>
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="gok-brand text-xl">
          Game of Kings
        </Link>
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
        </div>
      </div>
    </nav>
  );
}
