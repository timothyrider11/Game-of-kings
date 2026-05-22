"use client";

import { useState, useEffect } from "react";
import HouseCreation from "@/components/HouseCreation";

const sigils = {
  Wolf: "🐺",
  Lion: "🦁",
  Dragon: "🐉",
  Kraken: "🐙",
};

export default function MapPage() {

  const [gold, setGold] = useState(1000);
  const [troops, setTroops] = useState(500);
  const [prestige, setPrestige] = useState(0);
  const [castleLevel, setCastleLevel] = useState(1);

  const [playerHouse, setPlayerHouse] =
    useState(null);

  const [ownedCastle, setOwnedCastle] =
    useState(null);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const locations = [

    { name: "Winterfell", owner: "House Stark", x: 420, y: 520, color: "cyan" },
    { name: "White Harbor", owner: "House Manderly", x: 510, y: 760, color: "cyan" },
    { name: "Moat Cailin", owner: "House Reed", x: 410, y: 690, color: "green" },
    { name: "The Dreadfort", owner: "House Bolton", x: 600, y: 470, color: "red" },
    { name: "Karhold", owner: "House Karstark", x: 720, y: 360, color: "purple" },
    { name: "Last Hearth", owner: "House Umber", x: 560, y: 300, color: "orange" },

    { name: "The Twins", owner: "House Frey", x: 430, y: 970, color: "yellow" },
    { name: "Riverrun", owner: "House Tully", x: 420, y: 1180, color: "cyan" },
    { name: "Seagard", owner: "House Mallister", x: 350, y: 1000, color: "cyan" },
    { name: "Harrenhal", owner: "Riverlands", x: 620, y: 1120, color: "red" },

    { name: "The Eyrie", owner: "House Arryn", x: 720, y: 1030, color: "purple" },
    { name: "Heart's Home", owner: "House Corbray", x: 660, y: 940, color: "purple" },
    { name: "Gulltown", owner: "House Grafton", x: 860, y: 1170, color: "cyan" },

    { name: "Casterly Rock", owner: "House Lannister", x: 150, y: 1260, color: "yellow" },
    { name: "Lannisport", owner: "House Lannister", x: 130, y: 1320, color: "yellow" },

    { name: "Pyke", owner: "House Greyjoy", x: 120, y: 1140, color: "zinc" },
    { name: "Harlaw", owner: "House Harlaw", x: 220, y: 1080, color: "zinc" },

    { name: "King's Landing", owner: "Iron Throne", x: 650, y: 1300, color: "yellow" },
    { name: "Dragonstone", owner: "House Targaryen", x: 880, y: 1200, color: "red" },

    { name: "Highgarden", owner: "House Tyrell", x: 320, y: 1680, color: "green" },
    { name: "Oldtown", owner: "House Hightower", x: 120, y: 1940, color: "green" },
    { name: "Horn Hill", owner: "House Tarly", x: 300, y: 1830, color: "green" },

    { name: "Storm's End", owner: "House Baratheon", x: 770, y: 1540, color: "yellow" },
    { name: "Tarth", owner: "House Tarth", x: 910, y: 1460, color: "cyan" },

    { name: "Sunspear", owner: "House Martell", x: 930, y: 2050, color: "orange" },
    { name: "Skyreach", owner: "House Fowler", x: 430, y: 1900, color: "orange" },
    { name: "Starfall", owner: "House Dayne", x: 350, y: 2000, color: "orange" },

  ];

  useEffect(() => {

    if (!ownedCastle) return;

    const interval = setInterval(() => {

      setGold((g) => g + castleLevel * 100);

      setTroops((t) => t + castleLevel * 50);

    }, 60000);

    return () => clearInterval(interval);

  }, [ownedCastle, castleLevel]);

  const claimCastle = () => {

    if (!selectedLocation) return;

    if (ownedCastle) return;

    setOwnedCastle(selectedLocation.name);

    setPrestige((p) => p + 50);

  };

  const upgradeCastle = () => {

    if (gold < 500) return;

    setGold((g) => g - 500);

    setCastleLevel((l) => l + 1);

    setPrestige((p) => p + 25);

  };

  const recruit50 = () => {

    if (gold < 100) return;

    setGold((g) => g - 100);

    setTroops((t) => t + 50);

  };

  const recruit250 = () => {

    if (gold < 400) return;

    setGold((g) => g - 400);

    setTroops((t) => t + 250);

    setPrestige((p) => p + 5);

  };

  const recruit1000 = () => {

    if (gold < 1500) return;

    setGold((g) => g - 1500);

    setTroops((t) => t + 1000);

    setPrestige((p) => p + 20);

  };

  const power =
    troops +
    prestige +
    castleLevel * 500;

  const getMarkerClasses = (color) => {

    switch (color) {

      case "cyan":
        return "bg-cyan-400 shadow-cyan-400/90";

      case "yellow":
        return "bg-yellow-400 shadow-yellow-400/90";

      case "purple":
        return "bg-purple-400 shadow-purple-400/90";

      case "green":
        return "bg-green-400 shadow-green-400/90";

      case "orange":
        return "bg-orange-400 shadow-orange-400/90";

      case "zinc":
        return "bg-zinc-300 shadow-zinc-300/90";

      default:
        return "bg-red-500 shadow-red-500/90";
    }
  };

  if (!playerHouse) {

    return (
      <HouseCreation
        onCreateHouse={(house) =>
          setPlayerHouse(house)
        }
      />
    );

  }

  return (
    <main className="bg-black min-h-screen text-white">

      <div className="fixed top-0 left-0 z-50 w-full bg-black/90 border-b border-zinc-800 px-6 py-4">

        <div className="flex justify-between">

          <div>

            <h1 className="text-3xl font-black">
              {sigils[playerHouse.sigil?.name] || "⚔️"} Lord {playerHouse.lordName}
            </h1>

            <p>
              House {playerHouse.houseName}
            </p>

            <p className="italic text-zinc-400">
              "{playerHouse.words || playerHouse.motto}"
            </p>

          </div>

          <div className="text-right">

            <p className="text-yellow-400">
              Gold: {gold}
            </p>

            <p className="text-cyan-400">
              Troops: {troops}
            </p>

            <p className="text-purple-400">
              Prestige: {prestige}
            </p>

            <p className="text-orange-400">
              Castle Level: {castleLevel}
            </p>

            <p className="text-emerald-400">
              Power: {power}
            </p>

          </div>

        </div>

      </div>

      <div className="h-28" />

      <div className="fixed right-6 top-32 z-40 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 w-64">

        <h3 className="font-black mb-3">
          🏆 Realm Rankings
        </h3>

        <div>#1 {playerHouse.houseName} ({power})</div>
        <div>#2 House Stark (2000)</div>
        <div>#3 House Lannister (1800)</div>
        <div>#4 House Arryn (1600)</div>
        <div>#5 House Martell (1400)</div>

      </div>

      <div className="w-full overflow-auto bg-black">

        <div
          className="relative mx-auto"
          style={{
            width: "1000px",
            height: "2200px",
          }}
        >

          <img
            src="/LONG-MAP.png"
            alt="Westeros"
            draggable={false}
            className="absolute top-0 left-0 w-full h-full object-contain select-none"
          />

          {locations.map((location) => (

            <button
              key={location.name}
              onClick={() =>
                setSelectedLocation(location)
              }
              className="absolute group"
              style={{
                top: `${location.y}px`,
                left: `${location.x}px`,
                transform:
                  "translate(-50%, -50%)",
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

            </button>

          ))}

        </div>

      </div>

      {selectedLocation && (

        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6">

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-xl">

            <div className="p-6">

              <div className="flex justify-between mb-4">

                <h2 className="text-3xl font-black">
                  {selectedLocation.name}
                </h2>

                <button
                  onClick={() =>
                    setSelectedLocation(null)
                  }
                >
                  ✕
                </button>

              </div>

              <p className="mb-4">
                Owner: {selectedLocation.owner}
              </p>

              {ownedCastle === selectedLocation.name ? (

                <div className="space-y-3">

                  <button
                    onClick={upgradeCastle}
                    className="w-full bg-yellow-700 p-3 rounded-xl"
                  >
                    Upgrade Castle (500 Gold)
                  </button>

                  <button
                    onClick={recruit50}
                    className="w-full bg-blue-700 p-3 rounded-xl"
                  >
                    Recruit 50 Soldiers
                  </button>

                  <button
                    onClick={recruit250}
                    className="w-full bg-indigo-700 p-3 rounded-xl"
                  >
                    Recruit 250 Soldiers
                  </button>

                  <button
                    onClick={recruit1000}
                    className="w-full bg-red-700 p-3 rounded-xl"
                  >
                    Recruit 1000 Soldiers
                  </button>

                </div>

              ) : !ownedCastle ? (

                <button
                  onClick={claimCastle}
                  className="bg-emerald-700 px-6 py-3 rounded-xl"
                >
                  Claim Castle
                </button>

              ) : (

                <p>
                  You already control a castle.
                </p>

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  );
}