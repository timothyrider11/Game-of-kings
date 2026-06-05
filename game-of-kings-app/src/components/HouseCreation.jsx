"use client";

import { useState } from "react";

const sigils = [
  { name: "Wolf", emoji: "🐺" },
  { name: "Lion", emoji: "🦁" },
  { name: "Dragon", emoji: "🐉" },
  { name: "Kraken", emoji: "🐙" },
  { name: "Falcon", emoji: "🦅" },
  { name: "Bear", emoji: "🐻" },
  { name: "Raven", emoji: "🐦" },
  { name: "Stag", emoji: "🦌" },
  { name: "Direwolf", emoji: "🐺" },
  { name: "Griffin", emoji: "🦅" },
  { name: "Phoenix", emoji: "🔥" },
  { name: "Hydra", emoji: "🐍" },
  { name: "Wyvern", emoji: "🐉" },
  { name: "Boar", emoji: "🐗" },
  { name: "Fox", emoji: "🦊" },
  { name: "Owl", emoji: "🦉" },
  { name: "Eagle", emoji: "🦅" },
  { name: "Bull", emoji: "🐂" },
  { name: "Horse", emoji: "🐎" },
  { name: "Leviathan", emoji: "🌊" },
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
    <div
      className="
        fixed inset-0 z-[999]
        flex items-center justify-center
        bg-black/90
        p-6
      "
    >
      <div
        className="
          w-full max-w-4xl
          rounded-3xl
          border-4 border-amber-900
          bg-amber-100
          p-8
          text-black
          shadow-2xl
        "
      >
        <h2
          className="
            text-5xl
            font-black
            text-center
            mb-8
          "
        >
          👑 Found Your Noble House 👑
        </h2>

        <div className="space-y-4">

          <input
            value={lordName}
            onChange={(e) =>
              setLordName(e.target.value)
            }
            placeholder="Lord Name"
            className="
              w-full
              rounded-xl
              border-2 border-amber-900
              bg-white
              text-black
              px-4 py-3
              text-lg
            "
          />

          <input
            value={houseName}
            onChange={(e) =>
              setHouseName(e.target.value)
            }
            placeholder="House Name"
            className="
              w-full
              rounded-xl
              border-2 border-amber-900
              bg-white
              text-black
              px-4 py-3
              text-lg
            "
          />

          <input
            value={motto}
            onChange={(e) =>
              setMotto(e.target.value)
            }
            placeholder="House Words"
            className="
              w-full
              rounded-xl
              border-2 border-amber-900
              bg-white
              text-black
              px-4 py-3
              text-lg
            "
          />

        </div>

        <div className="mt-8 text-center">

          <div
            className="
              w-36 h-36
              mx-auto
              rounded-full
              border-4 border-red-900
              bg-red-700
              flex items-center justify-center
              text-6xl
              shadow-xl
            "
          >
            {selectedSigil.emoji}
          </div>

          <h3
            className="
              text-3xl
              font-black
              mt-4
            "
          >
            House {houseName || "Unknown"}
          </h3>

          <p
            className="
              italic
              text-lg
              mt-2
            "
          >
            &quot;{motto || "Our Words"}&quot;
          </p>

        </div>

        <h3
          className="
            text-2xl
            font-bold
            text-center
            mt-10 mb-6
          "
        >
          Choose Your Sigil
        </h3>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            lg:grid-cols-5
            gap-4
          "
        >
          {sigils.map((sigil) => (
            <button
              key={sigil.name}
              onClick={() =>
                setSelectedSigil(sigil)
              }
              className={`
                rounded-2xl
                border-2
                p-4
                transition

                ${
                  selectedSigil.name ===
                  sigil.name
                    ? "border-red-700 bg-red-100"
                    : "border-amber-900 bg-white"
                }
              `}
            >
              <div className="text-5xl">
                {sigil.emoji}
              </div>

              <p
                className="
                  mt-2
                  font-bold
                "
              >
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
          className="
            w-full
            mt-8
            bg-red-800
            hover:bg-red-900
            text-white
            py-4
            rounded-2xl
            text-xl
            font-black
          "
        >
          Enter The Realm
        </button>
      </div>
    </div>
  );
}
