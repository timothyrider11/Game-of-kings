"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game_of_kings_living_realm";

const tinctures = [
  ["Iron Black", "#070807", "A hard black field for grim, old houses."],
  ["Night Charcoal", "#151716", "Soft black leather and smoke."],
  ["Aged Steel", "#68716f", "Cold metal, practical and noble."],
  ["Muted Silver", "#b7b3a8", "Moonlit steel and worn plate."],
  ["Dim Parchment", "#a99d86", "Old maps, vows, and dusty halls."],
  ["Blood Red", "#5e1114", "War banners, old grudges, and ambition."],
  ["Dried Maroon", "#3a0d12", "Darker blood, more secretive."],
  ["Deep Umber", "#4a3728", "Wood, earth, and fortress halls."],
  ["Forest Shadow", "#153529", "Woods, scouts, and patient strength."],
  ["Moss Green", "#46523a", "Ancient growth and quiet survival."],
  ["Sea Iron", "#183c42", "Coasts, ships, and storm-water."],
  ["Storm Blue", "#263848", "Rain, banners, and northern skies."],
  ["Ash Violet", "#3c3346", "Mystery, old bloodlines, and court secrets."],
  ["Old Bone", "#d1c7b5", "Relics, vows, and ancient claims."],
  ["Soot Brown", "#241b16", "Forge smoke and burned timber."],
  ["Candle Gold", "#8a6d3b", "Wealth without looking bright or modern."],
];

const fieldLayouts = [
  ["plain", "Plain Field", "A single proud house color."],
  ["per-pale", "Split Vertical", "Two bloodlines or two loyalties."],
  ["per-fess", "Split Horizontal", "A house divided by land and sky."],
  ["quartered", "Quartered", "Alliance, marriage, or conquest."],
  ["bend", "Diagonal Bend", "A road, blade, river, or oath."],
  ["bend-sinister", "Reverse Bend", "A rival claim or hidden branch."],
  ["cross", "Iron Cross", "Duty, faith, and command."],
  ["saltire", "Saltire", "Crossed roads, crossed swords."],
  ["chevron", "Chevron", "A roof, mountain, or defensive wall."],
  ["pale", "Center Pale", "A central banner stripe."],
  ["fess", "Center Fess", "A strong belt across the shield."],
  ["chief", "Chief", "A ruling color above the house field."],
  ["base", "Base", "A foundation color below the house field."],
  ["bordure", "Bordure", "A bordered house mark for cadet branches."],
  ["orle", "Inner Orle", "A smaller frame inside the shield."],
  ["gyronny", "Gyronny", "Radiating wedges for a dramatic house."],
];

const shieldShapes = [
  ["heater", "Heater", "Classic knightly shield."],
  ["kite", "Kite", "Long war shield for older houses."],
  ["round", "Round", "Ancient island or hill clan feel."],
  ["banner", "Banner", "A hanging war banner."],
  ["tower", "Tower", "Fortress-shaped house mark."],
  ["royal", "Royal", "Highborn ceremonial shield."],
  ["pointed", "Pointed", "Aggressive tournament shield."],
];

const charges = [
  ["wolf", "Wolf", "Loyal, cold, watchful, and dangerous in packs."],
  ["lion", "Lion", "Pride, command, wealth, and open power."],
  ["dragon", "Dragon", "Fire, conquest, old magic, and royal ambition."],
  ["kraken", "Kraken", "Sea raids, deep grudges, and coastal terror."],
  ["stag", "Stag", "Storm kings, endurance, and lawful rule."],
  ["falcon", "Falcon", "Mountain sight, precision, and noble distance."],
  ["raven", "Raven", "Secrets, messages, omens, and memory."],
  ["bear", "Bear", "Raw strength, patience, and brutal defense."],
  ["horse", "Horse", "Speed, cavalry, open roads, and messengers."],
  ["serpent", "Serpent", "Cunning, poison, survival, and hidden strikes."],
  ["boar", "Boar", "Ferocity, stubborn charges, and hard survival."],
  ["rose", "Rose", "Courtly beauty, wealth, and soft power."],
  ["sun", "Sun", "Desert pride, warmth, and royal confidence."],
  ["moon", "Moon", "Night vows, mystery, and quiet influence."],
  ["tower", "Tower", "Stone, siegecraft, and a house built to last."],
  ["sword", "Sword", "Warrior vows, justice, and martial honor."],
  ["crown", "Crown", "Kingship, elections, prestige, and ambition."],
  ["ship", "Ship", "Trade, raids, fleets, and sea roads."],
  ["tree", "Weirwood", "Old gods, memory, roots, and northern mystery."],
  ["star", "Star", "Destiny, rare bloodlines, and legendary claims."],
  ["axe", "Axe", "Raids, executions, and hard northern justice."],
  ["chalice", "Chalice", "Faith, feasts, poison, or old ceremony."],
  ["key", "Key", "Gatekeepers, secrets, and castle authority."],
  ["flame", "Flame", "Zeal, danger, and restless ambition."],
];

const defaultSigil = {
  name: "Wolf",
  charge: "wolf",
  color: "#5e1114",
  secondary: "#070807",
  accent: "#b7b3a8",
  field: "plain",
  shield: "heater",
  chargeSize: 58,
  chargeX: 50,
  chargeY: 50,
  chargeRotate: 0,
  chargeStretch: 100,
  border: "#68716f",
};

function getById(list, id) {
  return list.find(([itemId]) => itemId === id) || list[0];
}

function getFieldBackground(sigil) {
  const primary = sigil.color;
  const secondary = sigil.secondary;
  const accent = sigil.accent;

  const fields = {
    plain: primary,
    "per-pale": `linear-gradient(90deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    "per-fess": `linear-gradient(180deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    quartered: `linear-gradient(90deg, transparent 0 50%, rgba(0,0,0,0.001) 50%), linear-gradient(180deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    bend: `linear-gradient(135deg, transparent 0 39%, ${accent} 39% 50%, transparent 50% 100%), ${primary}`,
    "bend-sinister": `linear-gradient(45deg, transparent 0 39%, ${accent} 39% 50%, transparent 50% 100%), ${primary}`,
    cross: `linear-gradient(90deg, transparent 0 42%, ${accent} 42% 58%, transparent 58%), linear-gradient(180deg, transparent 0 42%, ${accent} 42% 58%, transparent 58%), ${primary}`,
    saltire: `linear-gradient(45deg, transparent 0 43%, ${accent} 43% 55%, transparent 55%), linear-gradient(135deg, transparent 0 43%, ${accent} 43% 55%, transparent 55%), ${primary}`,
    chevron: `linear-gradient(135deg, transparent 0 41%, ${accent} 41% 52%, transparent 52%), linear-gradient(45deg, transparent 0 41%, ${accent} 41% 52%, transparent 52%), ${primary}`,
    pale: `linear-gradient(90deg, ${primary} 0 36%, ${accent} 36% 64%, ${primary} 64% 100%)`,
    fess: `linear-gradient(180deg, ${primary} 0 37%, ${accent} 37% 63%, ${primary} 63% 100%)`,
    chief: `linear-gradient(180deg, ${accent} 0 30%, ${primary} 30% 100%)`,
    base: `linear-gradient(180deg, ${primary} 0 70%, ${accent} 70% 100%)`,
    bordure: `radial-gradient(closest-side, ${primary} 72%, transparent 73%), ${accent}`,
    orle: `radial-gradient(closest-side, ${primary} 60%, transparent 61% 67%, ${primary} 68%), ${accent}`,
    gyronny: `conic-gradient(from 45deg, ${primary} 0 12.5%, ${secondary} 12.5% 25%, ${primary} 25% 37.5%, ${secondary} 37.5% 50%, ${primary} 50% 62.5%, ${secondary} 62.5% 75%, ${primary} 75% 87.5%, ${secondary} 87.5% 100%)`,
  };

  return fields[sigil.field] || primary;
}

function getShieldClip(shape) {
  const shapes = {
    heater: "polygon(50% 0, 94% 11%, 88% 72%, 50% 100%, 12% 72%, 6% 11%)",
    kite: "polygon(50% 0, 95% 10%, 82% 66%, 50% 100%, 18% 66%, 5% 10%)",
    round: "ellipse(44% 48% at 50% 45%)",
    banner: "polygon(8% 0, 92% 0, 92% 100%, 50% 82%, 8% 100%)",
    tower: "polygon(8% 8%, 18% 8%, 18% 0, 32% 0, 32% 8%, 44% 8%, 44% 0, 56% 0, 56% 8%, 68% 8%, 68% 0, 82% 0, 82% 8%, 92% 8%, 92% 100%, 8% 100%)",
    royal: "polygon(50% 0, 90% 8%, 96% 28%, 88% 76%, 50% 100%, 12% 76%, 4% 28%, 10% 8%)",
    pointed: "polygon(50% 0, 97% 18%, 80% 82%, 50% 100%, 20% 82%, 3% 18%)",
  };

  return shapes[shape] || shapes.heater;
}

function updateSigilValue(setSigil, key, value) {
  setSigil((sigil) => ({
    ...sigil,
    [key]: value,
    name: key === "charge" ? getById(charges, value)[1] : sigil.name,
  }));
}

export default function HouseFounderPage() {
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [sigil, setSigil] = useState(defaultSigil);
  const [savedMessage, setSavedMessage] = useState("");

  const background = useMemo(() => getFieldBackground(sigil), [sigil]);
  const selectedCharge = getById(charges, sigil.charge);
  const selectedField = getById(fieldLayouts, sigil.field);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      const savedSigil = data.houseSigil || {};

      setHouseName(data.houseName || "");
      setHouseMotto(data.houseMotto || "");
      setSigil({
        ...defaultSigil,
        ...savedSigil,
        charge: savedSigil.charge || savedSigil.name?.toLowerCase() || defaultSigil.charge,
        name: savedSigil.name || defaultSigil.name,
        color: savedSigil.color || defaultSigil.color,
        secondary: savedSigil.secondary || defaultSigil.secondary,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveHouse() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const chargeName = getById(charges, sigil.charge)[1];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...current,
        houseName: houseName.trim(),
        houseMotto: houseMotto.trim(),
        houseSigil: {
          ...sigil,
          name: chargeName,
          description: selectedCharge[2],
          fieldDescription: selectedField[2],
        },
      })
    );
    setSavedMessage("House saved. Your sigil is ready for the realm.");
  }

  return (
    <main className="gok-page min-h-screen overflow-x-hidden">
      <nav className="border-b border-[rgba(196,193,184,0.14)] bg-black/80 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="gok-brand text-xl">
            Game of Kings
          </Link>
          <div className="flex gap-2">
            <Link href="/map" className="gok-btn px-4 py-2 text-xs">
              Map
            </Link>
            <Link href="/events" className="gok-btn px-4 py-2 text-xs">
              Events
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[390px_minmax(0,1fr)]">
        <div className="gok-panel min-w-0 p-5">
          <p className="gok-eyebrow relative z-10">House Founder</p>
          <h1 className="relative z-10 mt-3 text-4xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Forge your house.
          </h1>
          <p className="gok-copy relative z-10 mt-4 max-w-full text-sm leading-6">
            Build a custom sigil with shield fields, colors, emblem objects, size, position, stretch, and rotation.
            This is the mark players will remember when your house enters the realm.
          </p>

          <div className="relative z-10 mt-5 space-y-3">
            <input
              value={houseName}
              onChange={(event) => setHouseName(event.target.value)}
              placeholder="House name"
              className="min-h-12 w-full border border-[var(--gok-line)] bg-black/70 px-4 py-3 outline-none focus:border-[var(--gok-line-strong)]"
            />
            <input
              value={houseMotto}
              onChange={(event) => setHouseMotto(event.target.value)}
              placeholder="House words"
              className="min-h-12 w-full border border-[var(--gok-line)] bg-black/70 px-4 py-3 outline-none focus:border-[var(--gok-line-strong)]"
            />
          </div>

          <div className="relative z-10 mt-5 border border-[var(--gok-line)] bg-black/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gok-dim)]">Selected Meaning</p>
            <h2 className="mt-2 text-xl font-normal text-[var(--gok-silver)]">{selectedCharge[1]}</h2>
            <p className="mt-2 text-sm leading-6 text-[rgba(210,205,194,0.62)]">{selectedCharge[2]}</p>
            <p className="mt-3 text-sm leading-6 text-[rgba(210,205,194,0.48)]">{selectedField[2]}</p>
          </div>

          <button
            onClick={saveHouse}
            disabled={!houseName.trim()}
            className="gok-btn gok-btn-blood relative z-10 mt-5 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Save House
          </button>
          {savedMessage && <p className="relative z-10 mt-3 text-sm font-bold text-[var(--gok-parchment)]">{savedMessage}</p>}
          <Link href="/map" className="gok-btn relative z-10 mt-3 flex w-full px-5 py-3">
            Go Claim A Castle
          </Link>
        </div>

        <div className="gok-panel min-w-0 p-5">
          <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="gok-eyebrow">Sigil Generator</p>
              <h2 className="mt-3 text-3xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
                Heraldry Workbench
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[rgba(210,205,194,0.58)]">
              Choose the shield, divide the field, place the emblem, and tune the mark until it feels like your house.
            </p>
          </div>

          <div className="relative z-10 mt-6 grid min-w-0 gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="min-w-0">
              <SigilPreview sigil={sigil} background={background} />
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-normal text-[var(--gok-silver)]">House {houseName || "Unnamed"}</h3>
                <p className="mt-1 text-[var(--gok-dim)]">&quot;{houseMotto || "Our Words"}&quot;</p>
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <ControlBlock title="Shield Fields">
                <OptionGrid options={fieldLayouts} value={sigil.field} onChange={(value) => updateSigilValue(setSigil, "field", value)} />
              </ControlBlock>

              <ControlBlock title="Shield Shape">
                <OptionGrid options={shieldShapes} value={sigil.shield} onChange={(value) => updateSigilValue(setSigil, "shield", value)} />
              </ControlBlock>

              <ControlBlock title="Emblem Objects">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {charges.map(([id, label, description]) => (
                    <button
                      key={id}
                      onClick={() => updateSigilValue(setSigil, "charge", id)}
                      className={`border px-3 py-3 text-sm font-bold transition ${
                        sigil.charge === id
                          ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)] text-[var(--gok-silver)]"
                          : "border-[var(--gok-line)] bg-black/40 text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"
                      }`}
                      title={description}
                    >
                      <span className="mx-auto mb-2 block h-10 w-10">
                        <ChargeIcon type={id} color="currentColor" />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </ControlBlock>

              <div className="grid gap-5 lg:grid-cols-2">
                <ColorPicker title="Primary Field" selected={sigil.color} onPick={(value) => updateSigilValue(setSigil, "color", value)} />
                <ColorPicker title="Secondary Field" selected={sigil.secondary} onPick={(value) => updateSigilValue(setSigil, "secondary", value)} />
                <ColorPicker title="Field Accent" selected={sigil.accent} onPick={(value) => updateSigilValue(setSigil, "accent", value)} />
                <ColorPicker title="Emblem Color" selected={sigil.border} onPick={(value) => updateSigilValue(setSigil, "border", value)} />
              </div>

              <ControlBlock title="Custom Placement">
                <div className="grid gap-4 md:grid-cols-2">
                  <RangeControl label="Size" value={sigil.chargeSize} min="24" max="96" onChange={(value) => updateSigilValue(setSigil, "chargeSize", value)} />
                  <RangeControl label="Width Stretch" value={sigil.chargeStretch} min="65" max="140" onChange={(value) => updateSigilValue(setSigil, "chargeStretch", value)} />
                  <RangeControl label="Left / Right" value={sigil.chargeX} min="12" max="88" onChange={(value) => updateSigilValue(setSigil, "chargeX", value)} />
                  <RangeControl label="Up / Down" value={sigil.chargeY} min="14" max="86" onChange={(value) => updateSigilValue(setSigil, "chargeY", value)} />
                  <RangeControl label="Rotation" value={sigil.chargeRotate} min="-60" max="60" onChange={(value) => updateSigilValue(setSigil, "chargeRotate", value)} />
                </div>
                <button
                  onClick={() => setSigil((current) => ({ ...current, chargeSize: 58, chargeX: 50, chargeY: 50, chargeRotate: 0, chargeStretch: 100 }))}
                  className="gok-btn mt-4 px-4 py-2 text-xs"
                >
                  Center Object
                </button>
              </ControlBlock>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SigilPreview({ sigil, background }) {
  const clipPath = getShieldClip(sigil.shield);

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative aspect-[3/4] bg-black/30 p-4">
        <div
          className="absolute inset-4 border-[5px] shadow-2xl"
          style={{
            background,
            borderColor: sigil.border,
            clipPath,
            boxShadow: "inset 0 0 42px rgba(0,0,0,.78), 0 26px 60px rgba(0,0,0,.7)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
          <div
            className="absolute"
            style={{
              left: `${sigil.chargeX}%`,
              top: `${sigil.chargeY}%`,
              width: `${sigil.chargeSize}%`,
              transform: `translate(-50%, -50%) rotate(${sigil.chargeRotate}deg) scaleX(${sigil.chargeStretch / 100})`,
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,.82))",
            }}
          >
            <ChargeIcon type={sigil.charge} color={sigil.border} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlBlock({ title, children }) {
  return (
    <section>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--gok-dim)]">{title}</p>
      {children}
    </section>
  );
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map(([id, label, description]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={description}
          className={`min-h-11 border px-3 py-2 text-sm font-bold transition ${
            value === id
              ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)] text-[var(--gok-silver)]"
              : "border-[var(--gok-line)] bg-black/40 text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ title, selected, onPick }) {
  return (
    <ControlBlock title={title}>
      <div className="grid grid-cols-4 gap-2">
        {tinctures.map(([name, color, description]) => (
          <button
            key={`${title}-${name}`}
            onClick={() => onPick(color)}
            className={`h-11 border transition ${selected === color ? "border-[var(--gok-silver)]" : "border-[var(--gok-line)]"}`}
            style={{ backgroundColor: color }}
            title={`${name}: ${description}`}
            aria-label={name}
          />
        ))}
      </div>
    </ControlBlock>
  );
}

function RangeControl({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-bold uppercase tracking-[0.18em] text-[var(--gok-dim)]">
        {label}
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-[var(--gok-steel)]"
      />
    </label>
  );
}

function ChargeIcon({ type, color }) {
  const common = {
    fill: color,
    stroke: "rgba(0,0,0,.55)",
    strokeWidth: 2,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  };

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full overflow-visible">
      {type === "wolf" && <path {...common} d="M10 58 L25 24 L38 38 L50 14 L61 38 L79 24 L71 50 L91 72 L67 68 L55 91 L45 70 L20 78 Z" />}
      {type === "lion" && <path {...common} d="M22 73 L30 45 L18 30 L36 31 L43 12 L52 30 L70 16 L68 38 L88 45 L69 55 L74 82 L55 68 L38 89 L39 65 Z" />}
      {type === "dragon" && <path {...common} d="M8 62 C22 27 46 40 50 17 L65 35 L91 20 L78 50 L92 68 L66 66 L56 91 L43 70 C30 79 16 76 8 62 Z" />}
      {type === "kraken" && <path {...common} d="M50 9 C70 9 80 25 70 42 C88 45 93 62 82 77 C75 61 63 61 56 72 L63 95 L50 82 L37 95 L44 72 C37 61 25 61 18 77 C7 62 12 45 30 42 C20 25 30 9 50 9 Z" />}
      {type === "stag" && <path {...common} d="M34 91 L42 58 L27 45 L11 55 L23 34 L8 17 L31 26 L36 7 L45 30 H55 L64 7 L69 26 L92 17 L77 34 L89 55 L73 45 L58 58 L66 91 L50 76 Z" />}
      {type === "falcon" && <path {...common} d="M6 55 C27 24 44 18 50 42 C56 18 73 24 94 55 C74 51 60 57 54 76 L50 94 L46 76 C40 57 26 51 6 55 Z" />}
      {type === "raven" && <path {...common} d="M15 55 C37 18 66 20 84 49 L97 48 L86 60 C80 76 61 87 40 79 L18 93 L28 70 C18 65 12 61 15 55 Z" />}
      {type === "bear" && <path {...common} d="M22 24 L34 13 L44 24 H56 L66 13 L79 24 L80 58 C78 80 63 91 50 91 C37 91 22 80 20 58 Z" />}
      {type === "horse" && <path {...common} d="M26 91 L34 56 L24 45 L30 20 L54 12 L75 28 L66 49 L79 66 L66 91 L58 64 L43 59 L39 91 Z" />}
      {type === "serpent" && <path {...common} d="M67 13 C36 14 26 36 48 46 C72 57 63 80 30 85 L20 70 C49 72 52 60 35 53 C8 41 25 11 67 13 Z M68 13 L88 21 L68 31 Z" />}
      {type === "boar" && <path {...common} d="M15 60 C20 34 47 26 72 35 L88 26 L83 47 L94 61 L78 66 L68 84 L58 68 L34 72 L22 89 L21 69 Z" />}
      {type === "rose" && (
        <>
          <circle {...common} cx="50" cy="50" r="13" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} {...common} cx="50" cy="31" rx="12" ry="20" transform={`rotate(${angle} 50 50)`} />
          ))}
        </>
      )}
      {type === "sun" && <path {...common} d="M50 5 L58 30 L82 18 L70 42 L95 50 L70 58 L82 82 L58 70 L50 95 L42 70 L18 82 L30 58 L5 50 L30 42 L18 18 L42 30 Z" />}
      {type === "moon" && <path {...common} d="M70 10 C45 22 38 53 58 76 C45 78 27 69 21 51 C13 25 39 4 70 10 Z" />}
      {type === "tower" && <path {...common} d="M22 90 V28 H32 V12 H44 V28 H56 V12 H68 V28 H78 V90 H58 V68 H42 V90 Z" />}
      {type === "sword" && <path {...common} d="M47 8 H53 L58 60 L78 69 L69 81 L56 72 L53 95 H47 L44 72 L31 81 L22 69 L42 60 Z" />}
      {type === "crown" && <path {...common} d="M12 78 L18 30 L38 58 L50 18 L62 58 L82 30 L88 78 Z" />}
      {type === "ship" && <path {...common} d="M15 60 H85 L72 82 H28 Z M48 18 H54 V60 H48 Z M54 24 C70 30 78 42 80 55 H54 Z M47 28 C32 33 24 44 22 56 H47 Z" />}
      {type === "tree" && <path {...common} d="M45 92 L48 64 C29 64 16 51 22 36 C26 25 37 25 41 31 C43 16 58 10 66 20 C75 19 84 29 78 42 C90 50 78 67 58 64 L62 92 Z" />}
      {type === "star" && <path {...common} d="M50 6 L61 37 L94 37 L67 56 L78 90 L50 70 L22 90 L33 56 L6 37 L39 37 Z" />}
      {type === "axe" && <path {...common} d="M44 91 L51 48 L32 36 C39 18 57 13 82 18 C76 42 64 58 51 48 L58 91 Z" />}
      {type === "chalice" && <path {...common} d="M27 15 H73 L66 46 C64 58 57 65 50 65 C43 65 36 58 34 46 Z M47 65 H53 V83 H70 V91 H30 V83 H47 Z" />}
      {type === "key" && <path {...common} d="M34 17 C49 17 58 31 52 44 L91 83 L79 95 L70 86 L63 92 L56 85 L49 91 L39 81 L44 53 C31 58 17 48 17 34 C17 24 24 17 34 17 Z" />}
      {type === "flame" && <path {...common} d="M51 95 C28 85 20 67 30 49 C36 37 45 32 43 16 C58 25 62 42 59 54 C68 48 72 38 72 28 C89 50 85 78 51 95 Z" />}
    </svg>
  );
}
