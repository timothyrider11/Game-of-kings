const castles = [
  // THE WALL / NORTH
  { name: "Castle Black", top: "7%", left: "49%" },
  { name: "Winterfell", top: "21%", left: "48%" },
  { name: "White Harbor", top: "31%", left: "56%" },
  { name: "The Dreadfort", top: "20%", left: "56%" },
  { name: "Karhold", top: "15%", left: "65%" },
  { name: "Last Hearth", top: "16%", left: "59%" },
  { name: "Deepwood Motte", top: "24%", left: "37%" },
  { name: "Bear Island", top: "23%", left: "28%" },
  { name: "Moat Cailin", top: "38%", left: "48%" },

  // RIVERLANDS
  { name: "The Twins", top: "47%", left: "44%" },
  { name: "Riverrun", top: "55%", left: "42%" },
  { name: "Harrenhal", top: "58%", left: "49%" },
  { name: "Seagard", top: "50%", left: "36%" },

  // VALE
  { name: "The Eyrie", top: "47%", left: "59%" },
  { name: "Runestone", top: "46%", left: "64%" },
  { name: "Gulltown", top: "52%", left: "67%" },

  // WESTERLANDS
  { name: "Casterly Rock", top: "64%", left: "25%" },
  { name: "Lannisport", top: "66%", left: "28%" },
  { name: "Castamere", top: "60%", left: "31%" },

  // REACH
  { name: "Highgarden", top: "78%", left: "34%" },
  { name: "Oldtown", top: "89%", left: "30%" },
  { name: "Horn Hill", top: "82%", left: "38%" },
  { name: "Brightwater Keep", top: "80%", left: "28%" },

  // CROWNLANDS
  { name: "King's Landing", top: "66%", left: "56%" },
  { name: "Dragonstone", top: "63%", left: "66%" },
  { name: "Rosby", top: "64%", left: "54%" },
  { name: "Duskendale", top: "62%", left: "58%" },

  // STORMLANDS
  { name: "Storm's End", top: "75%", left: "63%" },
  { name: "Tarth", top: "77%", left: "70%" },

  // DORNE
  { name: "Sunspear", top: "92%", left: "62%" },
  { name: "Yronwood", top: "85%", left: "53%" },
  { name: "Starfall", top: "89%", left: "44%" },

  // IRON ISLANDS
  { name: "Pyke", top: "54%", left: "11%" },
  { name: "Harlaw", top: "56%", left: "14%" },
];

export default function MapPage() {
  return (
    <main className="min-w-[1400px] w-full h-auto opacity-90">

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
  src="/westeros-map.png"
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