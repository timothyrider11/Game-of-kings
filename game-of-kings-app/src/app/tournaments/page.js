"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import SigilMark from "../../components/SigilMark";
import SiteNav from "../../components/SiteNav";
import { buildActivity, loadRealmActivity, recordRealmActivity } from "../../lib/realm-activity";
import { getSessionUser, loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

const STORAGE_KEY = "game_of_kings_living_realm";

const weatherOptions = ["sunny", "rain-soaked field", "muddy grounds", "windy archery range", "moonlit melee"];
const crowdMoods = ["calm", "excited", "restless", "furious", "roaring"];
const tournamentEvents = [
  "lance breaks",
  "horse stumbles",
  "shield shatters",
  "knight is injured",
  "noble house rivalry begins",
  "crowd favorite emerges",
  "champion crowned",
];

const tacticalStances = {
  aggressive: {
    key: "aggressive",
    label: "A. Aggressive",
    shortLabel: "Aggressive",
    edge: "Overwhelms calm fighters, but can be baited by balanced fighters.",
    story: "Your champion presses early, forcing broken shields, hard charges, and dangerous openings.",
    modifiers: { strength: 10, skill: 1, speed: 4, endurance: -4, reputation: 2, luck: 2 },
  },
  calm: {
    key: "calm",
    label: "B. Calm and Collected",
    shortLabel: "Calm",
    edge: "Outwaits balanced fighters, but can be overrun by aggressive fighters.",
    story: "Your champion waits, reads the field, and strikes only when the opponent gives away the moment.",
    modifiers: { strength: -2, skill: 8, speed: -2, endurance: 8, reputation: 4, luck: 1 },
  },
  balanced: {
    key: "balanced",
    label: "C. Balanced",
    shortLabel: "Balanced",
    edge: "Punishes reckless aggression, but can be picked apart by calm fighters.",
    story: "Your champion mixes pressure and patience, shifting stance as the crowd and weather change.",
    modifiers: { strength: 4, skill: 4, speed: 4, endurance: 4, reputation: 2, luck: 2 },
  },
};

const stanceCounters = {
  aggressive: "calm",
  calm: "balanced",
  balanced: "aggressive",
};

function playerFighter(realm, sessionUserId = "") {
  const house = realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "House Founder";
  const ruler = realm?.rulerName?.trim() || realm?.houseName?.trim() || "New Challenger";
  const title = realm?.rulerTitle || "Lord";
  const identity = sessionUserId || realm?.accountId || realm?.userId || `${house}-${ruler}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const stance = realm?.activeTournamentStance || "balanced";
  const modifiers = tacticalStances[stance]?.modifiers || tacticalStances.balanced.modifiers;
  const renownBoost = Math.min(16, Math.floor((realm?.renown || 0) / 80));
  const armyBoost = Math.min(12, Math.floor((realm?.army || realm?.troops || 0) / 500));
  return {
    id: `player-house-fighter-${identity}`,
    userId: sessionUserId || realm?.accountId || realm?.userId || "",
    name: `${title} ${ruler}`,
    house,
    stance,
    strength: 72 + armyBoost + modifiers.strength,
    skill: 74 + renownBoost + modifiers.skill,
    speed: 68 + modifiers.speed,
    endurance: 76 + armyBoost + modifiers.endurance,
    reputation: 80 + renownBoost + modifiers.reputation,
    luck: 62 + modifiers.luck,
    knightImage: realm?.selectedKnightImage || "/knights/male/01.png",
    houseSigil: realm?.houseSigil || null,
  };
}

function getTacticalBonus(fighter, opponent) {
  if (!fighter?.stance || !opponent?.stance) return 0;
  if (stanceCounters[fighter.stance] === opponent.stance) return 18;
  if (stanceCounters[opponent.stance] === fighter.stance) return -12;
  return 0;
}

function stableScore(fighter, opponent) {
  return fighter.strength * 1.2 + fighter.skill * 1.6 + fighter.speed * 1.1 + fighter.endurance + fighter.reputation * 0.7 + fighter.luck * 0.75 + getTacticalBonus(fighter, opponent);
}

function fighterScore(fighter, opponent) {
  return (
    fighter.strength * 1.2 +
    fighter.skill * 1.6 +
    fighter.speed * 1.1 +
    fighter.endurance +
    fighter.reputation * 0.7 +
    fighter.luck * Math.random() * 1.5 +
    getTacticalBonus(fighter, opponent)
  );
}

function getWinOdds(a, b) {
  const scoreA = Math.max(20, stableScore(a, b));
  const scoreB = Math.max(20, stableScore(b, a));
  const fighterAChance = Math.round((scoreA / (scoreA + scoreB)) * 100);
  return { fighterAChance, fighterBChance: 100 - fighterAChance };
}

function narrationFor(matchType, winner, loser, closeness, upset, event) {
  const openings = {
    Joust: [`${winner.name} unhorsed ${loser.name} in the second tilt`, `${winner.name} lowered the lance and struck true against ${loser.name}`],
    Archery: [`${winner.name} split the final marker while ${loser.name} watched in disbelief`, `${winner.name} mastered the wind and outshot ${loser.name}`],
    Melee: [`${winner.name} broke ${loser.name}'s guard with a shield rush`, `${winner.name} forced ${loser.name} back through the sanded yard`],
    Smithing: [`${winner.name} reforged a cracked gorget while ${loser.name}'s steel cooled too soon`, `${winner.name} drew a brighter edge from the coals than ${loser.name}`],
  };
  const line = openings[matchType]?.[Math.floor(Math.random() * openings[matchType].length)] || openings.Melee[0];
  const upsetLine = upset ? "A shocking upset sent the crowd into open shouting." : "The favorite held their nerve before the stands.";
  const stanceLine = `${tacticalStances[winner.stance]?.shortLabel || "Balanced"} judgment beat ${tacticalStances[loser.stance]?.shortLabel?.toLowerCase?.() || "balanced"} orders when it mattered.`;
  return `${line}. ${event}; ${closeness.toLowerCase()}. ${stanceLine} ${upsetLine}`;
}

function runMatch(a, b, matchType) {
  const odds = getWinOdds(a, b);
  const scoreA = Math.max(20, fighterScore(a, b));
  const scoreB = Math.max(20, fighterScore(b, a));
  const total = scoreA + scoreB;
  const roll = Math.random() * total;
  const winner = roll < scoreA ? a : b;
  const loser = winner === a ? b : a;
  const winnerChance = winner === a ? odds.fighterAChance : odds.fighterBChance;
  const favorite = odds.fighterAChance >= odds.fighterBChance ? a : b;
  const closenessValue = Math.abs(scoreA - scoreB);
  const closeness = closenessValue < 5 ? "A razor-close match" : closenessValue < 15 ? "A hard-fought contest" : "A dominant victory";
  const event = tournamentEvents[Math.floor(Math.random() * tournamentEvents.length)];
  return {
    id: `${a.id}-${b.id}-${Date.now()}-${Math.random()}`,
    first: a,
    second: b,
    winner,
    loser,
    odds,
    winnerChance,
    closeness,
    event,
    upset: winner.id !== favorite.id && winnerChance < 45,
    narration: narrationFor(matchType, winner, loser, closeness, winner.id !== favorite.id && winnerChance < 45, event),
  };
}

function makePairs(fighters) {
  const pairs = [];
  for (let index = 0; index < fighters.length; index += 2) {
    pairs.push({ first: fighters[index], second: fighters[index + 1] });
  }
  return pairs;
}

function normalizeEntrant(fighter, activity) {
  if (!fighter) return null;
  const userId = fighter.userId || activity?.meta?.userId || activity?.meta?.fighter?.user_id || "";
  const fallback = activity?.id || `${fighter.house || "house"}-${fighter.name || "fighter"}`;
  const id = fighter.id && fighter.id !== "player-house-fighter"
    ? fighter.id
    : `player-house-fighter-${userId || fallback}`;

  return {
    ...fighter,
    id,
    userId,
  };
}

function entrantKey(fighter) {
  return fighter?.userId || fighter?.id || `${fighter?.house || "house"}-${fighter?.name || "fighter"}`;
}

function sameEntrant(a, b) {
  return Boolean(a && b && entrantKey(a) === entrantKey(b));
}

function uniqueEntrants(entries) {
  return entries.filter((fighter, index, all) => all.findIndex((entry) => entrantKey(entry) === entrantKey(fighter)) === index);
}

function rewardForChampion(tournamentType, champion) {
  const trophy = tournamentType === "Joust" ? "Gilded Lance Trophy" : tournamentType === "Archery" ? "Silver Arrow Banner" : tournamentType === "Smithing" ? "Masterwork Anvil Seal" : "Champion's War Banner";
  return {
    gold: 350,
    honor: 60,
    reputation: 45,
    trophy,
    text: `${champion.name} receives ${trophy}, 350 gold, 60 honor, and 45 house reputation.`,
  };
}

function formatPercent(value) {
  return `${value}%`;
}

export default function TournamentsPage() {
  const [realm, setRealm] = useState({});
  const [bracketSize, setBracketSize] = useState(8);
  const [tournamentType, setTournamentType] = useState("Joust");
  const [selectedStance, setSelectedStance] = useState("balanced");
  const [weather, setWeather] = useState(weatherOptions[0]);
  const [crowdMood, setCrowdMood] = useState(crowdMoods[0]);
  const [publicEntrants, setPublicEntrants] = useState([]);
  const [currentPairs, setCurrentPairs] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [status, setStatus] = useState("signup");
  const [heraldFeed, setHeraldFeed] = useState([]);
  const [predictionPoints, setPredictionPoints] = useState(100);
  const [predictions, setPredictions] = useState({});
  const [miniGame, setMiniGame] = useState({ joust: 0, archery: 0, melee: 0, smithing: 0 });
  const [message, setMessage] = useState("");
  const [sessionUserId, setSessionUserId] = useState("");

  const tournamentKey = `open-${tournamentType.toLowerCase()}-${bracketSize}`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    setRealm(parsed);
    setSelectedStance(parsed.activeTournamentStance || "balanced");
    getSessionUser().then(({ user }) => setSessionUserId(user?.id || ""));
    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
      setSelectedStance(cloudRealm.activeTournamentStance || "balanced");
    });
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadEntrants() {
      const { activities } = await loadRealmActivity(500);
      if (!alive) return;
      const entrants = (activities || [])
        .filter((activity) => activity.type === "tournament" && activity.meta?.action === "signup")
        .filter((activity) => activity.meta?.tournamentKey === tournamentKey)
        .map((activity) => normalizeEntrant(activity.meta?.fighter, activity))
        .filter(Boolean)
        .filter((fighter, index, all) => all.findIndex((entry) => entrantKey(entry) === entrantKey(fighter)) === index);
      setPublicEntrants(entrants);
    }

    loadEntrants();
    const timer = setInterval(loadEntrants, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [tournamentKey]);

  const playerEntry = useMemo(() => playerFighter(realm, sessionUserId), [realm, sessionUserId]);
  const localSignup = realm.tournamentSignups?.[tournamentKey];
  const signedUp = Boolean(localSignup || publicEntrants.some((fighter) => sameEntrant(fighter, playerEntry)));
  const signupRoster = useMemo(() => {
    const entries = signedUp && !publicEntrants.some((fighter) => sameEntrant(fighter, playerEntry))
      ? [playerEntry, ...publicEntrants]
      : publicEntrants;

    return uniqueEntrants(entries).slice(0, bracketSize);
  }, [bracketSize, playerEntry, publicEntrants, signedUp]);

  const bracketSlots = useMemo(() => {
    const emptyCount = Math.max(0, bracketSize - signupRoster.length);
    return [...signupRoster, ...Array.from({ length: emptyCount }, (_, index) => ({ id: `empty-${index}`, empty: true, name: "Open Seat", house: "Awaiting a house" }))];
  }, [bracketSize, signupRoster]);

  const nextMatch = currentPairs[0];
  const champion = status === "complete" ? completedRounds.at(-1)?.matches?.at(-1)?.winner : null;
  const isSignedIn = Boolean(sessionUserId);

  function openBracketFromSignups() {
    if (signupRoster.length < 2) {
      setMessage("At least two houses must sign up before the heralds can call the lists.");
      return;
    }

    const roster = [...signupRoster].sort(() => Math.random() - 0.5);
    const nextWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    setCurrentPairs(makePairs(roster));
    setCompletedRounds([]);
    setRoundNumber(1);
    setWeather(nextWeather);
    setCrowdMood("calm");
    setStatus("ready");
    setPredictions({});
    setHeraldFeed([
      `The heralds close the rolls with ${roster.length} signed houses.`,
      `The field is set beneath ${nextWeather}.`,
      `The crowd roars as ${roster[0].house} enters the lists.`,
    ]);
    setMessage("The bracket is called from signed houses. The tournament will run live from here.");
  }

  const saveRealm = useCallback((nextRealm) => {
    setRealm(nextRealm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    saveCloudRealm(nextRealm);
  }, []);

  function choosePrediction(matchId, fighterId) {
    if (!matchId) return;
    setPredictions((current) => ({ ...current, [matchId]: fighterId }));
    setMessage("Prediction recorded with fake points only.");
  }

  async function signUpTournament() {
    if (!isSignedIn) {
      setMessage("Sign in first so the maesters can write your house into the public tournament rolls.");
      return;
    }

    if (!realm.houseName?.trim() && !realm.rulerName?.trim()) {
      setMessage("Found your house first, then enter the tournament rolls.");
      return;
    }

    if (signedUp) {
      setMessage("Your house is already written into the tournament rolls.");
      return;
    }

    const realmWithStance = {
      ...realm,
      activeTournamentStance: selectedStance,
      tournamentChoices: {
        ...(realm.tournamentChoices || {}),
        [tournamentKey]: selectedStance,
      },
    };
    const fighter = playerFighter(realmWithStance, sessionUserId);
    const nextRealm = {
      ...realmWithStance,
      tournamentSignups: {
        ...(realmWithStance.tournamentSignups || {}),
        [tournamentKey]: {
          tournamentType,
          bracketSize,
          stance: selectedStance,
          fighter,
          at: new Date().toISOString(),
        },
      },
    };

    saveRealm(nextRealm);
    setPublicEntrants((current) => uniqueEntrants([fighter, ...current]));
    const { error } = await recordRealmActivity(buildActivity({
      type: "tournament",
      title: "A House Entered The Lists",
      actor: fighter.house,
      body: `${fighter.name} of ${fighter.house} signed up for the ${tournamentType} tournament with ${tacticalStances[selectedStance].shortLabel.toLowerCase()} orders.`,
      meta: { action: "signup", tournamentKey, tournamentType, bracketSize, userId: sessionUserId, fighter },
    }));
    setHeraldFeed((current) => [`${fighter.house} has entered the ${tournamentType.toLowerCase()} lists with ${tacticalStances[selectedStance].shortLabel.toLowerCase()} orders.`, ...current].slice(0, 14));
    setMessage(error || "You are signed up. The bracket will fill as more houses join.");
  }

  const resolveNextMatch = useCallback(() => {
    if (!currentPairs.length || status === "complete") return;
    const [pair, ...remaining] = currentPairs;
    if (!pair.second) {
      const byeLine = `${pair.first.name} advances by an empty bracket lane while the crowd waits for blood.`;
      const currentRound = completedRounds.find((round) => round.roundNumber === roundNumber);
      const byeResult = {
        id: `${roundNumber}-${pair.first.id}-bye`,
        first: pair.first,
        second: null,
        winner: pair.first,
        loser: { name: "Open Seat", house: "No House" },
        odds: { fighterAChance: 100, fighterBChance: 0 },
        winnerChance: 100,
        closeness: "A walkover",
        event: "empty bracket lane",
        upset: false,
        narration: byeLine,
      };
      const updatedRounds = currentRound
        ? completedRounds.map((round) => round.roundNumber === roundNumber ? { ...round, matches: [...round.matches, byeResult] } : round)
        : [...completedRounds, { roundNumber, matches: [byeResult] }];
      const roundMatches = updatedRounds.find((round) => round.roundNumber === roundNumber)?.matches || [];
      setCompletedRounds(updatedRounds);
      setHeraldFeed((current) => [byeLine, ...current].slice(0, 14));

      if (remaining.length) {
        setCurrentPairs(remaining);
        return;
      }

      const winners = roundMatches.map((match) => match.winner);
      if (winners.length === 1) {
        setStatus("complete");
        setCurrentPairs([]);
        setHeraldFeed((current) => [`${winners[0].name} stands alone in the lists.`, ...current].slice(0, 14));
        return;
      }

      setRoundNumber((current) => current + 1);
      setCurrentPairs(makePairs(winners));
      return;
    }
    const matchId = `${roundNumber}-${pair.first.id}-${pair.second.id}`;
    const result = runMatch(pair.first, pair.second, tournamentType);
    const prediction = predictions[matchId];
    const predictedCorrectly = prediction && prediction === result.winner.id;
    const nextPoints = prediction ? predictionPoints + (predictedCorrectly ? 25 : -10) : predictionPoints;
    const nextMood = result.upset ? "roaring" : result.event.includes("injured") ? "restless" : crowdMoods[Math.floor(Math.random() * crowdMoods.length)];
    const feedLine = result.upset
      ? `A shocking upset! ${result.winner.name} of ${result.winner.house} has defeated the favorite.`
      : result.narration;

    const currentRound = completedRounds.find((round) => round.roundNumber === roundNumber);
    const updatedRounds = currentRound
      ? completedRounds.map((round) => round.roundNumber === roundNumber ? { ...round, matches: [...round.matches, result] } : round)
      : [...completedRounds, { roundNumber, matches: [result] }];
    const roundMatches = updatedRounds.find((round) => round.roundNumber === roundNumber)?.matches || [];

    setCompletedRounds(updatedRounds);
    setPredictionPoints(Math.max(0, nextPoints));
    setCrowdMood(nextMood);
    setHeraldFeed((current) => [feedLine, `The crowd is ${nextMood}.`, ...current].slice(0, 14));

    if (remaining.length) {
      setCurrentPairs(remaining);
      return;
    }

    const winners = roundMatches.map((match) => match.winner);
    if (winners.length === 1) {
      const reward = rewardForChampion(tournamentType, winners[0]);
      const playerWon = winners[0].userId
        ? winners[0].userId === sessionUserId
        : winners[0].id === playerEntry.id;
      const nextRealm = {
        ...realm,
        gold: (realm.gold || 350) + (playerWon ? reward.gold : 0),
        renown: (realm.renown || 0) + (playerWon ? reward.honor : 0),
        trophies: playerWon ? [...(realm.trophies || []), reward.trophy] : realm.trophies || [],
        tournamentRewards: [...(realm.tournamentRewards || []), { ...reward, champion: winners[0], at: new Date().toISOString() }],
      };
      saveRealm(nextRealm);
      setStatus("complete");
      setCurrentPairs([]);
      setHeraldFeed((current) => [`The champion receives a golden wreath before the crowd. ${reward.text}`, "A champion is crowned.", ...current].slice(0, 14));
      recordRealmActivity(buildActivity({
        type: "tournament",
        title: "A Champion Was Crowned",
        actor: winners[0].house,
        body: `${winners[0].name} won the ${tournamentType} tournament. ${reward.text}`,
        meta: { tournamentType, champion: winners[0].name, reward },
      }));
      return;
    }

    setRoundNumber((current) => current + 1);
    setCurrentPairs(makePairs(winners));
    setHeraldFeed((current) => [`Round ${roundNumber + 1} is called. Maesters update the odds before the next horns.`, ...current].slice(0, 14));
  }, [completedRounds, currentPairs, playerEntry.id, predictionPoints, predictions, realm, roundNumber, saveRealm, sessionUserId, status, tournamentType]);

  useEffect(() => {
    if (status !== "running") return undefined;
    const timer = setInterval(resolveNextMatch, 4200);
    return () => clearInterval(timer);
  }, [status, resolveNextMatch]);

  useEffect(() => {
    if (status !== "running") return undefined;
    const timer = setInterval(() => {
      const updates = [
        `The crowd roars as ${signupRoster[Math.floor(Math.random() * Math.max(1, signupRoster.length))]?.house || "a noble house"} enters the lists.`,
        "The maesters whisper of an injury.",
        "A noble house rivalry begins near the viewing rail.",
        "The champion's banner snaps above the yard.",
        `The field remains ${weather}.`,
      ];
      setHeraldFeed((current) => [updates[Math.floor(Math.random() * updates.length)], ...current].slice(0, 14));
    }, 6500);
    return () => clearInterval(timer);
  }, [status, signupRoster, weather]);

  function playMiniGame(type) {
    const roll = Math.floor(35 + Math.random() * 66);
    const label = {
      joust: "Joust timing",
      archery: "Archery accuracy",
      melee: "Melee reaction",
      smithing: "Blacksmith upgrade",
    }[type];
    setMiniGame((current) => ({ ...current, [type]: Math.max(current[type], roll) }));
    setPredictionPoints((current) => current + Math.floor(roll / 10));
    setHeraldFeed((current) => [`${label} mini-game scored ${roll}. The training yard awards fake prediction points.`, ...current].slice(0, 14));
  }

  const visiblePairs = useMemo(() => currentPairs.map((pair) => {
    const odds = pair.second ? getWinOdds(pair.first, pair.second) : { fighterAChance: 100, fighterBChance: 0 };
    return { ...pair, odds, matchId: `${roundNumber}-${pair.first.id}-${pair.second?.id || "bye"}` };
  }), [currentPairs, roundNumber]);

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 max-w-[1760px]">
        <div className="relative overflow-hidden border border-[var(--gok-line)] bg-black shadow-2xl shadow-black">
          <div className="absolute inset-0 bg-[url('/banners/TournamentGrounds.png')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.88)_72%,#050505),radial-gradient(circle_at_50%_0%,rgba(138,109,59,.28),transparent_42%)]" />
          <div className="relative z-10 min-h-[330px] px-5 py-8 md:px-10">
            <div className="mx-auto max-w-4xl border border-[rgba(138,109,59,0.35)] bg-black/62 px-4 py-3 text-center shadow-2xl shadow-black backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--gok-parchment)]">Will you be the champion?</p>
              <button onClick={signUpTournament} disabled={signedUp || signupRoster.length >= bracketSize} className="mt-3 border border-red-900 bg-red-950/55 px-12 py-2 text-xs font-black uppercase tracking-[0.24em] text-red-100 transition hover:border-red-400 disabled:opacity-55">
                {signedUp ? "Entered" : "Sign Up To Enter"}
              </button>
            </div>

            <div className="mt-16 text-center md:mt-20">
              <p className="gok-eyebrow">Tournament Grounds</p>
              <h1 className="mt-3 text-4xl uppercase tracking-[0.42em] text-[var(--gok-silver)] drop-shadow-[0_12px_24px_rgba(0,0,0,.95)] sm:text-6xl lg:text-7xl">
                Tournament Grounds
              </h1>
            </div>

            <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)] sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Type of Trial" value={tournamentType} />
              <Stat label="Tournament Begins" value={status === "running" ? "Live Now" : status === "signup" ? "Signing Up" : status} />
              <Stat label="Signed Houses" value={`${signupRoster.length} / ${bracketSize}`} />
              <Stat label="The Prize" value="Glory & Reward" />
            </div>
          </div>
          <div className="relative z-10 border-t border-[var(--gok-line)] bg-black/80 px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-[0.65rem] font-black uppercase tracking-[0.22em] text-red-300">
              <span>{status === "running" ? "Tournament In Progress" : "Tournament Rolls"}</span>
              <span>{signupRoster.length} houses written in</span>
            </div>
            <div className="h-3 overflow-hidden border border-red-950 bg-black">
            <div className="h-full bg-red-950" style={{ width: `${Math.round((signupRoster.length / bracketSize) * 100)}%` }} />
            </div>
          </div>
          {message && <p className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">{message}</p>}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="gok-panel p-5">
            <p className="gok-eyebrow">Master of Lists</p>
            <div className="relative z-10 mt-4 grid gap-3">
              <label className="grid gap-2 text-sm font-black text-[var(--gok-silver)]">
                Bracket Size
                <select value={bracketSize} onChange={(event) => setBracketSize(Number(event.target.value))} className="border border-[var(--gok-line)] bg-black p-3">
                  {[8, 16, 32].map((size) => <option key={size} value={size}>{size} fighters</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-[var(--gok-silver)]">
                Contest
                <select value={tournamentType} onChange={(event) => setTournamentType(event.target.value)} className="border border-[var(--gok-line)] bg-black p-3">
                  {["Joust", "Archery", "Melee", "Smithing"].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <div className="grid gap-2">
                <p className="text-sm font-black text-[var(--gok-silver)]">Choose Your Orders</p>
                {Object.values(tacticalStances).map((stance) => (
                  <button
                    key={stance.key}
                    type="button"
                    onClick={() => setSelectedStance(stance.key)}
                    disabled={signedUp}
                    className={`border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${selectedStance === stance.key ? "border-red-400 bg-red-950/35 text-red-100" : "border-[var(--gok-line)] bg-black/55 text-[var(--gok-silver)] hover:border-[var(--gok-line-strong)]"}`}
                  >
                    <span className="block font-black">{stance.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--gok-dim)]">{stance.edge}</span>
                  </button>
                ))}
              </div>
              <button onClick={signUpTournament} disabled={signedUp || signupRoster.length >= bracketSize} className="gok-btn gok-btn-blood min-h-12 px-5 py-3 disabled:opacity-45">
                {signedUp ? "Entered" : "Sign Up For The Lists"}
              </button>
              <button onClick={openBracketFromSignups} disabled={signupRoster.length < 2 || currentPairs.length > 0 || status === "complete"} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">
                Call The Lists
              </button>
              <button onClick={() => setStatus(status === "running" ? "paused" : "running")} disabled={!currentPairs.length} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">
                {status === "running" ? "Pause Live Tournament" : "Begin Live Tournament"}
              </button>
            </div>
            <div className="relative z-10 mt-5 grid gap-2 text-sm">
              <Stat label="Weather" value={weather} />
              <Stat label="Crowd Mood" value={crowdMood} />
              <Stat label="Prediction Points" value={predictionPoints.toLocaleString()} />
              <Stat label="Round" value={status === "complete" ? "Complete" : roundNumber} />
            </div>
          </aside>

          <section className="gok-panel p-5">
            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="gok-eyebrow">Visible Odds</p>
                <h2 className="mt-2 text-3xl text-[var(--gok-silver)]">Round {roundNumber}</h2>
              </div>
              {champion && <p className="border border-[var(--gok-line)] bg-black/60 px-3 py-2 font-black text-[var(--gok-silver)]">Champion: {champion.name}</p>}
            </div>

            <div className="relative z-10 mt-5 grid gap-4">
              {visiblePairs.length ? visiblePairs.map((pair) => (
                <article key={pair.matchId} className="border border-[var(--gok-line)] bg-black/55 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <FighterCard fighter={pair.first} chance={pair.odds.fighterAChance} />
                    <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">versus</p>
                    {pair.second ? (
                      <FighterCard fighter={pair.second} chance={pair.odds.fighterBChance} alignRight />
                    ) : (
                      <div className="border border-dashed border-[var(--gok-line)] bg-black/45 p-4 text-right">
                        <p className="font-serif text-2xl font-black text-[var(--gok-silver)]">Open Lane</p>
                        <p className="mt-2 text-sm text-[var(--gok-dim)]">This house advances unless another entrant fills the lists before the horn.</p>
                      </div>
                    )}
                  </div>
                  {pair.second && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button onClick={() => choosePrediction(pair.matchId, pair.first.id)} className={`gok-btn px-3 py-2 text-xs ${predictions[pair.matchId] === pair.first.id ? "border-red-300 text-red-200" : ""}`}>
                        Predict {pair.first.house}
                      </button>
                      <button onClick={() => choosePrediction(pair.matchId, pair.second.id)} className={`gok-btn px-3 py-2 text-xs ${predictions[pair.matchId] === pair.second.id ? "border-red-300 text-red-200" : ""}`}>
                        Predict {pair.second.house}
                      </button>
                    </div>
                  )}
                </article>
              )) : (
                <div className="grid gap-3 border border-[var(--gok-line)] bg-black/55 p-4">
                  <p className="text-center text-[var(--gok-dim)]">The bracket fills only when real houses sign up.</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {bracketSlots.map((fighter, index) => (
                      <div key={`${fighter.id}-${index}`} className={`flex items-center gap-3 border border-[var(--gok-line)] bg-black/60 p-3 ${fighter.empty ? "opacity-45" : ""}`}>
                        {fighter.empty ? (
                          <div className="grid h-14 w-12 place-items-center border border-dashed border-[var(--gok-line)] text-xs">OPEN</div>
                        ) : <FighterIdentity fighter={fighter} compact />}
                        <div>
                          <p className="font-black text-[var(--gok-silver)]">{fighter.name}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)]">{fighter.house}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-6">
              <p className="gok-eyebrow">Completed Matches</p>
              <div className="mt-3 max-h-[460px] overflow-y-auto border border-[var(--gok-line)] bg-black/40 p-3">
                {completedRounds.flatMap((round) => round.matches.map((match) => ({ ...match, roundNumber: round.roundNumber }))).map((match) => (
                  <div key={match.id} className="border-b border-[rgba(196,193,184,0.1)] py-3 last:border-b-0">
                    <p className="font-black text-[var(--gok-silver)]">Round {match.roundNumber}: {match.winner.name} defeated {match.loser.name}</p>
                    <p className="mt-1 text-sm text-[rgba(210,205,194,0.72)]">Winning odds: {formatPercent(match.winnerChance)}. {match.closeness}. {match.narration}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="gok-panel p-5">
              <p className="gok-eyebrow">{"Herald's Board"}</p>
              <div className="relative z-10 mt-4 max-h-80 overflow-y-auto border border-[var(--gok-line)] bg-black/50">
                {heraldFeed.map((line, index) => (
                  <p key={`${line}-${index}`} className="border-b border-[rgba(196,193,184,0.1)] p-3 text-sm leading-6 text-[rgba(210,205,194,0.78)] last:border-b-0">{line}</p>
                ))}
              </div>
            </section>

            <section className="gok-panel p-5">
              <p className="gok-eyebrow">Mini-Games</p>
              <div className="relative z-10 mt-4 grid gap-3">
                <MiniGameButton title="Joust timing game" score={miniGame.joust} onClick={() => playMiniGame("joust")} />
                <MiniGameButton title="Archery accuracy game" score={miniGame.archery} onClick={() => playMiniGame("archery")} />
                <MiniGameButton title="Melee duel reaction" score={miniGame.melee} onClick={() => playMiniGame("melee")} />
                <MiniGameButton title="Blacksmith upgrade" score={miniGame.smithing} onClick={() => playMiniGame("smithing")} />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-[var(--gok-line)] bg-black/50 p-3">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">{label}</p>
      <p className="mt-1 font-black text-[var(--gok-silver)]">{value}</p>
    </div>
  );
}

function FighterCard({ fighter, chance, alignRight = false }) {
  return (
    <div className={`flex gap-3 ${alignRight ? "flex-row-reverse text-right" : ""}`}>
      <FighterIdentity fighter={fighter} />
      <div className="min-w-0 flex-1">
      <p className="font-serif text-2xl font-black text-[var(--gok-silver)]">{fighter.name}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-red-300">{fighter.house}</p>
      <p className="mt-2 text-sm text-[var(--gok-dim)]">Chance to win: <span className="font-black text-[var(--gok-silver)]">{formatPercent(chance)}</span></p>
      <div className="mt-3 h-2 overflow-hidden border border-[var(--gok-line)] bg-black">
        <div className="h-full bg-red-900" style={{ width: `${chance}%` }} />
      </div>
      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--gok-dim)]">
        {tacticalStances[fighter.stance]?.shortLabel || "Balanced"} / STR {fighter.strength} / SKL {fighter.skill} / SPD {fighter.speed} / END {fighter.endurance} / REP {fighter.reputation} / LUCK {fighter.luck}
      </p>
      </div>
    </div>
  );
}

function FighterIdentity({ fighter, compact = false }) {
  return (
    <span className={`relative block shrink-0 ${compact ? "h-14 w-12" : "h-20 w-16"}`}>
      <span className="gok-knight-frame block h-full w-full">
        <img src={fighter.knightImage || "/knights/male/01.png"} alt="" className="gok-knight-image h-full w-full object-cover grayscale" />
      </span>
      {fighter.houseSigil?.layers?.length && (
        <span className={`absolute -bottom-2 -right-2 block ${compact ? "h-8 w-7" : "h-10 w-8"}`}>
          <SigilMark sigil={fighter.houseSigil} label={`${fighter.house} sigil`} />
        </span>
      )}
    </span>
  );
}

function MiniGameButton({ title, score, onClick }) {
  return (
    <button onClick={onClick} className="border border-[var(--gok-line)] bg-black/55 p-3 text-left transition hover:border-[var(--gok-line-strong)]">
      <span className="block font-black text-[var(--gok-silver)]">{title}</span>
      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)]">Best score: {score || "not played"}</span>
    </button>
  );
}
