"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gok_game_state";

const STARTING_CASTLES = [
  {
    id: "winterfell",
    name: "Winterfell",
    left: "42%",
    top: "32%",
    region: "The North",
    troops: 100,
    defense: 3,
    income: 35,
    owner: null,
    neighbors: ["riverrun", "pyke"],
  },
  {
    id: "kings-landing",
    name: "King's Landing",
    left: "56%",
    top: "70%",
    region: "Crownlands",
    troops: 120,
    defense: 2,
    income: 50,
    owner: null,
    neighbors: ["riverrun", "highgarden", "sunspear"],
  },
  {
    id: "highgarden",
    name: "Highgarden",
    left: "29%",
    top: "81%",
    region: "The Reach",
    troops: 110,
    defense: 2,
    income: 45,
    owner: null,
    neighbors: ["kings-landing", "casterly-rock", "sunspear"],
  },
  {
    id: "sunspear",
    name: "Sunspear",
    left: "72%",
    top: "89%",
    region: "Dorne",
    troops: 95,
    defense: 3,
    income: 30,
    owner: null,
    neighbors: ["kings-landing", "highgarden"],
  },
  {
    id: "riverrun",
    name: "Riverrun",
    left: "39%",
    top: "61%",
    region: "Riverlands",
    troops: 90,
    defense: 2,
    income: 35,
    owner: null,
    neighbors: ["winterfell", "kings-landing", "casterly-rock"],
  },
  {
    id: "casterly-rock",
    name: "Casterly Rock",
    left: "24%",
    top: "68%",
    region: "Westerlands",
    troops: 115,
    defense: 4,
    income: 55,
    owner: null,
    neighbors: ["riverrun", "highgarden", "pyke"],
  },
  {
    id: "pyke",
    name: "Pyke",
    left: "19%",
    top: "52%",
    region: "Iron Islands",
    troops: 80,
    defense: 2,
    income: 25,
    owner: null,
    neighbors: ["winterfell", "casterly-rock"],
  },
];

const ANIMALS = [
  "Wolf",
  "Lion",
  "Dragon",
  "Kraken",
  "Stag",
  "Falcon",
  "Bear",
  "Raven",
  "Direwolf",
  "Griffin",
  "Phoenix",
  "Hydra",
  "Wyvern",
  "Manticore",
  "Basilisk",
  "Boar",
  "Fox",
  "Owl",
  "Hawk",
  "Eagle",
  "Serpent",
  "Bull",
  "Horse",
  "Ram",
  "Elk",
  "Crow",
  "Leviathan",
  "Shadow Cat",
  "Mammoth",
];

const HOUSE_COLORS = {
  Wolf: "#64748b",
  Lion: "#b45309",
  Dragon: "#991b1b",
  Kraken: "#164e63",
  Stag: "#78350f",
  Falcon: "#1d4ed8",
  Bear: "#57534e",
  Raven: "#312e81",
  Direwolf: "#475569",
  Griffin: "#92400e",
  Phoenix: "#c2410c",
  Hydra: "#166534",
  Wyvern: "#7f1d1d",
  Manticore: "#9f1239",
  Basilisk: "#365314",
  Boar: "#713f12",
  Fox: "#ea580c",
  Owl: "#44403c",
  Hawk: "#0369a1",
  Eagle: "#1e3a8a",
  Serpent: "#15803d",
  Bull: "#854d0e",
  Horse: "#a16207",
  Ram: "#78716c",
  Elk: "#4d7c0f",
  Crow: "#18181b",
  Leviathan: "#0e7490",
  "Shadow Cat": "#3f3f46",
  Mammoth: "#6b7280",
};

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function resolveBattle(attackingTroops, defendingTroops, defenseBonus) {
  const attackRoll = rollDie() + Math.floor(attackingTroops / 25);
  const defenseRoll = rollDie() + Math.floor(defendingTroops / 25) + defenseBonus;

  if (attackRoll > defenseRoll) {
    const defenderLosses = Math.min(defendingTroops, 25 + (attackRoll - defenseRoll) * 5);
    return {
      winner: "attacker",
      attackRoll,
      defenseRoll,
      attackerLosses: 10,
      defenderLosses,
    };
  }

  const attackerLosses = Math.min(attackingTroops, 20 + (defenseRoll - attackRoll) * 5);
  return {
    winner: "defender",
    attackRoll,
    defenseRoll,
    attackerLosses,
    defenderLosses: 5,
  };
}

export default function MapPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedCastleId, setSelectedCastleId] = useState(null);
  const [castleToClaimId, setCastleToClaimId] = useState(null);
  const [showHouseCreator, setShowHouseCreator] = useState(false);

  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [houseAnimal, setHouseAnimal] = useState("Wolf");

  const [castles, setCastles] = useState(STARTING_CASTLES);
  const [claimedCastleId, setClaimedCastleId] = useState(null);
  const [gold, setGold] = useState(100);
  const [turn, setTurn] = useState(1);
  const [battleLog, setBattleLog] = useState([]);

  const selectedCastle = castles.find((castle) => castle.id === selectedCastleId);
  const claimedCastle = castles.find((castle) => castle.id === claimedCastleId);
  const castleToClaim = castles.find((castle) => castle.id === castleToClaimId);
  const houseColor = HOUSE_COLORS[houseAnimal] || "#8b0000";

  const playerCastles = useMemo(
    () => castles.filter((castle) => castle.owner === "player"),
    [castles]
  );

  const availableTargets = useMemo(() => {
    if (!selectedCastle || selectedCastle.owner !== "player") return [];

    return castles.filter(
      (castle) =>
        selectedCastle.neighbors.includes(castle.id) && castle.owner !== "player"
    );
  }, [castles, selectedCastle]);

  useEffect(() => {
    const savedGame = localStorage.getItem(STORAGE_KEY);

    if (savedGame) {
      try {
        const data = JSON.parse(savedGame);

        setHouseName(data.houseName || "");
        setHouseMotto(data.houseMotto || "");
        setHouseAnimal(data.houseAnimal || "Wolf");
        setClaimedCastleId(data.claimedCastleId || null);
        setGold(data.gold ?? 100);
        setTurn(data.turn ?? 1);
        setBattleLog(data.battleLog || []);

        if (Array.isArray(data.castles)) {
          setCastles(data.castles);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        houseName,
        houseMotto,
        houseAnimal,
        claimedCastleId,
        gold,
        turn,
        castles,
        battleLog,
      })
    );
  }, [
    hasLoaded,
    houseName,
    houseMotto,
    houseAnimal,
    claimedCastleId,
    gold,
    turn,
    castles,
    battleLog,
  ]);

  function addLog(message) {
    setBattleLog((currentLog) => [message, ...currentLog].slice(0, 6));
  }

  function claimCastle() {
    if (!castleToClaim || !houseName.trim()) return;

    setClaimedCastleId(castleToClaim.id);
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.id === castleToClaim.id
          ? { ...castle, owner: "player", troops: Math.max(castle.troops, 125) }
          : castle
      )
    );
    addLog(`House ${houseName} claimed ${castleToClaim.name}.`);
    setCastleToClaimId(null);
    setShowHouseCreator(false);
  }

  function recruitTroops(castleId) {
    const recruitCost = 25;

    if (gold < recruitCost) return;

    setGold((currentGold) => currentGold - recruitCost);
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.id === castleId ? { ...castle, troops: castle.troops + 25 } : castle
      )
    );
    addLog("25 troops recruited.");
  }

  function attackCastle(targetCastleId) {
    if (!selectedCastle || selectedCastle.owner !== "player") return;

    const attackingTroops = selectedCastle.troops;
    const targetCastle = castles.find((castle) => castle.id === targetCastleId);

    if (!targetCastle || attackingTroops < 30) return;

    const result = resolveBattle(
      attackingTroops,
      targetCastle.troops,
      targetCastle.defense
    );

    setCastles((currentCastles) =>
      currentCastles.map((castle) => {
        if (castle.id === selectedCastle.id) {
          return {
            ...castle,
            troops: Math.max(1, castle.troops - result.attackerLosses),
          };
        }

        if (castle.id === targetCastle.id) {
          const remainingDefenders = Math.max(0, castle.troops - result.defenderLosses);

          if (result.winner === "attacker" && remainingDefenders <= 0) {
            return {
              ...castle,
              owner: "player",
              troops: 35,
            };
          }

          return {
            ...castle,
            troops: remainingDefenders,
          };
        }

        return castle;
      })
    );

    if (result.winner === "attacker") {
      addLog(
        `${selectedCastle.name} attacked ${targetCastle.name}: ${result.attackRoll}-${result.defenseRoll}. Defenders lost ${result.defenderLosses}.`
      );
    } else {
      addLog(
        `${selectedCastle.name} failed against ${targetCastle.name}: ${result.attackRoll}-${result.defenseRoll}. Attackers lost ${result.attackerLosses}.`
      );
    }
  }

  function endTurn() {
    const income = playerCastles.reduce((total, castle) => total + castle.income, 0);

    setGold((currentGold) => currentGold + income);
    setTurn((currentTurn) => currentTurn + 1);
    addLog(`Turn ended. Your realm collected ${income} gold.`);
  }

  function resetGame() {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedCastleId(null);
    setCastleToClaimId(null);
    setShowHouseCreator(false);
    setHouseName("");
    setHouseMotto("");
    setHouseAnimal("Wolf");
    setCastles(STARTING_CASTLES);
    setClaimedCastleId(null);
    setGold(100);
    setTurn(1);
    setBattleLog([]);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom,#efe3bd,#d2b577)",
        color: "#1f1205",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "44px",
          margin: "0 0 10px",
        }}
      >
        GAME OF KINGS
      </h1>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto 16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "10px",
        }}
      >
        <StatCard label="Turn" value={turn} />
        <StatCard label="Gold" value={gold} />
        <StatCard label="Castles" value={playerCastles.length} />
        <StatCard label="House" value={houseName ? `House ${houseName}` : "Unfounded"} />
      </section>

      {claimedCastle && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto 18px",
            padding: "14px",
            background: "#f8efd0",
            border: "3px solid #6b4a22",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          House {houseName || "Unknown"} rules from {claimedCastle.name}
          {houseMotto ? ` - "${houseMotto}"` : ""}
        </div>
      )}

      <div
        style={{
          position: "relative",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <img
          src="/LONG-MAP.png"
          alt="Westeros"
          style={{
            width: "100%",
            border: "8px solid #5b3d1a",
            borderRadius: "8px",
            display: "block",
          }}
        />

        {castles.map((castle) => (
          <button
            key={castle.id}
            onClick={() => setSelectedCastleId(castle.id)}
            title={castle.name}
            style={{
              position: "absolute",
              left: castle.left,
              top: castle.top,
              transform: "translate(-50%, -50%)",
              width: "42px",
              height: "42px",
              border: castle.owner === "player" ? "3px solid #fef3c7" : "3px solid #3f2a12",
              background: castle.owner === "player" ? houseColor : "#5b3d1a",
              color: "white",
              borderRadius: "50%",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 3px 10px rgba(0,0,0,.45)",
            }}
          >
            {castle.owner === "player" ? "Y" : castle.troops}
          </button>
        ))}
      </div>

      <section
        style={{
          maxWidth: "1000px",
          margin: "16px auto 0",
          display: "grid",
          gridTemplateColumns: "minmax(0,2fr) minmax(260px,1fr)",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "#f8efd0",
            border: "3px solid #6b4a22",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <h2 style={{ margin: "0 0 10px", fontSize: "22px" }}>War Chronicle</h2>
          {battleLog.length === 0 ? (
            <p style={{ margin: 0 }}>Claim a castle to begin your reign.</p>
          ) : (
            battleLog.map((entry) => (
              <p key={entry} style={{ margin: "0 0 8px" }}>
                {entry}
              </p>
            ))
          )}
        </div>

        <div
          style={{
            background: "#f8efd0",
            border: "3px solid #6b4a22",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <button
            onClick={endTurn}
            disabled={!claimedCastleId}
            style={primaryButtonStyle(!claimedCastleId)}
          >
            End Turn / Collect Income
          </button>
          <button onClick={resetGame} style={secondaryButtonStyle}>
            Reset Game
          </button>
        </div>
      </section>

      {selectedCastle && (
        <Modal zIndex={1000}>
          <h2 style={{ textAlign: "center", marginTop: 0 }}>{selectedCastle.name}</h2>

          <p>
            <strong>Region:</strong> {selectedCastle.region}
          </p>
          <p>
            <strong>Owner:</strong>{" "}
            {selectedCastle.owner === "player"
              ? `House ${houseName || "Unknown"}`
              : "Unclaimed"}
          </p>
          <p>
            <strong>Troops:</strong> {selectedCastle.troops}
          </p>
          <p>
            <strong>Defense:</strong> +{selectedCastle.defense}
          </p>
          <p>
            <strong>Income:</strong> {selectedCastle.income} gold per turn
          </p>

          {selectedCastle.owner === "player" && (
            <>
              <button
                onClick={() => recruitTroops(selectedCastle.id)}
                disabled={gold < 25}
                style={primaryButtonStyle(gold < 25)}
              >
                Recruit 25 Troops - 25 Gold
              </button>

              {availableTargets.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <h3 style={{ margin: "0 0 8px" }}>Attack Nearby Castles</h3>
                  {availableTargets.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => attackCastle(target.id)}
                      disabled={selectedCastle.troops < 30}
                      style={secondaryButtonStyle}
                    >
                      Attack {target.name} ({target.troops} troops)
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {!claimedCastleId && selectedCastle.owner !== "player" && (
            <button
              onClick={() => {
                setCastleToClaimId(selectedCastle.id);
                setSelectedCastleId(null);
                setShowHouseCreator(true);
              }}
              style={primaryButtonStyle(false)}
            >
              Claim Castle
            </button>
          )}

          {claimedCastleId && selectedCastle.owner !== "player" && (
            <p style={{ fontWeight: "bold" }}>
              Select one of your neighboring castles to attack this location.
            </p>
          )}

          <button onClick={() => setSelectedCastleId(null)} style={secondaryButtonStyle}>
            Close
          </button>
        </Modal>
      )}

      {showHouseCreator && (
        <Modal zIndex={2000}>
          <h2 style={{ textAlign: "center", marginTop: 0 }}>Found Your Noble House</h2>

          <input
            placeholder="House Name"
            value={houseName}
            onChange={(event) => setHouseName(event.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="House Motto"
            value={houseMotto}
            onChange={(event) => setHouseMotto(event.target.value)}
            style={inputStyle}
          />

          <select
            value={houseAnimal}
            onChange={(event) => setHouseAnimal(event.target.value)}
            style={inputStyle}
          >
            {ANIMALS.map((animal) => (
              <option key={animal} value={animal}>
                {animal}
              </option>
            ))}
          </select>

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: `radial-gradient(circle,#fff7ed,${houseColor})`,
                margin: "0 auto 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                padding: "12px",
              }}
            >
              {houseAnimal}
            </div>

            <h3 style={{ margin: "0 0 4px" }}>House {houseName || "Unknown"}</h3>
            <p style={{ margin: 0 }}>"{houseMotto || "Our Words"}"</p>
            {castleToClaim && <p>Seat: {castleToClaim.name}</p>}
          </div>

          <button
            onClick={claimCastle}
            disabled={!houseName.trim()}
            style={primaryButtonStyle(!houseName.trim())}
          >
            Create House
          </button>

          <button
            onClick={() => {
              setCastleToClaimId(null);
              setShowHouseCreator(false);
            }}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
        </Modal>
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#f8efd0",
        border: "3px solid #6b4a22",
        borderRadius: "8px",
        padding: "12px",
      }}
    >
      <div style={{ fontSize: "13px", fontWeight: "bold", opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function Modal({ children, zIndex }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.78)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex,
        padding: "18px",
      }}
    >
      <div
        style={{
          width: "min(720px,100%)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "linear-gradient(180deg,#e7d6a7,#caa96a)",
          border: "6px solid #6b4a22",
          borderRadius: "12px",
          padding: "28px",
          color: "#1f1205",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function primaryButtonStyle(disabled) {
  return {
    width: "100%",
    padding: "14px",
    background: disabled ? "#8b7355" : "#8b0000",
    color: "white",
    border: "none",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "bold",
  };
}

const secondaryButtonStyle = {
  width: "100%",
  padding: "14px",
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: "8px",
  marginBottom: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  background: "#f8efd0",
  color: "#111",
  border: "3px solid #6b4a22",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
};
