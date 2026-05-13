"use client";

import { useState } from "react";

const locations = [
  {
    name: "Winterfell",
    region: "North",
    top: "26%",
    left: "50%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    description:
      "Ancient seat of House Stark and capital of the North.",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    top: "70%",
    left: "61%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital of the Seven Kingdoms.",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    top: "62%",
    left: "13%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
    description:
      "Seat of House Greyjoy.",
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 p-4">

        <h1 className="text-3xl font-black tracking-[0.25em] text-center">
          GAME OF KINGS
        </h1>

      </div>

      {/* MAP */}
      <div className="relative w-fit mx-auto pt-24 pb-20">

        <img
          src="/LONG-MAP.png"
          alt="Westeros Map"
          className="block w-auto max-w-none h-auto"
        />

        {/* MARKERS */}
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation(location)}
            className="absolute group hover:scale-125 transition"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-50%, -50%)",
            }}
          >

            <div className="w-4 h-4 bg-red-600 rounded-full border border-white shadow-lg animate-pulse" />

            <div className="absolute left-6 top-[-2px] whitespace-nowrap bg-black/90 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">
              {location.name}
            </div>

          </button>
        ))}

      </div>

      {/* POPUP */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-md w-full">

            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-6">

              <h2 className="text-3xl font-bold mb-2">
                {selectedLocation.name}
              </h2>

              <p className="text-zinc-400 mb-4">
                {selectedLocation.region}
              </p>

              <p className="text-zinc-300">
                {selectedLocation.description}
              </p>

              <button
                onClick={() => setSelectedLocation(null)}
                className="mt-6 w-full bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-bold"
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