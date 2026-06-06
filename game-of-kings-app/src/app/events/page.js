"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game_of_kings_living_realm";

const quizzes = [
  {
    id: "daily-show",
    cadence: "Daily",
    category: "TV Show Trivia",
    question: "Which city is the seat of the Iron Throne?",
    options: ["King's Landing", "Oldtown", "White Harbor"],
    answer: "King's Landing",
    rewardGold: 90,
    rewardRenown: 16,
  },
  {
    id: "daily-castle",
    cadence: "Daily",
    category: "Castle Trivia",
    question: "Which castle is the seat of House Stark?",
    options: ["Winterfell", "Harrenhal", "Storm's End"],
    answer: "Winterfell",
    rewardGold: 70,
    rewardRenown: 14,
  },
  {
    id: "weekly-dragon",
    cadence: "Weekly",
    category: "Dragon Trivia",
    question: "Which fortress is famous for Valyrian dragon-stone design?",
    options: ["Dragonstone", "The Twins", "Horn Hill"],
    answer: "Dragonstone",
    rewardGold: 160,
    rewardRenown: 32,
  },
];

const tournaments = [
  ["dragonstone-melee", "Dragonstone Grand Melee", "Melee", 260, "Legendary Artifact Chance"],
  ["winterfell-archery", "Winterfell Archery Championship", "Archery", 130, "Unique Banner"],
  ["kings-landing-trivia", "King's Landing Royal Tournament", "Trivia Championship", 95, "Exclusive Title"],
  ["blackwater-naval", "Blackwater Naval Trial", "Naval Battles", 180, "Gold Purse"],
  ["oldtown-lore-cup", "Oldtown Lore Cup", "Book Trivia", 150, "Rare Collectible"],
  ["pyke-sea-trial", "Pyke Sea Trial", "Naval Battles", 175, "Ironborn Trophy"],
];

const realmHouses = [
  "House Stark",
  "House Lannister",
  "House Targaryen",
  "House Greyjoy",
  "House Baratheon",
  "House Tyrell",
  "House Martell",
  "House Arryn",
  "House Tully",
  "House Manderly",
  "House Dayne",
  "House Hightower",
];

const artifacts = [
  ["longclaw", "Longclaw", "Valyrian Steel"],
  ["dark-sister", "Dark Sister", "Legendary Blade"],
  ["blackfyre", "Blackfyre", "Lost Kingsblade"],
  ["heartsbane", "Heartsbane", "Valyrian Steel"],
  ["dragon-eggs", "Dragon Eggs", "Mythic Relic"],
  ["ancient-crown", "Ancient Crown", "Royal Relic"],
  ["royal-seal", "Royal Seal", "Political Relic"],
  ["lost-relic", "Lost Relic", "Mystery"],
];

function getFridayKey(date = new Date()) {
  const friday = new Date(date);
  friday.setHours(12, 0, 0, 0);
  const daysUntilFriday = (5 - friday.getDay() + 7) % 7;
  friday.setDate(friday.getDate() + daysUntilFriday);
  return friday.toISOString().slice(0, 10);
}

function hashText(value) {
  return value.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function pickWeeklyWinner(tournamentId, fridayKey, entrants) {
  return entrants[hashText(`${tournamentId}-${fridayKey}`) % entrants.length];
}

export default function EventsPage() {
  const [realm, setRealm] = useState(null);
  const [message, setMessage] = useState("");
  const fridayKey = getFridayKey();
  const isFriday = new Date().getDay() === 5;
  const houseName = realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "Your House";
  const entrants = useMemo(() => [houseName, ...realmHouses.filter((house) => house !== houseName)], [houseName]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setRealm(stored ? JSON.parse(stored) : {});
  }, []);

  function saveRealm(nextRealm) {
    setRealm(nextRealm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
  }

  function answerQuiz(quiz, answer) {
    const completed = realm.completedQuizzes || [];
    if (completed.includes(quiz.id)) return;

    const correct = answer === quiz.answer;
    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) + (correct ? quiz.rewardGold : 0),
      renown: (realm.renown ?? 0) + (correct ? quiz.rewardRenown : 0),
      completedQuizzes: [...completed, quiz.id],
    };

    saveRealm(nextRealm);
    setMessage(correct ? `Correct. You earned ${quiz.rewardGold} gold and ${quiz.rewardRenown} renown.` : "Not quite. Try another event.");
  }

  function collectTournamentReward(tournament) {
    const tournamentId = tournament[0];
    const weeklyKey = `${tournamentId}-${fridayKey}`;
    const collected = realm.collectedTournamentWeeks || [];
    const winner = pickWeeklyWinner(tournamentId, fridayKey, entrants);

    if (!isFriday) {
      setMessage(`The heralds announce tournament winners every Friday. Next announcement: ${fridayKey}.`);
      return;
    }

    if (collected.includes(weeklyKey)) {
      setMessage(`${tournament[1]} has already been recorded for ${fridayKey}.`);
      return;
    }

    if (winner !== houseName) {
      setMessage(`${winner} won ${tournament[1]} for ${fridayKey}. Everyone had the same odds.`);
      saveRealm({
        ...realm,
        collectedTournamentWeeks: [...collected, weeklyKey],
      });
      return;
    }

    const inventory = realm.artifactInventory || [];
    const artifact = artifacts[hashText(`${tournamentId}-${fridayKey}-artifact`) % artifacts.length];
    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) + 120,
      renown: (realm.renown ?? 0) + tournament[3],
      collectedTournamentWeeks: [...collected, weeklyKey],
      artifactInventory: !inventory.includes(artifact[0]) ? [...inventory, artifact[0]] : inventory,
    };

    saveRealm(nextRealm);
    setMessage(`Your house won ${tournament[1]} for ${fridayKey}: +120 gold, +${tournament[3]} renown, and ${artifact[1]}.`);
  }

  if (!realm) {
    return <main className="min-h-screen bg-[#070707] text-stone-100" />;
  }

  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <nav className="border-b border-stone-800 bg-black px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
            Game of Kings
          </Link>
          <div className="flex gap-2">
            <Link href="/house" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              House
            </Link>
            <Link href="/map" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Map
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="border border-stone-700 bg-stone-900 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Events</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Win rewards without touching the map.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Quizzes and tournaments live here now. Tournaments are automatic: every house is entered, every house has equal odds, and winners are announced each Friday.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Gold" value={(realm.gold ?? 350).toLocaleString()} />
            <Stat label="Renown" value={(realm.renown ?? 0).toLocaleString()} />
            <Stat label="Quizzes" value={(realm.completedQuizzes || []).length} />
            <Stat label="Artifacts" value={(realm.artifactInventory || []).length} />
            <Stat label="Next Draw" value={fridayKey} />
          </div>
          {message && <p className="mt-4 rounded-md bg-emerald-950 p-3 text-sm font-bold text-emerald-300">{message}</p>}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="border border-stone-700 bg-stone-900 p-5">
            <h2 className="text-2xl font-black">Quizzes</h2>
            <div className="mt-4 space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="border border-stone-800 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {quiz.cadence} / {quiz.category}
                  </p>
                  <h3 className="mt-2 font-black">{quiz.question}</h3>
                  <div className="mt-3 grid gap-2">
                    {quiz.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => answerQuiz(quiz, option)}
                        disabled={(realm.completedQuizzes || []).includes(quiz.id)}
                        className="min-h-11 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-left text-sm font-bold disabled:opacity-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-stone-700 bg-stone-900 p-5">
            <h2 className="text-2xl font-black">Tournaments</h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              No signups and no entry cost. Your house is automatically entered in every tournament with the same chance as every other house.
            </p>
            <div className="mt-4 space-y-3">
              {tournaments.map((tournament) => {
                const winner = pickWeeklyWinner(tournament[0], fridayKey, entrants);
                const collected = (realm.collectedTournamentWeeks || []).includes(`${tournament[0]}-${fridayKey}`);

                return (
                  <div key={tournament[0]} className="border border-stone-800 bg-black p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-300">{tournament[2]}</p>
                    <h3 className="mt-2 text-xl font-black">{tournament[1]}</h3>
                    <div className="mt-3 grid gap-2 text-sm text-stone-400">
                      <p>Entry: automatic for all houses.</p>
                      <p>Odds: equal, 1 in {entrants.length}.</p>
                      <p>Friday announcement: {fridayKey}.</p>
                      <p>Prize: {tournament[3]} renown and {tournament[4]}.</p>
                      <p className="font-black text-stone-200">
                        Friday result: {isFriday ? winner : `sealed until ${fridayKey}`}
                      </p>
                    </div>
                    <button
                      onClick={() => collectTournamentReward(tournament)}
                      className="mt-3 min-h-11 w-full rounded-md border border-stone-600 bg-stone-900 px-4 py-3 font-black text-stone-100 transition hover:bg-stone-800 disabled:opacity-50"
                      disabled={collected || !isFriday}
                    >
                      {collected ? "Friday Result Recorded" : isFriday ? "Record Friday Result" : "Opens Friday"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-5 border border-stone-700 bg-stone-900 p-5">
          <h2 className="text-2xl font-black">Artifacts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {artifacts.map((artifact) => {
              const owned = (realm.artifactInventory || []).includes(artifact[0]);
              return (
                <div key={artifact[0]} className={`border p-4 ${owned ? "border-amber-300 bg-amber-950/30" : "border-stone-800 bg-black"}`}>
                  <p className="text-xs font-black uppercase tracking-wider text-stone-500">{artifact[2]}</p>
                  <h3 className="mt-2 text-lg font-black">{artifact[1]}</h3>
                  <p className={`mt-3 text-xs font-black ${owned ? "text-amber-300" : "text-stone-600"}`}>
                    {owned ? "Collected" : "Not collected"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-stone-800 bg-black p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
