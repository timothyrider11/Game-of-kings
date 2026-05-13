export default function Header({
  selectedSigil,
  houseName,
  gold,
  playerTroops,
  prestige,
  totalRealmPower,
}) {

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 backdrop-blur-md">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-4">

          <img
            src={selectedSigil.image}
            alt="Sigil"
            className="w-14 h-14 object-contain"
          />

          <div>

            <h1 className="text-3xl font-black tracking-[0.25em]">
              GAME OF KINGS
            </h1>

            <p className="text-zinc-400 text-sm">
              {houseName}
            </p>

          </div>

        </div>

        <div className="hidden xl:flex gap-6 text-sm">

          <div className="text-yellow-400 font-bold">
            Gold: {gold.toLocaleString()}
          </div>

          <div className="text-red-400 font-bold">
            Troops: {playerTroops.toLocaleString()}
          </div>

          <div className="text-cyan-300 font-bold">
            Prestige: {prestige}
          </div>

          <div className="text-emerald-400 font-bold">
            Realm Power: {totalRealmPower.toLocaleString()}
          </div>

        </div>

      </div>

    </div>
  );
}