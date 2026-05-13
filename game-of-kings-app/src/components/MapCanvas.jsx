export default function MapCanvas({
  locations,
  setSelectedLocation,
  getMarkerClasses,
}) {

  return (
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
  );
}