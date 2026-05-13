"use client";

import { useState } from "react";

const locations = [
  {
    name: "Winterfell",
    region: "North",
    ruler: "House Stark",
    troops: "12,400",
    status: "Controlled",
    top: "25.2%",
    left: "50.1%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    description:
      "Ancient seat of House Stark and capital of the North.",
  },

  {
    name: "Castle Black",
    region: "North",
    ruler: "Night's Watch",
    troops: "4,800",
    status: "Controlled",
    top: "6.4%",
    left: "54.2%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/6/69/Castle_Black.jpg",
    description:
      "Primary stronghold of the Night's Watch.",
  },

  {
    name: "White Harbor",
    region: "North",
    ruler: "House Manderly",
    troops: "7,400",
    status: "Controlled",
    top: "37.5%",
    left: "58.1%",
    image:
      "https://awoiaf.westeros.org/images/thumb/2/2d/White_Harbor.jpg/800px-White_Harbor.jpg",
    description:
      "Major northern port ruled by House Manderly.",
  },

  {
    name: "Greywater Watch",
    region: "Neck",
    ruler: "House Reed",
    troops: "2,100",
    status: "Hidden",
    top: "45.1%",
    left: "45.1%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/70/House_Reed.svg/500px-House_Reed.svg.png",
    description:
      "Hidden moving fortress of House Reed.",
  },

  {
    name: "The Twins",
    region: "Riverlands",
    ruler: "House Frey",
    troops: "8,300",
    status: "Controlled",
    top: "54.4%",
    left: "48.9%",
    image:
      "https://awoiaf.westeros.org/images/thumb/0/01/House_Frey.svg/500px-House_Frey.svg.png",
    description:
      "Twin crossing fortress over the Green Fork.",
  },

  {
    name: "Seagard",
    region: "Riverlands",
    ruler: "House Mallister",
    troops: "5,900",
    status: "Controlled",
    top: "52.4%",
    left: "41.7%",
    image:
      "https://awoiaf.westeros.org/images/thumb/6/61/House_Mallister.svg/500px-House_Mallister.svg.png",
    description:
      "Stronghold guarding the western coast.",
  },

  {
    name: "The Eyrie",
    region: "Vale",
    ruler: "House Arryn",
    troops: "7,200",
    status: "Controlled",
    top: "50.4%",
    left: "68.7%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/f/f0/Eyrie_HBO.jpg",
    description:
      "Mountain fortress of House Arryn.",
  },

  {
    name: "Heart's Home",
    region: "Vale",
    ruler: "House Corbray",
    troops: "3,600",
    status: "Controlled",
    top: "49.1%",
    left: "72.2%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7d/House_Corbray.svg/500px-House_Corbray.svg.png",
    description:
      "Seat of House Corbray.",
  },

  {
    name: "Casterly Rock",
    region: "Westerlands",
    ruler: "House Lannister",
    troops: "15,000",
    status: "Controlled",
    top: "69.3%",
    left: "19.8%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/0/0e/Casterly_Rock.jpg",
    description:
      "Legendary fortress of House Lannister.",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    ruler: "House Greyjoy",
    troops: "6,700",
    status: "Controlled",
    top: "61.8%",
    left: "12.8%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
    description:
      "Seat of House Greyjoy.",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    ruler: "The Iron Throne",
    troops: "20,000",
    status: "Capital",
    top: "69.7%",
    left: "60.7%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital of the Seven Kingdoms.",
  },

  {
    name: "Dragonstone",
    region: "Crownlands",
    ruler: "Unclaimed",
    troops: "2,500",
    status: "Claimable",
    top: "62.7%",
    left: "84.2%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/e/e7/Dragonstone.jpg",
    description:
      "Ancient island fortress of House Targaryen.",
  },

  {
    name: "Horn Hill",
    region: "Reach",
    ruler: "House Tarly",
    troops: "5,800",
    status: "Controlled",
    top: "82.8%",
    left: "30.8%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/56/House_Tarly.svg/500px-House_Tarly.svg.png",
    description:
      "Military stronghold of House Tarly.",
  },

  {
    name: "Oldtown",
    region: "Reach",
    ruler: "House Hightower",
    troops: "9,200",
    status: "Controlled",
    top: "92.5%",
    left: "21.9%",
    image:
      "https://awoiaf.westeros.org/images/thumb/4/4f/Hightower.svg/500px-Hightower.svg.png",
    description:
      "Ancient city ruled by House Hightower.",
  },

  {
    name: "Evenfall Hall",
    region: "Stormlands",
    ruler: "House Tarth",
    troops: "3,900",
    status: "Controlled",
    top: "72.1%",
    left: "78.8%",
    image:
      "https://awoiaf.westeros.org/images/thumb/0/05/House_Tarth.svg/500px-House_Tarth.svg.png",
    description:
      "Seat of House Tarth on the Sapphire Isle.",
  },

  {
    name: "Skyreach",
    region: "Dorne",
    ruler: "House Fowler",
    troops: "4,200",
    status: "Controlled",
    top: "90.7%",
    left: "50.8%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/70/House_Fowler.svg/500px-House_Fowler.svg.png",
    description:
      "Mountain fortress guarding the Prince's Pass.",
  },

  {
    name: "Sunspear",
    region: "Dorne",
    ruler: "House Martell",
    troops: "10,500",
    status: "Controlled",
    top: "95.4%",
    left: "83.6%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/52/Sunspear.jpg",
    description:
      "Capital of Dorne and seat of House Martell.",
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black/80 border-b border-zinc-800 p-4 backdrop-blur-md">

        <h1 className="text-3xl font-black tracking-[0.25em] text-center">
          GAME OF KINGS
        </h1>

      </div>

      {/* MAP CONTAINER */}
      <div className="relative w-fit mx-auto pt-24 pb-20">

        {/* MAP IMAGE */}
        <img
          src="/LONG-MAP.png"
          alt="Westeros Map"
          className="block w-auto max-w-none h-auto brightness-110 contrast-125 saturate-110"
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

            {/* GLOWING MARKER */}
            <div
              className={`
                w-4 h-4 rounded-full border border-white shadow-lg animate-pulse

                ${
                  location.region === "North"
                    ? "bg-cyan-300 shadow-cyan-400/80"
                    : location.region === "Riverlands"
                    ? "bg-blue-500 shadow-blue-500/80"
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

            {/* LABEL */}
            <div className="absolute left-6 top-[-2px] whitespace-nowrap bg-black/90 border border-zinc-700 px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition">

              {location.name}

            </div>

          </button>
        ))}

      </div>

      {/* POPUP */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl">

            {/* IMAGE */}
            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-72 object-cover"
            />

            {/* CONTENT */}
            <div className="p-6">

              <h2 className="text-4xl font-black mb-2">
                {selectedLocation.name}
              </h2>

              <p className="text-zinc-400 mb-4">
                {selectedLocation.region}
              </p>

              <p className="text-zinc-300 leading-relaxed">
                {selectedLocation.description}
              </p>

              {/* CLOSE BUTTON */}
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