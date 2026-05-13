"use client";

import { useMemo, useState } from "react";

import Header from "@/components/Header";
import MapCanvas from "@/components/MapCanvas";
import RealmForum from "@/components/RealmForum";
import RealmChronicle from "@/components/RealmChronicle";
import CastlePopup from "@/components/CastlePopup";
import RealmStats from "@/components/RealmStats";
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
    troops: 12000,
    income: 350,
    top: "25.2%",
    left: "50.1%",
    color: "cyan",
  },
];

export default function MapPage() {

  const [locations] = useState(defaultLocations);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [houseName, setHouseName] =
    useState("House Rider");

  const [gold] = useState(1000);

  const [prestige] = useState(100);

  const [ownedCastle, setOwnedCastle] = useState(null);

  const [forumPoints] = useState(0);

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
    playerTroops + prestige * 10;

  const submitForumPost = () => {

    if (!forumInput.trim()) return;

    setForumPosts((prev) => [
      {
        text: forumInput,
        author: houseName,
      },
      ...prev,
    ]);

    setWarLog((prev) => [
      `${houseName} addressed the realm.`,
      ...prev,
    ]);

    setForumInput("");
  };

  const getMarkerClasses = (color) => {

    switch (color) {

      case "cyan":
        return "bg-cyan-400 shadow-cyan-400/90";

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
>
  </CastlePopup><RealmAudio />

    </main>
  );
}