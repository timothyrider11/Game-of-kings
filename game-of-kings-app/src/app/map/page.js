"use client";

import { useMemo, useState } from "react";

import Header from "@/components/Header";
import MapCanvas from "@/components/MapCanvas";
import RealmForum from "@/components/RealmForum";
import RealmChronicle from "@/components/RealmChronicle";
import RealmStats from "@/components/RealmStats";
import CastlePopup from "@/components/CastlePopup";
import RealmAudio from "@/components/RealmAudio";

const sigils = [
  {
    name: "Direwolf",
    image:
      "https://awoiaf.westeros.org/images/thumb/7/7a/House_Stark.svg/545px-House_Stark.svg.png",
  },
];

const defaultLocations = [
  {
    name: "Winterfell",
    region: "The North",
    owner: "House Stark",
    troops: 12000,
    income: 350,
    level: 3,
    diplomacy: "Neutral",
    status: "Controlled",
    description: "Ancient seat of House Stark.",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/3/39/Winterfell_Season_8.jpg",
    top: "25.2%",
    left: "50.1%",
    color: "cyan",
  },

  {
    name: "King's Landing",
    region: "Crownlands",
    owner: "Iron Throne",
    troops: 20000,
    income: 600,
    level: 5,
    diplomacy: "Dominant",
    status: "Capital",
    description: "Capital of the Seven Kingdoms.",
    image:
      "https://static.wikia.nocookie.net/gameofthrones/images/5/5c/Kings_Landing.jpg",
    top: "69.7%",
    left: "60.7%",
    color: "yellow",
  },

  {
    name: "Pyke",
    region: "Iron Islands",
    owner: "House Greyjoy",
    troops: 6700,
    income: 260,
    level: 2,
    diplomacy: "Hostile",
    status: "Controlled",
    description: "Seat of House Greyjoy.",
    image:
      "https://awoiaf.westeros.org/images/thumb/5/5c/House_Greyjoy.svg/500px-House_Greyjoy.svg.png",
    top: "61.8%",
    left: "12.8%",
    color: "zinc",
  },
];

export default function MapPage() {

  const [locations, setLocations] =
    useState(defaultLocations);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [houseName] =
    useState("House Rider");

  const [gold] =
    useState(1000);

  const [prestige] =
    useState(100);

  const [forumPoints, setForumPoints] =
    useState(0);

  const [ownedCastle, setOwnedCastle] =
    useState(null);

  const [forumInput, setForumInput] =
    useState("");

  const [forumPosts, setForumPosts] =
    useState([]);

  const [warLog, setWarLog] = useState([
    "The realm awaits its next ruler.",
  ]);

  const playerTroops = useMemo(() => {

    return locations.reduce(
      (sum, location) => sum + location.troops,
      0
    );

  }, [locations]);

  const totalRealmPower =
    playerTroops +
    prestige * 10 +
    forumPoints * 100;

  const submitForumPost = () => {
/* =========================================
   CLAIM CASTLE
========================================= */

const claimCastle = () => {

  if (!selectedLocation) return;

  setOwnedCastle(selectedLocation.name);

  setWarLog((prev) => [
    `${houseName} claimed ${selectedLocation.name}.`,
    ...prev,
  ]);
};

/* =========================================
   RECRUIT TROOPS
========================================= */

const recruitTroops = () => {

  if (!selectedLocation) return;

  setWarLog((prev) => [
    `Troops recruited at ${selectedLocation.name}.`,
    ...prev,
  ]);
};

/* =========================================
   UPGRADE CASTLE
========================================= */

const upgradeCastle = () => {

  if (!selectedLocation) return;

  setWarLog((prev) => [
    `${selectedLocation.name} upgraded.`,
    ...prev,
  ]);
};

/* =========================================
   FORM ALLIANCE
========================================= */

const formAlliance = () => {

  if (!selectedLocation) return;

  setWarLog((prev) => [
    `${houseName} formed an alliance with ${selectedLocation.owner}.`,
    ...prev,
  ]);
  
    if (!forumInput.trim()) return;

    setForumPosts((prev) => [
      {
        text: forumInput,
        author: houseName,
      },
      ...prev,
    ]);

    setForumPoints((prev) => prev + 1);

    setWarLog((prev) => [
      `${houseName} addressed the realm.`,
      ...prev,
    ]);

    setForumInput("");
  };

  const claimCastle = () => {

    if (!selectedLocation) return;

    setOwnedCastle(selectedLocation.name);

    setWarLog((prev) => [
      `${houseName} claimed ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  const recruitTroops = () => {

    if (!selectedLocation) return;

    const updated = locations.map((location) => {

      if (
        location.name === selectedLocation.name
      ) {

        return {
          ...location,
          troops: location.troops + 1000,
        };
      }

      return location;
    });

    setLocations(updated);

    setWarLog((prev) => [
      `${houseName} recruited troops at ${selectedLocation.name}.`,
      ...prev,
    ]);
  };

  const upgradeCastle = () => {

    if (!selectedLocation) return;

    const updated = locations.map((location) => {

      if (
        location.name === selectedLocation.name
      ) {

        return {
          ...location,
          level: location.level + 1,
          income: location.income + 100,
        };
      }

      return location;
    });

    setLocations(updated);

    setWarLog((prev) => [
      `${selectedLocation.name} was upgraded.`,
      ...prev,
    ]);
  };

  const formAlliance = () => {

    if (!selectedLocation) return;

    setWarLog((prev) => [
      `${houseName} formed an alliance with ${selectedLocation.owner}.`,
      ...prev,
    ]);
  };

  const getMarkerClasses = (color) => {

    switch (color) {

      case "cyan":
        return "bg-cyan-400 shadow-cyan-400/90";

      case "yellow":
        return "bg-yellow-400 shadow-yellow-400/90";

      case "zinc":
        return "bg-zinc-300 shadow-zinc-300/90";

      default:
        return "bg-red-500 shadow-red-500/90";

    }

  };

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      <Header
        selectedSigil={sigils[0]}
        houseName={houseName}
        gold={gold}
        playerTroops={playerTroops}
        prestige={prestige}
        totalRealmPower={totalRealmPower}
      />

      <div className="h-28" />

      <MapCanvas
        locations={locations}
        setSelectedLocation={setSelectedLocation}
        getMarkerClasses={getMarkerClasses}
      />

      <RealmStats
        houseName={houseName}
        playerTroops={playerTroops}
        prestige={prestige}
        gold={gold}
        totalRealmPower={totalRealmPower}
        ownedCastle={ownedCastle}
        forumPoints={forumPoints}
      />

      <RealmForum
        forumPoints={forumPoints}
        forumInput={forumInput}
        setForumInput={setForumInput}
        submitForumPost={submitForumPost}
        forumPosts={forumPosts}
      />

      <RealmChronicle warLog={warLog} />

      <CastlePopup
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        ownedCastle={ownedCastle}
        claimCastle={claimCastle}
        recruitTroops={recruitTroops}
        upgradeCastle={upgradeCastle}
        formAlliance={formAlliance}
        houseName={houseName}
      />

      <RealmAudio />

    </main>
  );
}