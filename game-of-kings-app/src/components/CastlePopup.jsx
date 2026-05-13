export default function CastlePopup({
  selectedLocation,
  setSelectedLocation,
  ownedCastle,
  claimCastle,
  recruitTroops,
  upgradeCastle,
  formAlliance,
  houseName,
}) {

  if (!selectedLocation) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl">

        {/* IMAGE */}

        <img
          src={selectedLocation.image}
          alt={selectedLocation.name}
          className="w-full h-80 object-cover"
        />

        {/* CONTENT */}

        <div className="p-6 space-y-6">

          <div>

            <h2 className="text-5xl font-black">
              {selectedLocation.name}
            </h2>

            <p className="text-zinc-400 mt-2 text-lg">
              {selectedLocation.region}
            </p>

          </div>

          <p className="text-zinc-300 leading-relaxed text-lg">

            {selectedLocation.description}

          </p>

          {/* STATS */}

          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

              <p className="text-zinc-500 text-sm">
                Owner
              </p>

              <p className="text-xl font-bold mt-1">
                {selectedLocation.owner}
              </p>

            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

              <p className="text-zinc-500 text-sm">
                Troops
              </p>

              <p className="text-xl font-bold mt-1">
                {selectedLocation.troops.toLocaleString()}
              </p>

            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

              <p className="text-zinc-500 text-sm">
                Castle Level
              </p>

              <p className="text-xl font-bold mt-1">
                {selectedLocation.level}
              </p>

            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">

              <p className="text-zinc-500 text-sm">
                Income
              </p>

              <p className="text-xl font-bold mt-1">
                {selectedLocation.income} Gold
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="grid md:grid-cols-2 gap-4">

            {!ownedCastle && (
              <button
                onClick={claimCastle}
                className="bg-emerald-700 hover:bg-emerald-800 transition py-4 rounded-2xl font-black text-lg"
              >
                Claim Castle
              </button>
            )}

            <button
              onClick={formAlliance}
              className="bg-blue-700 hover:bg-blue-800 transition py-4 rounded-2xl font-black text-lg"
            >
              Form Alliance
            </button>

            {selectedLocation.owner === houseName && (
              <>
                <button
                  onClick={recruitTroops}
                  className="bg-red-700 hover:bg-red-800 transition py-4 rounded-2xl font-black text-lg"
                >
                  Recruit Troops
                </button>

                <button
                  onClick={upgradeCastle}
                  className="bg-yellow-700 hover:bg-yellow-800 transition py-4 rounded-2xl font-black text-lg"
                >
                  Upgrade Castle
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedLocation(null)}
              className="bg-zinc-800 hover:bg-zinc-700 transition py-4 rounded-2xl font-black text-lg"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}