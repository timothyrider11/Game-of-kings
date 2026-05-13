"use client";

import { useState } from "react";

export default function MapPage() {

  const locations = [
    {
      name: "Winterfell",
      top: "25%",
      left: "50%",
      color: "cyan",
    },

    {
      name: "King's Landing",
      top: "69%",
      left: "60%",
      color: "yellow",
    },

    {
      name: "Pyke",
      top: "61%",
      left: "13%",
      color: "zinc",
    },

    {
      name: "The Eyrie",
      top: "54%",
      left: "74%",
      color: "purple",
    },

    {
      name: "Highgarden",
      top: "84%",
      left: "32%",
      color: "green",
    },

    {
      name: "Sunspear",
      top: "94%",
      left: "88%",
      color: "orange",
    },
  ];

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const getMarkerClasses = (color) => {

    switch (color) {

      case "cyan":
        return "bg-cyan-400 shadow-cyan-400/90";

      case "yellow":
        return "bg-yellow-400 shadow-yellow-400/90";

      case "purple":
        return "bg-purple-400 shadow-purple-400/90";

      case "green":
        return "bg-green-400 shadow-green-400/90";

      case "orange":
        return "bg-orange-400 shadow-orange-400/90";

      case "zinc":
        return "bg-zinc-300 shadow-zinc-300/90";

      default:
        return "bg-red-500 shadow-red-500/90";
    }
  };

  return (
    <main className="bg-black min-h-screen overflow-hidden text-white">

      {/* HEADER */}

      <div className="fixed top-0 left-0 z-50 w-full bg-black/90 border-b border-zinc-800 px-6 py-4">

        <h1 className="text-3xl font-black tracking-[0.2em]">
          GAME OF KINGS
        </h1>

      </div>

      <div className="h-24" />

      {/* MAP */}

      <div className="w-full overflow-auto bg-black">

  <div
    className="relative mx-auto"
    style={{
      width: "1800px",
      height: "2600px",
    }}
  >

        <img
  src="/LONG-MAP.png"
  alt="Westeros"
  draggable={false}
  className="absolute top-0 left-0 w-full h-full object-fill select-none"
/>

        {locations.map((location) => (

          <button
            key={location.name}
            onClick={() =>
              setSelectedLocation(location)
            }
            className="absolute group"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-50%, -50%)",
            }}
          >

            <div
              className={`
                absolute inset-0 scale-[2.5]
                rounded-full blur-md opacity-80
                ${getMarkerClasses(location.color)}
              `}
            />

            <div
              className={`
                relative w-5 h-5 rounded-full
                border-2 border-white animate-pulse
                ${getMarkerClasses(location.color)}
              `}
            />

            <div className="absolute left-7 top-[-2px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>

        ))}

      </div>

      {/* POPUP */}

      {selectedLocation && (

        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6">

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-xl overflow-hidden">

            <div className="p-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-3xl font-black">
                  {selectedLocation.name}
                </h2>

                <button
                  onClick={() =>
                    setSelectedLocation(null)
                  }
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>

              </div>

              <p className="text-zinc-400">
                Canon stronghold of Westeros.
              </p>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}