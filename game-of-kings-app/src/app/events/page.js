"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildActivity, recordRealmActivity } from "../../lib/realm-activity";
import { loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

const STORAGE_KEY = "game_of_kings_living_realm";
const DAY_MS = 24 * 60 * 60 * 1000;
const QUIZ_INTERVAL_DAYS = 3;

const quizSets = [
  {
    title: "Realm Foundations",
    category: "Mixed Trivia",
    questions: [
      ["Which city is the seat of the Iron Throne?", ["King's Landing", "Oldtown", "White Harbor", "Lannisport"], "King's Landing"],
      ["Which castle is the ancient seat of House Stark?", ["Winterfell", "Harrenhal", "Storm's End", "The Eyrie"], "Winterfell"],
      ["Which house rules from Pyke?", ["Greyjoy", "Tyrell", "Arryn", "Tully"], "Greyjoy"],
      ["What is Dragonstone famous for?", ["Dragon-stone towers", "Golden mines", "Floating gardens", "Ice walls"], "Dragon-stone towers"],
      ["Which region contains Sunspear?", ["Dorne", "The North", "The Vale", "The Reach"], "Dorne"],
      ["Which castle is linked to House Baratheon?", ["Storm's End", "Oldtown", "Riverrun", "Highgarden"], "Storm's End"],
      ["Which city is known for the Citadel?", ["Oldtown", "Gulltown", "Barrowton", "Maidenpool"], "Oldtown"],
      ["Which house is tied to Highgarden?", ["Tyrell", "Bolton", "Manderly", "Dayne"], "Tyrell"],
      ["Which riverlands castle is famously huge and cursed?", ["Harrenhal", "Riverrun", "Seagard", "The Twins"], "Harrenhal"],
      ["Which northern port is ruled by House Manderly?", ["White Harbor", "Deepwood Motte", "Karhold", "Ramsgate"], "White Harbor"],
    ],
  },
  {
    title: "Castles and Houses",
    category: "Castle Trivia",
    questions: [
      ["Which castle guards the main road through the Neck?", ["Moat Cailin", "Castle Black", "Horn Hill", "Starfall"], "Moat Cailin"],
      ["Which house is seated at Casterly Rock?", ["Lannister", "Stark", "Martell", "Arryn"], "Lannister"],
      ["Which castle is high in the Mountains of the Moon?", ["The Eyrie", "Storm's End", "Riverrun", "Crakehall"], "The Eyrie"],
      ["Which house is seated at Riverrun?", ["Tully", "Frey", "Hightower", "Mormont"], "Tully"],
      ["Which southern city is tied to House Hightower?", ["Oldtown", "King's Landing", "Gulltown", "White Harbor"], "Oldtown"],
      ["Which castle is a Dayne seat?", ["Starfall", "Dreadfort", "Brightwater Keep", "Karhold"], "Starfall"],
      ["Which hold is associated with House Bolton?", ["The Dreadfort", "Winterfell", "The Twins", "Oldcastle"], "The Dreadfort"],
      ["Which castle is House Tarly's seat?", ["Horn Hill", "Highgarden", "Blackhaven", "Evenfall Hall"], "Horn Hill"],
      ["Which castle sits on the Wall?", ["Castle Black", "Pyke", "The Arbor", "Redfort"], "Castle Black"],
      ["Which castle is a major Iron Islands stronghold?", ["Pyke", "Harrenhal", "Sunspear", "The Eyrie"], "Pyke"],
    ],
  },
  {
    title: "War and Legend",
    category: "Lore Trivia",
    questions: [
      ["Which blade is a famous Valyrian steel sword?", ["Longclaw", "Needlepoint", "Gold Fang", "River Light"], "Longclaw"],
      ["Which ancestral sword belonged to House Tarly?", ["Heartsbane", "Blackfyre", "Oathkeeper", "Ice"], "Heartsbane"],
      ["Which lost sword is tied to Targaryen kingship?", ["Blackfyre", "Dawn", "Widow's Wail", "Brightroar"], "Blackfyre"],
      ["Which weapon type defines jousting?", ["Lance", "Longbow", "Dagger", "Sling"], "Lance"],
      ["Which contest uses mounted knights?", ["Jousting", "Archery", "Melee", "Trivia"], "Jousting"],
      ["Which house sigil is a direwolf?", ["Stark", "Tully", "Arryn", "Hightower"], "Stark"],
      ["Which house sigil is a golden lion?", ["Lannister", "Mormont", "Reed", "Royce"], "Lannister"],
      ["Which house sigil is a kraken?", ["Greyjoy", "Tyrell", "Baratheon", "Frey"], "Greyjoy"],
      ["Which region is ruled from the Eyrie?", ["The Vale", "Dorne", "The Reach", "The Westerlands"], "The Vale"],
      ["Which castle is reserved here for House Rider?", ["King's Landing", "Winterfell", "Oldtown", "Storm's End"], "King's Landing"],
    ],
  },
];

const tournaments = [
  { id: "royal-joust", name: "King's Landing Royal Joust", type: "Jousting", cadenceDays: 7, offsetDays: 5, entryGold: 75, prizeGold: 240, prizeRenown: 45 },
  { id: "winterfell-archery", name: "Winterfell Archery Championship", type: "Archery", cadenceDays: 9, offsetDays: 2, entryGold: 45, prizeGold: 150, prizeRenown: 32 },
  { id: "dragonstone-melee", name: "Dragonstone Grand Melee", type: "Melee", cadenceDays: 11, offsetDays: 4, entryGold: 90, prizeGold: 300, prizeRenown: 58 },
  { id: "blackwater-naval", name: "Blackwater Naval Trial", type: "Naval Battles", cadenceDays: 13, offsetDays: 7, entryGold: 110, prizeGold: 360, prizeRenown: 62 },
  { id: "oldtown-lore-cup", name: "Oldtown Lore Cup", type: "Trivia Championship", cadenceDays: 6, offsetDays: 1, entryGold: 35, prizeGold: 120, prizeRenown: 28 },
];

const realmHouses = [
  ["House Rider", "King Rider", 118],
  ["House Stark", "Lord Stark", 102],
  ["House Lannister", "Lord Lannister", 106],
  ["House Tyrell", "Lady Tyrell", 96],
  ["House Martell", "Prince Martell", 94],
  ["House Arryn", "Lord Arryn", 90],
  ["House Tully", "Lord Tully", 88],
  ["House Hightower", "Lord Hightower", 92],
  ["House Webber", "Lord Webber", 77],
  ["House Caswell", "Lord Caswell", 82],
  ["House Janos", "Lord Janos", 74],
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

function hashText(value) {
  return value.split("").reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

function getQuizCycle(now = Date.now()) {
  const cycle = Math.floor(now / (QUIZ_INTERVAL_DAYS * DAY_MS));
  return {
    key: `quiz-${cycle}`,
    index: cycle % quizSets.length,
    nextAt: (cycle + 1) * QUIZ_INTERVAL_DAYS * DAY_MS,
  };
}

function getTournamentWindow(tournament, now = Date.now()) {
  const day = Math.floor(now / DAY_MS);
  const adjusted = day - tournament.offsetDays;
  const cycle = Math.floor(adjusted / tournament.cadenceDays);
  const eventDay = cycle * tournament.cadenceDays + tournament.offsetDays;
  const nextEventDay = day <= eventDay ? eventDay : eventDay + tournament.cadenceDays;

  return {
    key: `${tournament.id}-${cycle}`,
    startsAt: nextEventDay * DAY_MS + 20 * 60 * 60 * 1000,
    endsAt: nextEventDay * DAY_MS + 22 * 60 * 60 * 1000,
  };
}

function getPlayerHouse(realm) {
  const houseName = realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "Your House";
  const lordName = realm?.houseName?.trim() ? `Lord ${realm.houseName.trim()}` : "Your Founder";
  return [houseName, lordName, 100];
}

function buildTournamentEntrants(realm, signup) {
  const playerHouse = getPlayerHouse(realm);
  const npcs = realmHouses.filter(([house]) => house !== playerHouse[0]).slice(0, 7);
  return signup ? [playerHouse, ...npcs] : npcs;
}

function contestLine(type, winner, loser, seed) {
  const joust = [
    "split a lance across the shoulder and stayed mounted through the roar of the yard",
    "caught the shield clean, twisting the saddle loose before the second pass",
    "won on the third pass after a brutal strike to the breastplate",
  ];
  const melee = [
    "landed three critical slashes and forced a yield in the ring",
    "broke the guard with a shield rush and ended it at sword point",
    "survived a heavy opening blow, then answered with a clean countercut",
  ];
  const archery = [
    "put the last arrow inside the black at fifty yards",
    "split a marker shaft while the crowd counted in silence",
    "won by a thumb's width after a sudden crosswind",
  ];
  const naval = [
    "took the inside current and rammed the opposing prow before sunset",
    "boarded through smoke and forced the banner down",
    "outmaneuvered the line with a hard turn beneath the chain towers",
  ];
  const trivia = [
    "answered the final castle clue before the maester could lower his hand",
    "won after naming every ruling seat in the Reach",
    "kept calm through the dragon round and stole the last point",
  ];
  const list =
    type === "Jousting" ? joust : type === "Archery" ? archery : type === "Naval Battles" ? naval : type === "Trivia Championship" ? trivia : melee;

  return `${winner[1]} of ${winner[0]} defeated ${loser[1]} of ${loser[0]}: ${list[hashText(seed) % list.length]}.`;
}

function buildBracket(tournament, entrants, cycleKey) {
  const shuffled = [...entrants].sort((a, b) => hashText(`${cycleKey}-${a[0]}`) - hashText(`${cycleKey}-${b[0]}`));
  const rounds = [];
  let field = shuffled.slice(0, 8);

  while (field.length > 1) {
    const next = [];
    for (let index = 0; index < field.length; index += 2) {
      const first = field[index];
      const second = field[index + 1] || field[0];
      const winner = hashText(`${cycleKey}-${index}-${tournament.id}`) % 2 === 0 ? first : second;
      const loser = winner === first ? second : first;
      rounds.push(contestLine(tournament.type, winner, loser, `${cycleKey}-${index}-${loser[0]}`));
      next.push(winner);
    }
    field = next;
  }

  return {
    winner: field[0],
    rounds,
  };
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(milliseconds) {
  const totalHours = Math.max(1, Math.ceil(milliseconds / (60 * 60 * 1000)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days <= 0) return `${hours}h`;
  if (hours === 0) return `${days}d`;
  return `${days}d ${hours}h`;
}

export default function EventsPage() {
  const [realm, setRealm] = useState(null);
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState({});
  const [now, setNow] = useState(0);
  const quizCycle = getQuizCycle(now);
  const activeQuiz = quizSets[quizCycle.index];
  const completedQuiz = realm?.quizAttempts?.[quizCycle.key];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setRealm(stored ? JSON.parse(stored) : {});
    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
    });
    setNow(Date.now());
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setAnswers({});
  }, [quizCycle.key]);

  function saveRealm(nextRealm) {
    setRealm(nextRealm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    saveCloudRealm(nextRealm);
  }

  function chooseAnswer(questionIndex, option) {
    if (completedQuiz) return;
    setAnswers((current) => ({ ...current, [questionIndex]: option }));
  }

  function submitQuiz() {
    if (completedQuiz || Object.keys(answers).length < activeQuiz.questions.length) return;

    const correct = activeQuiz.questions.reduce((count, question, index) => count + (answers[index] === question[2] ? 1 : 0), 0);
    const rewardGold = correct * 10;
    const rewardRenown = correct * 2;
    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) + rewardGold,
      renown: (realm.renown ?? 0) + rewardRenown,
      quizAttempts: {
        ...(realm.quizAttempts || {}),
        [quizCycle.key]: {
          title: activeQuiz.title,
          score: correct,
          total: activeQuiz.questions.length,
          rewardGold,
          rewardRenown,
          answers,
          submittedAt: new Date(now).toISOString(),
        },
      },
    };

    saveRealm(nextRealm);
    recordRealmActivity(buildActivity({
      type: "quiz",
      title: "A Quiz Was Completed",
      actor: realm?.houseName ? `House ${realm.houseName}` : "A realm player",
      body: `${activeQuiz.title}: ${correct}/10 correct. Reward: ${rewardGold} gold and ${rewardRenown} renown.`,
    }));
    setMessage(`Quiz scored ${correct}/10. You earned ${rewardGold} gold and ${rewardRenown} renown.`);
  }

  function signUpTournament(tournament, window) {
    const signupKey = `${tournament.id}-${window.startsAt}`;
    const signups = realm.tournamentSignups || {};
    if (signups[signupKey]) return;
    if ((realm.gold ?? 350) < tournament.entryGold) {
      setMessage(`You need ${tournament.entryGold} gold to register for ${tournament.name}.`);
      return;
    }

    saveRealm({
      ...realm,
      gold: (realm.gold ?? 350) - tournament.entryGold,
      tournamentSignups: {
        ...signups,
        [signupKey]: {
          tournament: tournament.name,
          house: getPlayerHouse(realm)[0],
          paidGold: tournament.entryGold,
          signedAt: new Date(now).toISOString(),
        },
      },
    });
    setMessage(`Signed up for ${tournament.name}. Entry paid: ${tournament.entryGold} gold.`);
  }

  function recordTournament(tournament, window, bracket, signup) {
    const recordKey = `${tournament.id}-${window.startsAt}`;
    const recorded = realm.tournamentRecords || {};
    if (recorded[recordKey]) {
      setMessage(`${tournament.name} is already recorded.`);
      return;
    }

    const playerWon = signup && bracket.winner[0] === getPlayerHouse(realm)[0];
    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) + (playerWon ? tournament.prizeGold : 0),
      renown: (realm.renown ?? 0) + (playerWon ? tournament.prizeRenown : signup ? 3 : 0),
      tournamentRecords: {
        ...recorded,
        [recordKey]: {
          tournament: tournament.name,
          winner: bracket.winner[0],
          recordedAt: new Date(now).toISOString(),
          rounds: bracket.rounds,
        },
      },
    };

    saveRealm(nextRealm);
    setMessage(
      playerWon
        ? `${bracket.winner[0]} won ${tournament.name}: +${tournament.prizeGold} gold and +${tournament.prizeRenown} renown.`
        : `${bracket.winner[0]} won ${tournament.name}.${signup ? " Your house earned 3 renown for taking part." : ""}`
    );
  }

  if (!realm || !now) {
    return <main className="min-h-screen bg-[#070707] text-stone-100" />;
  }

  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <nav className="border-b border-stone-800 bg-black px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-stone-300">
            Game of Kings
          </Link>
          <div className="flex gap-2">
            <Link href="/house" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              House
            </Link>
            <Link href="/map" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Map
            </Link>
            <Link href="/tournaments" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Tournaments
            </Link>
            <Link href="/forum" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Forum
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="border border-stone-700 bg-stone-950 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">Events Hall</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Quizzes and tournaments, clean and simple.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">
            Quizzes refresh every three days. Tournaments now require paid sign-up, use even bracket odds, and reveal results only after the event is complete.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Gold" value={(realm.gold ?? 350).toLocaleString()} />
            <Stat label="Renown" value={(realm.renown ?? 0).toLocaleString()} />
            <Stat label="Artifacts" value={(realm.artifactInventory || []).length} />
            <Stat label="Quiz Reset" value={formatDuration(quizCycle.nextAt - now)} />
          </div>
          {message && <p className="mt-4 rounded-md border border-emerald-800 bg-emerald-950/40 p-3 text-sm font-bold text-emerald-300">{message}</p>}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="border border-stone-700 bg-stone-950 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-stone-500">{activeQuiz.category}</p>
                <h2 className="mt-2 text-2xl font-black">{activeQuiz.title}</h2>
                <p className="mt-2 text-sm text-stone-400">10 questions. Each correct answer gives 10 gold and 2 renown.</p>
              </div>
              {completedQuiz && (
                <p className="rounded-md border border-stone-700 bg-black px-3 py-2 text-sm font-black text-stone-200">
                  Completed: {completedQuiz.score}/10
                </p>
              )}
            </div>

            <div className="mt-5 space-y-4">
              {activeQuiz.questions.map((question, index) => {
                const selected = answers[index] || completedQuiz?.answers?.[index];
                return (
                  <div key={question[0]} className="border border-stone-800 bg-black p-4">
                    <h3 className="font-black">
                      {index + 1}. {question[0]}
                    </h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {question[1].map((option) => (
                        <button
                          key={option}
                          onClick={() => chooseAnswer(index, option)}
                          disabled={Boolean(completedQuiz)}
                          className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed ${
                            selected === option
                              ? "border-red-300 bg-red-950/40 text-stone-100"
                              : "border-stone-700 bg-stone-950 text-stone-300 hover:border-stone-400"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={submitQuiz}
              disabled={Boolean(completedQuiz) || Object.keys(answers).length < activeQuiz.questions.length}
              className="mt-5 min-h-12 w-full rounded-md border border-stone-500 bg-stone-900 px-5 py-3 font-black text-stone-100 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-800 disabled:bg-stone-950 disabled:text-stone-600"
            >
              {completedQuiz ? `Next Quiz in ${formatDuration(quizCycle.nextAt - now)}` : "Submit 10 Answers"}
            </button>
          </section>

          <aside className="space-y-5">
            <section className="border border-stone-700 bg-stone-950 p-5">
              <h2 className="text-xl font-black">Tournament Rule</h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                Everyone who enters is matched in an even bracket. Each face-off is a 50/50 result, like heads or tails, until one champion remains.
              </p>
            </section>

            <section className="border border-stone-700 bg-stone-950 p-5">
              <h2 className="text-xl font-black">Artifacts</h2>
              <div className="mt-4 grid gap-2">
                {artifacts.slice(0, 6).map((artifact) => {
                  const owned = (realm.artifactInventory || []).includes(artifact[0]);
                  return (
                    <div key={artifact[0]} className={`border p-3 ${owned ? "border-stone-400 bg-stone-800" : "border-stone-800 bg-black"}`}>
                      <p className="text-xs font-black uppercase tracking-wider text-stone-500">{artifact[2]}</p>
                      <h3 className="mt-1 font-black">{artifact[1]}</h3>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-5 border border-stone-700 bg-stone-950 p-5">
          <h2 className="text-2xl font-black">Tournament Grounds</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
            Tournament signups, bracket previews, Friday reveals, armor prizes, and chronicles now live in the dedicated tournament hall.
          </p>
          <Link
            href="/tournaments"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md border border-stone-600 bg-stone-900 px-5 py-3 font-black text-stone-100 transition hover:bg-stone-800"
          >
            Enter Tournament Grounds
          </Link>
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
