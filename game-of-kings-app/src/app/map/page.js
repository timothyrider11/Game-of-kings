"use client";

import { useState } from "react";

const locations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: "12,400",
    top: "26%",
    left: "50%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    description:
      "Ancient seat of House Stark and capital of the North.",
  },

  {
    name: "The Twins",
    region: "Riverlands",
    ruler: "House Frey",
    troops: "8,200",
    top: "55%",
    left: "49%",
    image:
      "https://awoiaf.westeros.org/images/thumb/0/01/House_Frey.svg/500px-House_Frey.svg.png",
    description:
      "Bridge fortress controlling the Green Fork crossing.",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    ruler: "House Greyjoy",
    troops: "6,500",
    top: "62%",
    left: "13%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
    description:
      "Seat of the Ironborn and stronghold of House Greyjoy.",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    ruler: "The Iron Throne",
    troops: "20,000",
    top: "70%",
    left: "61%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital of the Seven Kingdoms and home of the Iron Throne.",
  },

  {
    name: "The Eyrie",
    region: "Vale",
    ruler: "House Arryn",
    troops: "7,800",
    top: "51%",
    left: "69%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/f/f0/Eyrie_HBO.jpg",
    description:
      "Mountain fortress overlooking the Vale of Arryn.",
  },

  {
    name: "Horn Hill",
    region: "Reach",
    ruler: "House Tarly",
    troops: "5,300",
    top: "83%",
    left: "31%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/56/House_Tarly.svg/500px-House_Tarly.svg.png",
    description:
      "Military stronghold of House Tarly in the Reach.",
  },

  {
    name: "Skyreach",
    region: "Dorne",
    ruler: "House Fowler",
    troops: "4,100",
    top: "91%",
    left: "51%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/70/House_Fowler.svg/500px-House_Fowler.svg.png",
    description:
      "Ancient mountain keep guarding the Prince's Pass.",
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <main className="relative bg-black min-h-screen text-white overflow-hidden">

      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(80,80,80,0.08),transparent_70%)] pointer-events-none z-0" />

      {/* HEADER */}
      <header className="fixed top-0 left-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-zinc-800">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-3xl md:text-4xl font-black tracking-[0.3em] text-zinc-100">
            GAME OF KINGS
          </h1>

          <a
            href="/"
            className="border border-zinc-700 hover:border-zinc-400 hover:bg-zinc-900 transition px-5 py-2 rounded-xl"
          >
            Return Home
          </a>
        </div>
      </header>

      {/* MAP CONTAINER */}
      <div className="relative w-fit mx-auto pt-28 pb-20 z-10">

        {/* MAP */}
        <img
          src="/LONG-MAP.png"
          alt="Westeros Map"
          className="block w-auto max-w-none h-auto select-none brightness-110 contrast-125 saturate-110"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

        {/* LOCATION MARKERS */}
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation(location)}
            className="absolute group transition duration-300 hover:scale-125 hover:z-50"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-50%, -50%)",
            }}
          >

            {/* GLOWING MARKER */}
            <div
              className={`
                relative w-4 h-4 rounded-full border border-white shadow-lg animate-pulse

                ${
                  location.region === "North"
                    ? "bg-cyan-300 shadow-cyan-400/80"
                    : location.region === "Riverlands"
                    ? "bg-blue-400 shadow-blue-500/80"
                    : location.region === "Iron Islands"
                    ? "bg-zinc-300 shadow-zinc-300/80"
                    : location.region === "Vale"
                    ? "bg-sky-300 shadow-sky-300/80"
                    : location.region === "Reach"
                    ? "bg-green-500 shadow-green-500/80"
                    : location.region === "Dorne"
                    ? "bg-orange-500 shadow-orange-500/80"
                    : "bg-red-500 shadow-red-500/80"
                }
              `}
            />

            {/* HOVER LABEL */}
            <div className="absolute left-7 top-[-3px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>
        ))}
      </div>

      {/* POPUP */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-700 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl shadow-black/90">

            {/* IMAGE */}
            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-72 object-cover"
            />

            {/* CONTENT */}
            <div className="p-7 space-y-5">

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

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-sm">Ruling House</p>
                  <p className="text-lg font-semibold">
                    {selectedLocation.ruler}
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-500 text-sm">Army Strength</p>
                  <p className="text-lg font-semibold">
                    {selectedLocation.troops}
                  </p>
                </div>

              </div>

              {/* BUTTON */}
              <button
                onClick={() => setSelectedLocation(null)}
                className="w-full bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-bold tracking-wide"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}