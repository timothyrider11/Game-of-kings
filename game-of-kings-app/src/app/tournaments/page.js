"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";
import { buildActivity, recordRealmActivity } from "../../lib/realm-activity";
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

const baseFighters = [
  ["Ser Alaric", "House Vance", 72, 82, 67, 76, 54, 65],
  ["Lord Webber", "House Webber", 68, 70, 59, 78, 63, 58],
  ["Ser Mandon", "House Moore", 78, 66, 52, 74, 48, 62],
  ["Lady Rohanne", "House Rowan", 60, 86, 74, 70, 80, 64],
  ["Lord Caswell", "House Caswell", 70, 73, 66, 72, 58, 52],
  ["Ser Janos", "House Slynt", 55, 61, 58, 64, 45, 78],
  ["Ser Brynden", "House Tully", 76, 79, 70, 82, 76, 57],
  ["Lord Royce", "House Royce", 84, 72, 55, 85, 70, 49],
  ["Ser Gwayne", "House Hightower", 69, 83, 66, 71, 82, 50],
  ["Lady Ynys", "House Arryn", 58, 78, 82, 69, 68, 70],
  ["Ser Marq", "House Piper", 64, 72, 88, 62, 52, 74],
  ["Lord Manderly", "House Manderly", 80, 68, 54, 88, 74, 48],
  ["Ser Damon", "House Lannister", 77, 80, 69, 72, 88, 55],
  ["Lady Myria", "House Martell", 61, 84, 90, 66, 72, 69],
  ["Ser Harlan", "House Tyrell", 66, 81, 73, 70, 84, 61],
  ["Lord Stark", "House Stark", 82, 74, 63, 90, 86, 44],
  ["Ser Osric", "House Dayne", 73, 91, 79, 72, 89, 60],
  ["Lord Celtigar", "House Celtigar", 67, 69, 62, 76, 71, 72],
  ["Ser Addam", "House Velaryon", 70, 82, 85, 73, 78, 56],
  ["Lord Tarth", "House Tarth", 86, 70, 58, 84, 73, 50],
  ["Ser Symon", "House Dondarrion", 74, 76, 67, 79, 68, 63],
  ["Lady Alys", "House Blackwood", 59, 83, 77, 68, 75, 80],
  ["Ser Walder", "House Frey", 62, 65, 58, 70, 67, 79],
  ["Lord Mallister", "House Mallister", 75, 77, 69, 78, 76, 53],
  ["Ser Theo", "House Redwyne", 63, 75, 71, 66, 72, 76],
  ["Lady Elinor", "House Beesbury", 55, 74, 80, 64, 58, 85],
  ["Ser Lyonel", "House Baratheon", 91, 70, 59, 82, 84, 46],
  ["Lord Yronwood", "House Yronwood", 79, 73, 66, 80, 72, 57],
  ["Ser Rolland", "House Storm", 83, 68, 64, 86, 61, 66],
  ["Lady Meredyth", "House Crane", 57, 82, 86, 65, 69, 73],
  ["Ser Quentyn", "House Qorgyle", 66, 76, 78, 69, 62, 81],
  ["Lord Harlaw", "House Harlaw", 81, 69, 61, 88, 70, 54],
];

function fighterFromRow(row, index) {
  const [name, house, strength, skill, speed, endurance, reputation, luck] = row;
  return { id: `${house}-${name}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, house, strength, skill, speed, endurance, reputation, luck };
}

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
  const [fighters, setFighters] = useState([]);
  const [currentPairs, setCurrentPairs] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [completedRounds, setCompletedRounds] = useState([]);
  const [status, setStatus] = useState("idle");
  const [heraldFeed, setHeraldFeed] = useState([]);
  const [predictionPoints, setPredictionPoints] = useState(100);
  const [predictions, setPredictions] = useState({});
  const [miniGame, setMiniGame] = useState({ joust: 0, archery: 0, melee: 0, smithing: 0 });
  const [message, setMessage] = useState("");

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

  const nextMatch = currentPairs[0];
  const champion = status === "complete" ? completedRounds.at(-1)?.matches?.at(-1)?.winner : null;

  function seedTournament(size = bracketSize, type = tournamentType) {
    const roster = [playerFighter(realm), ...baseFighters.map(fighterFromRow)]
      .filter((fighter, index, all) => all.findIndex((entry) => entry.house === fighter.house) === index)
      .slice(0, size)
      .sort(() => Math.random() - 0.5);
    const nextWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    setFighters(roster);
    setCurrentPairs(makePairs(roster));
    setCompletedRounds([]);
    setRoundNumber(1);
    setWeather(nextWeather);
    setCrowdMood("calm");
    setStatus("ready");
    setPredictions({});
    setHeraldFeed([
      `The heralds call ${roster.length} houses to the lists for a ${type.toLowerCase()} tournament.`,
      `The field is set beneath ${nextWeather}.`,
      `The crowd roars as ${roster[0].house} enters the lists.`,
    ]);
    setMessage("Tournament seeded. Press start and the bracket will run automatically.");
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
        `The crowd roars as ${fighters[Math.floor(Math.random() * Math.max(1, fighters.length))]?.house || "a noble house"} enters the lists.`,
        "The maesters whisper of an injury.",
        "A noble house rivalry begins near the viewing rail.",
        "The champion's banner snaps above the yard.",
        `The field remains ${weather}.`,
      ];
      setHeraldFeed((current) => [updates[Math.floor(Math.random() * updates.length)], ...current].slice(0, 14));
    }, 6500);
    return () => clearInterval(timer);
  }, [status, fighters, weather]);

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

      <section className="mx-auto mt-6 max-w-7xl">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Tournament Grounds</p>
          <h1 className="relative z-10 mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)] md:text-5xl">
            Automatic medieval tournament.
          </h1>
          <p className="gok-copy relative z-10 mt-4 max-w-4xl text-sm leading-6">
            Weighted brackets, visible odds, herald updates, crowd mood, weather, injuries, upsets, fake prediction points, trophies, and mini-games for the living realm.
          </p>
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
              <button onClick={() => seedTournament()} className="gok-btn gok-btn-blood min-h-12 px-5 py-3">Seed Tournament</button>
              <button onClick={() => setStatus(status === "running" ? "paused" : "running")} disabled={!currentPairs.length} className="gok-btn min-h-12 px-5 py-3 disabled:opacity-45">
                {status === "running" ? "Pause Heralds" : "Start Automatic Run"}
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
                <div className="border border-[var(--gok-line)] bg-black/55 p-6 text-center text-[var(--gok-dim)]">
                  Seed a tournament to call fighters to the lists.
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
    <div className={alignRight ? "text-right" : ""}>
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
