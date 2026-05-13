"use client";

import { useState } from "react";

const locations = [
  {
    name: "Winterfell",
    top: "26%",
    left: "50%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    description:
      "Ancient seat of House Stark and the capital of the North.",
  },

  name: "House Reed",
  top: "44.8%",
  left: "44.5%",
  image: "/houses/reed.png",
  description: "Greywater Watch — rulers of the Neck."
},

{
  name: "House Frey",
  top: "55.2%",
  left: "49.3%",
  image: "/houses/frey.png",
  description: "The Twins — bridge keepers of the Trident."
},

{
  name: "House Mallister",
  top: "53%",
  left: "42%",
  image: "/houses/mallister.png",
  description: "Seagard — defenders against Ironborn raids."
},

{
  name: "House Corbray",
  top: "51%",
  left: "68%",
  image: "/houses/corbray.png",
  description: "Ancient Vale house wielding Lady Forlorn."
},

{
  name: "King's Landing",
  top: "70.3%",
  left: "61%",
  image: "/locations/kingslanding.jpg",
  description: "Capital of the Seven Kingdoms."
},

{
  name: "House Greyjoy",
  top: "62%",
  left: "13%",
  image: "/houses/greyjoy.png",
  description: "Pyke — rulers of the Iron Islands."
},

{
  name: "House Tarth",
  top: "72%",
  left: "79%",
  image: "/houses/tarth.png",
  description: "Evenfall Hall on the Sapphire Isle."
},

{
  name: "House Fowler",
  top: "91%",
  left: "51%",
  image: "/houses/fowler.png",
  description: "Skyreach — wardens of the Prince's Pass."
},

{
  name: "House Blackbar",
  top: "88%",
  left: "11%",
  image: "/houses/blackbar.png",
  description: "Lords of Bandallon in the Reach."
},

{
  name: "House Tarly",
  top: "83%",
  left: "31%",
  image: "/houses/tarly.png",
  description: "Horn Hill — famed military house of the Reach."
},

{
    name: "Castle Black",
    top: "8%",
    left: "55%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/6/69/Castle_Black.jpg",
    description:
      "Primary headquarters of the Night’s Watch at the Wall.",
  },

  {
    name: "White Harbor",
    top: "40%",
    left: "58%",
    image:
      "https://awoiaf.westeros.org/images/thumb/2/2d/White_Harbor.jpg/800px-White_Harbor.jpg",
    description:
      "Major northern port ruled by House Manderly.",
  },

  {
    name: "The Eyrie",
    top: "52%",
    left: "73%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/f/f0/Eyrie_HBO.jpg",
    description:
      "Mountain fortress of House Arryn in the Vale.",
  },

  {
    name: "Riverrun",
    top: "60%",
    left: "49%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/7/7b/Riverrun.jpg",
    description:
      "Seat of House Tully in the Riverlands.",
  },

  {
    name: "Casterly Rock",
    top: "70%",
    left: "21%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/0/0e/Casterly_Rock.jpg",
    description:
      "Legendary fortress and homeland of House Lannister.",
  },

  {
    name: "King's Landing",
    top: "72%",
    left: "64%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    description:
      "Capital city of Westeros and seat of the Iron Throne.",
  },

  {
    name: "Dragonstone",
    top: "62%",
    left: "86%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/e/e7/Dragonstone.jpg",
    description:
      "Ancient Targaryen island fortress.",
  },

  {
    name: "Highgarden",
    top: "84%",
    left: "35%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/7/73/Highgarden.jpg",
    description:
      "Beautiful castle of House Tyrell in the Reach.",
  },

  {
    name: "Oldtown",
    top: "94%",
    left: "22%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/0/09/Oldtown.jpg",
    description:
      "Oldest city in Westeros and home of the Citadel.",
  },

  {
    name: "Storm's End",
    top: "78%",
    left: "82%",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/e/e7/Storms_End.jpg",
    description:
      "Massive coastal fortress of House Baratheon.",
  },

  {
    name: "Sunspear",
    top: "96%",
    left: "86%",
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
  className="block w-auto max-w-none h-auto select-none"
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
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg animate-pulse" />

            <div className="absolute left-7 top-[-2px] whitespace-nowrap bg-black/80 px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition">
              {location.name}
            </div>
          </button>
        ))}
      </div>

      {/* POPUP CARD */}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl">

            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-6">

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