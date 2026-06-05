"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game_of_kings_realm";
const REALM_VERSION = 3;
const OFFLINE_TURN_MINUTES = 5;

const STARTING_CASTLES = [
  {
    id: "winterfell",
    name: "Winterfell",
    left: "42%",
    top: "32%",
    region: "The North",
    troops: 125,
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
    troops: 140,
    defense: 2,
    income: 55,
    owner: null,
    neighbors: ["riverrun", "highgarden", "sunspear"],
  },
  {
    id: "highgarden",
    name: "Highgarden",
    left: "29%",
    top: "81%",
    region: "The Reach",
    troops: 115,
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
    troops: 100,
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
    troops: 95,
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
    troops: 120,
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
    troops: 85,
    defense: 2,
    income: 25,
    owner: null,
    neighbors: ["winterfell", "casterly-rock"],
  },
];

const SIGILS = [
  { name: "Wolf", color: "#64748b" },
  { name: "Lion", color: "#b45309" },
  { name: "Dragon", color: "#991b1b" },
  { name: "Kraken", color: "#164e63" },
  { name: "Stag", color: "#78350f" },
  { name: "Falcon", color: "#1d4ed8" },
  { name: "Bear", color: "#57534e" },
  { name: "Raven", color: "#312e81" },
  { name: "Serpent", color: "#15803d" },
  { name: "Horse", color: "#a16207" },
  { name: "Ram", color: "#78716c" },
  { name: "Elk", color: "#4d7c0f" },
];

const TURN_PHASES = [
  {
    id: "council",
    name: "Council",
    description: "Review the realm, pick a castle, and plan a friendly route for this visit.",
  },
  {
    id: "checkin",
    name: "Check-In",
    description: "Clock in, claim daily points, and keep your house active on the board.",
  },
  {
    id: "muster",
    name: "Muster",
    description: "Spend gold and realm points to grow your army.",
  },
  {
    id: "diplomacy",
    name: "Diplomacy",
    description: "Send aid to other houses and earn renown for helping.",
  },
  {
    id: "war",
    name: "War",
    description: "Fight neighboring armies when you want direct castle pressure.",
  },
  {
    id: "questing",
    name: "Questing",
    description: "Browse, scout, read chronicles, and complete quick realm duties.",
  },
  {
    id: "revenue",
    name: "Revenue",
    description: "Collect income, resolve the turn, and let the living realm continue.",
  },
];

const REALM_DUTIES = [
  {
    id: "read-chronicle",
    title: "Read the Realm Chronicle",
    phase: "questing",
    detail: "Catch up on the realm and earn points for staying informed.",
    points: 45,
    renown: 10,
    gold: 0,
    troops: 0,
  },
  {
    id: "scout-road",
    title: "Scout a Safe Road",
    phase: "questing",
    detail: "Send scouts ahead so allies can travel with fewer losses.",
    points: 55,
    renown: 15,
    gold: 10,
    troops: 0,
  },
  {
    id: "host-feast",
    title: "Host a Welcoming Feast",
    phase: "diplomacy",
    detail: "Boost morale and make your castle a friendly place to visit.",
    points: 35,
    renown: 25,
    gold: -15,
    troops: 10,
  },
  {
    id: "repair-walls",
    title: "Repair Castle Walls",
    phase: "muster",
    detail: "Help builders strengthen your seat and inspire new recruits.",
    points: 25,
    renown: 5,
    gold: -20,
    troops: 15,
  },
  {
    id: "send-ravens",
    title: "Send Friendly Ravens",
    phase: "council",
    detail: "Welcome newer houses and gain reputation for good counsel.",
    points: 40,
    renown: 20,
    gold: 0,
    troops: 0,
  },
];

const STATIC_LEADERS = [
  { house: "House Ashford", role: "Most Helpful", points: 12840, renown: 540 },
  { house: "House Thornwake", role: "Defenders", points: 10410, renown: 420 },
  { house: "House Ironvale", role: "Army Builder", points: 9775, renown: 260 },
  { house: "House Greenmoor", role: "Peacekeeper", points: 8320, renown: 610 },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function resolveBattle(attackingTroops, defendingTroops, defenseBonus) {
  const attackRoll = rollDie() + Math.floor(attackingTroops / 25);
  const defenseRoll = rollDie() + Math.floor(defendingTroops / 25) + defenseBonus;

  if (attackRoll > defenseRoll) {
    return {
      winner: "attacker",
      attackRoll,
      defenseRoll,
      attackerLosses: 10,
      defenderLosses: Math.min(defendingTroops, 30 + (attackRoll - defenseRoll) * 5),
    };
  }

  return {
    winner: "defender",
    attackRoll,
    defenseRoll,
    attackerLosses: Math.min(attackingTroops, 20 + (defenseRoll - attackRoll) * 5),
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
  const [houseSigil, setHouseSigil] = useState(SIGILS[0]);
  const [castles, setCastles] = useState(STARTING_CASTLES);
  const [gold, setGold] = useState(100);
  const [points, setPoints] = useState(0);
  const [renown, setRenown] = useState(0);
  const [aidSent, setAidSent] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [completedDuties, setCompletedDuties] = useState([]);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState("council");
  const [battleLog, setBattleLog] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  const selectedCastle = castles.find((castle) => castle.id === selectedCastleId);
  const castleToClaim = castles.find((castle) => castle.id === castleToClaimId);
  const currentPhase = TURN_PHASES.find((turnPhase) => turnPhase.id === phase) || TURN_PHASES[0];
  const checkedInToday = lastCheckInDate === todayKey();

  const playerCastles = useMemo(
    () => castles.filter((castle) => castle.owner === "player"),
    [castles]
  );

  const playerHasCastle = playerCastles.length > 0;

  const availableTargets = useMemo(() => {
    if (!selectedCastle || selectedCastle.owner !== "player") return [];

    return castles.filter(
      (castle) =>
        selectedCastle.neighbors.includes(castle.id) && castle.owner !== "player"
    );
  }, [castles, selectedCastle]);

  const availableDuties = useMemo(
    () =>
      REALM_DUTIES.filter(
        (duty) => duty.phase === phase && !completedDuties.includes(`${turn}-${duty.id}`)
      ),
    [completedDuties, phase, turn]
  );

  const leaderboard = useMemo(() => {
    const playerScore = points + renown * 8 + playerCastles.length * 500;
    const playerEntry = {
      house: houseName ? `House ${houseName}` : "Your Future House",
      role: playerHasCastle ? "Active Realm House" : "Unfounded",
      points: playerScore,
      renown,
    };

    return [playerEntry, ...STATIC_LEADERS]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [houseName, playerHasCastle, playerCastles.length, points, renown]);

  useEffect(() => {
    const storedRealm = localStorage.getItem(STORAGE_KEY);

    if (storedRealm) {
      try {
        const data = JSON.parse(storedRealm);

        setHouseName(data.houseName || "");
        setHouseMotto(data.houseMotto || "");
        setHouseSigil(data.houseSigil || SIGILS[0]);
        setGold(data.gold ?? 100);
        setPoints(data.points ?? data.realmPoints ?? 0);
        setRenown(data.renown ?? 0);
        setAidSent(data.aidSent ?? 0);
        setDailyStreak(data.dailyStreak ?? 0);
        setLastCheckInDate(data.lastCheckInDate || null);
        setCompletedDuties(data.completedDuties || []);
        setTurn(data.turn ?? 1);
        setPhase(data.phase || "council");
        setSelectedCastleId(data.selectedCastleId || null);
        setCastleToClaimId(data.castleToClaimId || null);
        setShowHouseCreator(data.showHouseCreator || false);
        setLastSyncedAt(data.syncedAt || data.savedAt || null);

        if (Array.isArray(data.castles)) {
          const offlineResult = calculateOfflineProgress(data);

          setCastles(offlineResult.castles);
          setGold(offlineResult.gold);
          setPoints(offlineResult.points);
          setRenown(offlineResult.renown);
          setTurn(offlineResult.turn);
          setBattleLog(offlineResult.battleLog);
          setSyncMessage(offlineResult.message);
        } else {
          setBattleLog(data.battleLog || []);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    syncRealm("Realm synced");
  }, [
    hasLoaded,
    houseName,
    houseMotto,
    houseSigil,
    gold,
    points,
    renown,
    aidSent,
    dailyStreak,
    lastCheckInDate,
    completedDuties,
    turn,
    phase,
    castles,
    battleLog,
    selectedCastleId,
    castleToClaimId,
    showHouseCreator,
  ]);

  function createRealmSnapshot() {
    return {
      version: REALM_VERSION,
      syncedAt: new Date().toISOString(),
      houseName,
      houseMotto,
      houseSigil,
      gold,
      points,
      renown,
      aidSent,
      dailyStreak,
      lastCheckInDate,
      completedDuties,
      turn,
      phase,
      castles,
      battleLog,
      selectedCastleId,
      castleToClaimId,
      showHouseCreator,
    };
  }

  function calculateOfflineProgress(data) {
    const syncedAt = data.syncedAt || data.savedAt;
    const existingCastles = Array.isArray(data.castles) ? data.castles : STARTING_CASTLES;
    const storedPlayerCastles = existingCastles.filter((castle) => castle.owner === "player");
    const minutesAway = syncedAt
      ? Math.floor((Date.now() - new Date(syncedAt).getTime()) / 60000)
      : 0;
    const offlineTurns = storedPlayerCastles.length
      ? Math.min(12, Math.floor(minutesAway / OFFLINE_TURN_MINUTES))
      : 0;

    if (offlineTurns <= 0) {
      return {
        castles: existingCastles,
        gold: data.gold ?? 100,
        points: data.points ?? data.realmPoints ?? 0,
        renown: data.renown ?? 0,
        turn: data.turn ?? 1,
        battleLog: data.battleLog || [],
        message: "Realm restored",
      };
    }

    const income = storedPlayerCastles.reduce((total, castle) => total + castle.income, 0);
    const offlineGold = income * offlineTurns;
    const offlinePoints = offlineTurns * 35;

    return {
      castles: existingCastles.map((castle) =>
        castle.owner === "player"
          ? { ...castle, troops: castle.troops + offlineTurns * 5 }
          : castle
      ),
      gold: (data.gold ?? 100) + offlineGold,
      points: (data.points ?? data.realmPoints ?? 0) + offlinePoints,
      renown: (data.renown ?? 0) + offlineTurns * 4,
      turn: (data.turn ?? 1) + offlineTurns,
      battleLog: [
        `Your realm kept moving while you were away: ${offlineTurns} turns passed, ${offlineGold} gold and ${offlinePoints} points were earned, and garrisons grew.`,
        ...(data.battleLog || []),
      ].slice(0, 8),
      message: `${offlineTurns} realm turns resolved`,
    };
  }

  function syncRealm(message = "Realm synced") {
    const realmSnapshot = createRealmSnapshot();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(realmSnapshot));
    setLastSyncedAt(realmSnapshot.syncedAt);
    setSyncMessage(message);
  }

  function addLog(message) {
    setBattleLog((currentLog) => [message, ...currentLog].slice(0, 8));
  }

  function claimCastle() {
    if (!castleToClaim || !houseName.trim()) return;

    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.id === castleToClaim.id
          ? { ...castle, owner: "player", troops: Math.max(castle.troops, 150) }
          : castle
      )
    );
    setPoints((currentPoints) => currentPoints + 125);
    setRenown((currentRenown) => currentRenown + 25);
    addLog(`House ${houseName} claimed ${castleToClaim.name} and joined the living realm.`);
    setPhase("checkin");
    setCastleToClaimId(null);
    setShowHouseCreator(false);
  }

  function checkIn() {
    if (checkedInToday) return;

    const nextStreak = dailyStreak + 1;
    const pointReward = 100 + Math.min(nextStreak * 10, 80);

    setLastCheckInDate(todayKey());
    setDailyStreak(nextStreak);
    setPoints((currentPoints) => currentPoints + pointReward);
    setRenown((currentRenown) => currentRenown + 12);
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.owner === "player" ? { ...castle, troops: castle.troops + 10 } : castle
      )
    );
    addLog(`Daily check-in complete: ${pointReward} points earned and loyal recruits arrived.`);
  }

  function completeDuty(duty) {
    const dutyKey = `${turn}-${duty.id}`;

    if (completedDuties.includes(dutyKey)) return;
    if (gold + duty.gold < 0) {
      addLog(`${duty.title} needs more gold before it can be completed.`);
      return;
    }

    setCompletedDuties((currentDuties) => [...currentDuties, dutyKey]);
    setPoints((currentPoints) => currentPoints + duty.points);
    setRenown((currentRenown) => currentRenown + duty.renown);
    setGold((currentGold) => currentGold + duty.gold);

    if (duty.troops > 0) {
      growAllPlayerCastles(duty.troops);
    }

    addLog(`${duty.title} completed: +${duty.points} points, +${duty.renown} renown.`);
  }

  function growAllPlayerCastles(amount) {
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.owner === "player" ? { ...castle, troops: castle.troops + amount } : castle
      )
    );
  }

  function recruitTroops(castleId) {
    if (phase !== "muster" || gold < 25) return;

    setGold((currentGold) => currentGold - 25);
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.id === castleId ? { ...castle, troops: castle.troops + 25 } : castle
      )
    );
    addLog("25 troops joined your banners.");
  }

  function convertPointsToTroops(castleId) {
    if (phase !== "muster" || points < 60) return;

    setPoints((currentPoints) => currentPoints - 60);
    setCastles((currentCastles) =>
      currentCastles.map((castle) =>
        castle.id === castleId ? { ...castle, troops: castle.troops + 20 } : castle
      )
    );
    addLog("60 realm points converted into 20 fresh troops.");
  }

  function sendAid() {
    if (phase !== "diplomacy" || points < 40) return;

    setPoints((currentPoints) => currentPoints - 40);
    setRenown((currentRenown) => currentRenown + 35);
    setAidSent((currentAid) => currentAid + 1);
    addLog("Aid sent to a neighboring house: +35 renown for helping the realm.");
  }

  function attackCastle(targetCastleId) {
    if (phase !== "war" || !selectedCastle || selectedCastle.owner !== "player") return;

    const targetCastle = castles.find((castle) => castle.id === targetCastleId);

    if (!targetCastle || selectedCastle.troops < 30) return;

    const result = resolveBattle(
      selectedCastle.troops,
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
      setPoints((currentPoints) => currentPoints + 25);
      addLog(
        `${selectedCastle.name} attacked ${targetCastle.name}: ${result.attackRoll}-${result.defenseRoll}. Defenders lost ${result.defenderLosses}.`
      );
    } else {
      addLog(
        `${selectedCastle.name} was repelled by ${targetCastle.name}: ${result.attackRoll}-${result.defenseRoll}. Attackers lost ${result.attackerLosses}.`
      );
    }
  }

  function endTurn() {
    if (phase !== "revenue") return;

    const income = playerCastles.reduce((total, castle) => total + castle.income, 0);
    const pointIncome = playerCastles.length * 20 + Math.floor(renown / 20);

    setGold((currentGold) => currentGold + income);
    setPoints((currentPoints) => currentPoints + pointIncome);
    setTurn((currentTurn) => currentTurn + 1);
    setPhase("council");
    setCompletedDuties([]);
    addLog(`Turn ${turn} ended. The realm granted ${income} gold and ${pointIncome} points.`);
  }

  function advancePhase() {
    if (!playerHasCastle) return;

    const currentIndex = TURN_PHASES.findIndex((turnPhase) => turnPhase.id === phase);
    const nextPhase = TURN_PHASES[currentIndex + 1] || TURN_PHASES[0];

    setPhase(nextPhase.id);
    addLog(`${nextPhase.name} phase begins.`);
  }

  function resetGame() {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedCastleId(null);
    setCastleToClaimId(null);
    setShowHouseCreator(false);
    setHouseName("");
    setHouseMotto("");
    setHouseSigil(SIGILS[0]);
    setCastles(STARTING_CASTLES);
    setGold(100);
    setPoints(0);
    setRenown(0);
    setAidSent(0);
    setDailyStreak(0);
    setLastCheckInDate(null);
    setCompletedDuties([]);
    setTurn(1);
    setPhase("council");
    setBattleLog([]);
    setLastSyncedAt(null);
    setSyncMessage("Realm reset");
  }

  function formatSyncTime(value) {
    if (!value) return "Waiting for sync";

    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#080807] text-stone-100">
      <section className="border-b border-stone-800 bg-stone-950 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Game of Kings
            </Link>
            <h1 className="mt-1 text-3xl font-black md:text-5xl">Realm Command</h1>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center md:grid-cols-6 lg:min-w-[720px]">
            <Stat label="Turn" value={turn} />
            <Stat label="Phase" value={currentPhase.name} />
            <Stat label="Gold" value={gold} />
            <Stat label="Points" value={points} />
            <Stat label="Renown" value={renown} />
            <Stat label="Castles" value={playerCastles.length} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <div className="overflow-hidden border border-stone-700 bg-black shadow-2xl">
            <div className="relative mx-auto max-w-5xl">
              <img
                src="/LONG-MAP.png"
                alt="Realm map"
                className="block w-full select-none opacity-95"
                draggable={false}
              />

              {castles.map((castle) => {
                const owned = castle.owner === "player";
                const canAttack =
                  phase === "war" &&
                  selectedCastle?.owner === "player" &&
                  selectedCastle.neighbors.includes(castle.id) &&
                  !owned;

                return (
                  <button
                    key={castle.id}
                    onClick={() => setSelectedCastleId(castle.id)}
                    title={castle.name}
                    className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-black shadow-lg transition hover:scale-110 ${
                      owned
                        ? "border-amber-200 text-white"
                        : canAttack
                          ? "border-red-300 bg-red-800 text-white"
                          : "border-stone-200 bg-stone-900 text-stone-100"
                    }`}
                    style={{
                      left: castle.left,
                      top: castle.top,
                      backgroundColor: owned ? houseSigil.color : undefined,
                    }}
                  >
                    {owned ? "YOU" : castle.troops}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="grid gap-4 lg:grid-cols-3">
            <Panel>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                Daily Clock-In
              </p>
              <h2 className="mt-2 text-2xl font-black">Keep Your Banners Raised</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Clock in for points and a small troop boost. Friendly activity should matter.
              </p>
              <button
                onClick={checkIn}
                disabled={checkedInToday}
                className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-3 font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                {checkedInToday ? "Checked In Today" : "Clock In For Points"}
              </button>
              <p className="mt-3 text-sm text-stone-400">Current streak: {dailyStreak} days</p>
            </Panel>

            <Panel>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                Cooperative Aid
              </p>
              <h2 className="mt-2 text-2xl font-black">Help Other Houses</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Spend points to send aid and climb the friendly side of the leaderboard.
              </p>
              <button
                onClick={sendAid}
                disabled={phase !== "diplomacy" || points < 40}
                className="mt-4 w-full rounded-md bg-blue-700 px-4 py-3 font-black transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Send Aid - 40 Points
              </button>
              <p className="mt-3 text-sm text-stone-400">Aid sent: {aidSent}</p>
            </Panel>

            <Panel>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                Realm Duties
              </p>
              <h2 className="mt-2 text-2xl font-black">Quick Things To Do</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Each phase has small duties for players who just want to browse and help.
              </p>
              <p className="mt-3 text-sm text-stone-400">
                Available now: {availableDuties.length}
              </p>
            </Panel>
          </section>
        </div>

        <aside className="space-y-4">
          <Panel>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Turn Phase
            </p>
            <h2 className="mt-2 text-2xl font-black">{currentPhase.name}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-300">{currentPhase.description}</p>

            <div className="mt-4 grid grid-cols-7 gap-1">
              {TURN_PHASES.map((turnPhase) => (
                <button
                  key={turnPhase.id}
                  onClick={() => playerHasCastle && setPhase(turnPhase.id)}
                  className={`h-2 rounded-full ${
                    turnPhase.id === phase ? "bg-amber-400" : "bg-stone-700"
                  }`}
                  title={turnPhase.name}
                />
              ))}
            </div>

            {phase !== "revenue" ? (
              <button
                onClick={advancePhase}
                disabled={!playerHasCastle}
                className="mt-4 w-full rounded-md bg-stone-100 px-5 py-3 font-black text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Advance Phase
              </button>
            ) : (
              <button
                onClick={endTurn}
                disabled={!playerHasCastle}
                className="mt-4 w-full rounded-md bg-amber-500 px-5 py-3 font-black text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Collect Income / Next Turn
              </button>
            )}
          </Panel>

          <Panel>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Your House
            </p>
            {playerHasCastle ? (
              <>
                <h2 className="mt-2 text-2xl font-black">House {houseName}</h2>
                <p className="mt-1 text-stone-300">{houseMotto || "No words declared."}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full border border-amber-200"
                    style={{ backgroundColor: houseSigil.color }}
                  />
                  <span className="font-bold">{houseSigil.name}</span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-stone-300">
                Choose one unclaimed castle to found your noble house.
              </p>
            )}
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Realm Duties</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {currentPhase.name}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {availableDuties.length === 0 ? (
                <p className="text-sm text-stone-400">
                  All duties for this phase are complete. Advance the phase for more.
                </p>
              ) : (
                availableDuties.map((duty) => (
                  <button
                    key={duty.id}
                    onClick={() => completeDuty(duty)}
                    className="w-full border border-stone-800 bg-stone-950 p-3 text-left transition hover:border-amber-400"
                  >
                    <span className="block font-black">{duty.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-stone-400">{duty.detail}</span>
                    <span className="mt-2 block text-xs font-black text-emerald-300">
                      +{duty.points} points / +{duty.renown} renown
                    </span>
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Leaderboard</h2>
              <span className="text-xs font-bold text-amber-300">Friendly Score</span>
            </div>
            <div className="mt-4 space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.house} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-stone-950">
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-black">{entry.house}</p>
                      <p className="text-xs text-stone-500">{entry.role}</p>
                    </div>
                  </div>
                  <p className="font-black text-amber-300">{entry.points.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Realm Sync
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Your realm persists automatically. Returning later resolves offline income, points,
              renown, and garrison growth.
            </p>
            <p className="mt-3 text-sm text-stone-400">Last sync: {formatSyncTime(lastSyncedAt)}</p>
            {syncMessage && (
              <p className="mt-1 text-xs font-bold text-emerald-300">{syncMessage}</p>
            )}
            <button
              onClick={() => syncRealm("Realm synced now")}
              className="mt-4 w-full rounded-md bg-emerald-700 px-4 py-3 font-black transition hover:bg-emerald-600"
            >
              Sync Now
            </button>
          </Panel>

          <button
            onClick={resetGame}
            className="w-full rounded-md border border-stone-700 px-5 py-4 font-black text-stone-300 transition hover:border-red-500 hover:text-red-300"
          >
            Reset Local Realm
          </button>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6">
        <Panel>
          <h2 className="text-xl font-black">War Chronicle</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {battleLog.length === 0 ? (
              <p className="text-stone-400">No ravens have arrived yet.</p>
            ) : (
              battleLog.map((entry) => (
                <p key={entry} className="bg-stone-950 p-3 text-sm text-stone-300">
                  {entry}
                </p>
              ))
            )}
          </div>
        </Panel>
      </section>

      {selectedCastle && (
        <Modal>
          <h2 className="text-center text-3xl font-black">{selectedCastle.name}</h2>
          <p className="mt-1 text-center text-stone-400">{selectedCastle.region}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="Owner" value={selectedCastle.owner === "player" ? `House ${houseName}` : "Unclaimed"} />
            <Info label="Troops" value={selectedCastle.troops} />
            <Info label="Defense" value={`+${selectedCastle.defense}`} />
            <Info label="Income" value={`${selectedCastle.income} gold`} />
          </div>

          {selectedCastle.owner === "player" && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => recruitTroops(selectedCastle.id)}
                disabled={phase !== "muster" || gold < 25}
                className="w-full rounded-md bg-red-700 px-5 py-4 font-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Recruit 25 Troops - 25 Gold
              </button>
              <button
                onClick={() => convertPointsToTroops(selectedCastle.id)}
                disabled={phase !== "muster" || points < 60}
                className="w-full rounded-md bg-emerald-700 px-5 py-4 font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Convert 60 Points To 20 Troops
              </button>
              {phase !== "muster" && (
                <p className="text-sm font-bold text-stone-400">
                  Recruiting and point conversion open during the Muster phase.
                </p>
              )}

              {availableTargets.length > 0 && (
                <div>
                  <h3 className="mb-3 font-black text-amber-300">Attack Nearby Castles</h3>
                  <div className="space-y-2">
                    {availableTargets.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => attackCastle(target.id)}
                        disabled={phase !== "war" || selectedCastle.troops < 30}
                        className="w-full rounded-md border border-red-800 bg-stone-950 px-4 py-3 text-left font-bold transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Attack {target.name} ({target.troops} troops)
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {phase !== "war" && (
                <p className="text-sm font-bold text-stone-400">
                  Attacks open during the War phase.
                </p>
              )}
            </div>
          )}

          {!playerHasCastle && selectedCastle.owner !== "player" && (
            <button
              onClick={() => {
                setCastleToClaimId(selectedCastle.id);
                setSelectedCastleId(null);
                setShowHouseCreator(true);
              }}
              className="mt-6 w-full rounded-md bg-emerald-700 px-5 py-4 font-black transition hover:bg-emerald-600"
            >
              Claim Castle
            </button>
          )}

          {playerHasCastle && selectedCastle.owner !== "player" && (
            <p className="mt-6 bg-stone-950 p-4 font-bold text-stone-300">
              Select one of your neighboring castles during War phase to attack this location.
            </p>
          )}

          <button
            onClick={() => setSelectedCastleId(null)}
            className="mt-3 w-full rounded-md bg-stone-800 px-5 py-4 font-black transition hover:bg-stone-700"
          >
            Close
          </button>
        </Modal>
      )}

      {showHouseCreator && (
        <Modal>
          <h2 className="text-center text-3xl font-black">Found Your Noble House</h2>
          <p className="mt-2 text-center text-stone-400">
            Pick a friendly banner and a seat. You can still grow through points and cooperation.
          </p>

          <div className="mt-6 space-y-3">
            <input
              placeholder="House Name"
              value={houseName}
              onChange={(event) => setHouseName(event.target.value)}
              className="w-full rounded-md border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-400"
            />
            <input
              placeholder="House Words"
              value={houseMotto}
              onChange={(event) => setHouseMotto(event.target.value)}
              className="w-full rounded-md border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-400"
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {SIGILS.map((sigil) => (
              <button
                key={sigil.name}
                onClick={() => setHouseSigil(sigil)}
                className={`rounded-md border p-3 text-sm font-bold transition ${
                  houseSigil.name === sigil.name
                    ? "border-amber-300 bg-stone-700"
                    : "border-stone-700 bg-stone-950 hover:bg-stone-800"
                }`}
              >
                <span
                  className="mx-auto mb-2 block h-8 w-8 rounded-full"
                  style={{ backgroundColor: sigil.color }}
                />
                {sigil.name}
              </button>
            ))}
          </div>

          <div className="mt-5 bg-stone-950 p-4 text-center">
            <p className="font-black">House {houseName || "Unknown"}</p>
            <p className="text-stone-400">&quot;{houseMotto || "Our Words"}&quot;</p>
            {castleToClaim && <p className="mt-2 text-amber-300">Seat: {castleToClaim.name}</p>}
          </div>

          <button
            onClick={claimCastle}
            disabled={!houseName.trim()}
            className="mt-5 w-full rounded-md bg-emerald-700 px-5 py-4 font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            Create House
          </button>

          <button
            onClick={() => {
              setCastleToClaimId(null);
              setShowHouseCreator(false);
            }}
            className="mt-3 w-full rounded-md bg-stone-800 px-5 py-4 font-black transition hover:bg-stone-700"
          >
            Cancel
          </button>
        </Modal>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-stone-700 bg-stone-900 px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="text-xl font-black text-stone-100">{value}</p>
    </div>
  );
}

function Panel({ children }) {
  return <div className="border border-stone-700 bg-stone-900 p-5 shadow-xl">{children}</div>;
}

function Info({ label, value }) {
  return (
    <div className="border border-stone-800 bg-stone-950 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-stone-700 bg-stone-900 p-6 text-stone-100 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
