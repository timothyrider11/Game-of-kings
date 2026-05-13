"use client";
        return "bg-purple-400 shadow-purple-400/90";

      case "green":
        return "bg-green-400 shadow-green-400/90";

      case "orange":
        return "bg-orange-400 shadow-orange-400/90";

      default:
        return "bg-red-500 shadow-red-500/90";
    }
  };

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">

      <Header
        houseName={houseName}
        gold={gold}
        prestige={prestige}
        playerTroops={playerTroops}
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