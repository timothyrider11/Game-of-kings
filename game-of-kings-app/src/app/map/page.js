"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react-hooks/immutability, react-hooks/exhaustive-deps */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "game_of_kings_living_realm";
const REALM_VERSION = 4;
const MINUTE = 60_000;
const ECONOMY_TICK_MS = 5 * MINUTE;

const galleryTypes = [
  ["exterior", "Exterior Images"],
  ["interior", "Interior Images"],
  ["banners", "Banners"],
  ["maps", "Maps"],
  ["artwork", "Historical Artwork"],
];

const localCastleGalleries = {
  "castle-black": {
    exterior: [{ id: "castle-black-exterior-1", name: "Castle Black", src: "/castles/castle-black/exterior-1.jpg" }],
  },
  "casterly-rock": {
    exterior: [{ id: "casterly-rock-exterior-1", name: "Casterly Rock", src: "/castles/casterly-rock/exterior-1.jpg" }],
  },
  dragonstone: {
    exterior: [{ id: "dragonstone-exterior-1", name: "Dragonstone", src: "/castles/dragonstone/exterior-1.jpg" }],
  },
  dreadfort: {
    exterior: [{ id: "dreadfort-exterior-1", name: "Dreadfort", src: "/castles/dreadfort/exterior-1.png" }],
  },
  eyrie: {
    exterior: [{ id: "eyrie-exterior-1", name: "The Eyrie", src: "/castles/eyrie/exterior-1.jpg" }],
  },
  highgarden: {
    exterior: [
      { id: "highgarden-exterior-1", name: "Highgarden", src: "/castles/highgarden/exterior-1.png" },
      { id: "highgarden-exterior-2", name: "Highgarden Overlook", src: "/castles/highgarden/exterior-2.png" },
    ],
    artwork: [{ id: "highgarden-artwork-1", name: "Highgarden Artwork", src: "/castles/highgarden/artwork-1.webp" }],
  },
  "horn-hill": {
    exterior: [{ id: "horn-hill-exterior-1", name: "Horn Hill", src: "/castles/horn-hill/exterior-1.webp" }],
  },
  karhold: {
    exterior: [{ id: "karhold-exterior-1", name: "Karhold", src: "/castles/karhold/exterior-1.png" }],
  },
  oldtown: {
    exterior: [{ id: "oldtown-exterior-1", name: "Oldtown", src: "/castles/oldtown/exterior-1.jpg" }],
  },
  pyke: {
    exterior: [{ id: "pyke-exterior-1", name: "Pyke", src: "/castles/pyke/exterior-1.jpg" }],
  },
  riverrun: {
    exterior: [{ id: "riverrun-exterior-1", name: "Riverrun", src: "/castles/riverrun/exterior-1.jpg" }],
  },
  starfall: {
    exterior: [{ id: "starfall-exterior-1", name: "Starfall", src: "/castles/starfall/exterior-1.jpg" }],
  },
  "storms-end": {
    exterior: [{ id: "storms-end-exterior-1", name: "Storm's End", src: "/castles/storms-end/exterior-1.jpg" }],
  },
  sunspear: {
    exterior: [{ id: "sunspear-exterior-1", name: "Sunspear", src: "/castles/sunspear/exterior-1.jpg" }],
  },
  "white-harbor": {
    exterior: [{ id: "white-harbor-exterior-1", name: "White Harbor", src: "/castles/white-harbor/exterior-1.jpg" }],
  },
  winterfell: {
    exterior: [
      { id: "winterfell-exterior-1", name: "Winterfell", src: "/castles/winterfell/exterior-1.jpg" },
      { id: "winterfell-exterior-2", name: "Winterfell Overlook", src: "/castles/winterfell/exterior-2.png" },
    ],
  },
};

const sigils = [
  { name: "Wolf", color: "#94a3b8" },
  { name: "Lion", color: "#d97706" },
  { name: "Dragon", color: "#991b1b" },
  { name: "Kraken", color: "#155e75" },
  { name: "Stag", color: "#854d0e" },
  { name: "Falcon", color: "#2563eb" },
  { name: "Rose", color: "#be123c" },
  { name: "Sun", color: "#ea580c" },
];

const castles = [
  {
    id: "castle-black",
    name: "Castle Black",
    house: "Night's Watch",
    region: "The Wall",
    lord: "Lord Commander",
    left: 54.4,
    top: 17.1,
    label: "right",
    militaryStrength: 760,
    population: 1100,
    wealth: 2,
    neighbors: ["last-hearth", "winterfell"],
    summary:
      "The central stronghold of the Night's Watch sits beneath the Wall and guards the kingsroad into the far north.",
  },
  {
    id: "winterfell",
    name: "Winterfell",
    house: "House Stark",
    region: "The North",
    lord: "Lord Stark",
    left: 41.5,
    top: 32.95,
    label: "right",
    militaryStrength: 1850,
    population: 14500,
    wealth: 5,
    neighbors: ["moat-cailin", "white-harbor", "dreadfort", "last-hearth"],
    summary:
      "Ancient seat of House Stark, built around hot springs and a godswood at the heart of northern power.",
  },
  {
    id: "last-hearth",
    name: "Last Hearth",
    house: "House Umber",
    region: "The North",
    lord: "Lord Umber",
    left: 55.0,
    top: 23.5,
    label: "right",
    militaryStrength: 880,
    population: 5200,
    wealth: 3,
    neighbors: ["castle-black", "karhold", "winterfell"],
    summary:
      "A hard northern holdfast watching the cold road south from the lands near the Wall.",
  },
  {
    id: "karhold",
    name: "Karhold",
    house: "House Karstark",
    region: "The North",
    lord: "Lord Karstark",
    left: 72.0,
    top: 28.0,
    label: "right",
    militaryStrength: 920,
    population: 6800,
    wealth: 3,
    neighbors: ["last-hearth", "dreadfort", "white-harbor"],
    summary:
      "Seat of House Karstark in the cold eastern North, tied by blood and old allegiance to Winterfell.",
  },
  {
    id: "dreadfort",
    name: "Dreadfort",
    house: "House Bolton",
    region: "The North",
    lord: "Lord Bolton",
    left: 61.4,
    top: 31.9,
    label: "right",
    militaryStrength: 1420,
    population: 9100,
    wealth: 4,
    neighbors: ["karhold", "winterfell", "white-harbor"],
    summary:
      "The grim redoubt of House Bolton commands the eastern North and carries a reputation for fear.",
  },
  {
    id: "white-harbor",
    name: "White Harbor",
    house: "House Manderly",
    region: "The North",
    lord: "Lord Manderly",
    left: 49.4,
    top: 41.1,
    label: "right",
    militaryStrength: 1280,
    population: 42000,
    wealth: 7,
    neighbors: ["winterfell", "dreadfort", "moat-cailin", "the-twins"],
    summary:
      "The North's great port and richest city, ruled by House Manderly from the mouth of the White Knife.",
  },
  {
    id: "moat-cailin",
    name: "Moat Cailin",
    house: "Northern Garrison",
    region: "The Neck",
    lord: "Warden of the Causeway",
    left: 37.79,
    top: 42.13,
    label: "right",
    militaryStrength: 680,
    population: 900,
    wealth: 2,
    neighbors: ["winterfell", "white-harbor", "the-twins"],
    summary:
      "A ruined but deadly fortress in the Neck, famous for making the northern causeway almost impossible to force.",
  },
  {
    id: "pyke",
    name: "Pyke",
    house: "House Greyjoy",
    region: "Iron Islands",
    lord: "Lord Reaper of Pyke",
    left: 19.28,
    top: 57.59,
    label: "left",
    militaryStrength: 1320,
    population: 8200,
    wealth: 4,
    neighbors: ["ten-towers", "seagard", "casterly-rock"],
    summary:
      "Wave-battered seat of House Greyjoy, raised on sea stacks amid the hard islands of the Ironborn.",
  },
  {
    id: "ten-towers",
    name: "Ten Towers",
    house: "House Harlaw",
    region: "Iron Islands",
    lord: "Lord Harlaw",
    left: 23.1,
    top: 56.1,
    label: "right",
    militaryStrength: 760,
    population: 6100,
    wealth: 4,
    neighbors: ["pyke", "seagard"],
    summary:
      "The Harlaw seat is a learned and wealthy island castle compared with many harsher Ironborn holds.",
  },
  {
    id: "the-twins",
    name: "The Twins",
    house: "House Frey",
    region: "Riverlands",
    lord: "Lord Frey",
    left: 36.34,
    top: 54.2,
    label: "right",
    militaryStrength: 1750,
    population: 15000,
    wealth: 6,
    neighbors: ["moat-cailin", "riverrun", "seagard", "harrenhal"],
    summary:
      "Twin castles linked by a bridge over the Green Fork, turning river passage into Frey power.",
  },
  {
    id: "seagard",
    name: "Seagard",
    house: "House Mallister",
    region: "Riverlands",
    lord: "Lord Mallister",
    left: 32.89,
    top: 55.18,
    label: "left",
    militaryStrength: 980,
    population: 8700,
    wealth: 4,
    neighbors: ["pyke", "ten-towers", "the-twins", "riverrun"],
    summary:
      "A western riverlands port and castle built to watch the Ironborn across the bay.",
  },
  {
    id: "riverrun",
    name: "Riverrun",
    house: "House Tully",
    region: "Riverlands",
    lord: "Lord Tully",
    left: 36.42,
    top: 62.35,
    label: "right",
    militaryStrength: 1500,
    population: 18000,
    wealth: 5,
    neighbors: ["seagard", "the-twins", "harrenhal", "casterly-rock"],
    summary:
      "House Tully's river fortress sits where the Tumblestone meets the Red Fork, defended by water and clever gates.",
  },
  {
    id: "harrenhal",
    name: "Harrenhal",
    house: "Disputed",
    region: "Riverlands",
    lord: "Castellan of Harrenhal",
    left: 50.98,
    top: 62.19,
    label: "right",
    militaryStrength: 1180,
    population: 6400,
    wealth: 4,
    neighbors: ["the-twins", "riverrun", "maidenpool", "kings-landing"],
    summary:
      "The vast blackened ruin on the Gods Eye remains one of the largest and most haunted castles in Westeros.",
  },
  {
    id: "pinkmaiden",
    name: "Pinkmaiden",
    house: "House Piper",
    region: "Riverlands",
    lord: "Lord Piper",
    left: 33.12,
    top: 66.15,
    label: "right",
    militaryStrength: 620,
    population: 5200,
    wealth: 3,
    neighbors: ["riverrun", "casterly-rock", "harrenhal"],
    summary:
      "A western riverlands castle near the pressure line between trout and lion.",
  },
  {
    id: "maidenpool",
    name: "Maidenpool",
    house: "House Mooton",
    region: "Riverlands",
    lord: "Lord Mooton",
    left: 58.01,
    top: 62.96,
    label: "right",
    militaryStrength: 720,
    population: 24000,
    wealth: 5,
    neighbors: ["harrenhal", "gulltown", "kings-landing"],
    summary:
      "A busy port town and castle on the Bay of Crabs, rich from trade and vulnerable to politics.",
  },
  {
    id: "eyrie",
    name: "The Eyrie",
    house: "House Arryn",
    region: "The Vale",
    lord: "Lord Arryn",
    left: 62.1,
    top: 56.0,
    label: "right",
    militaryStrength: 900,
    population: 2600,
    wealth: 5,
    neighbors: ["runestone", "gulltown", "maidenpool"],
    summary:
      "An almost untouchable mountain castle high above the Vale, seat of House Arryn and symbol of falcon rule.",
  },
  {
    id: "runestone",
    name: "Runestone",
    house: "House Royce",
    region: "The Vale",
    lord: "Lord Royce",
    left: 78.2,
    top: 56.1,
    label: "right",
    militaryStrength: 1120,
    population: 8500,
    wealth: 4,
    neighbors: ["eyrie", "gulltown"],
    summary:
      "Ancient bronze-clad House Royce holds Runestone on the eastern Vale coast.",
  },
  {
    id: "gulltown",
    name: "Gulltown",
    house: "House Grafton",
    region: "The Vale",
    lord: "Lord Grafton",
    left: 78.0,
    top: 59.2,
    label: "right",
    militaryStrength: 920,
    population: 45000,
    wealth: 7,
    neighbors: ["eyrie", "runestone", "maidenpool", "dragonstone"],
    summary:
      "The Vale's great port, opening mountain wealth and eastern trade to the Narrow Sea.",
  },
  {
    id: "casterly-rock",
    name: "Casterly Rock",
    house: "House Lannister",
    region: "Westerlands",
    lord: "Lord Lannister",
    left: 15.63,
    top: 69.74,
    label: "left",
    militaryStrength: 2100,
    population: 22000,
    wealth: 10,
    neighbors: ["lannisport", "golden-tooth", "riverrun", "pyke"],
    summary:
      "A fortress-palace carved into a colossal stone hill above the Sunset Sea, legendary for Lannister gold.",
  },
  {
    id: "lannisport",
    name: "Lannisport",
    house: "House Lannister",
    region: "Westerlands",
    lord: "Lord Mayor of Lannisport",
    left: 13.92,
    top: 71.64,
    label: "left",
    militaryStrength: 1300,
    population: 160000,
    wealth: 9,
    neighbors: ["casterly-rock", "crakehall", "golden-tooth"],
    summary:
      "One of the great cities of Westeros, thriving under the shadow and protection of Casterly Rock.",
  },
  {
    id: "golden-tooth",
    name: "Golden Tooth",
    house: "House Lefford",
    region: "Westerlands",
    lord: "Lord Lefford",
    left: 26.87,
    top: 66.14,
    label: "right",
    militaryStrength: 980,
    population: 4700,
    wealth: 6,
    neighbors: ["casterly-rock", "lannisport", "riverrun", "pinkmaiden"],
    summary:
      "A key pass fortress guarding the eastern road into the gold-rich Westerlands.",
  },
  {
    id: "crakehall",
    name: "Crakehall",
    house: "House Crakehall",
    region: "Westerlands",
    lord: "Lord Crakehall",
    left: 13.35,
    top: 74.83,
    label: "left",
    militaryStrength: 860,
    population: 7200,
    wealth: 4,
    neighbors: ["lannisport", "old-oak", "highgarden"],
    summary:
      "A strong western castle south of Lannisport, watching the road toward the Reach.",
  },
  {
    id: "kings-landing",
    name: "King's Landing",
    house: "The Crown",
    region: "Crownlands",
    lord: "The Iron Throne",
    left: 61.3,
    top: 71.9,
    label: "right",
    militaryStrength: 2600,
    population: 500000,
    wealth: 9,
    neighbors: ["harrenhal", "maidenpool", "dragonstone", "storms-end", "highgarden"],
    summary:
      "Capital of the Seven Kingdoms and seat of the Iron Throne, rich, crowded, dangerous, and politically central.",
  },
  {
    id: "dragonstone",
    name: "Dragonstone",
    house: "House Targaryen",
    region: "Crownlands",
    lord: "Prince of Dragonstone",
    left: 77.5,
    top: 69.0,
    label: "right",
    militaryStrength: 1250,
    population: 5400,
    wealth: 5,
    neighbors: ["kings-landing", "gulltown", "storms-end"],
    summary:
      "A volcanic island fortress of Valyrian design, long tied to dragons, heirs, and sea power.",
  },
  {
    id: "highgarden",
    name: "Highgarden",
    house: "House Tyrell",
    region: "The Reach",
    lord: "Lord Tyrell",
    left: 24.56,
    top: 84.66,
    label: "right",
    militaryStrength: 2300,
    population: 78000,
    wealth: 9,
    neighbors: ["oldtown", "horn-hill", "brightwater-keep", "kings-landing", "crakehall"],
    summary:
      "Seat of House Tyrell on the Mander, surrounded by fertile wealth, chivalry, and powerful bannermen.",
  },
  {
    id: "oldtown",
    name: "Oldtown",
    house: "House Hightower",
    region: "The Reach",
    lord: "Lord Hightower",
    left: 16.33,
    top: 90.5,
    label: "left",
    militaryStrength: 1900,
    population: 340000,
    wealth: 10,
    neighbors: ["highgarden", "horn-hill", "the-arbor"],
    summary:
      "Ancient city of the Hightower, Citadel, and Starry Sept, among the richest and most learned places in Westeros.",
  },
  {
    id: "horn-hill",
    name: "Horn Hill",
    house: "House Tarly",
    region: "The Reach",
    lord: "Lord Tarly",
    left: 28.6,
    top: 86.4,
    label: "right",
    militaryStrength: 1350,
    population: 8100,
    wealth: 5,
    neighbors: ["highgarden", "oldtown", "blackhaven"],
    summary:
      "Martial seat of House Tarly in the marches, famed for disciplined soldiers and old Reach honor.",
  },
  {
    id: "brightwater-keep",
    name: "Brightwater Keep",
    house: "House Florent",
    region: "The Reach",
    lord: "Lord Florent",
    left: 15.86,
    top: 84.88,
    label: "left",
    militaryStrength: 940,
    population: 6800,
    wealth: 5,
    neighbors: ["highgarden", "oldtown"],
    summary:
      "A notable Reach castle of House Florent, positioned among fertile lands and thorny noble rivalries.",
  },
  {
    id: "the-arbor",
    name: "The Arbor",
    house: "House Redwyne",
    region: "The Reach",
    lord: "Lord Redwyne",
    left: 10.2,
    top: 93.2,
    label: "left",
    militaryStrength: 1180,
    population: 36000,
    wealth: 8,
    neighbors: ["oldtown", "highgarden"],
    summary:
      "Island home of House Redwyne, famous for vineyards, fleets, and control of rich southern sea lanes.",
  },
  {
    id: "storms-end",
    name: "Storm's End",
    house: "House Baratheon",
    region: "Stormlands",
    lord: "Lord Baratheon",
    left: 71.34,
    top: 78.02,
    label: "right",
    militaryStrength: 2050,
    population: 16000,
    wealth: 6,
    neighbors: ["kings-landing", "dragonstone", "griffins-roost", "blackhaven"],
    summary:
      "Ancient storm fortress of House Baratheon, famous for its massive curtain wall and legendary resistance to sieges.",
  },
  {
    id: "griffins-roost",
    name: "Griffin's Roost",
    house: "House Connington",
    region: "Stormlands",
    lord: "Lord Connington",
    left: 70.0,
    top: 80.9,
    label: "right",
    militaryStrength: 820,
    population: 5200,
    wealth: 4,
    neighbors: ["storms-end", "blackhaven", "stonehelm"],
    summary:
      "A stormlands castle with proud ties to House Connington and the marches near Shipbreaker Bay.",
  },
  {
    id: "blackhaven",
    name: "Blackhaven",
    house: "House Dondarrion",
    region: "Stormlands",
    lord: "Lord Dondarrion",
    left: 49.5,
    top: 84.0,
    label: "right",
    militaryStrength: 900,
    population: 5600,
    wealth: 4,
    neighbors: ["horn-hill", "storms-end", "griffins-roost", "skyreach"],
    summary:
      "Marcher castle of House Dondarrion, guarding the dangerous border roads between storm and Dornish power.",
  },
  {
    id: "stonehelm",
    name: "Stonehelm",
    house: "House Swann",
    region: "Stormlands",
    lord: "Lord Swann",
    left: 60.7,
    top: 84.5,
    label: "right",
    militaryStrength: 860,
    population: 7200,
    wealth: 4,
    neighbors: ["griffins-roost", "blackhaven", "yronwood"],
    summary:
      "A marcher fortress of House Swann controlling southern approaches toward Cape Wrath and Dorne.",
  },
  {
    id: "sunspear",
    name: "Sunspear",
    house: "House Martell",
    region: "Dorne",
    lord: "Prince of Dorne",
    left: 82.7,
    top: 93.1,
    label: "right",
    militaryStrength: 1780,
    population: 64000,
    wealth: 7,
    neighbors: ["yronwood", "godsgrace", "starfall", "storms-end"],
    summary:
      "The Martell seat at the eastern tip of Dorne, where spear towers, sunlit courts, and desert politics meet the sea.",
  },
  {
    id: "yronwood",
    name: "Yronwood",
    house: "House Yronwood",
    region: "Dorne",
    lord: "Lord Yronwood",
    left: 45.89,
    top: 89.29,
    label: "right",
    militaryStrength: 1280,
    population: 9200,
    wealth: 5,
    neighbors: ["blackhaven", "stonehelm", "skyreach", "sunspear"],
    summary:
      "The Bloodroyal's castle anchors a powerful Dornish house near the mountain passes.",
  },
  {
    id: "starfall",
    name: "Starfall",
    house: "House Dayne",
    region: "Dorne",
    lord: "Lord Dayne",
    left: 27.36,
    top: 92.58,
    label: "right",
    militaryStrength: 840,
    population: 5100,
    wealth: 4,
    neighbors: ["skyreach", "sunspear", "the-arbor"],
    summary:
      "Seat of House Dayne on the Torrentine, wrapped in legends of Dawn, falling stars, and Sword of the Morning.",
  },
  {
    id: "skyreach",
    name: "Skyreach",
    house: "House Fowler",
    region: "Dorne",
    lord: "Lord Fowler",
    left: 40.16,
    top: 91.1,
    label: "right",
    militaryStrength: 980,
    population: 4600,
    wealth: 4,
    neighbors: ["blackhaven", "yronwood", "starfall"],
    summary:
      "A mountain castle of House Fowler guarding high passes through the Red Mountains.",
  },
  {
    id: "godsgrace",
    name: "Godsgrace",
    house: "House Allyrion",
    region: "Dorne",
    lord: "Lord Allyrion",
    left: 68.63,
    top: 91.51,
    label: "right",
    militaryStrength: 760,
    population: 6900,
    wealth: 4,
    neighbors: ["sunspear", "yronwood"],
    summary:
      "A Dornish castle on the Greenblood, important to river travel and inland Dornish influence.",
  },
];

const initialThreads = [
  {
    id: "welcome-council",
    category: "Realm Council",
    house: "All Houses",
    title: "Welcome new houses to the living realm",
    body: "Introduce your house, offer alliances, and share what part of the map you want to watch.",
    author: "Maester Admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    upvotes: 18,
    reputation: 42,
    media: "",
    moderated: false,
    replies: [
      {
        id: "reply-1",
        author: "House Ashford",
        body: "We are sending grain and scouts to any new Reach houses.",
        createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
        upvotes: 6,
      },
    ],
  },
  {
    id: "north-watch",
    category: "House Forums",
    house: "House Stark",
    title: "Northern road reports",
    body: "Share road safety, castle gallery finds, and aid requests from the North.",
    author: "House Manderly",
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    upvotes: 11,
    reputation: 30,
    media: "",
    moderated: false,
    replies: [],
  },
];

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

const artifactCatalog = [
  ["longclaw", "Longclaw", "Valyrian Steel", "Won through tournaments and northern quests."],
  ["dark-sister", "Dark Sister", "Legendary Blade", "Rare drop from royal and dragon events."],
  ["blackfyre", "Blackfyre", "Lost Kingsblade", "Auction relic with massive prestige value."],
  ["heartsbane", "Heartsbane", "Valyrian Steel", "Tournament reward from the Reach."],
  ["dragon-eggs", "Dragon Eggs", "Mythic Relic", "Seasonal event reward."],
  ["ancient-crown", "Ancient Crown", "Royal Relic", "Earned through elections and influence."],
  ["royal-seal", "Royal Seal", "Political Relic", "Granted to top council contributors."],
  ["lost-relic", "Lost Relic", "Mystery", "Found in quests, galleries, and rare drops."],
];

const tournamentCatalog = [
  ["dragonstone-melee", "Dragonstone Grand Melee", "Melee", 45, 260, "Legendary Artifact Chance"],
  ["winterfell-archery", "Winterfell Archery Championship", "Archery", 25, 130, "Unique Banner"],
  ["kings-landing-trivia", "King's Landing Royal Tournament", "Trivia Championship", 15, 95, "Exclusive Title"],
  ["blackwater-naval", "Blackwater Naval Trial", "Naval Battles", 35, 180, "Gold Purse"],
];

const eventTemplates = [
  "A raven reports fresh market prices from Oldtown.",
  "A border patrol near the Riverlands requested friendly supplies.",
  "A council vote opened on road safety for traveling houses.",
  "A tournament herald posted new brackets for the next melee.",
  "Merchants in Lannisport adjusted trade rates after a busy hour.",
  "Maesters recorded new gallery submissions from a castle archive.",
];

function createEmptyGallery() {
  return galleryTypes.reduce((gallery, [key]) => ({ ...gallery, [key]: [] }), {});
}

function createDefaultCastleState() {
  return castles.reduce(
    (state, castle) => ({
      ...state,
      [castle.id]: {
        owner: null,
        troops: castle.militaryStrength,
        upgradeEndsAt: null,
        upgradeStartedAt: null,
        upgradeName: "",
      },
    }),
    {}
  );
}

function createDefaultGalleries() {
  return castles.reduce(
    (state, castle) => ({
      ...state,
      [castle.id]: createEmptyGallery(),
    }),
    {}
  );
}

function getCastleImages(castleId, uploadedGalleries = {}) {
  return galleryTypes.flatMap(([type]) => [
    ...(localCastleGalleries[castleId]?.[type] || []),
    ...(uploadedGalleries[castleId]?.[type] || []),
  ]);
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeAgo(value, now) {
  const seconds = Math.max(1, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function pct(value) {
  return `${value}%`;
}

function scoreCastle(castle, castleState) {
  return castleState.troops + castle.wealth * 150 + Math.floor(castle.population / 120);
}

export default function MapPage() {
  const fileInputRef = useRef(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState("realm");
  const [selectedCastleId, setSelectedCastleId] = useState("winterfell");
  const [castlePopupOpen, setCastlePopupOpen] = useState(false);
  const [hoveredCastleId, setHoveredCastleId] = useState(null);
  const [galleryType, setGalleryType] = useState("exterior");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [houseSigil, setHouseSigil] = useState(sigils[0]);
  const [castleState, setCastleState] = useState(createDefaultCastleState);
  const [galleries, setGalleries] = useState(createDefaultGalleries);
  const [gold, setGold] = useState(350);
  const [renown, setRenown] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState("");
  const [lastResolvedAt, setLastResolvedAt] = useState(Date.now());
  const [worldEvents, setWorldEvents] = useState([
    {
      id: "event-start",
      at: new Date().toISOString(),
      text: "The living realm is online. Economy, wars, forums, and upgrades now run continuously.",
      type: "system",
    },
  ]);
  const [wars, setWars] = useState([]);
  const [threads, setThreads] = useState(initialThreads);
  const [forumSearch, setForumSearch] = useState("");
  const [threadDraft, setThreadDraft] = useState({
    title: "",
    body: "",
    category: "Realm Council",
    house: "All Houses",
    media: "",
  });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [artifactInventory, setArtifactInventory] = useState([]);
  const [joinedTournaments, setJoinedTournaments] = useState([]);

  const selectedCastle = useMemo(
    () => castles.find((castle) => castle.id === selectedCastleId) || castles[0],
    [selectedCastleId]
  );
  const selectedState = castleState[selectedCastle.id] || {
    owner: null,
    troops: selectedCastle.militaryStrength,
  };
  const playerCastleIds = useMemo(
    () =>
      castles
        .filter((castle) => castleState[castle.id]?.owner === "player")
        .map((castle) => castle.id),
    [castleState]
  );
  const playerCastles = useMemo(
    () => castles.filter((castle) => playerCastleIds.includes(castle.id)),
    [playerCastleIds]
  );
  const checkedInToday = lastCheckInDate === new Date(now).toISOString().slice(0, 10);
  const activeWars = wars.filter((war) => war.endsAt > now);
  const completedWars = wars.filter((war) => war.endsAt <= now).slice(0, 4);
  const selectedGallery = [
    ...(localCastleGalleries[selectedCastle.id]?.[galleryType] || []),
    ...(galleries[selectedCastle.id]?.[galleryType] || []),
  ];
  const selectedCastleImages = useMemo(
    () => getCastleImages(selectedCastle.id, galleries),
    [selectedCastle.id, galleries]
  );
  const canClaim = playerCastleIds.length === 0 && selectedState.owner !== "player";
  const economyPerHour = playerCastles.reduce(
    (total, castle) => total + castle.wealth * 18 + Math.floor(castle.population / 2000),
    0
  );

  const leaderboard = useMemo(() => {
    const playerScore =
      gold + renown * 14 + playerCastles.length * 900 + artifactInventory.length * 600;
    const entries = [
      {
        house: houseName ? `House ${houseName}` : "Your Future House",
        title: playerCastles.length ? "Living Realm House" : "Unclaimed",
        score: playerScore,
      },
      { house: "House Ashford", title: "Peacekeepers", score: 18450 },
      { house: "House Thornwake", title: "Tournament Hosts", score: 16900 },
      { house: "House Ironvale", title: "Army Builders", score: 14220 },
      { house: "House Greenmoor", title: "Forum Elders", score: 12680 },
    ];

    return entries.sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [artifactInventory.length, gold, houseName, playerCastles.length, renown]);

  const filteredThreads = useMemo(() => {
    const query = forumSearch.trim().toLowerCase();
    if (!query) return threads;

    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.body.toLowerCase().includes(query) ||
        thread.category.toLowerCase().includes(query) ||
        thread.house.toLowerCase().includes(query)
    );
  }, [forumSearch, threads]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        const offlineResult = resolveOfflineProgress(data);

        setHouseName(data.houseName || "");
        setHouseMotto(data.houseMotto || "");
        setHouseSigil(data.houseSigil || sigils[0]);
        setCastleState(offlineResult.castleState);
        setGalleries({ ...createDefaultGalleries(), ...(data.galleries || {}) });
        setGold(offlineResult.gold);
        setRenown(offlineResult.renown);
        setLastCheckInDate(data.lastCheckInDate || "");
        setLastResolvedAt(offlineResult.lastResolvedAt);
        setWorldEvents(offlineResult.worldEvents);
        setWars(offlineResult.wars);
        setThreads(data.threads || initialThreads);
        setCompletedQuizzes(data.completedQuizzes || []);
        setArtifactInventory(data.artifactInventory || []);
        setJoinedTournaments(data.joinedTournaments || []);
        setSelectedCastleId(data.selectedCastleId || "winterfell");
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    resolveLiveWorld();
  }, [now, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: REALM_VERSION,
        savedAt: new Date(now).toISOString(),
        houseName,
        houseMotto,
        houseSigil,
        castleState,
        galleries,
        gold,
        renown,
        lastCheckInDate,
        lastResolvedAt,
        worldEvents,
        wars,
        threads,
        completedQuizzes,
        artifactInventory,
        joinedTournaments,
        selectedCastleId,
      })
    );
  }, [
    artifactInventory,
    castleState,
    completedQuizzes,
    galleries,
    gold,
    hasLoaded,
    houseMotto,
    houseName,
    houseSigil,
    joinedTournaments,
    lastCheckInDate,
    lastResolvedAt,
    now,
    renown,
    selectedCastleId,
    threads,
    wars,
    worldEvents,
  ]);

  function resolveOfflineProgress(data) {
    const storedState = { ...createDefaultCastleState(), ...(data.castleState || {}) };
    const storedEvents = data.worldEvents || [];
    const storedWars = data.wars || [];
    const savedAt = data.lastResolvedAt || new Date(data.savedAt || Date.now()).getTime();
    const elapsedTicks = Math.max(0, Math.floor((Date.now() - savedAt) / ECONOMY_TICK_MS));
    const owned = castles.filter((castle) => storedState[castle.id]?.owner === "player");
    const earnedGold = owned.reduce(
      (total, castle) => total + elapsedTicks * (castle.wealth * 7 + Math.floor(castle.population / 5000)),
      0
    );
    const earnedRenown = elapsedTicks > 0 && owned.length ? elapsedTicks * owned.length : 0;
    const resolvedWars = storedWars.map((war) =>
      war.endsAt <= Date.now() && !war.resolved
        ? { ...war, resolved: true, winner: war.attackPower >= war.defensePower ? war.attacker : war.defender }
        : war
    );

    return {
      castleState: Object.fromEntries(
        Object.entries(storedState).map(([castleId, state]) => [
          castleId,
          state.upgradeEndsAt && state.upgradeEndsAt <= Date.now()
            ? {
                ...state,
                upgradeEndsAt: null,
                upgradeStartedAt: null,
                upgradeName: "",
                troops: state.troops + 120,
              }
            : state,
        ])
      ),
      gold: (data.gold ?? 350) + earnedGold,
      renown: (data.renown ?? 0) + earnedRenown,
      lastResolvedAt: Date.now(),
      wars: resolvedWars,
      worldEvents:
        elapsedTicks > 0
          ? [
              {
                id: `offline-${Date.now()}`,
                at: new Date().toISOString(),
                type: "economy",
                text: `The realm kept moving while you were away: ${elapsedTicks} economy updates resolved, earning ${earnedGold} gold and ${earnedRenown} renown.`,
              },
              ...storedEvents,
            ].slice(0, 40)
          : storedEvents,
    };
  }

  function resolveLiveWorld() {
    if (now - lastResolvedAt < ECONOMY_TICK_MS) return;

    const tickCount = Math.floor((now - lastResolvedAt) / ECONOMY_TICK_MS);
    const income = playerCastles.reduce(
      (total, castle) => total + tickCount * (castle.wealth * 7 + Math.floor(castle.population / 5000)),
      0
    );
    const renownGain = playerCastles.length * tickCount;
    const randomText = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];

    setGold((current) => current + income);
    setRenown((current) => current + renownGain);
    setCastleState((current) =>
      Object.fromEntries(
        Object.entries(current).map(([castleId, state]) => [
          castleId,
          state.upgradeEndsAt && state.upgradeEndsAt <= now
            ? {
                ...state,
                upgradeEndsAt: null,
                upgradeStartedAt: null,
                upgradeName: "",
                troops: state.troops + 120,
              }
            : state,
        ])
      )
    );
    setWars((currentWars) =>
      currentWars.map((war) =>
        war.endsAt <= now && !war.resolved
          ? { ...war, resolved: true, winner: war.attackPower >= war.defensePower ? war.attacker : war.defender }
          : war
      )
    );
    addEvent(
      income > 0
        ? `Economy update: your holdings earned ${income} gold and ${renownGain} renown. ${randomText}`
        : randomText,
      "economy"
    );
    setLastResolvedAt(lastResolvedAt + tickCount * ECONOMY_TICK_MS);
  }

  function addEvent(text, type = "realm") {
    setWorldEvents((current) =>
      [
        {
          id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          at: new Date().toISOString(),
          text,
          type,
        },
        ...current,
      ].slice(0, 40)
    );
  }

  function claimCastle() {
    if (!houseName.trim() || !canClaim) return;

    setCastleState((current) => ({
      ...current,
      [selectedCastle.id]: {
        ...current[selectedCastle.id],
        owner: "player",
        troops: Math.max(current[selectedCastle.id].troops, selectedCastle.militaryStrength + 200),
      },
    }));
    setRenown((current) => current + 75);
    addEvent(`House ${houseName} claimed ${selectedCastle.name}. The action was recorded at ${formatTime(now)}.`, "claim");
  }

  function checkIn() {
    if (checkedInToday) return;

    setGold((current) => current + 120);
    setRenown((current) => current + 24);
    setLastCheckInDate(new Date(now).toISOString().slice(0, 10));
    addEvent("Daily check-in complete: +120 gold, +24 renown, and your house remains active.", "reward");
  }

  function startUpgrade() {
    if (selectedState.owner !== "player" || gold < 300 || selectedState.upgradeEndsAt) return;

    const endsAt = now + 45 * MINUTE;
    setGold((current) => current - 300);
    setCastleState((current) => ({
      ...current,
      [selectedCastle.id]: {
        ...current[selectedCastle.id],
        upgradeName: "Barracks Expansion",
        upgradeStartedAt: now,
        upgradeEndsAt: endsAt,
      },
    }));
    addEvent(`${selectedCastle.name} began Barracks Expansion. Completion: ${formatTime(endsAt)}.`, "upgrade");
  }

  function recruitArmy() {
    if (selectedState.owner !== "player" || gold < 90) return;

    setGold((current) => current - 90);
    setCastleState((current) => ({
      ...current,
      [selectedCastle.id]: {
        ...current[selectedCastle.id],
        troops: current[selectedCastle.id].troops + 85,
      },
    }));
    addEvent(`${selectedCastle.name} recruited 85 troops at ${formatTime(now)}.`, "military");
  }

  function startWar(targetId) {
    const target = castles.find((castle) => castle.id === targetId);
    if (!target || selectedState.owner !== "player" || selectedState.troops < 250) return;

    const targetState = castleState[targetId];
    const duration = 30 * MINUTE + target.wealth * 2 * MINUTE;
    const war = {
      id: `war-${Date.now()}`,
      attacker: selectedCastle.name,
      defender: target.name,
      attackerId: selectedCastle.id,
      defenderId: target.id,
      attackPower: selectedState.troops + Math.floor(Math.random() * 300),
      defensePower: targetState.troops + target.wealth * 120 + Math.floor(Math.random() * 300),
      startedAt: now,
      endsAt: now + duration,
      resolved: false,
      winner: null,
    };

    setCastleState((current) => ({
      ...current,
      [selectedCastle.id]: {
        ...current[selectedCastle.id],
        troops: Math.max(1, current[selectedCastle.id].troops - 180),
      },
    }));
    setWars((current) => [war, ...current].slice(0, 18));
    addEvent(`${selectedCastle.name} declared a real-time campaign against ${target.name}.`, "war");
  }

  function finishResolvedWar(war) {
    if (!war.resolved) return;

    if (war.winner === war.attacker) {
      setCastleState((current) => ({
        ...current,
        [war.defenderId]: {
          ...current[war.defenderId],
          owner: "player",
          troops: 260,
        },
      }));
      setRenown((current) => current + 55);
      addEvent(`${war.defender} yielded to ${war.attacker}. +55 renown awarded.`, "war");
    } else {
      setRenown((current) => current + 12);
      addEvent(`${war.defender} held against ${war.attacker}. The campaign ended with honor.`, "war");
    }

    setWars((current) => current.filter((item) => item.id !== war.id));
  }

  function uploadGalleryImages(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        setGalleries((current) => ({
          ...current,
          [selectedCastle.id]: {
            ...current[selectedCastle.id],
            [galleryType]: [
              ...(current[selectedCastle.id]?.[galleryType] || []),
              {
                id: `${selectedCastle.id}-${galleryType}-${Date.now()}-${file.name}`,
                name: file.name,
                src: reader.result,
                uploadedAt: new Date().toISOString(),
              },
            ],
          },
        }));
        addEvent(`${selectedCastle.name} received a new ${galleryType} gallery image.`, "gallery");
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function answerQuiz(quiz, answer) {
    if (completedQuizzes.includes(quiz.id)) return;

    if (answer === quiz.answer) {
      setGold((current) => current + quiz.rewardGold);
      setRenown((current) => current + quiz.rewardRenown);
      addEvent(`${quiz.category} answered correctly: +${quiz.rewardGold} gold and +${quiz.rewardRenown} renown.`, "quiz");
    } else {
      addEvent(`${quiz.category} attempt recorded. Try another quiz for rewards.`, "quiz");
    }

    setCompletedQuizzes((current) => [...current, quiz.id]);
  }

  function joinTournament(tournament) {
    if (joinedTournaments.includes(tournament[0]) || gold < tournament[3]) return;

    setGold((current) => current - tournament[3]);
    setRenown((current) => current + tournament[4]);
    setJoinedTournaments((current) => [...current, tournament[0]]);

    const artifactDrop = Math.random() > 0.45;
    if (artifactDrop) {
      const artifact = artifactCatalog[Math.floor(Math.random() * artifactCatalog.length)];
      setArtifactInventory((current) =>
        current.includes(artifact[0]) ? current : [...current, artifact[0]]
      );
      addEvent(`${tournament[1]} awarded ${artifact[1]} to your collection.`, "tournament");
    } else {
      addEvent(`${tournament[1]} joined: +${tournament[4]} renown and ${tournament[5]} chance recorded.`, "tournament");
    }
  }

  function createThread(event) {
    event.preventDefault();
    if (!threadDraft.title.trim() || !threadDraft.body.trim()) return;

    const newThread = {
      id: `thread-${Date.now()}`,
      ...threadDraft,
      author: houseName ? `House ${houseName}` : "Wandering Scribe",
      createdAt: new Date().toISOString(),
      upvotes: 0,
      reputation: 0,
      moderated: false,
      replies: [],
    };

    setThreads((current) => [newThread, ...current]);
    setRenown((current) => current + 8);
    setThreadDraft({ title: "", body: "", category: "Realm Council", house: "All Houses", media: "" });
    addEvent("A new discussion thread was posted to the realm forum. +8 renown for participation.", "forum");
  }

  function createReply(threadId) {
    const body = (replyDrafts[threadId] || "").trim();
    if (!body) return;

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              replies: [
                ...thread.replies,
                {
                  id: `reply-${Date.now()}`,
                  author: houseName ? `House ${houseName}` : "Guest",
                  body,
                  createdAt: new Date().toISOString(),
                  upvotes: 0,
                },
              ],
              reputation: thread.reputation + 2,
            }
          : thread
      )
    );
    setReplyDrafts((current) => ({ ...current, [threadId]: "" }));
    setRenown((current) => current + 3);
  }

  function upvoteThread(threadId) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? { ...thread, upvotes: thread.upvotes + 1, reputation: thread.reputation + 1 }
          : thread
      )
    );
  }

  function moderateThread(threadId) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId ? { ...thread, moderated: !thread.moderated } : thread
      )
    );
  }

  function resetRealm() {
    localStorage.removeItem(STORAGE_KEY);
    setHouseName("");
    setHouseMotto("");
    setHouseSigil(sigils[0]);
    setCastleState(createDefaultCastleState());
    setGalleries(createDefaultGalleries());
    setGold(350);
    setRenown(0);
    setLastCheckInDate("");
    setLastResolvedAt(Date.now());
    setWorldEvents([]);
    setWars([]);
    setThreads(initialThreads);
    setCompletedQuizzes([]);
    setArtifactInventory([]);
    setJoinedTournaments([]);
  }

  const neighboringTargets = selectedCastle.neighbors
    .map((id) => castles.find((castle) => castle.id === id))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <section className="sticky top-0 z-40 border-b border-stone-800 bg-black/95 px-3 py-3 backdrop-blur md:static md:px-4 md:py-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Game of Kings
            </Link>
            <h1 className="mt-1 text-2xl font-black leading-tight md:text-5xl">Living Westeros Map</h1>
            <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-stone-400 sm:block">
              No turns. The economy, wars, upgrades, votes, forums, tournaments, and galleries are timestamped and keep moving in real time.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1 overflow-x-auto pb-1 text-center md:gap-2 xl:min-w-[780px]">
            <Stat label="Gold" value={gold.toLocaleString()} />
            <Stat label="Renown" value={renown.toLocaleString()} />
            <Stat label="Holdings" value={playerCastles.length} />
            <Stat label="Gold / Hour" value={economyPerHour} />
            <Stat label="Live Wars" value={activeWars.length} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-3 px-3 py-3 md:gap-4 md:px-4 md:py-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          <div className="border border-stone-700 bg-stone-950">
            <div className="flex flex-col gap-3 border-b border-stone-800 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {["realm", "forum"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-11 shrink-0 snap-start rounded-md px-4 py-2 text-sm font-black capitalize transition ${
                      activeTab === tab
                        ? "bg-amber-400 text-stone-950"
                        : "bg-stone-900 text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <Link
                  href="/house"
                  className="min-h-11 shrink-0 snap-start rounded-md bg-stone-900 px-4 py-2 text-sm font-black capitalize text-stone-300 transition hover:bg-stone-800"
                >
                  House
                </Link>
                <Link
                  href="/events"
                  className="min-h-11 shrink-0 snap-start rounded-md bg-stone-900 px-4 py-2 text-sm font-black capitalize text-stone-300 transition hover:bg-stone-800"
                >
                  Events
                </Link>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center">
                <select
                  aria-label="Jump to castle"
                  value={selectedCastle.id}
                  onChange={(event) => {
                    setSelectedCastleId(event.target.value);
                    setActiveTab("realm");
                    setGalleryIndex(0);
                  }}
                  className="min-h-11 rounded-md border border-stone-700 bg-black px-3 py-2 text-sm font-bold text-stone-100 outline-none focus:border-amber-300"
                >
                  {castles.map((castle) => (
                    <option key={castle.id} value={castle.id}>
                      {castle.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Zoom {Math.round(zoom * 100)}%
                  </span>
                  <input
                    aria-label="Map zoom"
                    type="range"
                    min="0.7"
                    max="2.4"
                    step="0.05"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-stone-800 bg-black/50 p-3 text-sm text-stone-400">
              <p>
                Selected: <span className="font-black text-amber-300">{selectedCastle.name}</span>
                <span className="ml-2 text-stone-500">Tap a printed castle dot on the map to open it.</span>
              </p>
            </div>

            <div className="h-[58vh] overflow-auto bg-[#10100e] overscroll-contain md:h-[72vh]">
              <div
                className="relative origin-top-left"
                style={{
                  width: `${Math.max(150, 100 * zoom)}%`,
                  minWidth: `${Math.max(150, 100 * zoom)}%`,
                }}
              >
                <img
                  src="/LONG-MAP.png"
                  alt="Full Westeros map"
                  className="block w-full select-none"
                  draggable={false}
                />

                {castles.map((castle) => {
                  const state = castleState[castle.id] || { troops: castle.militaryStrength };
                  const hovered = castle.id === hoveredCastleId;
                  const owned = state.owner === "player";

                  return (
                    <button
                      key={castle.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCastleId(castle.id);
                        setActiveTab("realm");
                        setGalleryIndex(0);
                        setCastlePopupOpen(true);
                      }}
                      onMouseEnter={() => setHoveredCastleId(castle.id)}
                      onMouseLeave={() => setHoveredCastleId(null)}
                      className="absolute z-10 flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        left: pct(castle.left),
                        top: pct(castle.top),
                        transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                        transformOrigin: "center",
                      }}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full transition ${
                          hovered
                            ? "border-2 border-amber-300 bg-amber-300/25 shadow-[0_0_14px_rgba(251,191,36,0.85)]"
                            : owned
                              ? "border-2 border-emerald-300 bg-emerald-300/20"
                              : "border border-transparent bg-transparent"
                        }`}
                        style={{ backgroundColor: owned ? houseSigil.color : undefined }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {activeTab === "realm" && (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Panel>
                <CastlePanel
                  castle={selectedCastle}
                  state={selectedState}
                  houseName={houseName}
                  canClaim={canClaim}
                  onClaim={claimCastle}
                  onRecruit={recruitArmy}
                  onUpgrade={startUpgrade}
                  gold={gold}
                  now={now}
                  targets={neighboringTargets}
                  castleState={castleState}
                  onWar={startWar}
                />
              </Panel>

              <Panel>
                <GalleryPanel
                  castle={selectedCastle}
                  galleryType={galleryType}
                  setGalleryType={(type) => {
                    setGalleryType(type);
                    setGalleryIndex(0);
                  }}
                  selectedGallery={selectedGallery}
                  galleryIndex={galleryIndex}
                  setGalleryIndex={setGalleryIndex}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onFullscreen={setFullscreenImage}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={uploadGalleryImages}
                />
              </Panel>
            </section>
          )}

          {activeTab === "forum" && (
            <ForumPanel
              threads={filteredThreads}
              threadDraft={threadDraft}
              setThreadDraft={setThreadDraft}
              forumSearch={forumSearch}
              setForumSearch={setForumSearch}
              onCreateThread={createThread}
              onReply={createReply}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              onUpvote={upvoteThread}
              onModerate={moderateThread}
              now={now}
            />
          )}

        </div>

        <aside className="space-y-3 md:space-y-4">
          <Panel>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Online World</p>
            <h2 className="mt-2 text-2xl font-black">Realm Clock</h2>
            <p className="mt-2 text-sm text-stone-400">{formatTime(now)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={checkIn}
                disabled={checkedInToday}
                className="min-h-11 rounded-md bg-emerald-700 px-4 py-3 text-sm font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                {checkedInToday ? "Checked In" : "Daily Check-In"}
              </button>
              <button
                onClick={resetRealm}
                className="min-h-11 rounded-md border border-stone-700 px-4 py-3 text-sm font-black text-stone-300 transition hover:border-red-400 hover:text-red-300"
              >
                Reset Local Realm
              </button>
            </div>
          </Panel>

          <Panel>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Your House</p>
            {houseName ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-12 w-10 rounded-t-full border border-amber-300"
                    style={{ backgroundColor: houseSigil.color }}
                  />
                  <div>
                    <h2 className="font-black">House {houseName}</h2>
                    <p className="text-sm text-stone-400">{houseMotto || "No words declared."}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-400">
                  {playerCastles.length
                    ? `Seat: ${playerCastles[0].name}.`
                    : "Now click a castle and claim it as your only seat."}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-stone-400">
                Make your house first, then come back to the map and claim one castle.
              </p>
            )}
            <Link
              href="/house"
              className="mt-4 block min-h-11 rounded-md bg-amber-400 px-4 py-3 text-center font-black text-stone-950 transition hover:bg-amber-300"
            >
              {houseName ? "Edit House Founder" : "Create House"}
            </Link>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Live Wars</h2>
              <span className="text-xs font-black text-red-300">{activeWars.length} active</span>
            </div>
            <div className="mt-4 space-y-3">
              {[...activeWars, ...completedWars].length === 0 ? (
                <p className="text-sm text-stone-400">No active campaigns. Wars continue while players browse.</p>
              ) : (
                [...activeWars, ...completedWars].map((war) => (
                  <div key={war.id} className="border border-stone-800 bg-black p-3">
                    <p className="font-black">
                      {war.attacker} vs {war.defender}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Started {timeAgo(war.startedAt, now)} / Ends {formatTime(war.endsAt)}
                    </p>
                    {war.resolved ? (
                      <button
                        onClick={() => finishResolvedWar(war)}
                        className="mt-3 rounded-md bg-red-700 px-3 py-2 text-xs font-black transition hover:bg-red-600"
                      >
                        Resolve: {war.winner} won
                      </button>
                    ) : (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-800">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${Math.min(100, Math.max(4, ((now - war.startedAt) / (war.endsAt - war.startedAt)) * 100))}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Leaderboard</h2>
              <span className="text-xs font-black text-amber-300">Renown</span>
            </div>
            <div className="mt-4 space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.house} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-stone-950">
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-black">{entry.house}</p>
                      <p className="text-xs text-stone-500">{entry.title}</p>
                    </div>
                  </div>
                  <p className="font-black text-amber-300">{entry.score.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-xl font-black">World Feed</h2>
            <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
              {worldEvents.map((event) => (
                <div key={event.id} className="border border-stone-800 bg-black p-3">
                  <p className="text-sm leading-6 text-stone-300">{event.text}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-600">
                    {event.type} / {timeAgo(event.at, now)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </section>

      {castlePopupOpen && (
        <CastlePopup
          castle={selectedCastle}
          state={selectedState}
          houseName={houseName}
          images={selectedCastleImages}
          canClaim={canClaim}
          onClaim={claimCastle}
          onClose={() => setCastlePopupOpen(false)}
          onFullscreen={setFullscreenImage}
          onOpenGallery={() => {
            setCastlePopupOpen(false);
            setActiveTab("realm");
          }}
        />
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute right-4 top-4 rounded-md bg-stone-100 px-4 py-2 font-black text-stone-950"
          >
            Close
          </button>
          <img src={fullscreenImage.src} alt={fullscreenImage.name} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </main>
  );
}

function CastlePopup({ castle, state, houseName, images, canClaim, onClaim, onClose, onFullscreen, onOpenGallery }) {
  const heroImage = images[0];
  const owner = state.owner === "player" ? `House ${houseName || "Unknown"}` : castle.house;
  const currentLord = state.owner === "player" ? houseName || "Player Lord" : castle.lord;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-lg border border-amber-300/40 bg-[#11100d] shadow-2xl shadow-black">
        <div className="relative min-h-64 border-b border-stone-800 bg-black sm:min-h-80">
          {heroImage ? (
            <button onClick={() => onFullscreen(heroImage)} className="block h-full min-h-64 w-full sm:min-h-80">
              <img src={heroImage.src} alt={heroImage.name} className="h-full min-h-64 w-full object-cover sm:min-h-80" />
            </button>
          ) : (
            <div className="flex min-h-64 items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,#17130d,#050505)] p-8 text-center sm:min-h-80">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">Castle Archive</p>
                <h2 className="mt-3 text-3xl font-black text-stone-100">{castle.name}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-400">No castle image has been added yet.</p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">{castle.region}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-5xl">{castle.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md bg-black/80 px-4 py-2 text-sm font-black text-stone-100 transition hover:bg-stone-100 hover:text-stone-950"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-stone-500">Lore</p>
            <p className="mt-3 text-base leading-7 text-stone-300">{castle.summary}</p>
            <p className="mt-4 text-sm leading-6 text-stone-500">
              This location is part of the living realm: claims, wars, upgrades, gallery uploads, and house activity are timestamped as the world keeps moving.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {canClaim && (
                <button
                  onClick={() => {
                    onClaim();
                    onClose();
                  }}
                  disabled={!houseName.trim()}
                  className="min-h-11 rounded-md bg-emerald-700 px-5 py-3 text-sm font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
                >
                  Claim Castle
                </button>
              )}
              <button
                onClick={onOpenGallery}
                className="min-h-11 rounded-md bg-amber-400 px-5 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-300"
              >
                View Gallery
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Info label="House Name" value={owner} />
            <Info label="Current Lord" value={currentLord} />
            <Info label="Military" value={state.troops.toLocaleString()} />
            <Info label="Population" value={castle.population.toLocaleString()} />
            <Info label="Wealth" value={`${castle.wealth}/10`} />
            <Info label="Power Score" value={scoreCastle(castle, state).toLocaleString()} />
          </div>
        </div>
      </section>
    </div>
  );
}

function CastlePanel({ castle, state, houseName, canClaim, onClaim, onRecruit, onUpgrade, gold, now, targets, castleState, onWar }) {
  const upgradeRemaining = state.upgradeEndsAt ? Math.max(0, Math.ceil((state.upgradeEndsAt - now) / 1000)) : 0;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">{castle.region}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">{castle.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">{castle.summary}</p>
        </div>
        {canClaim && (
          <button
            onClick={onClaim}
            disabled={!houseName.trim()}
            className="min-h-11 rounded-md bg-emerald-700 px-5 py-3 font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            Claim Castle
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Info label="House Name" value={state.owner === "player" ? `House ${houseName}` : castle.house} />
        <Info label="Current Lord" value={state.owner === "player" ? houseName || "Player Lord" : castle.lord} />
        <Info label="Military" value={state.troops.toLocaleString()} />
        <Info label="Population" value={castle.population.toLocaleString()} />
        <Info label="Wealth" value={`${castle.wealth}/10`} />
        <Info label="Power Score" value={scoreCastle(castle, state).toLocaleString()} />
      </div>

      {state.owner === "player" && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            onClick={onRecruit}
            disabled={gold < 90}
            className="min-h-11 rounded-md bg-red-700 px-5 py-3 font-black transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            Recruit 85 Troops - 90 Gold
          </button>
          <button
            onClick={onUpgrade}
            disabled={gold < 300 || Boolean(state.upgradeEndsAt)}
            className="min-h-11 rounded-md bg-blue-700 px-5 py-3 font-black transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            {state.upgradeEndsAt ? `Upgrading: ${Math.floor(upgradeRemaining / 60)}m ${upgradeRemaining % 60}s` : "Start Barracks Upgrade - 300 Gold"}
          </button>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-lg font-black text-amber-300">Neighboring Locations</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {targets.map((target) => (
            <button
              key={target.id}
              onClick={() => onWar(target.id)}
              disabled={state.owner !== "player" || castleState[target.id]?.owner === "player" || state.troops < 250}
              className="min-h-12 rounded-md border border-stone-700 bg-black px-3 py-2 text-left text-sm font-bold transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {target.name}
              <span className="block text-xs text-stone-500">{target.region}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryPanel({ castle, galleryType, setGalleryType, selectedGallery, galleryIndex, setGalleryIndex, onUploadClick, onFullscreen }) {
  const activeImage = selectedGallery[galleryIndex];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Castle Gallery</p>
          <h2 className="mt-2 text-2xl font-black">{castle.name}</h2>
        </div>
        <button
          onClick={onUploadClick}
          className="min-h-11 rounded-md bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-amber-300"
        >
          Upload Images
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {galleryTypes.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setGalleryType(key)}
            className={`min-h-10 rounded-md px-3 py-2 text-xs font-black ${
              galleryType === key ? "bg-stone-100 text-stone-950" : "bg-black text-stone-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-stone-800 bg-black">
        {activeImage ? (
          <button onClick={() => onFullscreen(activeImage)} className="block w-full">
            <img src={activeImage.src} alt={activeImage.name} className="h-56 w-full object-cover sm:h-72" />
          </button>
        ) : (
          <div className="flex h-56 items-center justify-center p-6 text-center text-sm text-stone-500 sm:h-72">
            No images yet. Upload exterior shots, interiors, banners, maps, or historical artwork for this castle.
            Local files can also be organized under public/castles/castle-id/.
          </div>
        )}
      </div>

      {selectedGallery.length > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setGalleryIndex((galleryIndex - 1 + selectedGallery.length) % selectedGallery.length)}
            className="rounded-md bg-stone-800 px-3 py-2 text-sm font-black"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-stone-400">
            {galleryIndex + 1} / {selectedGallery.length}
          </span>
          <button
            onClick={() => setGalleryIndex((galleryIndex + 1) % selectedGallery.length)}
            className="rounded-md bg-stone-800 px-3 py-2 text-sm font-black"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ForumPanel({ threads, threadDraft, setThreadDraft, forumSearch, setForumSearch, onCreateThread, onReply, replyDrafts, setReplyDrafts, onUpvote, onModerate, now }) {
  return (
    <Panel>
      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <h2 className="text-2xl font-black">Discussion Board</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">
            Categories, house forums, threads, replies, upvotes, reputation, moderation, search, images, and embedded media all persist locally.
          </p>
          <form onSubmit={onCreateThread} className="mt-5 space-y-3">
            <input
              value={threadDraft.title}
              onChange={(event) => setThreadDraft((draft) => ({ ...draft, title: event.target.value }))}
              placeholder="Thread title"
              className="min-h-11 w-full rounded-md border border-stone-700 bg-black px-3 py-2 text-sm outline-none focus:border-amber-300"
            />
            <textarea
              value={threadDraft.body}
              onChange={(event) => setThreadDraft((draft) => ({ ...draft, body: event.target.value }))}
              placeholder="Start a discussion"
              rows={5}
              className="w-full rounded-md border border-stone-700 bg-black px-3 py-2 text-sm outline-none focus:border-amber-300"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={threadDraft.category}
                onChange={(event) => setThreadDraft((draft) => ({ ...draft, category: event.target.value }))}
                className="min-h-11 rounded-md border border-stone-700 bg-black px-3 py-2 text-sm"
              >
                <option>Realm Council</option>
                <option>House Forums</option>
                <option>War Room</option>
                <option>Market</option>
                <option>Quizzes</option>
                <option>Tournaments</option>
              </select>
              <input
                value={threadDraft.house}
                onChange={(event) => setThreadDraft((draft) => ({ ...draft, house: event.target.value }))}
                placeholder="House forum"
                className="min-h-11 rounded-md border border-stone-700 bg-black px-3 py-2 text-sm outline-none focus:border-amber-300"
              />
            </div>
            <input
              value={threadDraft.media}
              onChange={(event) => setThreadDraft((draft) => ({ ...draft, media: event.target.value }))}
              placeholder="Image or embedded media URL"
              className="min-h-11 w-full rounded-md border border-stone-700 bg-black px-3 py-2 text-sm outline-none focus:border-amber-300"
            />
            <button className="min-h-11 w-full rounded-md bg-amber-400 px-4 py-3 font-black text-stone-950 transition hover:bg-amber-300">
              Create Thread
            </button>
          </form>
        </div>

        <div>
          <input
            value={forumSearch}
            onChange={(event) => setForumSearch(event.target.value)}
            placeholder="Search categories, houses, threads"
            className="w-full rounded-md border border-stone-700 bg-black px-3 py-2 text-sm outline-none focus:border-amber-300"
          />
          <div className="mt-4 space-y-4">
            {threads.map((thread) => (
              <article key={thread.id} className={`border p-4 ${thread.moderated ? "border-red-700 bg-red-950/20" : "border-stone-800 bg-black"}`}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                      {thread.category} / {thread.house}
                    </p>
                    <h3 className="mt-1 text-xl font-black">{thread.title}</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      {thread.author} / {timeAgo(thread.createdAt, now)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onUpvote(thread.id)} className="min-h-10 rounded-md bg-stone-800 px-3 py-2 text-xs font-black">
                      Upvote {thread.upvotes}
                    </button>
                    <button onClick={() => onModerate(thread.id)} className="min-h-10 rounded-md border border-stone-700 px-3 py-2 text-xs font-black text-stone-300">
                      {thread.moderated ? "Unflag" : "Flag"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-300">{thread.body}</p>
                {thread.media && (
                  <a href={thread.media} target="_blank" className="mt-3 block text-sm font-bold text-blue-300">
                    Open embedded media
                  </a>
                )}
                <p className="mt-3 text-xs font-black uppercase tracking-wider text-emerald-300">
                  Reputation {thread.reputation}
                </p>
                <div className="mt-4 space-y-2">
                  {thread.replies.map((reply) => (
                    <div key={reply.id} className="border-l-2 border-stone-700 bg-stone-950 p-3">
                      <p className="text-sm text-stone-300">{reply.body}</p>
                      <p className="mt-1 text-xs text-stone-600">
                        {reply.author} / {timeAgo(reply.createdAt, now)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={replyDrafts[thread.id] || ""}
                    onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [thread.id]: event.target.value }))}
                    placeholder="Reply"
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm outline-none focus:border-amber-300"
                  />
                  <button onClick={() => onReply(thread.id)} className="min-h-11 rounded-md bg-stone-100 px-4 py-2 text-sm font-black text-stone-950">
                    Reply
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-[92px] border border-stone-700 bg-stone-900 px-2 py-2 md:min-w-0 md:px-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 md:text-xs">{label}</p>
      <p className="text-base font-black text-stone-100 md:text-xl">{value}</p>
    </div>
  );
}

function Panel({ children }) {
  return <div className="border border-stone-700 bg-stone-900 p-4 shadow-xl md:p-5">{children}</div>;
}

function Info({ label, value }) {
  return (
    <div className="border border-stone-800 bg-black p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 break-words text-base font-black">{value}</p>
    </div>
  );
}
