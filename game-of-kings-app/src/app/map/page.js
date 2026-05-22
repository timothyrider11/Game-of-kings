"use client";

export default function MapPage() {
  function handleMapClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();

    const left =
      ((e.clientX - rect.left) / rect.width) * 100;

    const top =
      ((e.clientY - rect.top) / rect.height) * 100;

    alert(
      `top: "${top.toFixed(
        2
      )}%"\nleft: "${left.toFixed(2)}%"`
    );

    console.log(
      `top: "${top.toFixed(
        2
      )}%", left: "${left.toFixed(2)}%"`
    );
  }

  return (
    <main className="bg-black min-h-screen">

      <div className="fixed top-0 left-0 z-50 w-full bg-black/90 border-b border-zinc-800 px-6 py-4">
        <h1 className="text-3xl font-black text-white">
          GAME OF KINGS
        </h1>

        <p className="text-zinc-400 text-sm">
          Click anywhere on the map to get coordinates
        </p>
      </div>

      <div className="h-24" />

      <div className="w-full overflow-auto bg-black">

        <div
          className="relative mx-auto"
          style={{
            width: "1800px",
            height: "2600px",
          }}
          onClick={handleMapClick}
        >
          <img
            src="/LONG-MAP.png"
            alt="Westeros"
            draggable={false}
            className="absolute top-0 left-0 w-full h-full object-fill select-none"
          />
        </div>

      </div>

    </main>
  );
}