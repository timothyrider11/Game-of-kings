"use client";

import Link from "next/link";

const factions = [
  {
    name: "House Stark",
    words: "Winter Is Coming",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7a/House_Stark.svg/545px-House_Stark.svg.png",
  },

  {
    name: "House Lannister",
    words: "Hear Me Roar",
    image:
      "https://awoiaf.westeros.org/images/thumb/c/c7/House_Lannister.svg/545px-House_Lannister.svg.png",
  },

  {
    name: "House Targaryen",
    words: "Fire and Blood",
    image:
      "https://awoiaf.westeros.org/images/thumb/9/9b/House_Targaryen.svg/545px-House_Targaryen.svg.png",
  },

  {
    name: "House Greyjoy",
    words: "We Do Not Sow",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/545px-House_Greyjoy.svg.png",
  },
];

export default function HomePage() {

  return (
    <main className="bg-black text-white overflow-hidden">

      {/* HERO SECTION */}

      <section className="relative h-screen flex items-center justify-center">

        {/* BACKGROUND IMAGE */}
        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6">

          <h1 className="text-6xl md:text-8xl font-black tracking-[0.3em] mb-6">

            GAME OF KINGS

          </h1>

          <p className="text-zinc-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-10">

            Forge your noble house.
            Claim legendary castles.
            Build armies.
            Form alliances.
            Dominate the Seven Kingdoms.

          </p>

          {/* ENTER BUTTON */}
          <Link href="/map">

            <button className="
bg-emerald-700
hover:bg-emerald-600
transition-all
duration-300
px-12
py-6
rounded-2xl
text-2xl
font-black
tracking-wider
shadow-[0_0_40px_rgba(16,185,129,0.5)]
hover:scale-110
">

              ENTER THE REALM

            </button>

          </Link>

        </div>

      </section>

      {/* FACTIONS */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-black mb-5">
            Great Houses of Westeros
          </h2>

          <p className="text-zinc-400 text-lg">
            Choose your alliances carefully.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {factions.map((faction) => (

            <div
              key={faction.name}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center hover:border-emerald-500 transition hover:scale-105"
            >

              <img
                src={faction.image}
                alt={faction.name}
                className="w-36 h-36 mx-auto object-contain mb-6"
              />

              <h3 className="text-2xl font-black mb-2">
                {faction.name}
              </h3>

              <p className="text-zinc-400 italic">
                "{faction.words}"
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* LORE SECTION */}

      <section className="relative py-32">

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-5xl font-black mb-10">
            The Realm Awaits
          </h2>

          <p className="text-zinc-300 text-xl leading-relaxed">

            Across Westeros, ancient rivalries awaken.
            Noble houses rise and fall through war,
            diplomacy, and ambition.

            Build your kingdom from a single castle into
            a legendary dynasty feared across the realm.

          </p>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-zinc-900 py-10 text-center text-zinc-500">

        GAME OF KINGS — Realm Strategy Simulator

{/* REALM NEWS */}

<section className="max-w-7xl mx-auto px-6 py-24">

  <div className="text-center mb-16">

    <h2 className="text-5xl font-black mb-4">
      Realm News
    </h2>

    <p className="text-zinc-400">
      The latest events from across Westeros
    </p>

  </div>

  <div className="grid lg:grid-cols-3 gap-8">

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h3 className="text-2xl font-black mb-4">
        Northern Unrest
      </h3>

      <p className="text-zinc-400">
        Scouts report increased activity beyond
        the Wall as rival houses prepare for war.
      </p>

    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h3 className="text-2xl font-black mb-4">
        Tournament Announced
      </h3>

      <p className="text-zinc-400">
        A grand tournament has been declared
        in King's Landing for all noble houses.
      </p>

    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h3 className="text-2xl font-black mb-4">
        New Alliances
      </h3>

      <p className="text-zinc-400">
        Political alliances continue to reshape
        the balance of power throughout the realm.
      </p>

    </div>

  </div>

</section>

{/* REALM STATS */}

<section className="bg-zinc-950 py-24">

  <div className="max-w-6xl mx-auto px-6">

    <div className="grid md:grid-cols-4 gap-8 text-center">

      <div>
        <h3 className="text-5xl font-black text-emerald-400">
          500+
        </h3>

        <p className="text-zinc-400 mt-2">
          Castles
        </p>
      </div>

      <div>
        <h3 className="text-5xl font-black text-cyan-400">
          9
        </h3>

        <p className="text-zinc-400 mt-2">
          Great Regions
        </p>
      </div>

      <div>
        <h3 className="text-5xl font-black text-yellow-400">
          100+
        </h3>

        <p className="text-zinc-400 mt-2">
          Noble Houses
        </p>
      </div>

      <div>
        <h3 className="text-5xl font-black text-red-400">
          Endless
        </h3>

        <p className="text-zinc-400 mt-2">
          Possibilities
        </p>
      </div>

    </div>

  </div>

</section>

      </footer>

    </main>
  );
}