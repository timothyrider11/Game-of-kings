import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* BACKGROUND MAP */}
      <img
        src="/LONG-MAP.png"
        alt="Westeros"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">

        <h1 className="text-6xl md:text-8xl font-black tracking-[0.3em]">
          GAME OF KINGS
        </h1>

        <p className="mt-8 text-zinc-300 max-w-2xl text-lg md:text-2xl leading-relaxed">
          Claim castles. Forge alliances. Conquer Westeros.
        </p>

        {/* BUTTON */}
        <Link
          href="/map"
          className="mt-12 bg-red-700 hover:bg-red-800 transition px-10 py-5 rounded-2xl text-2xl font-bold shadow-lg"
        >
          Enter The Realm
        </Link>

      </div>

    </main>
  );
}