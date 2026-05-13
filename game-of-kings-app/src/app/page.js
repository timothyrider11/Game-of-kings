export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-gradient-to-b from-black via-zinc-900 to-black">

        <h1 className="text-6xl md:text-8xl font-bold tracking-[0.3em] text-yellow-500 mb-6">
          GAME OF KINGS
        </h1>

        <p className="max-w-2xl text-zinc-300 text-lg md:text-2xl mb-8">
          Claim your castle. Forge your house. Conquer the realm.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-xl transition">
            Enter the Realm
          </button>

          <button className="border border-yellow-600 hover:bg-yellow-700/20 text-yellow-500 px-8 py-4 rounded-xl transition">
            View the Map
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 py-20 bg-zinc-950">

        {[
          {
            title: "Claim Castles",
            desc: "Begin your rise by taking control of a lesser stronghold.",
          },
          {
            title: "Create Your House",
            desc: "Forge your sigil, motto, banners and legacy.",
          },
          {
            title: "Wage War",
            desc: "Battle rival lords through strategy, alliances and conquest.",
          },
          {
            title: "Earn Glory",
            desc: "Win tournaments, discover relics and rise through the realm.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-black border border-yellow-700/30 rounded-2xl p-6 hover:border-yellow-500 transition"
          >
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">
              {item.title}
            </h2>

            <p className="text-zinc-400">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* REALM NEWS */}
      <section className="px-8 py-20 bg-black">
        <h2 className="text-4xl font-bold text-center text-yellow-500 mb-12">
          Realm News
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">

          {[
            "House Blackmont has conquered Old Anchor.",
            "The King has announced a grand tournament in King's Landing.",
            "Rumors spread of Valyrian steel discovered beyond the Wall.",
            "War banners rise in the Riverlands.",
          ].map((news, i) => (
            <div
              key={i}
              className="border border-zinc-800 bg-zinc-950 rounded-xl p-5"
            >
              <p className="text-zinc-300">{news}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}