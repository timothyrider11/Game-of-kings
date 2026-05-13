"use client";

import { useState } from "react";

export default function MapCanvas({
  locations,
  setSelectedLocation,
  getMarkerClasses,
}) {

  const [scale, setScale] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);

  const [start, setStart] = useState({
    x: 0,
    y: 0,
  });

  /* =========================
     ZOOM
  ========================= */

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  /* =========================
     DRAGGING
  ========================= */

  const handleMouseDown = (e) => {

    setDragging(true);

    setStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });

  };

  const handleMouseMove = (e) => {

    if (!dragging) return;

    setPosition({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });

  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden border-y border-zinc-900 bg-black">

      {/* CONTROLS */}

      <div className="absolute top-5 right-5 z-50 flex flex-col gap-3">

        <button
          onClick={zoomIn}
          className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 transition w-12 h-12 rounded-xl text-2xl font-black"
        >
          +
        </button>

        <button
          onClick={zoomOut}
          className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 transition w-12 h-12 rounded-xl text-2xl font-black"
        >
          −
        </button>

      </div>

      {/* MAP CONTAINER */}

      <div
        className="absolute cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `
            translate(${position.x}px, ${position.y}px)
            scale(${scale})
          `,
          transformOrigin: "center center",
          transition: dragging
            ? "none"
            : "transform 0.15s ease-out",
        }}
      >

        {/* MAP */}

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          draggable={false}
          className="block select-none max-w-none w-[1800px] brightness-110 contrast-125"
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

            {/* OUTER GLOW */}

            <div
              className={`
                absolute inset-0 scale-[2.5] rounded-full blur-md opacity-80
                ${getMarkerClasses(location.color)}
              `}
            />

            {/* MARKER */}

            <div
              className={`
                relative w-5 h-5 rounded-full border-2 border-white shadow-2xl animate-pulse
                ${getMarkerClasses(location.color)}
              `}
            />

            {/* LABEL */}

            <div className="absolute left-7 top-[-2px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>
        ))}

      </div>

      {/* HELP TEXT */}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 border border-zinc-800 px-5 py-2 rounded-xl text-sm text-zinc-400">

        Drag the map • Use + and − to zoom

      </div>

    </div>
  );
}