"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import SigilMark from "../../components/SigilMark";
import SiteNav from "../../components/SiteNav";
import { formatDragonCountdown, getNextDragonEpisode } from "../../lib/dragon-countdown";
import { artifactCatalog } from "../../lib/artifacts";
import { buildActivity, loadRealmActivity, recordRealmActivity } from "../../lib/realm-activity";
import { getSessionUser, loadCloudRealm, loadPublicProfiles, saveCloudRealm } from "../../lib/realm-cloud";
import { formatTournamentCountdown, getTournamentCycle } from "../../lib/tournament-schedule";

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

const tourneyNames = {
  Joust: ["The Tourney of Broken Lances", "The Silver Tilt", "The Lists of Ash and Steel", "The King's Road Joust"],
  Archery: ["The Blackwood Bowmeet", "The Wind-Read Trial", "The Flight of Red Arrows", "The Winter Marks"],
  Melee: ["The Winter Lists", "The Yard of Splintered Shields", "The Iron Ring Melee", "The Clash Beneath the Banners"],
  "Horse Racing": ["The Thundering Course", "The Dustroad Run", "The Bannerfield Race", "The Queen's Gallop"],
};

const proclamationOpeners = [
  "By wax, seal, and ringing horn, the realm is called to witness",
  "Let every keep, market, and smoky inn hear word of",
  "Under watched banners and sharpened whispers, the heralds announce",
  "Before the eyes of noble houses and gathered smallfolk comes",
];

const proclamationMiddles = [
  "where bold names will be weighed before the crowd",
  "where quiet wagers pass from glove to glove",
  "where banners rise, grudges stir, and songs wait for a victor",
  "where glory may be won before the last torch gutters",
];

const waitingScenes = [
  "Merchants drag canvas stalls into place while children chase loose ribbons beneath the stands.",
  "House banners are lifted by squires whose fingers are already numb from the morning air.",
  "The inns near the grounds have no empty benches, only cups, rumors, and louder rumors.",
  "A septon blesses the field while a hedge knight checks the same buckle for the seventh time.",
  "Smallfolk gather along the rail, trading names of favorites as if they were copper coins.",
  "A quiet noble writes a wager into a folded note and sends it away under a servant's sleeve.",
  "The master of lists walks the yard, testing mud, rope, and timber with a frown.",
  "Ravens circle the kitchens, drawn by smoke, shouting, and the promise of dropped crusts.",
];

const preTournamentRavens = [
  "The grounds are not yet open, but every banner pole has eyes beneath it.",
  "A groom swears the horses know a tournament is coming before the riders do.",
  "The master of lists has ordered fresh chalk for the lanes and fresh silence from the gamblers.",
  "A cupbearer claims two houses nearly quarreled over a place near the viewing rail.",
  "The crowd has not gathered, but the realm is already talking.",
];

const finishedRavens = [
  "The benches empty slowly. No one wishes to be the first to stop speaking of the champion.",
  "The heralds copy the final result into the royal chronicle before the ink can dry.",
  "Squires gather splinters, bent arrows, and scraps of ribbon from the field.",
  "By dusk, the champion's name is already louder than the bells.",
];

function hashText(text = "") {
  return text.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0) >>> 0;
}

function pickFrom(list, seed, offset = 0) {
  return list[(hashText(`${seed}-${offset}`) % list.length)];
}

function getTournamentName(tournamentType, tournamentKey) {
  return pickFrom(tourneyNames[tournamentType] || tourneyNames.Melee, tournamentKey);
}

function buildRoyalProclamation({ tournamentName, tournamentType, weather, crowdMood, countdown, tournamentKey }) {
  const opener = pickFrom(proclamationOpeners, tournamentKey, 1);
  const middle = pickFrom(proclamationMiddles, tournamentKey, 2);
  const moodLine = crowdMood === "roaring"
    ? "The stands already feel hungry for a name to shout."
    : crowdMood === "restless"
      ? "Even before the first horn, unease moves through the benches."
      : "The realm waits with measured breath.";
  return `${opener} ${tournamentName}, a ${tournamentType.toLowerCase()} trial beneath ${weather}, ${middle}. ${moodLine} The first horn is marked for ${countdown}.`;
}

function buildRealmAwaits(tournamentKey) {
  return [0, 1, 2, 3, 4]
    .map((offset) => pickFrom(waitingScenes, tournamentKey, offset))
    .filter((line, index, all) => all.indexOf(line) === index)
    .slice(0, 5);
}

function buildStateRavens({ status, tournamentCycle, tournamentKey, signupRoster, completedMatches, champion, weather, crowdMood }) {
  if (status === "complete" && champion) {
    const finalMatch = completedMatches.at(-1);
    return [
      `${champion.name} is named before the stands, and ${champion.house} answers with raised colors.`,
      finalMatch?.loser?.name ? `${finalMatch.loser.name} leaves with honor, though the final word belongs elsewhere.` : pickFrom(finishedRavens, tournamentKey, 1),
      pickFrom(finishedRavens, tournamentKey, 2),
    ];
  }

  if (status === "running" || tournamentCycle.isLive) {
    const lastMatch = completedMatches.at(-1);
    return [
      lastMatch ? `The latest raven names ${lastMatch.winner.name} after ${lastMatch.closeness.toLowerCase()}.` : `The field is live beneath ${weather}, and the first calls are being made.`,
      `The crowd is ${crowdMood}, and every new bout changes the sound of the grounds.`,
      `${signupRoster.length} houses are written into the lists for this trial.`,
    ];
  }

  return [
    pickFrom(preTournamentRavens, tournamentKey, 1),
    pickFrom(preTournamentRavens, tournamentKey, 2),
    `${signupRoster.length} houses are already expected at the grounds.`,
  ];
}

function buildChronicle({ tournamentKey, tournamentName, tournamentType, weather, crowdMood, champion, completedMatches, prizeArtifact, previousChronicles }) {
  const finalMatch = completedMatches.at(-1);
  const runnerUp = finalMatch?.loser || null;
  const upset = completedMatches.find((match) => match.upset);
  const closeFinal = finalMatch?.closeness === "A razor-close match";
  const repeatedChampion = previousChronicles.some((entry) => entry.champion === champion.name);
  const notableMoment = upset
    ? `${upset.winner.name} overturned the expected order against ${upset.loser.name}.`
    : closeFinal
      ? `${champion.name} survived a final so close the judges leaned over the rail.`
      : finalMatch?.event
        ? `${finalMatch.event} became the moment most retold by the crowd.`
        : `${champion.name} stood unbeaten when the last horn faded.`;
  const artifactHint = prizeArtifact
    ? ` Some swore ${prizeArtifact.name} seemed to wait for the champion as if old stories had chosen a side.`
    : "";
  const repeatLine = repeatedChampion
    ? ` This was not the first time the realm had heard ${champion.name} named with awe.`
    : ` For many in the crowd, this was the first time the champion's name felt like history.`;
  const summary = `${tournamentName} was fought as a ${tournamentType.toLowerCase()} trial beneath ${weather}, before a ${crowdMood} crowd. ${runnerUp?.name ? `${runnerUp.name} pressed to the final, but ${champion.name} carried the day for ${champion.house}.` : `${champion.name} carried the day for ${champion.house}.`} ${notableMoment}${repeatLine}${artifactHint}`;

  return {
    id: tournamentKey,
    tournamentName,
    date: new Date().toISOString(),
    tournamentType,
    weather,
    crowdMood,
    champion: champion.name,
    championHouse: champion.house,
    championSigil: champion.houseSigil || null,
    runnerUp: runnerUp?.name || "No final opponent recorded",
    runnerUpHouse: runnerUp?.house || "",
    runnerUpSigil: runnerUp?.houseSigil || null,
    notableMoment,
    summary,
    matchCount: completedMatches.length,
    prize: prizeArtifact?.name || "Glory & Reward",
  };
}

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

function profileFighter(profile) {
  const ruler = profile?.ruler_name?.trim() || profile?.username?.trim() || "New Challenger";
  const title = profile?.ruler_title || "Lord";
  const houseStem = profile?.username?.trim() || ruler;
  const seed = hashText(`${profile?.user_id || houseStem}-${ruler}`);
  const stanceKeys = Object.keys(tacticalStances);
  const stance = stanceKeys[seed % stanceKeys.length];
  const modifiers = tacticalStances[stance]?.modifiers || tacticalStances.balanced.modifiers;

  return {
    id: `profile-fighter-${profile?.user_id || normalizeEntryText(houseStem)}`,
    userId: profile?.user_id || "",
    name: `${title} ${ruler}`,
    house: `House ${houseStem}`,
    stance,
    strength: 66 + (seed % 10) + modifiers.strength,
    skill: 68 + ((seed >> 2) % 10) + modifiers.skill,
    speed: 66 + ((seed >> 3) % 10) + modifiers.speed,
    endurance: 68 + ((seed >> 4) % 10) + modifiers.endurance,
    reputation: 70 + ((seed >> 5) % 12) + modifiers.reputation,
    luck: 58 + ((seed >> 6) % 15) + modifiers.luck,
    knightImage: profile?.avatar_url || "/knights/male/01.png",
    houseSigil: null,
    autoEnrolled: true,
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
    "Horse Racing": [`${winner.name} cut the final turn beneath whipping banners while ${loser.name} lost the line`, `${winner.name} drove through the dust and crossed the posts ahead of ${loser.name}`],
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
  const email = fighter.email || activity?.meta?.email || activity?.meta?.fighter?.email || "";
  const fallback = activity?.id || `${fighter.house || "house"}-${fighter.name || "fighter"}`;
  const id = fighter.id && fighter.id !== "player-house-fighter"
    ? fighter.id
    : `player-house-fighter-${userId || fallback}`;

  return {
    ...fighter,
    id,
    userId,
    email,
  };
}

function normalizeEntryText(value = "") {
  return value.toString().trim().toLowerCase().replace(/^house\s+/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function entrantKey(fighter) {
  const stableIdentity = fighter?.userId || fighter?.email;
  if (stableIdentity) return stableIdentity.toString().trim().toLowerCase();
  return entrantNameKey(fighter);
}

function entrantNameKey(fighter) {
  return `${normalizeEntryText(fighter?.house || "house")}::${normalizeEntryText(fighter?.name || "fighter")}`;
}

function sameEntrant(a, b) {
  return Boolean(a && b && (entrantKey(a) === entrantKey(b) || entrantNameKey(a) === entrantNameKey(b)));
}

function uniqueEntrants(entries) {
  return entries.filter((fighter, index, all) => all.findIndex((entry) => sameEntrant(entry, fighter)) === index);
}

function rewardForChampion(tournamentType, champion, prizeArtifact) {
  const trophy = tournamentType === "Joust" ? "Gilded Lance Trophy" : tournamentType === "Archery" ? "Silver Arrow Banner" : tournamentType === "Smithing" ? "Masterwork Anvil Seal" : "Champion's War Banner";
  const artifactText = prizeArtifact ? ` The Sunday relic awarded: ${prizeArtifact.name}.` : "";
  return {
    gold: 350,
    honor: 60,
    reputation: 45,
    trophy,
    artifact: prizeArtifact?.name || null,
    text: `${champion.name} receives ${trophy}, 350 gold, 60 honor, and 45 house reputation.${artifactText}`,
  };
}

function formatPercent(value) {
  return `${value}%`;
}

function formatElapsedDuration(duration) {
  const elapsed = Math.max(0, duration);
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function TournamentsPage() {
  const [realm, setRealm] = useState({});
  const [bracketSize, setBracketSize] = useState(8);
  const [now, setNow] = useState(() => Date.now());
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
  const [message, setMessage] = useState("");
  const [sessionUserId, setSessionUserId] = useState("");

  const tournamentCycle = useMemo(() => getTournamentCycle(now), [now]);
  const tournamentType = tournamentCycle.type;
  const tournamentKey = tournamentCycle.tournamentKey;
  const tournamentCountdown = tournamentCycle.isLive
    ? formatTournamentCountdown(tournamentCycle.endTime, now)
    : formatTournamentCountdown(tournamentCycle.nextStartTime, now);
  const prizeArtifact = useMemo(
    () => tournamentCycle.isSunday ? artifactCatalog[tournamentCycle.cycleIndex % artifactCatalog.length] : null,
    [tournamentCycle.cycleIndex, tournamentCycle.isSunday]
  );
  const tournamentName = useMemo(() => getTournamentName(tournamentType, tournamentKey), [tournamentKey, tournamentType]);
  const royalProclamation = useMemo(() => buildRoyalProclamation({
    tournamentName,
    tournamentType,
    weather,
    crowdMood,
    countdown: tournamentCountdown,
    tournamentKey,
  }), [crowdMood, tournamentCountdown, tournamentKey, tournamentName, tournamentType, weather]);
  const realmAwaits = useMemo(() => buildRealmAwaits(tournamentKey), [tournamentKey]);
  const chronicleArchive = useMemo(() => realm.tournamentChronicles || [], [realm.tournamentChronicles]);
  const nextDragonEpisode = useMemo(() => getNextDragonEpisode(now), [now]);
  const nextDragonEpisodeTime = nextDragonEpisode ? new Date(nextDragonEpisode.at).getTime() : null;
  const dragonCountdown = nextDragonEpisodeTime ? formatDragonCountdown(nextDragonEpisodeTime, now) : "Season complete";

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
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCurrentPairs([]);
    setCompletedRounds([]);
    setRoundNumber(1);
    setStatus("signup");
    setPredictions({});
    setCrowdMood("calm");
    setWeather(weatherOptions[hashText(tournamentKey) % weatherOptions.length]);
    setHeraldFeed([
      tournamentCycle.isLive
        ? `The ${tournamentType.toLowerCase()} tournament window is open. The bracket forms from saved realm accounts.`
        : `The next ${tournamentType.toLowerCase()} tournament begins in ${formatTournamentCountdown(tournamentCycle.nextStartTime, Date.now())}.`,
      prizeArtifact
        ? `Sunday's prize is ${prizeArtifact.name}, a singular artifact for the champion.`
        : "This cycle awards gold, honor, reputation, and a champion's trophy.",
    ]);
    setMessage(tournamentCycle.isLive ? "The tournament rolls are open for this live cycle." : "Tournament orders are open for the next 12-hour cycle.");
  }, [prizeArtifact, tournamentCycle.isLive, tournamentCycle.nextStartTime, tournamentKey, tournamentType]);

  useEffect(() => {
    let alive = true;

    async function loadEntrants() {
      const [{ activities }, { profiles }] = await Promise.all([
        loadRealmActivity(500),
        loadPublicProfiles(160),
      ]);
      if (!alive) return;
      const accountEntrants = (profiles || []).map(profileFighter);
      const activityEntrants = (activities || [])
        .filter((activity) => activity.type === "tournament" && activity.meta?.action === "signup")
        .filter((activity) => activity.meta?.tournamentKey === tournamentKey)
        .map((activity) => normalizeEntrant(activity.meta?.fighter, activity))
        .filter(Boolean);
      setPublicEntrants(uniqueEntrants([...accountEntrants, ...activityEntrants]));
    }

    loadEntrants();
    const timer = setInterval(loadEntrants, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [tournamentKey]);

  const playerEntry = useMemo(() => playerFighter(realm, sessionUserId), [realm, sessionUserId]);
  const isSignedIn = Boolean(sessionUserId);
  const localSignup = realm.tournamentSignups?.[tournamentKey];
  const signedUp = Boolean(localSignup || publicEntrants.some((fighter) => sameEntrant(fighter, playerEntry)));
  const effectiveBracketSize = useMemo(() => {
    const entrantCount = uniqueEntrants(isSignedIn ? [playerEntry, ...publicEntrants] : publicEntrants).length;
    return [8, 16, 32].find((size) => size >= Math.max(bracketSize, entrantCount)) || 32;
  }, [bracketSize, isSignedIn, playerEntry, publicEntrants]);
  const signupRoster = useMemo(() => {
    const entries = isSignedIn
      ? [playerEntry, ...publicEntrants]
      : publicEntrants;

    return uniqueEntrants(entries).slice(0, effectiveBracketSize);
  }, [effectiveBracketSize, isSignedIn, playerEntry, publicEntrants]);

  const bracketSlots = useMemo(() => {
    const emptyCount = Math.max(0, effectiveBracketSize - signupRoster.length);
    return [...signupRoster, ...Array.from({ length: emptyCount }, (_, index) => ({ id: `empty-${index}`, empty: true, name: "Open Seat", house: "Awaiting a house" }))];
  }, [effectiveBracketSize, signupRoster]);

  const nextMatch = currentPairs[0];
  const champion = status === "complete" ? completedRounds.at(-1)?.matches?.at(-1)?.winner : null;

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
      setMessage("Sign in first so the maesters can read your tournament orders.");
      return;
    }

    if (!realm.houseName?.trim() && !realm.rulerName?.trim()) {
      setMessage("Found your house first, then enter the tournament rolls.");
      return;
    }

    if (tournamentCycle.isLive) {
      setMessage("The horns have sounded. Your next orders can be set for the following 12-hour tournament.");
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

    if (signedUp) {
      saveRealm(realmWithStance);
      setPublicEntrants((current) => uniqueEntrants([fighter, ...current]));
      setHeraldFeed((current) => [`${fighter.house} updates the lists with ${tacticalStances[selectedStance].shortLabel.toLowerCase()} orders.`, ...current].slice(0, 14));
      setMessage("Tournament orders updated. Your account remains automatically entered.");
      return;
    }

    if (publicEntrants.some((entry) => sameEntrant(entry, fighter))) {
      saveRealm(realmWithStance);
      setPublicEntrants((current) => uniqueEntrants([fighter, ...current]));
      setMessage("Tournament orders updated. Your account remains automatically entered.");
      return;
    }

    const nextRealm = {
      ...realmWithStance,
      tournamentSignups: {
        ...(realmWithStance.tournamentSignups || {}),
        [tournamentKey]: {
          tournamentType,
          bracketSize: effectiveBracketSize,
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
      meta: { action: "signup", tournamentKey, tournamentType, bracketSize: effectiveBracketSize, userId: sessionUserId, email: realm.email || "", fighter },
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
      const reward = rewardForChampion(tournamentType, winners[0], prizeArtifact);
      const playerWon = winners[0].userId
        ? winners[0].userId === sessionUserId
        : winners[0].id === playerEntry.id;
      const nextArtifacts = playerWon && prizeArtifact
        ? Array.from(new Set([...(realm.artifactInventory || []), prizeArtifact.name]))
        : realm.artifactInventory || [];
      const nextRealm = {
        ...realm,
        gold: (realm.gold || 350) + (playerWon ? reward.gold : 0),
        renown: (realm.renown || 0) + (playerWon ? reward.honor : 0),
        trophies: playerWon ? [...(realm.trophies || []), reward.trophy] : realm.trophies || [],
        artifactInventory: nextArtifacts,
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
        meta: { tournamentType, tournamentKey, champion: winners[0].name, reward, artifact: prizeArtifact?.name || "" },
      }));
      return;
    }

    setRoundNumber((current) => current + 1);
    setCurrentPairs(makePairs(winners));
    setHeraldFeed((current) => [`Round ${roundNumber + 1} is called. Maesters update the odds before the next horns.`, ...current].slice(0, 14));
  }, [completedRounds, currentPairs, playerEntry.id, predictionPoints, predictions, prizeArtifact, realm, roundNumber, saveRealm, sessionUserId, status, tournamentKey, tournamentType]);

  useEffect(() => {
    if (status !== "running" || !tournamentCycle.isLive) return undefined;
    const timer = setInterval(resolveNextMatch, 4200);
    return () => clearInterval(timer);
  }, [status, resolveNextMatch, tournamentCycle.isLive]);

  useEffect(() => {
    if (!tournamentCycle.isLive || status !== "signup" || currentPairs.length || completedRounds.length || signupRoster.length < 2) return;

    const roster = [...signupRoster].sort((first, second) => hashText(`${first.id}-${second.house}-${tournamentKey}`) - hashText(`${second.id}-${first.house}-${tournamentKey}`));
    const nextWeather = weatherOptions[hashText(`${tournamentKey}-${roster.length}`) % weatherOptions.length];
    const hasBye = roster.length % 2 === 1;
    setCurrentPairs(makePairs(roster));
    setCompletedRounds([]);
    setRoundNumber(1);
    setWeather(nextWeather);
    setCrowdMood("calm");
    setStatus("running");
    setPredictions({});
    setHeraldFeed([
      `The heralds close the rolls with ${roster.length} signed houses.`,
      hasBye ? "An uneven list grants one house a bye into the next lane." : "Every first-round lane has found an opponent.",
      `The field is set beneath ${nextWeather}.`,
      `The crowd roars as ${roster[0].house} enters the lists.`,
    ]);
    setMessage("The tournament bracket opened automatically from every saved account in the realm.");
  }, [completedRounds.length, currentPairs.length, signupRoster, status, tournamentCycle.isLive, tournamentKey]);

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

  const visiblePairs = useMemo(() => currentPairs.map((pair) => {
    const odds = pair.second ? getWinOdds(pair.first, pair.second) : { fighterAChance: 100, fighterBChance: 0 };
    return { ...pair, odds, matchId: `${roundNumber}-${pair.first.id}-${pair.second?.id || "bye"}` };
  }), [currentPairs, roundNumber]);
  const completedMatches = useMemo(
    () => completedRounds.flatMap((round) => round.matches.map((match) => ({ ...match, roundNumber: round.roundNumber }))),
    [completedRounds]
  );
  const ravenLines = useMemo(() => [
    ...buildStateRavens({ status, tournamentCycle, tournamentKey, signupRoster, completedMatches, champion, weather, crowdMood }),
    ...heraldFeed,
  ].filter(Boolean).slice(0, 18), [champion, completedMatches, crowdMood, heraldFeed, signupRoster, status, tournamentCycle, tournamentKey, weather]);

  useEffect(() => {
    if (status !== "complete" || !champion || !completedMatches.length) return;
    if (chronicleArchive.some((entry) => entry.id === tournamentKey)) return;

    const chronicle = buildChronicle({
      tournamentKey,
      tournamentName,
      tournamentType,
      weather,
      crowdMood,
      champion,
      completedMatches,
      prizeArtifact,
      previousChronicles: chronicleArchive,
    });
    const nextRealm = {
      ...realm,
      tournamentChronicles: [chronicle, ...chronicleArchive].slice(0, 30),
    };
    saveRealm(nextRealm);
    recordRealmActivity(buildActivity({
      type: "tournament",
      title: "A Page Was Added To The Book",
      actor: champion.house,
      body: chronicle.summary,
      meta: {
        action: "chronicle",
        tournamentKey,
        tournamentType,
        champion: champion.name,
        runnerUp: chronicle.runnerUp,
        notableMoment: chronicle.notableMoment,
      },
    }));
  }, [champion, chronicleArchive, completedMatches, crowdMood, prizeArtifact, realm, saveRealm, status, tournamentKey, tournamentName, tournamentType, weather]);

  const firstRoundRows = useMemo(() => {
    const lanes = currentPairs.length || completedRounds.length
      ? [...currentPairs.flatMap((pair) => [pair.first, pair.second]).filter(Boolean), ...(completedRounds[0]?.matches?.flatMap((match) => [match.first, match.second]).filter(Boolean) || [])]
      : bracketSlots;
    const uniqueLanes = uniqueEntrants(lanes);
    const padded = [...uniqueLanes, ...Array.from({ length: Math.max(0, effectiveBracketSize - uniqueLanes.length) }, (_, index) => ({ id: `open-lane-${index}`, empty: true, name: "Open Seat", house: "Awaiting a house" }))];
    return padded.slice(0, effectiveBracketSize);
  }, [bracketSlots, completedRounds, currentPairs, effectiveBracketSize]);
  const roundWinners = (targetRound) => completedRounds.find((round) => round.roundNumber === targetRound)?.matches?.map((match) => match.winner) || [];
  const quarterSlots = roundWinners(1);
  const semiSlots = roundWinners(2);
  const finalSlots = roundWinners(3);
  const tournamentProgress = tournamentCycle.isLive
    ? Math.min(100, Math.max(4, Math.round(((now - tournamentCycle.startTime) / Math.max(1, tournamentCycle.endTime - tournamentCycle.startTime)) * 100)))
    : status === "complete"
      ? 100
      : 4;

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 max-w-[1760px]">
        <div className="relative overflow-hidden border border-[var(--gok-line)] bg-black shadow-2xl shadow-black">
          <div className="absolute inset-0 bg-[url('/banners/TournamentGrounds.png')] bg-cover bg-center opacity-78" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.62)_46%,#050505_88%),radial-gradient(circle_at_50%_0%,rgba(138,109,59,.3),transparent_38%)]" />
          <div className="relative z-10 min-h-[420px] px-5 py-8 md:px-10">
            <div className="mx-auto max-w-3xl border border-[rgba(138,109,59,0.35)] bg-black/68 px-4 py-3 text-center shadow-2xl shadow-black backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-[var(--gok-parchment)]">Will you be the champion?</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--gok-dim)]">Every saved account is automatically entered.</p>
              <button onClick={signUpTournament} disabled={!isSignedIn || tournamentCycle.isLive} className="mt-3 border border-red-900 bg-red-950/55 px-12 py-2 text-xs font-black uppercase tracking-[0.24em] text-red-100 transition hover:border-red-400 disabled:opacity-55">
                {!isSignedIn ? "Sign In To Set Orders" : tournamentCycle.isLive ? "Orders Locked" : "Update Orders"}
              </button>
            </div>

            <div className="mt-20 text-center md:mt-24">
              <p className="gok-eyebrow">Tournament Grounds</p>
              <p className="mt-2 font-serif text-2xl font-black text-[var(--gok-parchment)] md:text-3xl">{tournamentName}</p>
              <h1 className="mt-3 text-4xl uppercase tracking-[0.42em] text-[var(--gok-silver)] drop-shadow-[0_12px_24px_rgba(0,0,0,.95)] sm:text-6xl lg:text-7xl">
                Tournament Grounds
              </h1>
            </div>

            <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)] sm:grid-cols-2 lg:grid-cols-7">
              <Stat label="Type of Trial" value={tournamentType} />
              <Stat label={tournamentCycle.isLive ? "Tournament Ends" : "Tournament Begins"} value={tournamentCycle.isLive ? `Live Now: ${tournamentCountdown}` : tournamentCountdown} />
              <Stat label="Signed Houses" value={`${signupRoster.length} / ${effectiveBracketSize}`} />
              <Stat label="The Prize" value={prizeArtifact ? prizeArtifact.name : "Glory & Reward"} />
              <Stat label="Weather" value={weather} />
              <Stat label="Crowd Mood" value={crowdMood} />
              <Stat label="Next Dragon Hour" value={nextDragonEpisode ? `Episode ${nextDragonEpisode.episode}: ${dragonCountdown}` : dragonCountdown} />
            </div>
          </div>
          <div className="relative z-10 border-t border-[var(--gok-line)] bg-black/86 px-5 py-5">
            <div className="mb-2 flex items-center justify-between text-[0.65rem] font-black uppercase tracking-[0.22em] text-red-300">
              <span>{status === "running" ? "Tournament In Progress" : status === "complete" ? "Tournament Complete" : "Tournament Rolls"}</span>
              <span>{tournamentCycle.isLive ? `${tournamentCountdown} remaining` : `${signupRoster.length} houses written in`}</span>
            </div>
            <div className="relative h-4 overflow-visible border border-red-950 bg-black">
              <div className="h-full bg-gradient-to-r from-red-950 via-red-800 to-[rgba(167,126,55,.75)]" style={{ width: `${tournamentProgress}%` }} />
              <div className="absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[rgba(167,126,55,.65)] bg-black shadow-xl shadow-red-950" style={{ left: `calc(${tournamentProgress}% - 20px)` }}>
                <span className="text-lg text-[var(--gok-parchment)]">X</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-[0.65rem] uppercase tracking-[0.18em] text-[var(--gok-dim)]">
              <span>Elapsed: {tournamentCycle.isLive ? formatElapsedDuration(now - tournamentCycle.startTime) : "rolls open"}</span>
              <span>Remaining: {status === "complete" ? "champion crowned" : tournamentCycle.isLive ? tournamentCountdown : `${Math.max(0, effectiveBracketSize - signupRoster.length)} seats`}</span>
            </div>
          </div>
          {message && <p className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">{message}</p>}
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <article className="gok-panel p-5">
            <p className="gok-eyebrow">Royal Proclamation</p>
            <p className="relative z-10 mt-4 font-serif text-xl leading-8 text-[var(--gok-silver)]">{royalProclamation}</p>
          </article>

          <article className="gok-panel p-5">
            <p className="gok-eyebrow">The Realm Awaits</p>
            <div className="relative z-10 mt-4 grid gap-3">
              {realmAwaits.map((line) => (
                <p key={line} className="border-l-2 border-[rgba(167,126,55,0.55)] bg-black/35 px-4 py-2 text-sm leading-6 text-[rgba(210,205,194,0.78)]">{line}</p>
              ))}
            </div>
          </article>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="gok-panel p-5">
            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="gok-eyebrow">The Bracket</p>
                <h2 className="mt-2 text-3xl text-[var(--gok-silver)]">Visible Odds</h2>
              </div>
              {champion && <p className="border border-[var(--gok-line)] bg-black/60 px-3 py-2 font-black text-[var(--gok-silver)]">Champion: {champion.name}</p>}
            </div>

            <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-4">
              <BracketColumn title={`Round of ${effectiveBracketSize}`} slots={firstRoundRows} />
              <BracketColumn title="Quarterfinals" slots={quarterSlots} emptyCount={Math.max(2, Math.ceil(effectiveBracketSize / 4))} />
              <BracketColumn title="Semifinals" slots={semiSlots} emptyCount={2} />
              <BracketColumn title="Finals" slots={finalSlots} emptyCount={1} champion={champion} />
            </div>

            <div className="relative z-10 mt-6 grid gap-4">
              {visiblePairs.length ? visiblePairs.map((pair) => (
                <article key={pair.matchId} className="border border-[var(--gok-line)] bg-black/55 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                    <FighterCard fighter={pair.first} chance={pair.odds.fighterAChance} />
                    <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">versus</p>
                    {pair.second ? <FighterCard fighter={pair.second} chance={pair.odds.fighterBChance} alignRight /> : <OpenLane />}
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
              )) : <p className="border border-[var(--gok-line)] bg-black/55 p-5 text-center text-[var(--gok-dim)]">The bracket fills as saved accounts enter the realm.</p>}
            </div>

            <div className="relative z-10 mt-6">
              <p className="gok-eyebrow">Completed Matches</p>
              <div className="mt-3 max-h-[460px] overflow-y-auto border border-[var(--gok-line)] bg-black/40 p-3">
                {completedMatches.map((match) => (
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
              <p className="gok-eyebrow">Ravens From The Grounds</p>
              <div className="relative z-10 mt-4 max-h-80 overflow-y-auto border border-[var(--gok-line)] bg-black/50">
                {ravenLines.map((line, index) => (
                  <p key={`${line}-${index}`} className="border-b border-[rgba(196,193,184,0.1)] p-3 text-sm leading-6 text-[rgba(210,205,194,0.78)] last:border-b-0">{line}</p>
                ))}
              </div>
            </section>

            <section className="gok-panel p-5">
              <p className="gok-eyebrow">Your Tournament Orders</p>
              <div className="relative z-10 mt-4 grid gap-3">
                {Object.values(tacticalStances).map((stance) => (
                  <button
                    key={stance.key}
                    type="button"
                    onClick={() => setSelectedStance(stance.key)}
                    disabled={!isSignedIn || tournamentCycle.isLive}
                    className={`border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${selectedStance === stance.key ? "border-red-400 bg-red-950/35 text-red-100" : "border-[var(--gok-line)] bg-black/55 text-[var(--gok-silver)] hover:border-[var(--gok-line-strong)]"}`}
                  >
                    <span className="block font-black">{stance.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--gok-dim)]">{stance.edge}</span>
                  </button>
                ))}
                <button onClick={signUpTournament} disabled={!isSignedIn || tournamentCycle.isLive} className="gok-btn gok-btn-blood min-h-12 px-5 py-3 disabled:opacity-45">
                  {!isSignedIn ? "Sign In To Save Orders" : tournamentCycle.isLive ? "Orders Locked Until Next Lists" : "Update Orders"}
                </button>
              </div>
              <div className="relative z-10 mt-5 grid gap-2 text-sm">
                <Stat label="Weather" value={weather} />
                <Stat label="Crowd Mood" value={crowdMood} />
                <Stat label="Prediction Points" value={predictionPoints.toLocaleString()} />
                <Stat label="Round" value={status === "complete" ? "Complete" : roundNumber} />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="border border-[var(--gok-line)] bg-black/70 p-5">
            <p className="gok-eyebrow text-red-300">Late for the Tournament?</p>
            <h3 className="mt-2 font-serif text-2xl font-black uppercase tracking-[0.08em] text-[var(--gok-silver)]">Sign up for next one</h3>
          </div>
          <FeatureCard title="Every 12 Hours" body="The realm opens fresh lists twice a day." />
          <FeatureCard title="Uneven Lists" body="Odd brackets grant one house a clean bye." />
          <FeatureCard title="Sunday Relics" body="Sunday champions claim a singular artifact." />
          <FeatureCard title="Glory & Reward" body="Gold, honor, reputation, and trophies await." />
        </section>

        <section className="gok-panel mt-5 overflow-hidden border-[#6f5631]/70 bg-[linear-gradient(135deg,rgba(28,15,8,0.96),rgba(9,7,5,0.98)_42%,rgba(42,24,11,0.94))] p-5 shadow-[inset_0_0_70px_rgba(0,0,0,0.72)]">
          <div className="relative z-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="gok-eyebrow text-[#d7b46a]">Permanent Tournament History</p>
              <h2 className="mt-2 font-serif text-4xl font-black text-[#e0bd73]">The Book of Champions</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--gok-dim)]">
              Every Champion Earns a Page. Every Page Becomes History.
            </p>
          </div>
          <div className="relative z-10 mt-4 grid gap-3 border border-[#6f5631]/50 bg-black/35 p-4 text-sm leading-6 text-[var(--gok-parchment)] md:grid-cols-[1fr_0.8fr]">
            <p>
              Finished tournaments are sealed here as permanent realm history. New tournaments may grow grander, but old pages remain as the chronicler first wrote them.
            </p>
            <p className="text-[var(--gok-dim)]">
              Future idea: player profiles can show a <span className="font-black text-[#d7b46a]">Mentioned In</span> list of Book pages where that house appears.
            </p>
          </div>
          <div className="relative z-10 mt-5 max-h-[620px] space-y-4 overflow-y-auto pr-2">
            {chronicleArchive.length ? chronicleArchive.map((entry) => (
              <ChronicleCard key={entry.id} entry={entry} />
            )) : (
              <p className="border border-[#6f5631]/60 bg-black/45 p-5 text-[var(--gok-dim)]">No page has been sealed yet. When the next tournament ends, its champion and story will be written into the Book of Champions.</p>
            )}
          </div>
        </section>
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
        {tacticalStances[fighter.stance]?.shortLabel || "Balanced"} orders / {fighter.reputation > 84 ? "renowned contender" : "tested contender"} / {fighter.luck > 68 ? "fortune near at hand" : "steady nerve"}
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

function BracketColumn({ title, slots = [], emptyCount = 0, champion }) {
  const rows = champion ? [champion] : slots.length ? slots : Array.from({ length: emptyCount }, (_, index) => ({ id: `blank-${title}-${index}`, empty: true }));

  return (
    <div className="min-h-[360px] border border-[var(--gok-line)] bg-black/35 p-3">
      <p className="mb-3 text-center text-[0.68rem] font-black uppercase tracking-[0.2em] text-[var(--gok-parchment)]">{title}</p>
      <div className="grid gap-2">
        {rows.map((fighter, index) => (
          <BracketSlot key={fighter?.empty ? `${fighter.id}-${index}` : `${entrantKey(fighter)}-${index}`} fighter={fighter} champion={Boolean(champion)} />
        ))}
      </div>
    </div>
  );
}

function BracketSlot({ fighter, champion = false }) {
  if (!fighter || fighter.empty) {
    return (
      <div className="min-h-16 border border-dashed border-[rgba(196,193,184,0.18)] bg-black/45" />
    );
  }

  return (
    <div className={`flex min-h-16 items-center gap-3 border bg-black/70 p-2 ${champion ? "border-red-500 shadow-lg shadow-red-950/40" : "border-[var(--gok-line)]"}`}>
      <FighterIdentity fighter={fighter} compact />
      <div className="min-w-0">
        <p className="truncate font-black text-[var(--gok-silver)]">{fighter.name}</p>
        <p className="truncate text-[0.62rem] uppercase tracking-[0.14em] text-[var(--gok-dim)]">{fighter.house}</p>
      </div>
    </div>
  );
}

function OpenLane() {
  return (
    <div className="border border-dashed border-[var(--gok-line)] bg-black/45 p-4 text-right">
      <p className="font-serif text-2xl font-black text-[var(--gok-silver)]">Open Lane</p>
      <p className="mt-2 text-sm text-[var(--gok-dim)]">This house advances unless another entrant fills the lists before the horn.</p>
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <article className="border border-[var(--gok-line)] bg-black/60 p-5">
      <p className="font-black uppercase tracking-[0.14em] text-[var(--gok-silver)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--gok-dim)]">{body}</p>
    </article>
  );
}

function ChronicleCard({ entry }) {
  const dateText = new Date(entry.date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="relative overflow-hidden border border-[#8e6a35]/70 bg-[linear-gradient(115deg,#2a160b_0%,#3c2413_4%,#d1b17a_5%,#c19a61_50%,#a77743_95%,#321b0d_96%,#130a05_100%)] p-5 text-[#180f08] shadow-2xl shadow-black/50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,245,206,.32),transparent_22%),radial-gradient(circle_at_78%_84%,rgba(73,32,12,.28),transparent_30%),linear-gradient(90deg,rgba(72,37,15,.25),transparent_11%,transparent_89%,rgba(72,37,15,.28))]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-[#5c351b]/35" />
      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_270px]">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.26em] text-[#4d2416]">Page Sealed In The Book</p>
          <h3 className="mt-2 font-serif text-3xl font-black text-[#130b05]">{entry.tournamentName}</h3>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#59351d]">{dateText}</p>
          <p className="mt-5 border-y border-[#5c351b]/35 py-3 font-serif text-xl font-black leading-8">{entry.notableMoment}</p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#24160b]">{entry.summary}</p>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#5d3217]">
            Mentioned In: champion, runner-up, and houses recorded on this page.
          </p>
        </div>
        <div className="border border-[#4e2d17]/45 bg-[#160d07]/12 p-4 shadow-[inset_0_0_28px_rgba(58,26,9,0.28)]">
          <BookSigil sigil={entry.championSigil} label={`${entry.champion} crest`} />
          <BookFact label="Trial Type" value={entry.tournamentType} />
          <BookFact label="Weather" value={entry.weather} />
          <BookFact label="Crowd Mood" value={entry.crowdMood} />
          <BookFact label="Champion" value={`${entry.champion} ${entry.championHouse ? `of ${entry.championHouse}` : ""}`} />
          <BookFact label="Runner-Up" value={entry.runnerUp} sigil={entry.runnerUpSigil} />
          <BookFact label="Prize" value={entry.prize} />
        </div>
      </div>
      <div className="absolute bottom-4 right-5 grid h-16 w-16 place-items-center rounded-full border border-red-950 bg-[radial-gradient(circle,#9f2b1d,#4d0c09_68%,#210403)] font-serif text-xl font-black text-red-100 shadow-lg shadow-black/55">
        C
      </div>
    </article>
  );
}

function BookSigil({ sigil, label }) {
  if (!sigil?.layers?.length) {
    return (
      <div className="mb-4 grid h-20 place-items-center border border-[#4e2d17]/45 bg-[#180d06]/12 text-xs font-black uppercase tracking-[0.2em] text-[#5d3217]">
        Crest Unrecorded
      </div>
    );
  }

  return (
    <div className="mb-4 mx-auto h-24 w-20">
      <SigilMark sigil={sigil} label={label} />
    </div>
  );
}

function BookFact({ label, value, sigil }) {
  return (
    <div className="mt-3 border border-[#4e2d17]/35 bg-[#fff0bf]/12 p-3">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#5d3217]">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {sigil?.layers?.length && (
          <span className="block h-9 w-8 shrink-0">
            <SigilMark sigil={sigil} label={`${value} crest`} />
          </span>
        )}
        <p className="font-serif text-base font-black leading-6 text-[#170c05]">{value}</p>
      </div>
    </div>
  );
}
