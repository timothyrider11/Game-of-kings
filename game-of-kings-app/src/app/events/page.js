"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity */

import Link from "next/link";
import { useEffect, useState } from "react";

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
  ["dragonstone-melee", "Dragonstone Grand Melee", "Melee", 45, 260, "Legendary Artifact Chance"],
  ["winterfell-archery", "Winterfell Archery Championship", "Archery", 25, 130, "Unique Banner"],
  ["kings-landing-trivia", "King's Landing Royal Tournament", "Trivia Championship", 15, 95, "Exclusive Title"],
  ["blackwater-naval", "Blackwater Naval Trial", "Naval Battles", 35, 180, "Gold Purse"],
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

export default function EventsPage() {
  const [realm, setRealm] = useState(null);
  const [message, setMessage] = useState("");

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

  function joinTournament(tournament) {
    const joined = realm.joinedTournaments || [];
    const gold = realm.gold ?? 350;
    if (joined.includes(tournament[0]) || gold < tournament[3]) return;

    const inventory = realm.artifactInventory || [];
    const artifact = artifacts[Math.floor(Math.random() * artifacts.length)];
    const wonArtifact = Math.random() > 0.5;

    const nextRealm = {
      ...realm,
      gold: gold - tournament[3],
      renown: (realm.renown ?? 0) + tournament[4],
      joinedTournaments: [...joined, tournament[0]],
      artifactInventory: wonArtifact && !inventory.includes(artifact[0]) ? [...inventory, artifact[0]] : inventory,
    };

    saveRealm(nextRealm);
    setMessage(wonArtifact ? `${tournament[1]} complete. You won ${artifact[1]}.` : `${tournament[1]} complete. You gained ${tournament[4]} renown.`);
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
            Quizzes and tournaments live here now. Pick one simple activity, get gold or renown, then return to your castle.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Gold" value={(realm.gold ?? 350).toLocaleString()} />
            <Stat label="Renown" value={(realm.renown ?? 0).toLocaleString()} />
            <Stat label="Quizzes" value={(realm.completedQuizzes || []).length} />
            <Stat label="Artifacts" value={(realm.artifactInventory || []).length} />
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
            <div className="mt-4 space-y-3">
              {tournaments.map((tournament) => (
                <div key={tournament[0]} className="border border-stone-800 bg-black p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-300">{tournament[2]}</p>
                  <h3 className="mt-2 text-xl font-black">{tournament[1]}</h3>
                  <p className="mt-2 text-sm text-stone-400">
                    Entry: {tournament[3]} gold. Reward: {tournament[4]} renown and {tournament[5]}.
                  </p>
                  <button
                    onClick={() => joinTournament(tournament)}
                    disabled={(realm.joinedTournaments || []).includes(tournament[0]) || (realm.gold ?? 350) < tournament[3]}
                    className="mt-3 min-h-11 w-full rounded-md bg-amber-400 px-4 py-3 font-black text-stone-950 disabled:bg-stone-700 disabled:text-stone-400"
                  >
                    {(realm.joinedTournaments || []).includes(tournament[0]) ? "Joined" : "Join"}
                  </button>
                </div>
              ))}
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
