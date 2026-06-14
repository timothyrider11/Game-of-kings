"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";
import { buildActivity, loadRealmActivity, recordRealmActivity } from "../../lib/realm-activity";
import { loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

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

function playerFighter(realm) {
  const house = realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "House Founder";
  const ruler = realm?.rulerName?.trim() || realm?.houseName?.trim() || "New Challenger";
  const title = realm?.rulerTitle || "Lord";
  const renownBoost = Math.min(16, Math.floor((realm?.renown || 0) / 80));
  const armyBoost = Math.min(12, Math.floor((realm?.army || realm?.troops || 0) / 500));
  return {
    id: "player-house-fighter",
    name: `${title} ${ruler}`,
    house,
    strength: 72 + armyBoost,
    skill: 74 + renownBoost,
    speed: 68,
    endurance: 76 + armyBoost,
    reputation: 80 + renownBoost,
    luck: 62,
    knightImage: realm?.selectedKnightImage || "/knights/male/01.png",
  };
}

function stableScore(fighter) {
  return fighter.strength * 1.2 + fighter.skill * 1.6 + fighter.speed * 1.1 + fighter.endurance + fighter.reputation * 0.7 + fighter.luck * 0.75;
}

function fighterScore(fighter) {
  return (
    fighter.strength * 1.2 +
    fighter.skill * 1.6 +
    fighter.speed * 1.1 +
    fighter.endurance +
    fighter.reputation * 0.7 +
    fighter.luck * Math.random() * 1.5
  );
}

function getWinOdds(a, b) {
  const scoreA = stableScore(a);
  const scoreB = stableScore(b);
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
  return `${line}. ${event}; ${closeness.toLowerCase()}. ${upsetLine}`;
}

function runMatch(a, b, matchType) {
  const odds = getWinOdds(a, b);
  const scoreA = fighterScore(a);
  const scoreB = fighterScore(b);
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

  const tournamentKey = `open-${tournamentType.toLowerCase()}-${bracketSize}`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    setRealm(parsed);
    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
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
        .map((activity) => activity.meta?.fighter)
        .filter(Boolean)
        .filter((fighter, index, all) => all.findIndex((entry) => entry.id === fighter.id || entry.house === fighter.house) === index);
      setPublicEntrants(entrants);
    }

    loadEntrants();
    const timer = setInterval(loadEntrants, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [tournamentKey]);

  const playerEntry = useMemo(() => playerFighter(realm), [realm]);
  const localSignup = realm.tournamentSignups?.[tournamentKey];
  const signedUp = Boolean(localSignup || publicEntrants.some((fighter) => fighter.id === playerEntry.id || fighter.house === playerEntry.house));
  const signupRoster = useMemo(() => {
    const entries = signedUp && !publicEntrants.some((fighter) => fighter.id === playerEntry.id || fighter.house === playerEntry.house)
      ? [playerEntry, ...publicEntrants]
      : publicEntrants;

    return entries
      .filter((fighter, index, all) => all.findIndex((entry) => entry.id === fighter.id || entry.house === fighter.house) === index)
      .slice(0, bracketSize);
  }, [bracketSize, playerEntry, publicEntrants, signedUp]);

  const bracketSlots = useMemo(() => {
    const emptyCount = Math.max(0, bracketSize - signupRoster.length);
    return [...signupRoster, ...Array.from({ length: emptyCount }, (_, index) => ({ id: `empty-${index}`, empty: true, name: "Open Seat", house: "Awaiting a house" }))];
  }, [bracketSize, signupRoster]);

  const nextMatch = currentPairs[0];
  const champion = status === "complete" ? completedRounds.at(-1)?.matches?.at(-1)?.winner : null;

  function openBracketFromSignups() {
    if (signupRoster.length < bracketSize) {
      setMessage(`${bracketSize - signupRoster.length} more houses must sign up before the bracket can begin.`);
      return;
    }

    const roster = [...signupRoster];
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
    setMessage("The bracket is filled from signed houses. The tournament is ready.");
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

  function signUpTournament() {
    if (!realm.houseName?.trim() && !realm.rulerName?.trim()) {
      setMessage("Found your house first, then enter the tournament rolls.");
      return;
    }

    if (signedUp) {
      setMessage("Your house is already written into the tournament rolls.");
      return;
    }

    const fighter = playerFighter(realm);
    const nextRealm = {
      ...realm,
      tournamentSignups: {
        ...(realm.tournamentSignups || {}),
        [tournamentKey]: {
          tournamentType,
          bracketSize,
          fighter,
          at: new Date().toISOString(),
        },
      },
    };

    saveRealm(nextRealm);
    setPublicEntrants((current) => [fighter, ...current].filter((entry, index, all) => all.findIndex((item) => item.id === entry.id || item.house === entry.house) === index));
    recordRealmActivity(buildActivity({
      type: "tournament",
      title: "A House Entered The Lists",
      actor: fighter.house,
      body: `${fighter.name} of ${fighter.house} signed up for the ${tournamentType} tournament.`,
      meta: { action: "signup", tournamentKey, tournamentType, bracketSize, fighter },
    }));
    setHeraldFeed((current) => [`${fighter.house} has entered the ${tournamentType.toLowerCase()} lists.`, ...current].slice(0, 14));
    setMessage("You are signed up. The bracket will fill as more houses join.");
  }

  const resolveNextMatch = useCallback(() => {
    if (!currentPairs.length || status === "complete") return;
    const [pair, ...remaining] = currentPairs;
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
      const nextRealm = {
        ...realm,
        gold: (realm.gold || 350) + (winners[0].id === "player-house-fighter" ? reward.gold : 0),
        renown: (realm.renown || 0) + (winners[0].id === "player-house-fighter" ? reward.honor : 0),
        trophies: winners[0].id === "player-house-fighter" ? [...(realm.trophies || []), reward.trophy] : realm.trophies || [],
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
  }, [completedRounds, currentPairs, predictionPoints, predictions, realm, roundNumber, saveRealm, status, tournamentType]);

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
    const odds = getWinOdds(pair.first, pair.second);
    return { ...pair, odds, matchId: `${roundNumber}-${pair.first.id}-${pair.second.id}` };
  }), [currentPairs, roundNumber]);

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 max-w-[1760px]">
        <div className="relative overflow-hidden border border-[var(--gok-line)] bg-black p-5 shadow-2xl shadow-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2a2218,transparent_35%),linear-gradient(90deg,#070707,#0e0c09_45%,#050505)]" />
          <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="hidden h-24 border border-[var(--gok-line)] bg-[url('/banners/TournamentGrounds.png')] bg-cover bg-left opacity-55 lg:block" />
            <div className="text-center">
              <p className="gok-eyebrow">Tournament Grounds</p>
              <h1 className="mt-2 text-4xl uppercase tracking-[0.34em] text-[var(--gok-silver)] md:text-6xl">Tournament Grounds</h1>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)] sm:grid-cols-4">
                <Stat label="Trial" value={tournamentType} />
                <Stat label="Status" value={status === "signup" ? "Signing Up" : status} />
                <Stat label="Rolls" value={`${signupRoster.length} / ${bracketSize}`} />
                <Stat label="Prize" value="Gold and Trophy" />
              </div>
            </div>
            <div className="hidden h-24 border border-[var(--gok-line)] bg-[url('/banners/TournamentGrounds.png')] bg-cover bg-right opacity-55 lg:block" />
          </div>
          <div className="relative z-10 mt-5 h-3 overflow-hidden border border-red-950 bg-black">
            <div className="h-full bg-red-950" style={{ width: `${Math.round((signupRoster.length / bracketSize) * 100)}%` }} />
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
              <button onClick={signUpTournament} disabled={signedUp || signupRoster.length >= bracketSize} className="gok-btn gok-btn-blood min-h-12 px-5 py-3 disabled:opacity-45">
                {signedUp ? "Already Signed Up" : "Sign Up For The Lists"}
              </button>
              <button onClick={openBracketFromSignups} disabled={signupRoster.length < bracketSize || currentPairs.length > 0 || status === "complete"} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">
                Open Filled Bracket
              </button>
              <button onClick={() => setStatus(status === "running" ? "paused" : "running")} disabled={!currentPairs.length} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">
                {status === "running" ? "Pause Heralds" : "Begin Tournament"}
              </button>
              <button onClick={resolveNextMatch} disabled={!currentPairs.length || status === "complete"} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">Run Next Match</button>
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
                    <FighterCard fighter={pair.second} chance={pair.odds.fighterBChance} alignRight />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button onClick={() => choosePrediction(pair.matchId, pair.first.id)} className={`gok-btn px-3 py-2 text-xs ${predictions[pair.matchId] === pair.first.id ? "border-red-300 text-red-200" : ""}`}>
                      Predict {pair.first.house}
                    </button>
                    <button onClick={() => choosePrediction(pair.matchId, pair.second.id)} className={`gok-btn px-3 py-2 text-xs ${predictions[pair.matchId] === pair.second.id ? "border-red-300 text-red-200" : ""}`}>
                      Predict {pair.second.house}
                    </button>
                  </div>
                </article>
              )) : (
                <div className="grid gap-3 border border-[var(--gok-line)] bg-black/55 p-4">
                  <p className="text-center text-[var(--gok-dim)]">The bracket fills only when real houses sign up.</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {bracketSlots.map((fighter, index) => (
                      <div key={`${fighter.id}-${index}`} className={`flex items-center gap-3 border border-[var(--gok-line)] bg-black/60 p-3 ${fighter.empty ? "opacity-45" : ""}`}>
                        {fighter.empty ? (
                          <div className="grid h-14 w-12 place-items-center border border-dashed border-[var(--gok-line)] text-xs">OPEN</div>
                        ) : (
                          <span className="gok-knight-frame block h-14 w-12">
                            <img src={fighter.knightImage || "/knights/male/01.png"} alt="" className="gok-knight-image h-full w-full object-cover grayscale" />
                          </span>
                        )}
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
      <span className="gok-knight-frame block h-20 w-16 shrink-0">
        <img src={fighter.knightImage || "/knights/male/01.png"} alt="" className="gok-knight-image h-full w-full object-cover grayscale" />
      </span>
      <div className="min-w-0 flex-1">
      <p className="font-serif text-2xl font-black text-[var(--gok-silver)]">{fighter.name}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-red-300">{fighter.house}</p>
      <p className="mt-2 text-sm text-[var(--gok-dim)]">Chance to win: <span className="font-black text-[var(--gok-silver)]">{formatPercent(chance)}</span></p>
      <div className="mt-3 h-2 overflow-hidden border border-[var(--gok-line)] bg-black">
        <div className="h-full bg-red-900" style={{ width: `${chance}%` }} />
      </div>
      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--gok-dim)]">
        STR {fighter.strength} / SKL {fighter.skill} / SPD {fighter.speed} / END {fighter.endurance} / REP {fighter.reputation} / LUCK {fighter.luck}
      </p>
      </div>
    </div>
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
