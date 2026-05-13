const castles = [
  { name: "Winterfell", top: "22%", left: "48%" },
  { name: "Castle Black", top: "8%", left: "50%" },
  { name: "White Harbor", top: "28%", left: "56%" },
  { name: "The Dreadfort", top: "20%", left: "58%" },
  { name: "Karhold", top: "14%", left: "66%" },

  { name: "Moat Cailin", top: "36%", left: "49%" },
  { name: "The Twins", top: "48%", left: "45%" },
  { name: "Riverrun", top: "54%", left: "43%" },
  { name: "Harrenhal", top: "58%", left: "49%" },
  { name: "The Eyrie", top: "49%", left: "58%" },

  { name: "Casterly Rock", top: "64%", left: "26%" },
  { name: "Lannisport", top: "66%", left: "29%" },
  { name: "Highgarden", top: "78%", left: "34%" },
  { name: "Oldtown", top: "88%", left: "30%" },

  { name: "Storm's End", top: "74%", left: "62%" },
  { name: "King's Landing", top: "66%", left: "56%" },
  { name: "Dragonstone", top: "63%", left: "66%" },

  { name: "Sunspear", top: "92%", left: "62%" },
  { name: "Yronwood", top: "86%", left: "54%" },

  { name: "Pyke", top: "54%", left: "12%" },
];

export default function MapPage() {
  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="absolute z-20 w-full p-6 flex justify-between items-center bg-black/70 backdrop-blur-sm border-b border-zinc-800">
        <h1 className="text-3xl font-bold tracking-[0.2em] text-zinc-200">
          WESTEROS
        </h1>

        <a
          href="/"
          className="border border-zinc-600 px-5 py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          Return Home
        </a>
      </div>

      {/* MAP */}
      <div className="relative w-full h-screen overflow-auto">

     
  <img
  src="/westeros-map.jpg"
  alt="Westeros Map"
  className="min-w-[1400px] w-full h-auto opacity-80"
/>

        {/* CASTLES */}
        {castles.map((castle) => (
          <button
            key={castle.name}
            className="absolute group"
            style={{
              top: castle.top,
              left: castle.left,
            }}
          >
            <div className="w-4 h-4 bg-red-700 rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition" />

            <div className="absolute left-6 top-[-6px] whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm border border-zinc-700 opacity-0 group-hover:opacity-100 transition">
              {castle.name}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}