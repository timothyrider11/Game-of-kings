"use client";

import { useState } from "react";

const defaultLocations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: "12,400",
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
    troops: "20,000",
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
    troops: "2,500",
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
    troops: "6,700",
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
    troops: "9,200",
    owner: "AI Realm",
    status: "Controlled",
    top: "92.5%",
    left: "21.9%",
    image:
      "https://awoiaf.westeros.org/images/thumb/4/4f/Hightower.svg/500px-Hightower.svg.png",
    description:
      "Ancient city ruled by House Hightower.",
  },
];

export default function MapPage() {
  const [locations, setLocations] = useState(defaultLocations);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const claimCastle = () => {
    const updated = locations.map((location) => {
      if (location.name === selectedLocation.name) {
        return {
          ...location,
          owner: "Player Realm",
          ruler: "Your House",
          status: "Claimed",
        };
      }

      return location;
    });

    setLocations(updated);

    setSelectedLocation({
      ...selectedLocation,
      owner: "Player Realm",
      ruler: "Your House",
      status: "Claimed",
    });
  };

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-black tracking-[0.3em]">
            GAME OF KINGS
          </h1>

          <div className="hidden md:flex gap-5 text-sm text-zinc-400">

            <div>
              Holdings: <span className="text-green-400">5</span>
            </div>

            <div>
              Wars: <span className="text-red-400">2 Active</span>
            </div>

            <div>
              Realm Power: <span className="text-yellow-300">Stable</span>
            </div>

          </div>

        </div>

      </div>

      {/* MAP */}
      <div className="relative w-fit mx-auto pt-24 pb-20">

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          className="block w-auto max-w-none h-auto brightness-110 contrast-125 saturate-110"
        />

        {/* LOCATION MARKERS */}
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

            {/* MARKER */}
            <div
              className={`
                w-4 h-4 rounded-full border border-white shadow-lg animate-pulse

                ${
                  location.status === "Capital"
                    ? "bg-yellow-400 shadow-yellow-400/90"

                    : location.status === "Claimable"
                    ? "bg-purple-500 shadow-purple-500/90"

                    : location.status === "Claimed"
                    ? "bg-green-400 shadow-green-400/90"

                    : "bg-red-500 shadow-red-500/80"
                }
              `}
            />

            {/* LABEL */}
            <div className="absolute left-6 top-[-2px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>
        ))}

      </div>

      {/* POPUP */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl">

            {/* IMAGE */}
            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-72 object-cover"
            />

            {/* CONTENT */}
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
                    {selectedLocation.troops}
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

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4">

                {selectedLocation.status !== "Claimed" && (
                  <button
                    onClick={claimCastle}
                    className="bg-green-700 hover:bg-green-800 transition py-3 rounded-xl font-bold"
                  >
                    Claim Castle
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