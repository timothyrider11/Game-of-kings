import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          className="w-full h-full object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

      </div>

      {/* ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,120,120,0.06),transparent_70%)]" />

      {/* CONTENT */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* TITLE */}
        <h1 className="text-6xl md:text-8xl font-black tracking-[0.35em] text-zinc-100 drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">

          GAME OF KINGS

        </h1>

        {/* SUBTITLE */}
        <p className="mt-8 max-w-2xl text-zinc-300 text-lg md:text-2xl leading-relaxed">

          Claim castles. Forge alliances. Conquer Westeros.
          Build your own noble house and rise through war,
          diplomacy, tournaments, and political power.

        </p>

        {/* BUTTONS */}
        <div className="mt-12 flex flex-col md:flex-row gap-5 z-30">

          {/* ENTER REALM */}
          <Link
            href="/map"
            className="relative z-40 rounded-2xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-md px-10 py-5 text-xl font-bold tracking-wide transition hover:border-zinc-400 hover:bg-zinc-800 hover:scale-105 cursor-pointer"
          >
            Enter The Realm
          </Link>

          {/* LORE BUTTON */}
          <button
            className="rounded-2xl border border-zinc-800 bg-black/50 px-10 py-5 text-xl font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            Realm Lore
          </button>

        </div>

        {/* REALM STATUS */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6">

            <h2 className="text-3xl font-black text-cyan-300">
              172
            </h2>

            <p className="mt-2 text-zinc-400">
              Claimable Holdings
            </p>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6">

            <h2 className="text-3xl font-black text-red-400">
              9
            </h2>

            <p className="mt-2 text-zinc-400">
              Great Kingdoms
            </p>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6">

            <h2 className="text-3xl font-black text-green-400">
              LIVE
            </h2>

            <p className="mt-2 text-zinc-400">
              Realm Conquest
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}