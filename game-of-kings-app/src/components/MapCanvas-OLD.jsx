"use client";

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-black border-y border-zinc-900">

      <div className="absolute top-5 right-5 z-50 flex flex-col gap-3">

        <button
          onClick={zoomIn}
          className="bg-zinc-900 border border-zinc-700 w-12 h-12 rounded-xl text-2xl"
        >
          +
        </button>

        <button
          onClick={zoomOut}
          className="bg-zinc-900 border border-zinc-700 w-12 h-12 rounded-xl text-2xl"
        >
          −
        </button>

      </div>

      <div
        className="absolute cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >

        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          draggable={false}
          className="block select-none max-w-none w-[1800px]"
        />

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
    </div>
  );
