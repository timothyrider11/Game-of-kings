export default function RealmStats({
  houseName,
  playerTroops,
  prestige,
  gold,
  totalRealmPower,
  ownedCastle,
  forumPoints,
}) {

  const leaderboard = [

    {
      name: houseName,
      power: totalRealmPower,
      troops: playerTroops,
      prestige,
      gold,
    },

    {
      name: "House Stark",
      power: 182000,
      troops: 42000,
      prestige: 8000,
      gold: 12000,
    },

    {
      name: "House Lannister",
      power: 215000,
      troops: 38000,
      prestige: 12000,
      gold: 24000,
    },

    {
      name: "House Targaryen",
      power: 270000,
      troops: 52000,
      prestige: 15000,
      gold: 18000,
    },

    {
      name: "House Greyjoy",
      power: 98000,
      troops: 21000,
      prestige: 3500,
      gold: 6000,
    },

  ].sort((a, b) => b.power - a.power);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-16">

      <div className="grid lg:grid-cols-3 gap-6">

        {/* REALM PANEL */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          <h2 className="text-3xl font-black mb-6">
            Realm Statistics
          </h2>

          <div className="space-y-4">

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Noble House
              </p>

              <p className="text-xl font-bold mt-1">
                {houseName}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Seat of Power
              </p>

              <p className="text-xl font-bold mt-1">
                {ownedCastle || "Unlanded"}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Total Troops
              </p>

              <p className="text-xl font-bold mt-1 text-red-400">
                {playerTroops.toLocaleString()}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Prestige
              </p>

              <p className="text-xl font-bold mt-1 text-cyan-300">
                {prestige.toLocaleString()}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Gold
              </p>

              <p className="text-xl font-bold mt-1 text-yellow-400">
                {gold.toLocaleString()}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Forum Influence
              </p>

              <p className="text-xl font-bold mt-1 text-emerald-400">
                {forumPoints}
              </p>

            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-500 text-sm">
                Realm Power
              </p>

              <p className="text-2xl font-black mt-1 text-purple-400">
                {totalRealmPower.toLocaleString()}
              </p>

            </div>

          </div>

        </div>

        {/* LEADERBOARD */}

        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          <h2 className="text-3xl font-black mb-6">
            Great Houses Leaderboard
          </h2>

          <div className="space-y-4">

            {leaderboard.map((house, index) => (

              <div
                key={house.name}
                className={`
                  rounded-2xl border p-5 flex justify-between items-center

                  ${
                    house.name === houseName
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-800 bg-black/40"
                  }
                `}
              >

                <div>

                  <div className="flex items-center gap-3">

                    <div className="text-2xl font-black text-zinc-500">
                      #{index + 1}
                    </div>

                    <div>

                      <h3 className="text-2xl font-black">
                        {house.name}
                      </h3>

                      <p className="text-zinc-500">
                        Realm Power: {house.power.toLocaleString()}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="hidden md:flex gap-8 text-right">

                  <div>

                    <p className="text-zinc-500 text-sm">
                      Troops
                    </p>

                    <p className="font-bold text-red-400">
                      {house.troops.toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-zinc-500 text-sm">
                      Prestige
                    </p>

                    <p className="font-bold text-cyan-300">
                      {house.prestige.toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-zinc-500 text-sm">
                      Gold
                    </p>

                    <p className="font-bold text-yellow-400">
                      {house.gold.toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}