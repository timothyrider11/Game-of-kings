"use client";

import { useMemo, useState } from "react";

const defaultLocations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: 12400,
    owner: "AI Realm",
    status: "Controlled",
    top: "25.2%",
    left: "50.1%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    description:
      "Ancient seat of House Stark and capital of the North.",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    ruler: "The Iron Throne",
    troops: 20000,
    owner: "AI Realm",
    status: "Capital",
    top: "69.7%",
    left: "60.7%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital of the Seven Kingdoms.",
  },

  {
    name: "Dragonstone",
    region: "Crownlands",
    ruler: "Unclaimed",
    troops: 2500,
    owner: "None",
    status: "Claimable",
    top: "62.7%",
    left: "84.2%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/e/e7/Dragonstone.jpg",
    description:
      "Ancient island fortress of House Targaryen.",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    ruler: "House Greyjoy",
    troops: 6700,
    owner: "AI Realm",
    status: "Controlled",
    top: "61.8%",
    left: "12.8%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
    description:
      "Seat of House Greyjoy.",
  },

  {
    name: "Oldtown",
    region: "Reach",
    ruler: "House Hightower",
    troops: 9200,
    owner: "AI Realm",
    status: "Controlled",
    top: "92.5%",
    left: "21.9%",
    image:
      "https://awoiaf.westeros.org/images/thumb/4/4f/Hightower.svg/500px-Hightower.svg.png",
    description:
      "Ancient city ruled by House Hightower.",
  },

  {
    name: "Sunspear",
    region: "Dorne",
    ruler: "House Martell",
    troops: 10500,
    owner: "AI Realm",
    status: "Controlled",
    top: "95.4%",
    left: "83.6%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/52/Sunspear.jpg",
    description:
      "Capital of Dorne and seat of House Martell.",
  },
];

export default function MapPage() {

  const [locations, setLocations] = useState(defaultLocations);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [houseName, setHouseName] = useState("House Rider");

  const [rulerName, setRulerName] = useState("Lord Timothy");

  const [warLog, setWarLog] = useState([]);

  /* CLAIM CASTLE */

  const claimCastle = () => {

    const updated = locations.map((location) => {

      if (location.name === selectedLocation.name) {

        return {
          ...location,
          owner: houseName,
          ruler: rulerName,
          status: "Claimed",
        };
      }

      return location;
    });

    setLocations(updated);

    setSelectedLocation({
      ...selectedLocation,
      owner: houseName,
      ruler: rulerName,
      status: "Claimed",
    });

    setWarLog((prev) => [
      `${houseName} peacefully claimed ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  /* ATTACK CASTLE */

  const attackCastle = () => {

    const playerPower = Math.floor(Math.random() * 18000) + 5000;

    const defenderPower = selectedLocation.troops;

    const victory = playerPower >= defenderPower;

    const updated = locations.map((location) => {

      if (location.name === selectedLocation.name) {

        return {
          ...location,
          owner: victory ? houseName : location.owner,
          ruler: victory ? rulerName : location.ruler,
          status: victory ? "Conquered" : location.status,
          troops: victory
            ? Math.max(3000, playerPower - 2000)
            : location.troops,
        };
      }

      return location;
    });

    setLocations(updated);

    const updatedLocation = updated.find(
      (location) => location.name === selectedLocation.name
    );

    setSelectedLocation(updatedLocation);

    setWarLog((prev) => [
      victory
        ? `${houseName} conquered ${selectedLocation.name} with ${playerPower.toLocaleString()} troops.`
        : `${houseName} failed to conquer ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  /* REALM STATS */

  const playerCastles = useMemo(() => {
    return locations.filter(
      (location) => location.owner === houseName
    ).length;
  }, [locations, houseName]);

  const playerTroops = useMemo(() => {
    return locations
      .filter((location) => location.owner === houseName)
      .reduce((sum, location) => sum + location.troops, 0);
  }, [locations, houseName]);

  const powerRank = useMemo(() => {

    if (playerTroops >= 40000) return "Empire";
    if (playerTroops >= 25000) return "Dominant";
    if (playerTroops >= 12000) return "Rising";
    return "Minor House";

  }, [playerTroops]);

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-black tracking-[0.3em]">
            GAME OF KINGS
          </h1>

          <div className="hidden lg:flex gap-6 text-sm">

            <div className="text-zinc-400">
              Realm:
              <span className="ml-2 text-green-400 font-semibold">
                {houseName}
              </span>
            </div>

            <div className="text-zinc-400">
              Holdings:
              <span className="ml-2 text-cyan-300 font-semibold">
                {playerCastles}
              </span>
            </div>

            <div className="text-zinc-400">
              Troops:
              <span className="ml-2 text-red-400 font-semibold">
                {playerTroops.toLocaleString()}
              </span>
            </div>

            <div className="text-zinc-400">
              Rank:
              <span className="ml-2 text-yellow-300 font-semibold">
                {powerRank}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* HOUSE PANEL */}
      <div className="max-w-7xl mx-auto pt-28 px-6">

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-black mb-5">
            Forge Your Noble House
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="House Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />

            <input
              value={rulerName}
              onChange={(e) => setRulerName(e.target.value)}
              placeholder="Ruler Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />

          </div>

        </div>

      </div>

      {/* MAP */}
      <div className="relative w-fit mx-auto pb-20">

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          className="block w-auto max-w-none h-auto brightness-110 contrast-125 saturate-110"
        />

        {/* MARKERS */}
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation(location)}
            className="absolute group hover:scale-125 transition duration-300"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-48%, -52%)",
            }}
          >

            <div
              className={`
                w-4 h-4 rounded-full border border-white shadow-lg animate-pulse

                ${
                  location.status === "Capital"
                    ? "bg-yellow-400 shadow-yellow-400/90"

                    : location.owner === houseName
                    ? "bg-green-400 shadow-green-400/90"

                    : "bg-red-500 shadow-red-500/80"
                }
              `}
            />

            <div className="absolute left-6 top-[-2px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>
        ))}

      </div>

      {/* WAR LOG */}
      <div className="max-w-5xl mx-auto px-6 pb-16">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-2xl font-black mb-4">
            Realm War Chronicle
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">

            {warLog.length === 0 && (
              <p className="text-zinc-500">
                No wars fought yet.
              </p>
            )}

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

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl">

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

                <p className="text-zinc-400 mt-1">
                  {selectedLocation.region}
                </p>

              </div>

              <p className="text-zinc-300 leading-relaxed">
                {selectedLocation.description}
              </p>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-4">

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

                  <p className="text-zinc-500 text-sm">
                    Ruler
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedLocation.ruler}
                  </p>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

                  <p className="text-zinc-500 text-sm">
                    Troops
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedLocation.troops.toLocaleString()}
                  </p>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

                  <p className="text-zinc-500 text-sm">
                    Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedLocation.status}
                  </p>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

                  <p className="text-zinc-500 text-sm">
                    Owner
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedLocation.owner}
                  </p>

                </div>

              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-3 gap-4">

                {selectedLocation.owner !== houseName && (
                  <button
                    onClick={claimCastle}
                    className="bg-green-700 hover:bg-green-800 transition py-3 rounded-xl font-bold"
                  >
                    Claim
                  </button>
                )}

                {selectedLocation.owner !== houseName && (
                  <button
                    onClick={attackCastle}
                    className="bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-bold"
                  >
                    Siege
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