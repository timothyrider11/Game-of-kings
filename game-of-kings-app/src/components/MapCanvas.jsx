"use client";

import { useState } from "react";

const locations = [
  {
    name: "Castle Black",
    top: "8%",
    left: "50%",
    color: "cyan",
  },
  {
    name: "Winterfell",
    top: "22%",
    left: "45%",
    color: "cyan",
  },
  {
    name: "White Harbor",
    top: "33%",
    left: "52%",
    color: "cyan",
  },
  {
    name: "The Twins",
    top: "49%",
    left: "39%",
    color: "yellow",
  },
  {
    name: "Riverrun",
    top: "57%",
    left: "35%",
    color: "yellow",
  },
  {
    name: "The Eyrie",
    top: "50%",
    left: "62%",
    color: "purple",
  },
  {
    name: "King's Landing",
    top: "67%",
    left: "55%",
    color: "orange",
  },
  {
    name: "Storm's End",
    top: "74%",
    left: "67%",
    color: "orange",
  },
  {
    name: "Highgarden",
    top: "77%",
    left: "28%",
    color: "green",
  },
  {
    name: "Oldtown",
    top: "85%",
    left: "24%",
    color: "green",
  },
  {
    name: "Sunspear",
    top: "95%",
    left: "72%",
    color: "red",
  },
];

export default function MapCanvas({ setSelectedLocation }) {
  const [scale, setScale] = useState(1);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

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

      default:
        return "bg-red-500 shadow-red-500/90";
    }
  };

  return (
    <div className="relative w-full h-[85vh] overflow-auto bg-[#f5e6b3] border-y border-zinc-700">

      <div className="absolute top-5 right-5 z-50 flex flex-col gap-3">

        <button
          onClick={zoomIn}
          className="bg-zinc-900 text-white border border-zinc-700 w-12 h-12 rounded-xl text-2xl"
        >
          +
        </button>

        <button
          onClick={zoomOut}
          className="bg-zinc-900 text-white border border-zinc-700 w-12 h-12 rounded-xl text-2xl"
        >
          −
        </button>

      </div>

      <div
        className="relative mx-auto"
        style={{
          width: "1066px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          draggable={false}
          className="block w-full select-none"
        />

        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation?.(location)}
            className="absolute group hover:scale-125 transition"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-50%, -50%)",
            }}
          >

            <div
              className={`absolute inset-0 scale-[2.5] rounded-full blur-md opacity-80 ${getMarkerClasses(
                location.color
              )}`}
            />

            <div
              className={`relative w-5 h-5 rounded-full border-2 border-white animate-pulse ${getMarkerClasses(
                location.color
              )}`}
            />

            <div className="absolute left-7 top-[-2px] whitespace-nowrap bg-black/90 text-white border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">
              {location.name}
            </div>

          </button>
        ))}

      </div>
    </div>
  );
}