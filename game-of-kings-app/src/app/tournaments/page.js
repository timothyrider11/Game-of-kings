"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";
import { rollUnclaimedArtifact } from "../../lib/artifacts";
import { buildActivity, loadRealmActivity, recordRealmActivity } from "../../lib/realm-activity";
import { loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

const STORAGE_KEY = "game_of_kings_living_realm";

const tournaments = [
  { id: "june-10-royal-joust", name: "King's Landing Royal Joust", type: "Jousting", entryGold: 75, prizeGold: 180, prizeRenown: 35, armor: "Engraved Tourney Breastplate", field: "solo", day: 10, offsetHours: 19 },
  { id: "june-11-winterfell-archery", name: "Winterfell Archery Championship", type: "Archery", entryGold: 45, prizeGold: 125, prizeRenown: 24, armor: "Northern Archer's Bracers", field: "solo", day: 11, offsetHours: 19 },
  { id: "june-12-dragonstone-melee", name: "Dragonstone Grand Melee", type: "Melee", entryGold: 90, prizeGold: 220, prizeRenown: 42, armor: "Blackened Ringmail", field: "solo", day: 12, offsetHours: 19 },
  { id: "june-13-blackwater-team-trial", name: "Blackwater Team Trial", type: "Team Bracket", entryGold: 120, prizeGold: 300, prizeRenown: 48, armor: "Captain's War Helm", field: "team", day: 13, offsetHours: 19 },
];

const npcHouses = [
  ["House Stark", "Lord Stark"],
  ["House Lannister", "Lord Lannister"],
  ["House Tyrell", "Lady Tyrell"],
  ["House Martell", "Prince Martell"],
  ["House Arryn", "Lord Arryn"],
  ["House Tully", "Lord Tully"],
  ["House Hightower", "Lord Hightower"],
  ["House Webber", "Lord Webber"],
  ["House Caswell", "Lord Caswell"],
  ["House Janos", "Lord Janos"],
  ["House Royce", "Lord Royce"],
  ["House Manderly", "Lord Manderly"],
];

function hashText(value) {
  return value.split("").reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

function scheduledStartsAt(tournament) {
  return new Date(2026, 5, tournament.day, tournament.offsetHours, 0, 0, 0).getTime();
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

function houseName(realm) {
  return realm?.houseName?.trim() ? `House ${realm.houseName.trim()}` : "Unfounded House";
}

function rulerName(realm) {
  const title = realm?.rulerTitle || "Lord";
  const name = realm?.rulerName || realm?.houseName || "Unknown";
  return `${title} ${name}`;
}

function buildEntrants(realm, signup, tournament) {
  const player = [houseName(realm), rulerName(realm)];
  const seeded = npcHouses.filter(([house]) => house !== player[0]);
  const targetSize = tournament.field === "team" ? 8 : 16;
  return (signup ? [player, ...seeded] : seeded).slice(0, targetSize);
}

function buildPublicEntrants(activities, tournamentId, startsAt) {
  const startKey = new Date(startsAt).toISOString().slice(0, 10);
  const entries = activities
    .filter((activity) => activity.type === "tournament" && activity.meta?.action === "signup")
    .filter((activity) => activity.meta?.tournamentId === tournamentId && activity.meta?.startKey === startKey)
    .map((activity) => [activity.meta.house || activity.actor, activity.meta.ruler || activity.actor]);

  return Array.from(new Map(entries.map((entry) => [entry[0], entry])).values());
}

function entrantTickets(entry, tournament, key) {
  const flourish = hashText(`${key}-${entry[0]}-${tournament.type}`) % 21;
  return 100 + flourish;
}

function drawWinner(first, second, tournament, key) {
  const firstTickets = entrantTickets(first, tournament, key);
  const secondTickets = entrantTickets(second, tournament, key);
  const draw = hashText(`${key}-raven-draw`) % (firstTickets + secondTickets);
  const winner = draw < firstTickets ? first : second;
  return {
    winner,
    loser: winner === first ? second : first,
    firstTickets,
    secondTickets,
    winnerOdds: Math.round((winner === first ? firstTickets : secondTickets) / (firstTickets + secondTickets) * 100),
  };
}

function contestLine(type, winner, loser, seed) {
  const lines = {
    Jousting: [
      "won the pass after a clean shield strike sent splinters across the rail",
      "stayed mounted through three passes and took the round by steadier lance work",
      "caught the shoulder plate hard enough to turn the crowd silent",
    ],
    Archery: [
      "split the final marker at long range",
      "beat the wind with one patient shot into the inner ring",
      "won by a thumb's width after the last arrow landed true",
    ],
    Melee: [
      "forced a yield with three hard cuts and a shield bind",
      "survived the first charge and answered with a clean counter",
      "won at sword point after breaking the guard",
    ],
    "Team Bracket": [
      "held formation and pushed the opposing line from the yard",
      "won when the captain called a perfect flank at the rail",
      "survived the final rush and raised the banner together",
    ],
  };
  const choices = lines[type] || lines.Melee;
  return `${winner[1]} of ${winner[0]} defeated ${loser[1]} of ${loser[0]} and ${choices[hashText(seed) % choices.length]}.`;
}

function buildStoryParagraphs(tournament, champion, rounds, key) {
  const openings = [
    `By torchlight and trumpet call, the yard filled for ${tournament.name}; banners snapped above the rail while every house waited for the draw.`,
    `The lists opened under a hard grey sky, and ${tournament.name} became the talk of the realm before the first helm was lowered.`,
    `Ravens carried word of ${tournament.name} before dawn, and by evening the stands were loud enough to shake dust from the old stones.`,
  ];
  const disputes = [
    "A quarrel broke out near the steward's table when one knight accused another of soft leather under steel, but the marshal silenced them with a threat of forfeiture.",
    "Two squires nearly came to blows over a misplaced banner, drawing laughter from the crowd before the master-at-arms restored order.",
    "The betting rail roared after a disputed call, and the crowd demanded one more look before the herald confirmed the result.",
  ];
  const courage = [
    `When the final dust settled, ${champion[1]} stood with helm raised while the crowd called for an encore.`,
    `The champion was praised for courage, restraint, and a refusal to yield even when the field turned ugly.`,
    `A hedge knight who had fallen early was knighted for dragging an injured rival from the rail, earning louder cheers than half the victors.`,
  ];
  const finale = [
    `${champion[0]} claimed the day, and the herald wrote the victory into the realm chronicle before the torches burned low.`,
    `${champion[1]} left the lists as champion, carrying armor, purse, and a story every tavern will improve by morning.`,
    `The crowd chanted the champion's name until the gates opened and the realm had a new tale to repeat.`,
  ];
  const allLines = rounds.flatMap((round) => round.matches.map((match) => match.chronicle));
  return [
    openings[hashText(`${key}-open`) % openings.length],
    disputes[hashText(`${key}-argument`) % disputes.length],
    ...allLines.slice(-4),
    courage[hashText(`${key}-courage`) % courage.length],
    finale[hashText(`${key}-finale`) % finale.length],
  ];
}

function buildBracket(tournament, entrants, key) {
  let field = [...entrants].sort((a, b) => hashText(`${key}-${a[0]}`) - hashText(`${key}-${b[0]}`));
  const rounds = [];
  let round = 1;

  while (field.length > 1) {
    const next = [];
    const matches = [];

    for (let index = 0; index < field.length; index += 2) {
      const first = field[index];
      const second = field[index + 1] || field[0];
      const draw = drawWinner(first, second, tournament, `${key}-${round}-${index}`);
      matches.push({
        first,
        second,
        winner: draw.winner,
        firstTickets: draw.firstTickets,
        secondTickets: draw.secondTickets,
        winnerOdds: draw.winnerOdds,
        chronicle: `${contestLine(tournament.type, draw.winner, draw.loser, `${key}-${round}-${index}-${draw.loser[0]}`)} The raven draw gave ${draw.winner[0]} a ${draw.winnerOdds}% edge in that pairing.`,
      });
      next.push(draw.winner);
    }

    rounds.push({ name: field.length === 2 ? "Final" : `Round ${round}`, matches });
    field = next;
    round += 1;
  }

  return { champion: field[0], rounds };
}

export default function TournamentsPage() {
  const [realm, setRealm] = useState({});
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    setRealm(parsed);

    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
    });
    loadRealmActivity(150).then(({ activities: loaded }) => setActivities(loaded));
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
      loadRealmActivity(150).then(({ activities: loaded }) => setActivities(loaded));
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const signedCount = useMemo(
    () => activities.filter((activity) => activity.type === "tournament" && activity.meta?.action === "signup").length,
    [activities]
  );

  function saveRealm(nextRealm) {
    setRealm(nextRealm);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    saveCloudRealm(nextRealm);
  }

  function signUp(tournament, startsAt) {
    if (!realm.houseName) {
      setMessage("Found your house before entering a tournament.");
      return;
    }

    const signupKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
    const signups = realm.tournamentSignups || {};

    if (signups[signupKey]) {
      setMessage(`${houseName(realm)} is already registered for ${tournament.name}.`);
      return;
    }

    if ((realm.gold ?? 350) < tournament.entryGold) {
      setMessage(`You need ${tournament.entryGold} gold to enter ${tournament.name}.`);
      return;
    }

    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) - tournament.entryGold,
      tournamentSignups: {
        ...signups,
        [signupKey]: {
          tournament: tournament.name,
          type: tournament.type,
          house: houseName(realm),
          ruler: rulerName(realm),
          paidGold: tournament.entryGold,
          startsAt: new Date(startsAt).toISOString(),
          signedAt: new Date(now).toISOString(),
          status: "registered",
        },
      },
    };

    saveRealm(nextRealm);
    recordRealmActivity(buildActivity({
      type: "tournament",
      title: "A House Entered The Lists",
      actor: houseName(realm),
      body: `${rulerName(realm)} registered for ${tournament.name}. Entry paid: ${tournament.entryGold} gold.`,
      meta: {
        action: "signup",
        tournamentId: tournament.id,
        tournament: tournament.name,
        startKey: new Date(startsAt).toISOString().slice(0, 10),
        house: houseName(realm),
        ruler: rulerName(realm),
      },
    }));
    loadRealmActivity(150).then(({ activities: loaded }) => setActivities(loaded));
    setMessage(`${houseName(realm)} has entered ${tournament.name}. Entry paid: ${tournament.entryGold} gold.`);
  }

  async function revealTournament(tournament, startsAt, bracket, signup) {
    const recordKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
    if (realm.tournamentRecords?.[recordKey]) return;

    const playerWon = Boolean(signup) && bracket.champion[0] === houseName(realm);
    const { activities: latestActivities } = await loadRealmActivity(300);
    const foundArtifact = playerWon ? rollUnclaimedArtifact(0.01, latestActivities) : null;
    const nextArmor = playerWon ? [...(realm.armorInventory || []), tournament.armor] : realm.armorInventory || [];
    const story = buildStoryParagraphs(tournament, bracket.champion, bracket.rounds, recordKey);
    const nextRealm = {
      ...realm,
      gold: (realm.gold ?? 350) + (playerWon ? tournament.prizeGold : 0),
      renown: (realm.renown ?? 0) + (playerWon ? tournament.prizeRenown : signup ? 4 : 0),
      armorInventory: nextArmor,
      artifactInventory: foundArtifact ? [...new Set([...(realm.artifactInventory || []), foundArtifact])] : realm.artifactInventory || [],
      tournamentRecords: {
        ...(realm.tournamentRecords || {}),
        [recordKey]: {
          tournament: tournament.name,
          champion: bracket.champion[0],
          revealedAt: new Date(now).toISOString(),
          rounds: bracket.rounds,
          story,
          prizeArmor: playerWon ? tournament.armor : "",
          rareArtifact: foundArtifact || "",
        },
      },
    };

    saveRealm(nextRealm);
    recordRealmActivity(buildActivity({
      type: "tournament",
      title: `${tournament.name} Has A Champion`,
      actor: bracket.champion[0],
      body: playerWon
        ? `${bracket.champion[1]} won ${tournament.prizeGold} gold, ${tournament.prizeRenown} renown, and ${tournament.armor}.${foundArtifact ? ` A unique realm artifact was revealed: ${foundArtifact}.` : ""} ${story[story.length - 1]}`
        : `${bracket.champion[1]} won the bracket. ${story[story.length - 1]}`,
      meta: foundArtifact ? { artifact: foundArtifact, chance: 0.01, source: "tournament" } : { source: "tournament" },
    }));
    setMessage(playerWon ? `You won ${tournament.name}. Armor awarded: ${tournament.armor}.` : `${bracket.champion[0]} won ${tournament.name}.`);
  }

  if (!now) {
    return <main className="gok-page min-h-screen text-stone-100" />;
  }

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 max-w-7xl">
        <div className="gok-panel p-5">
          <p className="gok-eyebrow">Tournament Grounds</p>
          <h1 className="relative z-10 mt-3 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)] md:text-5xl">
            Four nights of brackets. One locked roster per event.
          </h1>
          <p className="gok-copy relative z-10 mt-4 max-w-3xl text-sm leading-6">
            Sign up with gold for the June 10, 11, 12, and 13 tournaments. Once your house enters a roster, the button locks. Results stay hidden until the event finishes, then the realm chronicle posts the full story.
          </p>
          <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-4">
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">House: {houseName(realm)}</div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">Gold: {(realm.gold ?? 350).toLocaleString()}</div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">Renown: {(realm.renown ?? 0).toLocaleString()}</div>
            <div className="border border-[var(--gok-line)] bg-black/50 p-3">Signed: {signedCount}</div>
          </div>
          {message && <p className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">{message}</p>}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {tournaments.map((tournament) => {
              const startsAt = scheduledStartsAt(tournament);
              const endsAt = startsAt + 2 * 60 * 60 * 1000;
              const signupKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
              const recordKey = `${tournament.id}-${new Date(startsAt).toISOString().slice(0, 10)}`;
              const signup = realm.tournamentSignups?.[signupKey];
              const record = realm.tournamentRecords?.[recordKey];
              const publicEntrants = buildPublicEntrants(activities, tournament.id, startsAt);
              const entrants = [...publicEntrants, ...buildEntrants(realm, signup, tournament)]
                .filter((entry, index, all) => all.findIndex(([house]) => house === entry[0]) === index);
              const bracket = buildBracket(tournament, entrants, signupKey);
              const isFinished = now >= endsAt;

              return (
                <article key={tournament.id} className="gok-card p-5">
                  <p className="relative z-10 text-xs font-black uppercase tracking-[0.25em] text-red-300">
                    June {tournament.day}, 2026 - {tournament.type}
                  </p>
                  <h2 className="relative z-10 mt-2 text-2xl text-[var(--gok-silver)]">{tournament.name}</h2>
                  <div className="relative z-10 mt-4 grid gap-2 text-sm text-[rgba(210,205,194,0.72)]">
                    <p>Starts: {formatDate(startsAt)}</p>
                    <p>Ends: {formatDate(endsAt)}</p>
                    <p>Entry: {tournament.entryGold} gold.</p>
                    <p>Prize: {tournament.armor}, {tournament.prizeGold} gold, {tournament.prizeRenown} renown.</p>
                    <p>Public entries: {publicEntrants.length}. Field: {entrants.length} {tournament.field === "team" ? "teams" : "houses"}.</p>
                  </div>

                  <div className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/45 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Bracket</p>
                    <div className="mt-3 grid gap-2">
                      {bracket.rounds[0]?.matches.slice(0, 4).map((match, index) => (
                        <div key={`${match.first[0]}-${match.second[0]}-${index}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-[var(--gok-parchment)]">
                          <span>{match.first[0]}</span>
                          <span className="text-[var(--gok-dim)]">vs</span>
                          <span className="text-right">{match.second[0]}</span>
                          <span className="col-span-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--gok-dim)]">
                            Draw odds: {match.firstTickets} tickets to {match.secondTickets} tickets
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {record && (
                    <div className="relative z-10 mt-4 max-h-64 overflow-y-auto border border-[var(--gok-line)] bg-black/55 p-3">
                      <p className="font-black text-[var(--gok-silver)]">Champion: {record.champion}</p>
                      <div className="mt-3 space-y-3 border-b border-[rgba(196,193,184,0.12)] pb-3">
                        {(record.story || []).map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-6 text-[rgba(210,205,194,0.78)]">{paragraph}</p>
                        ))}
                      </div>
                      {record.rounds.map((round) => (
                        <div key={round.name} className="mt-3">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">{round.name}</p>
                          {round.matches.map((match) => (
                            <p key={match.chronicle} className="mt-2 text-sm leading-6 text-[rgba(210,205,194,0.74)]">{match.chronicle}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {!record && isFinished ? (
                    <button onClick={() => revealTournament(tournament, startsAt, bracket, signup)} className="gok-btn gok-btn-blood relative z-10 mt-5 min-h-12 w-full px-5 py-3">
                      Post Completed Chronicle
                    </button>
                  ) : (
                    <button
                      onClick={() => signUp(tournament, startsAt)}
                      disabled={Boolean(signup) || (realm.gold ?? 350) < tournament.entryGold || now >= startsAt}
                      className="gok-btn gok-btn-blood relative z-10 mt-5 min-h-12 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {signup ? "Already On The Roster" : now >= startsAt ? "Registration Closed" : `Sign Up - ${tournament.entryGold} Gold`}
                    </button>
                  )}
                </article>
              );
            })}
        </div>
      </section>
    </main>
  );
}
