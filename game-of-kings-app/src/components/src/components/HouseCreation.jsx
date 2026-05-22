"use client";

import { useState } from "react";

const sigils = [
  {
    name: "Wolf",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7a/House_Stark.svg/545px-House_Stark.svg.png",
  },
  {
    name: "Lion",
    image:
      "https://awoiaf.westeros.org/images/thumb/c/c7/House_Lannister.svg/545px-House_Lannister.svg.png",
  },
  {
    name: "Dragon",
    image:
      "https://awoiaf.westeros.org/images/thumb/9/9b/House_Targaryen.svg/545px-House_Targaryen.svg.png",
  },
  {
    name: "Kraken",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/545px-House_Greyjoy.svg.png",
  },
];

export default function HouseCreation({
  onCreateHouse,
}) {
  const [lordName, setLordName] =
    useState("");

  const [houseName, setHouseName] =
    useState("");

  const [motto, setMotto] =
    useState("");

  const [selectedSigil, setSelectedSigil] =
    useState(sigils[0]);

  return (
    <div className="fixed inset-0 bg-black z-[999] flex items-center justify-center p-6">

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-3xl">

        <h2 className="text-4xl font-black text-center mb-8">
          Create Your Noble House
        </h2>

        <div className="space-y-5">

          <input
            value={lordName}
            onChange={(e) =>
              setLordName(e.target.value)
            }
            placeholder="Lord Name"
            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3"
          />

          <input
            value={houseName}
            onChange={(e) =>
              setHouseName(e.target.value)
            }
            placeholder="House Name"
            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3"
          />

          <input
            value={motto}
            onChange={(e) =>
              setMotto(e.target.value)
            }
            placeholder="House Words"
            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3"
          />

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

          {sigils.map((sigil) => (

            <button
              key={sigil.name}
              onClick={() =>
                setSelectedSigil(sigil)
              }
              className={`
                border rounded-2xl p-4

                ${
                  selectedSigil.name === sigil.name
                    ? "border-emerald-500"
                    : "border-zinc-700"
                }
              `}
            >

              <img
                src={sigil.image}
                alt={sigil.name}
                className="w-24 h-24 mx-auto object-contain"
              />

              <p className="mt-2 font-bold">
                {sigil.name}
              </p>

            </button>

          ))}

        </div>

        <button
          onClick={() =>
            onCreateHouse({
              lordName,
              houseName,
              motto,
              sigil: selectedSigil,
            })
          }
          className="w-full mt-8 bg-emerald-700 hover:bg-emerald-800 py-4 rounded-2xl font-black text-xl"
        >
          Enter the Realm
        </button>

      </div>

    </div>
  );
}