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
      "Ancient seat of House Stark and the capital of the North.",
  },

  {
    name: "House Reed",
    region: "Riverlands",
    top: "44.8%",
    left: "44.5%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/70/House_Reed.svg/400px-House_Reed.svg.png",
    description:
      "Greywater Watch - rulers of the Neck.",
  },

  {
    name: "House Frey",
    region: "Riverlands",
    top: "55.2%",
    left: "49.3%",
    image:
      "https://awoiaf.westeros.org/images/thumb/0/01/House_Frey.svg/400px-House_Frey.svg.png",
    description:
      "The Twins - bridge keepers of the Trident.",
  },

  {
    name: "House Mallister",
    region: "Riverlands",
    top: "53%",
    left: "42%",
    image:
      "https://awoiaf.westeros.org/images/thumb/6/61/House_Mallister.svg/400px-House_Mallister.svg.png",
    description:
      "Seagard - defenders against Ironborn raids.",
  },

  {
    name: "House Corbray",
    region: "Riverlands",
    top: "51%",
    left: "68%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7d/House_Corbray.svg/400px-House_Corbray.svg.png",
    description:
      "Ancient Vale house wielding Lady Forlorn.",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    top: "70.3%",
    left: "61%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital city of Westeros and seat of the Iron Throne.",
  },

  {
    name: "House Greyjoy",
    region: "Iron Islands",
    top: "62%",
    left: "13%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/400px-House_Greyjoy.svg.png",
    description:
      "Pyke - rulers of the Iron Islands.",
  },

  {
    name: "House Tarth",
    region: "Stormlands",
    top: "72%",
    left: "79%",
    image:
      "https://awoiaf.westeros.org/images/thumb/0/05/House_Tarth.svg/400px-House_Tarth.svg.png",
    description:
      "Evenfall Hall on the Sapphire Isle.",
  },

  {
    name: "House Fowler",
    region: "Dorne",
    top: "91%",
    left: "51%",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/70/House_Fowler.svg/400px-House_Fowler.svg.png",
    description:
      "Skyreach - wardens of the Prince's Pass.",
  },

  {
    name: "House Blackbar",
    region: "Reach",
    top: "88%",
    left: "11%",
    image:
      "https://awoiaf.westeros.org/images/thumb/b/b9/House_Blackbar.svg/400px-House_Blackbar.svg.png",
    description:
      "Lords of Bandallon in the Reach.",
  },

  {
    name: "House Tarly",
    region: "Reach",
    top: "83%",
    left: "31%",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/56/House_Tarly.svg/400px-House_Tarly.svg.png",
    description:
      "Horn Hill - famed military house of the Reach.",
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      {/* HEADER */}

      <div className="fixed top-0 left-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">

        <h1 className="text-3xl font-bold tracking-[0.2em] text-zinc-100">
          GAME OF KINGS
        </h1>

        <a
          href="/"
          className="border border-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          Return Home
        </a>
      </div>

      {/* MAP */}

      <div className="relative w-fit mx-auto pt-24 pb-20">

        <img
  src="/LONG-MAP.png"
  alt="Westeros Map"
  className="block w-auto max-w-none h-auto select-none transition duration-700 hover:scale-[1.01]"
/>

        {/* LOCATION MARKERS */}

        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => setSelectedLocation(location)}
            className="absolute group"
            style={{
              top: location.top,
              left: location.left,
              transform: "translate(-45%, -55%)",
            }}
          >
            <div
  className={`
    w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse
    ${
      location.region === "North"
        ? "bg-cyan-400"
        : location.region === "Riverlands"
        ? "bg-blue-500"
        : location.region === "Westerlands"
        ? "bg-red-500"
        : location.region === "Reach"
        ? "bg-green-500"
        : location.region === "Stormlands"
        ? "bg-yellow-400"
        : location.region === "Dorne"
        ? "bg-orange-500"
        : location.region === "Vale"
        ? "bg-sky-300"
        : location.region === "Iron Islands"
        ? "bg-zinc-400"
        : "bg-purple-500"
    }
  `}
/>

            <div className="absolute left-7 top-[-2px] whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition">
              {location.name}
            </div>
          </button>
        ))}
      </div>

      {/* POPUP CARD */}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-700 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl shadow-black/80">

            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-6 relative">
              <div className="absolute inset-0 opacity-10 bg-center bg-contain bg-no-repeat pointer-events-none" />

              <h2 className="text-3xl font-bold mb-3">
                {selectedLocation.name}
              </h2>

              <p className="text-zinc-300 leading-relaxed">
                {selectedLocation.description}
              </p>

              <button
                onClick={() => setSelectedLocation(null)}
                className="mt-6 w-full bg-red-700 hover:bg-red-800 transition py-3 rounded-xl font-semibold"
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