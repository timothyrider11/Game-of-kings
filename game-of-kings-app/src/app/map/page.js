"use client";

import { useMemo, useState } from "react";

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

  {
    name: "Sun Spear",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7e/House_Martell.svg/545px-House_Martell.svg.png",
  },
];

const defaultLocations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: 12400,
    owner: "Northern Realm",
    status: "Controlled",
    top: "25.2%",
    left: "50.1%",
    color: "cyan",
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
    owner: "Crown Authority",
    status: "Capital",
    top: "69.7%",
    left: "60.7%",
    color: "yellow",
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
    color: "purple",
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
    owner: "Iron Fleet",
    status: "Controlled",
    top: "61.8%",
    left: "12.8%",
    color: "zinc",
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
    owner: "Reach Dominion",
    status: "Controlled",
    top: "92.5%",
    left: "21.9%",
    color: "green",
    image:
      "https://awoiaf.westeros.org/images/thumb/4/4f/Hightower.svg/500px-Hightower.svg.png",
    description:
      "Ancient city ruled by House Hightower.",
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
        };
      }

      return location;
    });

    setLocations(updated);

    setOwnedCastle(selectedLocation.name);

    setSelectedLocation({
      ...selectedLocation,
      owner: houseName,
      ruler: rulerName,
      status: "Lord Paramount",
      color: "emerald",
    });

    setWarLog((prev) => [
      `${rulerName} established ${houseName} at ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  /* SIEGE */

  const attackCastle = () => {

    if (ownedCastle) return;

    const playerPower = Math.floor(Math.random() * 18000) + 5000;

    const defenderPower = selectedLocation.troops;

    const victory = playerPower >= defenderPower;

    if (!victory) {

      setWarLog((prev) => [
        `${houseName} failed to conquer ${selectedLocation.name}.`,
        ...prev,
      ]);

      return;
    }

    const updated = locations.map((location) => {

      if (location.name === selectedLocation.name) {

        return {
          ...location,
          owner: houseName,
          ruler: rulerName,
          status: "Conquered",
          troops: Math.max(3000, playerPower - 2000),
          color: "emerald",
        };
      }

      return location;
    });

    setLocations(updated);

    setOwnedCastle(selectedLocation.name);

    const updatedLocation = updated.find(
      (location) => location.name === selectedLocation.name
    );

    setSelectedLocation(updatedLocation);

    setWarLog((prev) => [
      `${houseName} conquered ${selectedLocation.name}.`,
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

      case "yellow":
        return "bg-yellow-400 shadow-yellow-400/90";

      case "purple":
        return "bg-purple-500 shadow-purple-500/90";

      case "green":
        return "bg-green-500 shadow-green-500/90";

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

            <div className="text-zinc-400">
              Seat:
              <span className="ml-2 text-cyan-300 font-semibold">
                {ownedCastle || "Unlanded"}
              </span>
            </div>

            <div className="text-zinc-400">
              Troops:
              <span className="ml-2 text-red-400 font-semibold">
                {playerTroops.toLocaleString()}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* HOUSE PANEL */}
      <div className="max-w-7xl mx-auto pt-28 px-6">

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-black mb-5">
            Establish Your Noble House
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="House Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
            />

            <input
              value={rulerName}
              onChange={(e) => setRulerName(e.target.value)}
              placeholder="Ruler Name"
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
            />

          </div>

          {/* SIGILS */}
          <div>

            <h3 className="text-lg font-bold mb-4">
              Select Your Sigil
            </h3>

            <div className="flex flex-wrap gap-4">

              {sigils.map((sigil) => (

                <button
                  key={sigil.name}
                  onClick={() => setSelectedSigil(sigil)}
                  className={`
                    border rounded-2xl p-3 transition

                    ${
                      selectedSigil.name === sigil.name
                        ? "border-emerald-400 bg-emerald-500/10"
                        : "border-zinc-700 bg-black/40"
                    }
                  `}
                >

                  <img
                    src={sigil.image}
                    alt={sigil.name}
                    className="w-20 h-20 object-contain"
                  />

                  <p className="text-sm mt-2">
                    {sigil.name}
                  </p>

                </button>

              ))}

            </div>

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
            Realm Chronicle
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">

            {warLog.length === 0 && (
              <p className="text-zinc-500">
                No realm events yet.
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

              {/* ACTIONS */}
              <div className="grid grid-cols-3 gap-4">

                {!ownedCastle &&
                  selectedLocation.owner !== houseName && (
                    <>
                      <button
                        onClick={claimCastle}
                        className="bg-emerald-700 hover:bg-emerald-800 transition py-3 rounded-xl font-bold"
                      >
                        Claim
                      </button>

                      <button
                        onClick={attackCastle}
                        className="bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-bold"
                      >
                        Siege
                      </button>
                    </>
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