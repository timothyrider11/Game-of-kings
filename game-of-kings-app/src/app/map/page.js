"use client";

import { useEffect, useMemo, useState } from "react";

const sigils = [
  {
    name: "Direwolf",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7a/House_Stark.svg/545px-House_Stark.svg.png",
  },

  {
    name: "Lion",
    image:
      "https://awoiaf.westeros.org/images/thumb/c/c7/House_Lannister.svg/545px-House_Lannister.svg.png",
  },

  {
    name: "Dragon",
    image:
      "https://awoiaf.westeros.org/images/thumb/9/9b/House_Targaryen.svg/545px-House_Targaryen.svg.png",
  },

  {
    name: "Kraken",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/545px-House_Greyjoy.svg.png",
  },
];

const defaultLocations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: 12400,
    owner: "Northern Realm",
    level: 3,
    income: 350,
    diplomacy: "Neutral",
    status: "Controlled",
    top: "25.2%",
    left: "50.1%",
    color: "cyan",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
  },

  {
    name: "Dragonstone",
    region: "Crownlands",
    ruler: "Unclaimed",
    troops: 2500,
    owner: "None",
    level: 1,
    income: 150,
    diplomacy: "Neutral",
    status: "Claimable",
    top: "62.7%",
    left: "84.2%",
    color: "purple",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/e/e7/Dragonstone.jpg",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    ruler: "House Greyjoy",
    troops: 6700,
    owner: "Iron Fleet",
    level: 2,
    income: 260,
    diplomacy: "Hostile",
    status: "Controlled",
    top: "61.8%",
    left: "12.8%",
    color: "zinc",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
  },
];

export default function MapPage() {

  const [locations, setLocations] = useState(defaultLocations);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [houseName, setHouseName] = useState("House Rider");

  const [rulerName, setRulerName] = useState("Lord Timothy");

  const [ownedCastle, setOwnedCastle] = useState(null);

  const [warLog, setWarLog] = useState([]);

  const [selectedSigil, setSelectedSigil] = useState(sigils[0]);

  const [gold, setGold] = useState(1000);

  const [prestige, setPrestige] = useState(0);

  /* PASSIVE GOLD */

  useEffect(() => {

    const interval = setInterval(() => {

      const income = locations
        .filter((location) => location.owner === houseName)
        .reduce((sum, location) => sum + location.income, 0);

      if (income > 0) {
        setGold((prev) => prev + income);
      }

    }, 5000);

    return () => clearInterval(interval);

  }, [locations, houseName]);

  /* AI EVENTS */

  useEffect(() => {

    const interval = setInterval(() => {

      const randomEvents = [

        "Tensions rise in the Riverlands.",

        "Merchants arrive from Essos.",

        "A northern rebellion was quietly crushed.",

        "Rumors spread of a secret alliance.",

      ];

      const randomEvent =
        randomEvents[Math.floor(Math.random() * randomEvents.length)];

      setWarLog((prev) => [
        randomEvent,
        ...prev.slice(0, 24),
      ]);

    }, 12000);

    return () => clearInterval(interval);

  }, []);

  /* CLAIM */

  const claimCastle = () => {

    if (ownedCastle) return;

    const updated = locations.map((location) => {

      if (location.name === selectedLocation.name) {

        return {
          ...location,
          owner: houseName,
          ruler: rulerName,
          status: "Lord Paramount",
          color: "emerald",
          diplomacy: "Player Realm",
        };
      }

      return location;
    });

    setLocations(updated);

    setOwnedCastle(selectedLocation.name);

    setPrestige((prev) => prev + 100);

    setWarLog((prev) => [
      `${rulerName} established ${houseName} at ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  /* ALLIANCE */

  const formAlliance = () => {

    if (!selectedLocation) return;

    setWarLog((prev) => [
      `${houseName} formed an alliance with ${selectedLocation.owner}.`,
      ...prev,
    ]);

    setPrestige((prev) => prev + 50);
  };

  /* TOURNAMENT */

  const hostTournament = () => {

    if (gold < 500) return;

    setGold((prev) => prev - 500);

    const prestigeGain = Math.floor(Math.random() * 150) + 50;

    setPrestige((prev) => prev + prestigeGain);

    setWarLog((prev) => [
      `${houseName} hosted a grand tournament and gained ${prestigeGain} prestige.`,
      ...prev,
    ]);
  };

  /* RECRUIT */

  const recruitTroops = () => {

    if (gold < 300) return;

    const updated = locations.map((location) => {

      if (location.name === selectedLocation.name) {

        return {
          ...location,
          troops: location.troops + 1000,
        };
      }

      return location;
    });

    setLocations(updated);

    setGold((prev) => prev - 300);

    setWarLog((prev) => [
      `${houseName} recruited 1,000 soldiers.`,
      ...prev,
    ]);
  };

  /* STATS */

  const playerTroops = useMemo(() => {

    return locations
      .filter((location) => location.owner === houseName)
      .reduce((sum, location) => sum + location.troops, 0);

  }, [locations, houseName]);

  /* COLORS */

  const getMarkerClasses = (color) => {

    switch (color) {

      case "cyan":
        return "bg-cyan-400 shadow-cyan-400/90";

      case "purple":
        return "bg-purple-500 shadow-purple-500/90";

      case "emerald":
        return "bg-emerald-400 shadow-emerald-400/90";

      case "zinc":
        return "bg-zinc-300 shadow-zinc-300/90";

      default:
        return "bg-red-500 shadow-red-500/90";

    }

  };

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <img
              src={selectedSigil.image}
              alt="Sigil"
              className="w-14 h-14 object-contain"
            />

            <div>

              <h1 className="text-3xl font-black tracking-[0.3em]">
                GAME OF KINGS
              </h1>

              <p className="text-zinc-400 text-sm">
                {houseName}
              </p>

            </div>

          </div>

          <div className="hidden lg:flex gap-6 text-sm">

            <div className="text-yellow-400 font-bold">
              Gold: {gold.toLocaleString()}
            </div>

            <div className="text-red-400 font-bold">
              Troops: {playerTroops.toLocaleString()}
            </div>

            <div className="text-cyan-300 font-bold">
              Prestige: {prestige}
            </div>

          </div>

        </div>

      </div>

      {/* CONTROLS */}
      <div className="max-w-7xl mx-auto pt-28 px-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="House Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
            />

            <input
              value={rulerName}
              onChange={(e) => setRulerName(e.target.value)}
              placeholder="Ruler Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3"
            />

          </div>

          {/* SIGILS */}
          <div className="flex flex-wrap gap-4 mb-6">

            {sigils.map((sigil) => (

              <button
                key={sigil.name}
                onClick={() => setSelectedSigil(sigil)}
                className={`
                  border rounded-2xl p-3 transition

                  ${
                    selectedSigil.name === sigil.name
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-zinc-700"
                  }
                `}
              >

                <img
                  src={sigil.image}
                  alt={sigil.name}
                  className="w-20 h-20 object-contain"
                />

              </button>

            ))}

          </div>

          {/* TOURNAMENT BUTTON */}
          <button
            onClick={hostTournament}
            className="bg-yellow-700 hover:bg-yellow-800 transition px-6 py-3 rounded-xl font-bold"
          >
            Host Tournament (-500 Gold)
          </button>

        </div>

      </div>

      {/* MAP */}
      <div className="relative w-fit mx-auto pb-20">

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          className="block w-auto max-w-none h-auto brightness-110 contrast-125"
        />

        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation(location)}
            className="absolute group hover:scale-125 transition"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-48%, -52%)",
            }}
          >

            <div
              className={`
                absolute inset-0 scale-[2.4] rounded-full blur-md opacity-70
                ${getMarkerClasses(location.color)}
              `}
            />

            <div
              className={`
                relative w-4 h-4 rounded-full border border-white shadow-2xl animate-pulse
                ${getMarkerClasses(location.color)}
              `}
            />

          </button>
        ))}

      </div>

      {/* CHRONICLE */}
      <div className="max-w-5xl mx-auto px-6 pb-16">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-black mb-4">
            Realm Chronicle
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">

            {warLog.map((entry, index) => (
              <div
                key={index}
                className="border border-zinc-800 bg-black/50 rounded-xl p-3 text-zinc-300"
              >
                {entry}
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* POPUP */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-xl w-full">

            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-72 object-cover"
            />

            <div className="p-6 space-y-5">

              <div>

                <h2 className="text-4xl font-black">
                  {selectedLocation.name}
                </h2>

                <p className="text-zinc-400">
                  {selectedLocation.region}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-sm">Troops</p>
                  <p className="mt-1 font-semibold">
                    {selectedLocation.troops.toLocaleString()}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-sm">Diplomacy</p>
                  <p className="mt-1 font-semibold">
                    {selectedLocation.diplomacy}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                {!ownedCastle && (
                  <button
                    onClick={claimCastle}
                    className="bg-emerald-700 hover:bg-emerald-800 transition py-3 rounded-xl font-bold"
                  >
                    Claim Castle
                  </button>
                )}

                <button
                  onClick={formAlliance}
                  className="bg-blue-700 hover:bg-blue-800 transition py-3 rounded-xl font-bold"
                >
                  Form Alliance
                </button>

                {selectedLocation.owner === houseName && (
                  <button
                    onClick={recruitTroops}
                    className="bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-bold"
                  >
                    Recruit Troops
                  </button>
                )}

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 transition py-3 rounded-xl font-bold"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}