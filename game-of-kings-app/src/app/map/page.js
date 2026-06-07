"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability, react-hooks/exhaustive-deps */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { rollArtifact } from "../../lib/artifacts";
import { buildActivity, recordRealmActivity } from "../../lib/realm-activity";
import { abandonCastleCloud, claimCastleCloud, getSessionUser, loadCastleClaims, loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";
import { isRoyalEmail, normalizeRulerTitle, STORAGE_KEY } from "../../lib/realm-identity";

const REALM_VERSION = 4;
const MINUTE = 60_000;
const DAY_MS = 24 * 60 * MINUTE;
const ECONOMY_TICK_MS = 5 * MINUTE;

const galleryTypes = [
  ["exterior", "Exterior Images"],
  ["interior", "Interior Images"],
  ["banners", "Banners"],
  ["maps", "Maps"],
  ["artwork", "Historical Artwork"],
];

const castleImageManifest = [
  ["barrowton", "exterior", "exterior-0.png"],
  ["barrowton", "exterior", "exterior-1.png"],
  ["barrowton", "exterior", "exterior-2.png"],
  ["bloody-gate", "exterior", "exterior-0.jpg"],
  ["bloody-gate", "exterior", "exterior-1.jpg"],
  ["casterly-rock", "exterior", "exterior-0.jpg"],
  ["casterly-rock", "exterior", "exterior-1.jpg"],
  ["casterly-rock", "exterior", "exterior-2.jpg"],
  ["castle-black", "exterior", "exterior-0.jpg"],
  ["castle-black", "exterior", "exterior-1.jpg"],
  ["castle-black", "exterior", "exterior-2.jpg"],
  ["cerwyn", "exterior", "exterior-0.webp"],
  ["cerwyn", "exterior", "exterior-1.webp"],
  ["crasters-keep", "exterior", "exterior-0.png"],
  ["deepwood-motte", "exterior", "exterior-0.webp"],
  ["deepwood-motte", "exterior", "exterior-1.webp"],
  ["dragonstone", "exterior", "exterior-0.jpg"],
  ["dragonstone", "exterior", "exterior-1.jpg"],
  ["dragonstone", "exterior", "exterior-2.jpg"],
  ["dreadfort", "exterior", "exterior-0.png"],
  ["dreadfort", "exterior", "exterior-1.png"],
  ["dreadfort", "exterior", "exterior-2.png"],
  ["eastwatch", "exterior", "exterior-0.png"],
  ["evenfall-hall", "exterior", "exterior-0.jpg"],
  ["evenfall-hall", "exterior", "exterior-1.jpg"],
  ["eyrie", "exterior", "exterior-0.jpg"],
  ["eyrie", "exterior", "exterior-1.jpg"],
  ["eyrie", "exterior", "exterior-2.jpg"],
  ["fist-of-the-first-men", "exterior", "exterior-0.png"],
  ["fist-of-the-first-men", "exterior", "exterior-1.png"],
  ["flints-finger", "exterior", "exterior-0.png"],
  ["flints-finger", "exterior", "exterior-1.png"],
  ["greywater-watch", "exterior", "exterior-0.webp"],
  ["greywater-watch", "exterior", "exterior-1.webp"],
  ["hardhome", "exterior", "exterior-0.webp"],
  ["hardhome", "exterior", "exterior-1.webp"],
  ["highgarden", "artwork", "artwork-1.webp"],
  ["highgarden", "artwork", "artwork-2.webp"],
  ["highgarden", "exterior", "exterior-0.png"],
  ["highgarden", "exterior", "exterior-1.png"],
  ["highgarden", "exterior", "exterior-2.png"],
  ["highgarden", "exterior", "exterior-3.png"],
  ["highgarden", "exterior", "exterior-4.png"],
  ["horn-hill", "exterior", "exterior-0.webp"],
  ["horn-hill", "exterior", "exterior-1.webp"],
  ["horn-hill", "exterior", "exterior-2.webp"],
  ["hornwood", "exterior", "exterior-0.png"],
  ["karhold", "exterior", "exterior-0.png"],
  ["karhold", "exterior", "exterior-1.png"],
  ["karhold", "exterior", "exterior-2.png"],
  ["last-hearth", "exterior", "exterior-0.jpg"],
  ["last-hearth", "exterior", "exterior-1.jpg"],
  ["moat-cailin", "exterior", "exterior-0.png"],
  ["moat-cailin", "exterior", "exterior-1.png"],
  ["moles-town", "exterior", "exterior-0.webp"],
  ["moles-town", "exterior", "exterior-1.webp"],
  ["oldcastle", "exterior", "exterior-0.png"],
  ["oldtown", "exterior", "exterior-0.jpg"],
  ["oldtown", "exterior", "exterior-1.jpg"],
  ["oldtown", "exterior", "exterior-2.jpg"],
  ["pyke", "exterior", "exterior-0.jpg"],
  ["pyke", "exterior", "exterior-1.jpg"],
  ["pyke", "exterior", "exterior-2.jpg"],
  ["rains-of-summerhall", "exterior", "exterior-0.jpg"],
  ["rains-of-summerhall", "exterior", "exterior-1.jpg"],
  ["ramsgate", "exterior", "exterior-0.png"],
  ["redfort", "exterior", "exterior-0.png"],
  ["redfort", "exterior", "exterior-1.png"],
  ["riverrun", "exterior", "exterior-0.jpg"],
  ["riverrun", "exterior", "exterior-1.jpg"],
  ["riverrun", "exterior", "exterior-2.jpg"],
  ["runestone", "exterior", "exterior-0.png"],
  ["seagard", "exterior", "exterior-0.webp"],
  ["seagard", "exterior", "exterior-1.webp"],
  ["shadow-tower", "exterior", "exterior-0.png"],
  ["starfall", "exterior", "exterior-0.jpg"],
  ["starfall", "exterior", "exterior-1.jpg"],
  ["starfall", "exterior", "exterior-2.jpg"],
  ["storms-end", "exterior", "exterior-0.jpg"],
  ["storms-end", "exterior", "exterior-1.jpg"],
  ["storms-end", "exterior", "exterior-2.jpg"],
  ["strongsong", "exterior", "exterior-0.png"],
  ["sunspear", "exterior", "exterior-0.jpg"],
  ["sunspear", "exterior", "exterior-1.jpg"],
  ["sunspear", "exterior", "exterior-2.jpg"],
  ["the-twins", "exterior", "exterior-0.png"],
  ["torrhens-square", "exterior", "exterior-0.webp"],
  ["torrhens-square", "exterior", "exterior-1.webp"],
  ["white-harbor", "exterior", "exterior-0.jpg"],
  ["white-harbor", "exterior", "exterior-1.jpg"],
  ["white-harbor", "exterior", "exterior-2.jpg"],
  ["widows-watch", "exterior", "exterior-0.png"],
  ["winterfell", "exterior", "exterior-0-overlook.png"],
  ["winterfell", "exterior", "exterior-0.jpg"],
  ["winterfell", "exterior", "exterior-1.jpg"],
  ["winterfell", "exterior", "exterior-2.png"],
  ["winterfell", "exterior", "exterior-3.png"],
  ["winterfell", "exterior", "exterior-4.jpg"],
];

const localCastleGalleries = castleImageManifest.reduce((galleries, [castleId, type, fileName], index) => {
  const name = fileName
    .replace(/\.[^.]+$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    ...galleries,
    [castleId]: {
      ...(galleries[castleId] || {}),
      [type]: [
        ...(galleries[castleId]?.[type] || []),
        {
          id: `${castleId}-${type}-${index + 1}`,
          name,
          src: `/castles/${castleId}/${fileName}`,
        },
      ],
    },
  };
}, {});

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

const coreCastles = [
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
    left: 42.6,
    top: 33.8,
    label: "right",
    militaryStrength: 1850,
    population: 14500,
    wealth: 5,
    neighbors: ["cerwyn", "barrowton", "torrhens-square", "moat-cailin", "white-harbor", "dreadfort", "last-hearth"],
    summary:
      "Ancient seat of House Stark, built around hot springs and a godswood at the heart of northern power.",
  },
  {
    id: "deepwood-motte",
    name: "Deepwood Motte",
    house: "House Glover",
    region: "The North",
    lord: "Master Glover",
    left: 28.3,
    top: 27.5,
    label: "left",
    militaryStrength: 760,
    population: 4200,
    wealth: 3,
    neighbors: ["barrowton", "torrhens-square", "winterfell", "pyke"],
    summary:
      "A timbered northern stronghold in the Wolfswood, important to western defenses and coastal warning fires.",
  },
  {
    id: "barrowton",
    name: "Barrowton",
    house: "House Dustin",
    region: "The North",
    lord: "Lady Dustin",
    left: 29.1,
    top: 40.7,
    label: "left",
    militaryStrength: 820,
    population: 7600,
    wealth: 4,
    neighbors: ["deepwood-motte", "torrhens-square", "winterfell", "moat-cailin"],
    summary:
      "A western northern town and seat of House Dustin, surrounded by ancient barrows and old First Men memory.",
  },
  {
    id: "torrhens-square",
    name: "Torrhen's Square",
    house: "House Tallhart",
    region: "The North",
    lord: "Lord Tallhart",
    left: 29.8,
    top: 36.1,
    label: "left",
    militaryStrength: 700,
    population: 4800,
    wealth: 3,
    neighbors: ["deepwood-motte", "barrowton", "cerwyn", "winterfell"],
    summary:
      "A square-built Tallhart holdfast west of Winterfell, guarding roads through the northern heartland.",
  },
  {
    id: "cerwyn",
    name: "Cerwyn",
    house: "House Cerwyn",
    region: "The North",
    lord: "Lord Cerwyn",
    left: 40.2,
    top: 38.2,
    label: "right",
    militaryStrength: 690,
    population: 5100,
    wealth: 3,
    neighbors: ["winterfell", "torrhens-square", "oldcastle", "dreadfort"],
    summary:
      "A close Stark bannerman seat northeast of Winterfell, often pulled into the first shock of northern wars.",
  },
  {
    id: "oldcastle",
    name: "Oldcastle",
    house: "House Locke",
    region: "The North",
    lord: "Lord Locke",
    left: 54.2,
    top: 45.5,
    label: "right",
    militaryStrength: 640,
    population: 4300,
    wealth: 3,
    neighbors: ["cerwyn", "white-harbor", "ramsgate", "winterfell"],
    summary:
      "An old northern seat near the White Knife's influence, bound to the politics of White Harbor and Winterfell.",
  },
  {
    id: "ramsgate",
    name: "Ramsgate",
    house: "House Bolton Vassals",
    region: "The North",
    lord: "Northern Castellan",
    left: 62.8,
    top: 40.1,
    label: "right",
    militaryStrength: 610,
    population: 3700,
    wealth: 3,
    neighbors: ["dreadfort", "oldcastle", "white-harbor", "karhold"],
    summary:
      "A hard eastern northern castle near Bolton influence, useful as a watch point over roads and lonely coast.",
  },
  {
    id: "greywater-watch",
    name: "Greywater Watch",
    house: "House Reed",
    region: "The Neck",
    lord: "Lord Reed",
    left: 36.7,
    top: 47.9,
    label: "right",
    militaryStrength: 520,
    population: 1800,
    wealth: 2,
    neighbors: ["moat-cailin", "winterfell", "the-twins"],
    summary:
      "The elusive moving seat of House Reed lies hidden in the bogs and channels of the Neck.",
  },
  {
    id: "flints-finger",
    name: "Flint's Finger",
    house: "House Flint",
    region: "The North",
    lord: "Lord Flint",
    left: 17.4,
    top: 46.7,
    label: "left",
    militaryStrength: 570,
    population: 3200,
    wealth: 3,
    neighbors: ["barrowton", "moat-cailin", "seagard"],
    summary:
      "A rocky western hold on the edge of the North, watching cold waters and the difficult routes toward the Neck.",
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
    top: 27.8,
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
    neighbors: ["karhold", "winterfell", "white-harbor", "cerwyn", "ramsgate"],
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
    neighbors: ["winterfell", "dreadfort", "oldcastle", "ramsgate", "moat-cailin", "the-twins"],
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
    neighbors: ["winterfell", "white-harbor", "greywater-watch", "flints-finger", "the-twins"],
    summary:
      "A ruined but deadly fortress in the Neck, famous for making the northern causeway almost impossible to force.",
  },
  {
    id: "pyke",
    name: "Pyke",
    house: "House Greyjoy",
    region: "Iron Islands",
    lord: "Lord Reaper of Pyke",
    left: 17.4,
    top: 60.3,
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
    top: 58.2,
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
    top: 56.7,
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
    top: 63.5,
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
    left: 47.9,
    top: 65.3,
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
    left: 31.4,
    top: 68.2,
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
    left: 53.1,
    top: 65.3,
    label: "right",
    militaryStrength: 720,
    population: 24000,
    wealth: 5,
    neighbors: ["harrenhal", "gulltown", "kings-landing"],
    summary:
      "A busy port town and castle on the Bay of Crabs, rich from trade and vulnerable to politics.",
  },
  {
    id: "raventree-hall",
    name: "Raventree Hall",
    house: "House Blackwood",
    region: "Riverlands",
    lord: "Lord Blackwood",
    left: 43.6,
    top: 61.2,
    label: "left",
    militaryStrength: 760,
    population: 6100,
    wealth: 4,
    neighbors: ["riverrun", "harrenhal", "the-twins", "stone-hedge"],
    summary:
      "The Blackwood seat is famed for its dead weirwood and ancient rivalry with House Bracken.",
  },
  {
    id: "stone-hedge",
    name: "Stone Hedge",
    house: "House Bracken",
    region: "Riverlands",
    lord: "Lord Bracken",
    left: 40.4,
    top: 64.1,
    label: "left",
    militaryStrength: 780,
    population: 6500,
    wealth: 4,
    neighbors: ["riverrun", "raventree-hall", "harrenhal", "pinkmaiden"],
    summary:
      "A Bracken stronghold in the riverlands, forever shadowed by bitter border disputes and old blood feuds.",
  },
  {
    id: "darry",
    name: "Darry",
    house: "House Darry",
    region: "Riverlands",
    lord: "Lord Darry",
    left: 55.1,
    top: 65.6,
    label: "right",
    militaryStrength: 680,
    population: 5700,
    wealth: 4,
    neighbors: ["harrenhal", "maidenpool", "kings-landing"],
    summary:
      "A loyalist riverlands castle on important roads between the Trident and the Crownlands.",
  },
  {
    id: "eyrie",
    name: "The Eyrie",
    house: "House Arryn",
    region: "The Vale",
    lord: "Lord Arryn",
    left: 60.7,
    top: 57.2,
    label: "right",
    militaryStrength: 900,
    population: 2600,
    wealth: 5,
    neighbors: ["bloody-gate", "strongsong", "hearts-home", "runestone", "gulltown", "maidenpool"],
    summary:
      "An almost untouchable mountain castle high above the Vale, seat of House Arryn and symbol of falcon rule.",
  },
  {
    id: "bloody-gate",
    name: "Bloody Gate",
    house: "House Arryn Garrison",
    region: "The Vale",
    lord: "Knight of the Gate",
    left: 53.7,
    top: 58.5,
    label: "right",
    militaryStrength: 720,
    population: 900,
    wealth: 2,
    neighbors: ["eyrie", "strongsong", "maidenpool"],
    summary:
      "A mountain gate fortress that guards the dangerous approach into the Vale of Arryn.",
  },
  {
    id: "strongsong",
    name: "Strongsong",
    house: "House Belmore",
    region: "The Vale",
    lord: "Lord Belmore",
    left: 51.8,
    top: 54.8,
    label: "left",
    militaryStrength: 640,
    population: 4600,
    wealth: 3,
    neighbors: ["eyrie", "bloody-gate", "hearts-home"],
    summary:
      "A Vale mountain castle of House Belmore, positioned among steep roads and old Arryn loyalties.",
  },
  {
    id: "hearts-home",
    name: "Heart's Home",
    house: "House Corbray",
    region: "The Vale",
    lord: "Lord Corbray",
    left: 64.1,
    top: 54.4,
    label: "right",
    militaryStrength: 760,
    population: 5300,
    wealth: 4,
    neighbors: ["eyrie", "strongsong", "runestone", "gulltown"],
    summary:
      "Seat of House Corbray, known for proud knights, mountain politics, and the Valyrian sword Lady Forlorn.",
  },
  {
    id: "runestone",
    name: "Runestone",
    house: "House Royce",
    region: "The Vale",
    lord: "Lord Royce",
    left: 76.8,
    top: 58.2,
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
    left: 75.6,
    top: 60.2,
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
    top: 74.6,
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
    left: 14.8,
    top: 76.8,
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
    left: 13.9,
    top: 78.9,
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
    left: 59.7,
    top: 73.8,
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
    top: 86.6,
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
    top: 92.1,
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
    left: 27.6,
    top: 91.1,
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
    left: 72.9,
    top: 81.5,
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
    left: 68.0,
    top: 83.2,
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
    left: 46.8,
    top: 86.7,
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
    left: 62.5,
    top: 88.5,
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
    left: 79.1,
    top: 96.5,
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
    top: 92.0,
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
    left: 28.8,
    top: 95.2,
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
    left: 39.2,
    top: 95.1,
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
    left: 65.6,
    top: 95.5,
    label: "right",
    militaryStrength: 760,
    population: 6900,
    wealth: 4,
    neighbors: ["sunspear", "yronwood"],
    summary:
      "A Dornish castle on the Greenblood, important to river travel and inland Dornish influence.",
  },
];

const printedMapLocations = [
  ["fist-of-the-first-men", "Fist of the First Men", "Beyond the Wall", 40.5, 14.4],
  ["crasters-keep", "Craster's Keep", "Beyond the Wall", 45.6, 15.9],
  ["hardhome", "Hardhome", "Beyond the Wall", 61.3, 10.3],
  ["shadow-tower", "Shadow Tower", "The Wall", 41.2, 18.4],
  ["eastwatch", "Eastwatch", "The Wall", 58.0, 17.0],
  ["moles-town", "Mole's Town", "The North", 52.6, 18.9],
  ["hornwood", "Hornwood", "The North", 56.3, 35.5],
  ["widows-watch", "Widow's Watch", "The North", 69.3, 40.8],
  ["coldwater", "Coldwater", "The Vale", 64.8, 50.3],
  ["snakewood", "Snakewood", "The Vale", 67.0, 51.5],
  ["longbow-hall", "Longbow Hall", "The Vale", 70.2, 53.2],
  ["old-anchor", "Old Anchor", "The Vale", 73.7, 55.0],
  ["ironoaks", "Ironoaks", "The Vale", 63.2, 56.0],
  ["redfort", "Redfort", "The Vale", 64.4, 60.1],
  ["wickenden", "Wickenden", "The Vale", 58.5, 62.8],
  ["oldstones", "Oldstones", "Riverlands", 36.6, 58.5],
  ["lord-harroways-town", "Lord Harroway's Town", "Riverlands", 48.3, 62.4],
  ["saltpans", "Saltpans", "Riverlands", 51.0, 64.0],
  ["acorn-hall", "Acorn Hall", "Riverlands", 41.9, 64.5],
  ["rook-rest", "Rook's Rest", "Crownlands", 64.2, 64.8],
  ["antlers", "Antlers", "Crownlands", 52.7, 67.4],
  ["hayford", "Hayford", "Crownlands", 48.4, 70.8],
  ["duskendale", "Duskendale", "Crownlands", 59.8, 68.6],
  ["sharp-point", "Sharp Point", "Crownlands", 69.0, 68.8],
  ["stonedance", "Stonedance", "Crownlands", 70.2, 71.0],
  ["haystack-hall", "Haystack Hall", "Stormlands", 59.6, 76.8],
  ["evenfall-hall", "Evenfall Hall", "Stormlands", 72.0, 78.0],
  ["bronzegate", "Bronzegate", "Stormlands", 55.5, 78.7],
  ["rains-of-summerhall", "Ruins of Summerhall", "Stormlands", 53.0, 81.3],
  ["rain-house", "Rain House", "Stormlands", 72.2, 83.2],
  ["mistwood", "Mistwood", "Stormlands", 65.8, 84.8],
  ["crows-nest", "Crow's Nest", "Stormlands", 58.8, 83.2],
  ["weeping-town", "Weeping Town", "Stormlands", 67.6, 87.2],
  ["wyl", "Wyl", "Dorne", 51.8, 88.1],
  ["tower-of-joy", "Tower of Joy", "Dorne", 35.0, 88.1],
  ["kingsgrave", "Kingsgrave", "Dorne", 36.0, 89.6],
  ["blackmont", "Blackmont", "Dorne", 29.6, 90.2],
  ["sandstone", "Sandstone", "Dorne", 34.9, 96.5],
  ["hellholt", "Hellholt", "Dorne", 42.8, 96.2],
  ["vaith", "Vaith", "Dorne", 56.4, 95.2],
  ["the-tor", "The Tor", "Dorne", 61.0, 93.8],
  ["ghost-hill", "Ghost Hill", "Dorne", 68.6, 94.1],
  ["spottswood", "Spottswood", "Dorne", 75.5, 92.8],
  ["lemonwood", "Lemonwood", "Dorne", 69.1, 96.8],
  ["saltshore", "Saltshore", "Dorne", 60.5, 97.8],
  ["sunhouse", "Sunhouse", "Dorne", 22.8, 98.4],
  ["blackcrown", "Blackcrown", "The Reach", 11.5, 91.8],
  ["three-towers", "Three Towers", "The Reach", 14.1, 93.1],
  ["bandallon", "Bandallon", "The Reach", 13.7, 85.9],
  ["honeyholt", "Honeyholt", "The Reach", 19.6, 86.6],
  ["oldtown-uplands", "Oldtown Uplands", "The Reach", 21.8, 90.0],
  ["starpike", "Starpike", "The Reach", 33.5, 86.1],
  ["cider-hall", "Cider Hall", "The Reach", 33.7, 81.4],
  ["ashford", "Ashford", "The Reach", 40.0, 82.5],
  ["harvest-hall", "Harvest Hall", "The Reach", 43.2, 83.0],
  ["longtable", "Longtable", "The Reach", 35.7, 79.6],
  ["bitterbridge", "Bitterbridge", "The Reach", 39.1, 76.8],
  ["grassy-vale", "Grassy Vale", "The Reach", 45.6, 78.2],
  ["goldengrove", "Goldengrove", "The Reach", 26.2, 75.8],
  ["old-oak", "Old Oak", "The Reach", 15.0, 79.9],
  ["cornfield", "Cornfield", "Westerlands", 21.8, 76.4],
  ["silverhill", "Silverhill", "Westerlands", 27.0, 72.4],
  ["deep-den", "Deep Den", "Westerlands", 27.5, 69.6],
  ["hornvale", "Hornvale", "Westerlands", 29.6, 67.2],
  ["ashemark", "Ashemark", "Westerlands", 22.0, 66.0],
  ["sarsfield", "Sarsfield", "Westerlands", 20.3, 67.9],
  ["kayce", "Kayce", "Westerlands", 14.6, 69.4],
  ["faircastle", "Faircastle", "Westerlands", 14.6, 65.5],
  ["the-crag", "The Crag", "Westerlands", 17.2, 62.6],
  ["banefort", "Banefort", "Westerlands", 19.9, 60.1],
];

const extraCastles = printedMapLocations.map(([id, name, region, left, top]) => ({
  id,
  name,
  house: "Local Holding",
  region,
  lord: "Local Lord",
  left,
  top,
  label: left > 63 ? "left" : "right",
  militaryStrength: 420,
  population: 2200,
  wealth: 2,
  neighbors: [],
  summary: `${name} is a printed map location in ${region}. Its archive window is ready for lore expansion, images, and player claims as the realm grows.`,
}));

const markerPositionOverrides = {
  "hardhome": [60.95, 12.08],
  "fist-of-the-first-men": [40.17, 14.11],
  "crasters-keep": [45.3, 15.61],
  "castle-black": [50.91, 17.51],
  "eastwatch": [57.52, 17.27],
  "shadow-tower": [40.79, 18.57],
  "moles-town": [52.15, 19.42],
  "last-hearth": [51.76, 23.59],
  "deepwood-motte": [26.86, 26.72],
  "karhold": [67.49, 28.01],
  "dreadfort": [57.84, 31.91],
  "winterfell": [41.49, 32.96],
  "torrhens-square": [28.72, 35.43],
  "cerwyn": [38.92, 35.64],
  "hornwood": [55.81, 36.16],
  "barrowton": [27.94, 39.81],
  "ramsgate": [68.5, 39.89],
  "white-harbor": [47.02, 42.08],
  "moat-cailin": [37.75, 42.12],
  "oldcastle": [54.49, 47.07],
  "greywater-watch": [35.26, 47.15],
  "flints-finger": [16.74, 46.01],
  "widows-watch": [70.37, 47.11],
  "coldwater": [64.06, 49.82],
  "snakewood": [65.54, 51.32],
  "longbow-hall": [69.67, 52.34],
  "hearts-home": [67.6, 52.26],
  "strongsong": [49.27, 53.84],
  "old-anchor": [73.02, 54.08],
  "the-twins": [36.12, 54.2],
  "seagard": [32.93, 55.18],
  "eyrie": [58.15, 56.23],
  "ironoaks": [64.3, 56.96],
  "runestone": [73.31, 56.95],
  "bloody-gate": [51.69, 57.69],
  "pyke": [16.6, 58.86],
  "ten-towers": [21.95, 57.45],
  "oldstones": [36.27, 57.53],
  "redfort": [62.89, 59.62],
  "gulltown": [72.47, 58.72],
  "lord-harroways-town": [47.56, 61.42],
  "riverrun": [35.96, 61.99],
  "harrenhal": [45.62, 63.92],
  "wickenden": [57.99, 62.96],
  "saltpans": [51.08, 62.15],
  "maidenpool": [53.85, 63.15],
  "casterly-rock": [15.42, 69.78],
  "pinkmaiden": [33.08, 66.16],
  "antlers": [52.15, 66.32],
  "stone-hedge": [40.4, 64.1],
  "acorn-hall": [41.5, 63.15],
  "darry": [52.25, 66.25],
  "lannisport": [13.75, 71.65],
  "hayford": [47.72, 70.14],
  "duskendale": [59.19, 67.85],
  "kayce": [11.6, 68.32],
  "the-crag": [18.75, 63.65],
  "banefort": [19.55, 60.42],
  "kings-landing": [54.41, 75.93],
  "crakehall": [13.31, 74.84],
  "golden-tooth": [26.0, 76.82],
  "haystack-hall": [62.58, 76.26],
  "evenfall-hall": [71.3, 78.0],
  "storms-end": [66.32, 79.14],
  "old-oak": [15.02, 79.46],
  "bronzegate": [58.15, 76.95],
  "bitterbridge": [37.65, 75.9],
  "cider-hall": [33.15, 81.35],
  "ashford": [39.62, 80.88],
  "longtable": [35.4, 79.27],
  "rains-of-summerhall": [49.95, 81.04],
  "griffins-roost": [62.65, 81.65],
  "rain-house": [70.6, 82.42],
  "harvest-hall": [42.58, 82.05],
  "mistwood": [65.39, 84.57],
  "blackhaven": [46.4, 83.45],
  "brightwater-keep": [17.59, 85.62],
  "highgarden": [24.52, 84.65],
  "starpike": [33.0, 85.54],
  "crows-nest": [58.26, 82.69],
  "stonehelm": [55.19, 84.65],
  "honeyholt": [19.38, 87.49],
  "horn-hill": [26.78, 87.93],
  "wyl": [48.9, 85.88],
  "tower-of-joy": [35.73, 86.92],
  "weeping-town": [66.87, 86.72],
  "oldtown": [16.35, 90.49],
  "oldtown-uplands": [22.11, 89.15],
  "blackmont": [30.59, 89.88],
  "hornvale": [26.65, 66.05],
  "deep-den": [27.4, 67.9],
  "yronwood": [45.15, 89.88],
  "three-towers": [11.21, 91.3],
  "blackcrown": [13.93, 92.68],
  "starfall": [28.1, 93.36],
  "skyreach": [38.84, 93.12],
  "the-tor": [59.24, 93.85],
  "ghost-hill": [68.66, 91.5],
  "spottswood": [77.3, 91.34],
  "sandstone": [34.56, 95.39],
  "hellholt": [42.42, 95.35],
  "vaith": [55.89, 94.86],
  "godsgrace": [68.34, 95.51],
  "sunspear": [78.23, 91.74],
  "saltshore": [60.02, 96.49],
  "lemonwood": [71.85, 93.16],
  "sunhouse": [22.11, 95.59],
};

const castles = [...coreCastles, ...extraCastles].map((castle) => {
  const position = markerPositionOverrides[castle.id];
  const isMajor = coreCastles.some((coreCastle) => coreCastle.id === castle.id);
  const nextCastle = { ...castle, tier: isMajor ? "major" : "holding" };
  return position ? { ...nextCastle, left: position[0], top: position[1] } : nextCastle;
});

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
        body: "We are watching the Reach roads and welcoming new houses to introduce themselves.",
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

const eventTemplates = [
  "A raven marked the economy ledger with a fresh timestamp.",
  "The realm clock advanced and holdings were counted again.",
  "Castle stewards updated troop and gold ledgers across the map.",
  "The war table refreshed active campaigns and pending upgrades.",
];

const banditRaidTemplates = [
  {
    id: "kingsroad-cutpurses",
    title: "Cutpurses On The Kingsroad",
    place: "a muddy kingsroad inn",
    threat: "a band of knife-men has been robbing ravens and toll wagons after dusk",
    rewardGold: 70,
    rewardRenown: 8,
    troopCost: 18,
    success:
      "Your riders caught the thieves under a broken milepost. Two surrendered when the house banner came through the rain.",
    failure:
      "The bandits scattered into the tree line before your men closed the road. A few horses were lost in the chase.",
  },
  {
    id: "moonlit-camp",
    title: "Moonlit Camp In The Pines",
    place: "a pine hollow beyond the nearest village",
    threat: "camp smoke and stolen sheep point to raiders hiding off the road",
    rewardGold: 95,
    rewardRenown: 11,
    troopCost: 26,
    success:
      "Your scouts circled the hollow and struck before sunrise. The stolen goods were returned beneath your sigil.",
    failure:
      "The camp was a decoy. Your patrol found cold ashes and spring traps set in the brush.",
  },
  {
    id: "bridge-toll",
    title: "False Toll At The Bridge",
    place: "a narrow stone bridge",
    threat: "armed men are charging peasants under a stolen banner",
    rewardGold: 120,
    rewardRenown: 14,
    troopCost: 34,
    success:
      "Your captain tore down the stolen banner and broke the toll gang in a shield rush.",
    failure:
      "The gang fired the bridge carts and fled through the smoke. The road is open, but repairs cost blood and coin.",
  },
  {
    id: "graveyard-lanterns",
    title: "Lanterns At The Old Graveyard",
    place: "a ruined graveyard beside a sept road",
    threat: "grave robbers are selling heirlooms and stirring fear in the villages",
    rewardGold: 85,
    rewardRenown: 12,
    troopCost: 22,
    success:
      "The grave robbers were found by lanternlight with silver still in their sacks. Your house restored the dead their peace.",
    failure:
      "A storm rolled in and swallowed the trail. Your patrol returned with wet cloaks and little else.",
  },
  {
    id: "salt-smugglers",
    title: "Smugglers In The Salt Reeds",
    place: "a reed-choked creek",
    threat: "smugglers are moving stolen blades by skiff before dawn",
    rewardGold: 145,
    rewardRenown: 16,
    troopCost: 40,
    success:
      "Your men dragged three skiffs from the reeds and found enough steel to arm a watch post.",
    failure:
      "The smugglers cut their ropes and vanished with the tide. One patrol boat was left gutted in the mud.",
  },
];

function createEmptyGallery() {
  return galleryTypes.reduce((gallery, [key]) => ({ ...gallery, [key]: [] }), {});
}

function createDefaultCastleState() {
  return castles.reduce(
    (state, castle) => ({
      ...state,
      [castle.id]: {
        owner: castle.id === "kings-landing" ? "rider" : castle.tier === "major" ? "ai" : null,
        reservedHouse: castle.id === "kings-landing" ? "House Rider" : "",
        troops: castle.militaryStrength,
        upgradeEndsAt: null,
        upgradeStartedAt: null,
        upgradeName: "",
      },
    }),
    {}
  );
}

function protectReservedCastles(castleState) {
  return castles.reduce((state, castle) => {
    const current = state[castle.id] || {};
    return {
      ...state,
      [castle.id]: {
        ...current,
        owner:
          castle.id === "kings-landing"
            ? "rider"
            : castle.tier === "major" && !current.owner
              ? "ai"
              : current.owner || null,
        reservedHouse: castle.id === "kings-landing" ? "House Rider" : current.reservedHouse || "",
        troops: current.troops || castle.militaryStrength,
      },
    };
  }, castleState);
}

function applyRoyalOwnership(castleState, email = "") {
  const kingLanding = castleState["kings-landing"] || {};
  return {
    ...castleState,
    "kings-landing": {
      ...kingLanding,
      owner: isRoyalEmail(email) ? "player" : "rider",
      reservedHouse: "House Rider",
      troops: Math.max(kingLanding.troops || 0, 1200),
    },
  };
}

function applyPublicClaims(castleState, claims = [], currentUserId = "", email = "") {
  const claimedState = claims.reduce((state, claim) => {
    if (!claim.castle_id || claim.castle_id === "kings-landing") return state;
    const current = state[claim.castle_id] || {};

    return {
      ...state,
      [claim.castle_id]: {
        ...current,
        owner: claim.user_id && claim.user_id === currentUserId ? "player" : "claimed",
        claimedByUserId: claim.user_id || "",
        claimedHouse: claim.house_name || "",
        rulerName: claim.ruler_name || "",
        reservedHouse: claim.reserved_house || current.reservedHouse || "",
      },
    };
  }, castleState);

  return applyRoyalOwnership(claimedState, email);
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

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / MINUTE));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
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

function getCastleOwnerText({ state, castle, houseName }) {
  if (state.owner === "player") return `House ${houseName || "Unknown"} owns this castle.`;
  if (state.owner === "claimed") return `${state.claimedHouse || state.reservedHouse || "Another house"} owns this castle.`;
  if (state.reservedHouse) return `${state.reservedHouse} owns this castle.`;
  if (state.owner === "ai") return `${castle.house} controls this castle.`;
  return "This castle is unclaimed.";
}

function getCastleLordText({ state, castle, rulerTitle, rulerName, houseName }) {
  if (state.owner === "player") return `${rulerTitle} ${rulerName || houseName || "Unknown"}`;
  if (state.owner === "claimed") return state.rulerName || "A sworn ruler";
  if (state.reservedHouse) return "King Rider";
  return castle.lord;
}

function getClaimDialogue({ isSignedIn, houseName, hasPlayerCastle, state }) {
  if (!isSignedIn) return "Sign in to claim a castle and keep it tied to your account.";
  if (!houseName.trim()) return "Found your house before claiming a castle.";
  if (hasPlayerCastle) return "Your house already owns a castle. Abandon that seat before claiming another.";
  if (state.owner) return "This castle already has a ruler.";
  return "This castle is open. Claim it for your house.";
}

export default function MapPage() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [zoom, setZoom] = useState(0.95);
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionUserId, setSessionUserId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("realm");
  const [selectedCastleId, setSelectedCastleId] = useState("winterfell");
  const [castlePopupOpen, setCastlePopupOpen] = useState(false);
  const [hoveredCastleId, setHoveredCastleId] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [rulerTitle, setRulerTitle] = useState("Lord");
  const [rulerName, setRulerName] = useState("");
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
  const [raidHistory, setRaidHistory] = useState([]);
  const lastCloudSaveRef = useRef(0);

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
  const lastCheckInTime = lastCheckInDate ? new Date(lastCheckInDate).getTime() : 0;
  const checkInReadyAt = Number.isFinite(lastCheckInTime) && lastCheckInTime > 0 ? lastCheckInTime + DAY_MS : 0;
  const checkInRemaining = Math.max(0, checkInReadyAt - now);
  const canCheckIn = !checkInReadyAt || checkInRemaining === 0;
  const activeWars = wars.filter((war) => war.endsAt > now);
  const completedWars = wars.filter((war) => war.endsAt <= now).slice(0, 4);
  const selectedCastleImages = useMemo(
    () => getCastleImages(selectedCastle.id, galleries),
    [selectedCastle.id, galleries]
  );
  const hasPlayerCastle = playerCastleIds.length > 0;
  const canClaim = isSignedIn && Boolean(houseName.trim()) && !hasPlayerCastle && !selectedState.owner;
  const economyPerHour = playerCastles.reduce(
    (total, castle) => total + castle.wealth * 18 + Math.floor(castle.population / 2000),
    0
  );
  const raidCycle = Math.floor(now / (60 * MINUTE));
  const activeRaids = useMemo(() => {
    const start = raidCycle % banditRaidTemplates.length;
    return [0, 1, 2].map((offset) => {
      const raid = banditRaidTemplates[(start + offset) % banditRaidTemplates.length];
      return {
        ...raid,
        instanceId: `${raid.id}-${raidCycle}`,
      };
    });
  }, [raidCycle]);

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

  function applyRealmData(data, emailOverride = sessionEmail, userIdOverride = sessionUserId, publicClaims = []) {
    const offlineResult = resolveOfflineProgress(data);

    const royal = isRoyalEmail(emailOverride);
    setHouseName(data.houseName || (royal ? "Rider" : ""));
    setHouseMotto(data.houseMotto || (royal ? "Loyalty Never Dies" : ""));
    setRulerTitle(normalizeRulerTitle(data.rulerTitle || "Lord", emailOverride));
    setRulerName(data.rulerName || (royal ? "Rider" : ""));
    setHouseSigil(data.houseSigil || sigils[0]);
    setCastleState(applyPublicClaims(protectReservedCastles(offlineResult.castleState), publicClaims, userIdOverride, emailOverride));
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
    setRaidHistory(data.raidHistory || []);
    setSelectedCastleId(data.selectedCastleId || "winterfell");
  }

  useEffect(() => {
    getSessionUser().then(({ user }) => {
      const email = user?.email || "";
      const userId = user?.id || "";
      setSessionEmail(email);
      setSessionUserId(userId);
      setIsSignedIn(Boolean(user));

      if (!user) {
        localStorage.removeItem(STORAGE_KEY);
        resetRealm();
        loadCastleClaims().then(({ claims }) => {
          if (!claims?.length) return;
          setCastleState((current) => applyPublicClaims(current, claims, "", ""));
        });
        setHasLoaded(true);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        try {
          applyRealmData(JSON.parse(stored), email, userId);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      Promise.all([loadCloudRealm(), loadCastleClaims()]).then(([{ realm }, { claims }]) => {
        if (!realm) {
          if (claims?.length) {
            setCastleState((current) => applyPublicClaims(current, claims, userId, email));
          }
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realm));
        applyRealmData(realm, email, userId, claims);
      });
      setHasLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadCastleClaims().then(({ claims }) => {
      if (!claims?.length) return;
      setCastleState((current) => applyPublicClaims(current, claims, sessionUserId, sessionEmail));
    });
  }, [sessionEmail, sessionUserId]);

  useEffect(() => {
    function handleRealmCleared() {
      resetRealm();
    }

    window.addEventListener("gok:realm-cleared", handleRealmCleared);
    return () => window.removeEventListener("gok:realm-cleared", handleRealmCleared);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function closeCastleView(event) {
      if (event.key !== "Escape") return;

      if (fullscreenImage) {
        setFullscreenImage(null);
        return;
      }

      if (castlePopupOpen) {
        setCastlePopupOpen(false);
      }
    }

    window.addEventListener("keydown", closeCastleView);
    return () => window.removeEventListener("keydown", closeCastleView);
  }, [castlePopupOpen, fullscreenImage]);

  useEffect(() => {
    if (!hasLoaded) return;
    resolveLiveWorld();
  }, [now, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;

    const realmSnapshot = {
      version: REALM_VERSION,
      savedAt: new Date(now).toISOString(),
      houseName,
      houseMotto,
      rulerTitle: normalizeRulerTitle(rulerTitle, sessionEmail),
      rulerName,
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
      raidHistory,
      selectedCastleId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(realmSnapshot));

    if (Date.now() - lastCloudSaveRef.current > 15_000) {
      lastCloudSaveRef.current = Date.now();
      saveCloudRealm(realmSnapshot);
    }
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
    raidHistory,
    rulerName,
    rulerTitle,
    selectedCastleId,
    threads,
    wars,
    worldEvents,
  ]);

  function resolveOfflineProgress(data) {
    const storedState = protectReservedCastles({ ...createDefaultCastleState(), ...(data.castleState || {}) });
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
      castleState: applyRoyalOwnership(protectReservedCastles(Object.fromEntries(
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
      )), sessionEmail),
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

  function logPublicActivity({ type, title, body }) {
    const actor = houseName ? `House ${houseName}` : rulerName ? `${rulerTitle} ${rulerName}` : "A realm visitor";
    recordRealmActivity(buildActivity({ type, title, body, actor }));
  }

  function claimCastle() {
    if (!houseName.trim() || !canClaim) return;

    claimCastleCloud({
      castleId: selectedCastle.id,
      houseName: `House ${houseName}`,
      rulerName: `${rulerTitle} ${rulerName || houseName}`,
    }).then(({ error }) => {
      if (error && !error.includes("Not signed in")) {
        addEvent(`Cloud claim note for ${selectedCastle.name}: ${error}`, "claim");
      }
    });

    setCastleState((current) => ({
      ...current,
      [selectedCastle.id]: {
        ...current[selectedCastle.id],
        owner: "player",
        claimedByUserId: sessionUserId,
        claimedHouse: `House ${houseName}`,
        rulerName: `${rulerTitle} ${rulerName || houseName}`,
        troops: Math.max(current[selectedCastle.id].troops, selectedCastle.militaryStrength + 200),
      },
    }));
    setRenown((current) => current + 75);
    addEvent(`House ${houseName} claimed ${selectedCastle.name}. The action was recorded at ${formatTime(now)}.`, "claim");
    logPublicActivity({
      type: "claim",
      title: `${selectedCastle.name} Has A New Banner`,
      body: `House ${houseName} claimed ${selectedCastle.name}. Words: "${houseMotto || "Words yet unspoken"}." Ruler: ${rulerTitle} ${rulerName || houseName}.`,
    });
  }

  function abandonCastle() {
    const seat = playerCastles[0];
    if (!seat || seat.id === "kings-landing") return;

    abandonCastleCloud(seat.id).then(({ error }) => {
      if (error && !error.includes("Not signed in")) {
        addEvent(`Cloud abandon note for ${seat.name}: ${error}`, "claim");
      }
    });

    setCastleState((current) => ({
      ...current,
      [seat.id]: {
        ...current[seat.id],
        owner: null,
        claimedByUserId: "",
        claimedHouse: "",
        rulerName: "",
        reservedHouse: "",
      },
    }));
    setWars((current) => current.filter((war) => war.attackerId !== seat.id && war.defenderId !== seat.id));
    addEvent(`House ${houseName} abandoned ${seat.name}. The castle is open for claim again.`, "claim");
    logPublicActivity({
      type: "claim",
      title: `${seat.name} Was Abandoned`,
      body: `House ${houseName} lowered its banner. ${seat.name} is now open for a new claimant.`,
    });
  }

  function checkIn() {
    if (!canCheckIn) return;

    setGold((current) => current + 100);
    setRenown((current) => current + 10);
    setLastCheckInDate(new Date(now).toISOString());
    addEvent("Daily check-in complete: +100 gold and +10 renown. The next check-in unlocks 24 hours from now.", "reward");
    logPublicActivity({
      type: "check-in",
      title: "A House Answered The Realm Clock",
      body: "+100 gold and +10 renown were recorded. The next raven unlocks after 24 hours.",
    });
  }

  function runBanditRaid(raid) {
    const seat = playerCastles[0];
    if (!houseName.trim() || !seat) {
      addEvent("Found your house and claim a castle before sending riders after bandits.", "raid");
      return;
    }

    const seatState = castleState[seat.id];
    if (!seatState || seatState.troops <= raid.troopCost + 25) {
      addEvent(`${seat.name} needs more troops before risking a raid against ${raid.title}.`, "raid");
      return;
    }

    if (raidHistory.some((entry) => entry.instanceId === raid.instanceId)) {
      addEvent(`${raid.title} has already been answered by your house this hour.`, "raid");
      return;
    }

    const roll = Math.random();
    const successChance = Math.min(0.82, 0.48 + seatState.troops / 2600 + renown / 12000);
    const succeeded = roll <= successChance;
    const goldReward = succeeded ? raid.rewardGold : Math.floor(raid.rewardGold * 0.22);
    const renownReward = succeeded ? raid.rewardRenown : 2;
    const troopsLost = succeeded ? Math.ceil(raid.troopCost * 0.55) : raid.troopCost;
    const story = succeeded ? raid.success : raid.failure;
    const resultTitle = succeeded ? `${raid.title} Broken` : `${raid.title} Slipped Away`;
    const foundArtifact = succeeded ? rollArtifact(0.01) : null;

    setCastleState((current) => ({
      ...current,
      [seat.id]: {
        ...current[seat.id],
        troops: Math.max(1, current[seat.id].troops - troopsLost),
      },
    }));
    setGold((current) => current + goldReward);
    setRenown((current) => current + renownReward);
    if (foundArtifact) {
      setArtifactInventory((current) => [...new Set([...current, foundArtifact])]);
    }
    setRaidHistory((current) =>
      [
        {
          instanceId: raid.instanceId,
          title: raid.title,
          succeeded,
          story,
          goldReward,
          renownReward,
          troopsLost,
          at: new Date(now).toISOString(),
        },
        ...current,
      ].slice(0, 25)
    );
    addEvent(`${resultTitle}: ${story} Reward: ${goldReward} gold, ${renownReward} renown. Troops lost: ${troopsLost}.${foundArtifact ? ` Rare artifact found: ${foundArtifact}.` : ""}`, "raid");
    logPublicActivity({
      type: "raid",
      title: resultTitle,
      body: `${story} House ${houseName} gained ${goldReward} gold and ${renownReward} renown from ${seat.name}.${foundArtifact ? ` A 1% relic roll revealed ${foundArtifact}.` : ""}`,
    });
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
    logPublicActivity({
      type: "upgrade",
      title: `${selectedCastle.name} Began An Upgrade`,
      body: `Barracks Expansion started and is expected to finish at ${formatTime(endsAt)}.`,
    });
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
    logPublicActivity({
      type: "military",
      title: `${selectedCastle.name} Raised Fresh Troops`,
      body: "85 troops were added to the garrison ledger.",
    });
  }

  function startWar(targetId) {
    const target = castles.find((castle) => castle.id === targetId);
    if (
      !target ||
      target.id === "kings-landing" ||
      target.tier !== "major" ||
      playerCastleIds.length >= 2 ||
      selectedState.owner !== "player" ||
      selectedState.troops < 250
    ) {
      return;
    }

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
    logPublicActivity({
      type: "war",
      title: "A Campaign Has Begun",
      body: `${selectedCastle.name} declared a live campaign against ${target.name}. The result will resolve by the realm clock.`,
    });
  }

  function finishResolvedWar(war) {
    if (!war.resolved) return;

    if (war.winner === war.attacker && playerCastleIds.length < 2) {
      const foundArtifact = rollArtifact(0.01);
      setCastleState((current) => ({
        ...current,
        [war.defenderId]: {
          ...current[war.defenderId],
          owner: "player",
          troops: 260,
        },
      }));
      setRenown((current) => current + 55);
      if (foundArtifact) {
        setArtifactInventory((current) => [...new Set([...current, foundArtifact])]);
      }
      addEvent(`${war.defender} yielded to ${war.attacker}. +55 renown awarded.${foundArtifact ? ` Rare artifact found: ${foundArtifact}.` : ""}`, "war");
      logPublicActivity({
        type: "war",
        title: `${war.attacker} Won A Campaign`,
        body: `${war.defender} yielded after the live battle resolved. +55 renown was awarded.${foundArtifact ? ` A 1% relic roll revealed ${foundArtifact}.` : ""}`,
      });
    } else {
      setRenown((current) => current + 12);
      addEvent(`${war.defender} held against ${war.attacker}. The campaign ended with honor.`, "war");
      logPublicActivity({
        type: "war",
        title: `${war.defender} Held The Walls`,
        body: `${war.defender} resisted ${war.attacker}. The campaign ended with honor.`,
      });
    }

    setWars((current) => current.filter((item) => item.id !== war.id));
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
    setCastleState(protectReservedCastles(createDefaultCastleState()));
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
    setRaidHistory([]);
  }

  const directTargets = selectedCastle.neighbors
    .map((id) => castles.find((castle) => castle.id === id))
    .filter(Boolean);
  const neighboringTargets = (directTargets.length ? directTargets : castles)
    .filter((castle) => castle.id !== selectedCastle.id && castle.id !== "kings-landing")
    .filter((castle) => castle.tier === "major" && castleState[castle.id]?.owner !== "player")
    .sort((first, second) => {
      const firstDistance = Math.hypot(first.left - selectedCastle.left, first.top - selectedCastle.top);
      const secondDistance = Math.hypot(second.left - selectedCastle.left, second.top - selectedCastle.top);
      return firstDistance - secondDistance;
    })
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <section className="sticky top-0 z-40 border-b border-stone-800 bg-black/95 px-3 py-2 backdrop-blur md:static md:px-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              Game of Kings
            </Link>
            <h1 className="mt-1 text-xl font-black leading-tight md:text-3xl">Living Westeros Map</h1>
            <p className="mt-1 hidden max-w-3xl text-xs leading-5 text-stone-500 sm:block">
              Claim one holding, build your house, then fight toward one AI-held major castle.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1 overflow-x-auto pb-1 text-center md:gap-2 xl:min-w-[560px]">
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
                <button
                  onClick={() => setActiveTab("realm")}
                  className="min-h-11 shrink-0 snap-start rounded-md bg-amber-400 px-4 py-2 text-sm font-black capitalize text-stone-950 transition"
                >
                  Realm
                </button>
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
                <Link
                  href="/tournaments"
                  className="min-h-11 shrink-0 snap-start rounded-md bg-stone-900 px-4 py-2 text-sm font-black capitalize text-stone-300 transition hover:bg-stone-800"
                >
                  Tournaments
                </Link>
                <Link
                  href="/forum"
                  className="min-h-11 shrink-0 snap-start rounded-md bg-stone-900 px-4 py-2 text-sm font-black capitalize text-stone-300 transition hover:bg-stone-800"
                >
                  Forum
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
                    min="0.5"
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

            <div className="h-[62vh] overflow-auto bg-[#10100e] overscroll-contain md:h-[78vh]">
              <div
                className="relative origin-top-left"
                style={{
                  width: `${Math.max(28, 100 * zoom)}%`,
                  minWidth: `${Math.max(28, 100 * zoom)}%`,
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
                      aria-label={`Open ${castle.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCastleId(castle.id);
                        setActiveTab("realm");
                        setGalleryIndex(0);
                        setCastlePopupOpen(true);
                      }}
                      onMouseEnter={() => setHoveredCastleId(castle.id)}
                      onMouseLeave={() => setHoveredCastleId(null)}
                      className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        left: pct(castle.left),
                        top: pct(castle.top),
                        transform: `translate(-50%, -50%) scale(${Math.min(1, 1 / zoom)})`,
                        transformOrigin: "center",
                      }}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full transition ${
                          hovered
                            ? "border-2 border-stone-100 bg-red-950/45 shadow-[0_0_12px_rgba(229,231,235,0.9)]"
                            : owned
                              ? "border-2 border-stone-100 bg-emerald-950/35 shadow-[0_0_8px_rgba(16,185,129,0.75)]"
                              : "border border-stone-950/40 bg-black/5 shadow-[0_0_4px_rgba(255,255,255,0.2)]"
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
            <section>
              <Panel>
                <CastlePanel
                  castle={selectedCastle}
                  state={selectedState}
                  houseName={houseName}
                  rulerTitle={rulerTitle}
                  rulerName={rulerName}
                  canClaim={canClaim}
                  isSignedIn={isSignedIn}
                  hasPlayerCastle={hasPlayerCastle}
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
                disabled={!canCheckIn}
                className="min-h-11 rounded-md bg-emerald-700 px-4 py-3 text-sm font-black transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                {canCheckIn ? "Daily Check-In" : `Ready in ${formatDuration(checkInRemaining)}`}
              </button>
              <button
                onClick={abandonCastle}
                disabled={!playerCastles.length || playerCastles[0]?.id === "kings-landing"}
                className="min-h-11 rounded-md border border-stone-700 px-4 py-3 text-sm font-black text-stone-300 transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Abandon Castle
              </button>
            </div>
            {!isSignedIn && (
              <p className="mt-3 text-xs leading-5 text-stone-500">
                Visitors can browse the realm. Sign in to claim a castle, check in, raid camps, and keep progress.
              </p>
            )}
          </Panel>

          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">Live Raid Notices</p>
                <h2 className="mt-2 text-2xl font-black">Bandit Camps</h2>
              </div>
              <span className="rounded border border-stone-700 bg-black px-2 py-1 text-xs font-black text-stone-400">
                rotates hourly
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Ride out for instant story results, gold, and renown. No turns, no waiting.
            </p>
            <div className="mt-4 space-y-3">
              {activeRaids.map((raid) => {
                const completed = raidHistory.some((entry) => entry.instanceId === raid.instanceId);
                return (
                  <div key={raid.instanceId} className="border border-stone-800 bg-black p-3">
                    <h3 className="font-black text-stone-100">{raid.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{raid.place}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{raid.threat}.</p>
                    <p className="mt-2 text-xs font-bold text-stone-500">
                      Reward: {raid.rewardGold} gold / {raid.rewardRenown} renown. Risk: about {raid.troopCost} troops.
                    </p>
                    <button
                      onClick={() => runBanditRaid(raid)}
                      disabled={completed || !houseName || playerCastles.length === 0}
                      className="mt-3 min-h-10 w-full rounded-md border border-red-900/70 bg-red-950/45 px-3 py-2 text-xs font-black text-red-100 transition hover:border-red-400 disabled:cursor-not-allowed disabled:border-stone-800 disabled:bg-stone-950 disabled:text-stone-600"
                    >
                      {completed ? "Answered" : "Ride Out"}
                    </button>
                  </div>
                );
              })}
            </div>
            {raidHistory.length > 0 && (
              <div className="mt-4 max-h-44 overflow-y-auto border border-stone-800 bg-black/60 p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Recent Raid Chronicle</p>
                {raidHistory.slice(0, 4).map((raid) => (
                  <p key={raid.instanceId} className="mt-2 text-sm leading-6 text-stone-400">
                    <span className="font-black text-stone-200">{raid.title}:</span> {raid.story}
                  </p>
                ))}
              </div>
            )}
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
                    <p className="text-sm text-stone-400">
                      {rulerTitle} {rulerName || houseName}
                    </p>
                    <p className="text-sm text-stone-500">{houseMotto || "No words declared."}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-400">
                  {playerCastles.length
                    ? `Seat: ${playerCastles[0].name}. House ${houseName} owns this castle.`
                    : isSignedIn
                      ? "Now click an unclaimed castle and claim it as your only seat."
                      : "Sign in to claim a castle and keep it tied to your account."}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-stone-400">
                {isSignedIn
                  ? "Make your house first, then come back to the map and claim one castle."
                  : "Visitors can inspect castles, lore, and activity. Sign in to found a house and claim a castle."}
              </p>
            )}
            <Link
              href="/house"
              className="mt-4 block min-h-11 rounded-md bg-amber-400 px-4 py-3 text-center font-black text-stone-950 transition hover:bg-amber-300"
            >
              {houseName ? "Edit House Founder" : "Create House"}
            </Link>
            <Link
              href="/account"
              className="mt-2 block min-h-11 rounded-md border border-stone-700 px-4 py-3 text-center font-black text-stone-300 transition hover:border-amber-300 hover:text-amber-200"
            >
              Account Sync
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

        </aside>
      </section>

      {castlePopupOpen && (
        <CastlePopup
          castle={selectedCastle}
          state={selectedState}
          houseName={houseName}
          rulerTitle={rulerTitle}
          rulerName={rulerName}
          isSignedIn={isSignedIn}
          hasPlayerCastle={hasPlayerCastle}
          images={selectedCastleImages}
          galleryIndex={galleryIndex}
          setGalleryIndex={setGalleryIndex}
          canClaim={canClaim}
          onClaim={claimCastle}
          onClose={() => setCastlePopupOpen(false)}
          onFullscreen={setFullscreenImage}
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

function CastlePopup({
  castle,
  state,
  houseName,
  rulerTitle,
  rulerName,
  isSignedIn,
  hasPlayerCastle,
  images,
  galleryIndex,
  setGalleryIndex,
  canClaim,
  onClaim,
  onClose,
  onFullscreen,
}) {
  const safeIndex = images.length ? galleryIndex % images.length : 0;
  const heroImage = images[safeIndex];
  const owner = getCastleOwnerText({ state, castle, houseName });
  const currentLord = getCastleLordText({ state, castle, rulerTitle, rulerName, houseName });
  const claimDialogue = getClaimDialogue({ isSignedIn, houseName, hasPlayerCastle, state });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-lg border border-amber-300/40 bg-[#11100d] shadow-2xl shadow-black">
        <div className="relative min-h-64 border-b border-stone-800 bg-black sm:min-h-80">
          {heroImage ? (
            <button onClick={() => onFullscreen(heroImage)} className="block h-full min-h-64 w-full sm:min-h-80">
              <img src={heroImage.src} alt={heroImage.name} className="h-full min-h-64 w-full object-cover sm:min-h-80" />
            </button>
          ) : (
            <div className="flex min-h-64 items-center justify-center bg-[radial-gradient(circle_at_50%_18%,rgba(120,120,120,0.2),transparent_32%),linear-gradient(135deg,#171717,#050505)] p-8 text-center sm:min-h-80">
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-stone-300">Castle Archive</p>
                <h2 className="mt-3 text-3xl font-black text-stone-100">{castle.name}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-400">
                  Image window ready. Add exterior views, interiors, banners, maps, and historical artwork when your castle folders are ready.
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">{castle.region}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-5xl">{castle.name}</h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Back to map"
            className="absolute right-3 top-3 rounded-md border border-stone-500 bg-black/85 px-3 py-2 text-sm font-black text-stone-100 transition hover:bg-stone-100 hover:text-stone-950"
          >
            x Back to Map
          </button>

          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-md border border-stone-700 bg-black/80 p-2">
              <button
                onClick={() => setGalleryIndex((safeIndex - 1 + images.length) % images.length)}
                className="rounded border border-stone-600 px-3 py-2 text-xs font-black text-stone-200 transition hover:bg-stone-800"
              >
                Previous
              </button>
              <span className="min-w-12 text-center text-xs font-black text-stone-300">
                {safeIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => setGalleryIndex((safeIndex + 1) % images.length)}
                className="rounded border border-stone-600 px-3 py-2 text-xs font-black text-stone-200 transition hover:bg-stone-800"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-stone-500">Lore</p>
            <p className="mt-3 text-base leading-7 text-stone-300">{castle.summary}</p>
            <p className="mt-4 text-sm leading-6 text-stone-500">
              {owner} This location is part of the living realm: claims, wars, upgrades, castle archives, and house activity are timestamped as the world keeps moving.
            </p>
            {!canClaim && (
              <p className="mt-3 border border-stone-800 bg-black/45 p-3 text-sm leading-6 text-stone-400">
                {claimDialogue}
              </p>
            )}

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
            </div>

            {images.length > 1 && (
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    onClick={() => setGalleryIndex(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded border ${
                      index === safeIndex ? "border-amber-300" : "border-stone-800"
                    }`}
                  >
                    <img src={image.src} alt={image.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Info label="Ownership" value={owner} />
            <Info label="Current Lord" value={currentLord} />
            <Info label="Military" value={state.troops.toLocaleString()} />
            <Info label="Population" value={castle.population.toLocaleString()} />
            <Info label="Wealth" value={`${castle.wealth}/10`} />
            <Info label="Power Score" value={scoreCastle(castle, state).toLocaleString()} />
            <Info label="Castle Images" value={images.length ? `${images.length} available` : "None added yet"} />
          </div>
        </div>
      </section>
    </div>
  );
}

function CastlePanel({ castle, state, houseName, rulerTitle, rulerName, canClaim, isSignedIn, hasPlayerCastle, onClaim, onRecruit, onUpgrade, gold, now, targets, castleState, onWar }) {
  const upgradeRemaining = state.upgradeEndsAt ? Math.max(0, Math.ceil((state.upgradeEndsAt - now) / 1000)) : 0;
  const owner = getCastleOwnerText({ state, castle, houseName });
  const currentLord = getCastleLordText({ state, castle, rulerTitle, rulerName, houseName });
  const claimDialogue = getClaimDialogue({ isSignedIn, houseName, hasPlayerCastle, state });

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">{castle.region}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">{castle.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">{castle.summary}</p>
          <p className="mt-3 max-w-3xl border border-stone-800 bg-black/45 p-3 text-sm font-bold leading-6 text-stone-300">
            {owner}
          </p>
          {!canClaim && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">{claimDialogue}</p>
          )}
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
        <Info label="Ownership" value={owner} />
        <Info label="Current Lord" value={currentLord} />
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
