"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game_of_kings_living_realm";

const tinctures = [
  ["Iron Black", "#070807"],
  ["Night Charcoal", "#151716"],
  ["Aged Steel", "#68716f"],
  ["Muted Silver", "#b7b3a8"],
  ["Dim Parchment", "#a99d86"],
  ["Blood Red", "#5e1114"],
  ["Dried Maroon", "#3a0d12"],
  ["Deep Umber", "#4a3728"],
  ["Forest Shadow", "#153529"],
  ["Moss Green", "#46523a"],
  ["Sea Iron", "#183c42"],
  ["Storm Blue", "#263848"],
  ["Ash Violet", "#3c3346"],
  ["Old Bone", "#d1c7b5"],
  ["Soot Brown", "#241b16"],
  ["Candle Gold", "#8a6d3b"],
];

const fieldLayouts = [
  ["plain", "Plain Field"],
  ["per-pale", "Split Vertical"],
  ["per-fess", "Split Horizontal"],
  ["quartered", "Quartered"],
  ["bend", "Diagonal Bend"],
  ["bend-sinister", "Reverse Bend"],
  ["cross", "Iron Cross"],
  ["saltire", "Saltire"],
  ["chevron", "Chevron"],
  ["pale", "Center Pale"],
  ["fess", "Center Fess"],
  ["chief", "Chief"],
  ["base", "Base"],
  ["bordure", "Bordure"],
];

const shieldShapes = [
  ["heater", "Heater"],
  ["kite", "Kite"],
  ["round", "Round"],
  ["banner", "Banner"],
  ["tower", "Tower"],
];

const charges = [
  ["wolf", "Wolf"],
  ["lion", "Lion"],
  ["dragon", "Dragon"],
  ["kraken", "Kraken"],
  ["stag", "Stag"],
  ["falcon", "Falcon"],
  ["raven", "Raven"],
  ["bear", "Bear"],
  ["horse", "Horse"],
  ["serpent", "Serpent"],
  ["boar", "Boar"],
  ["rose", "Rose"],
  ["sun", "Sun"],
  ["moon", "Moon"],
  ["tower", "Tower"],
  ["sword", "Sword"],
  ["crown", "Crown"],
  ["ship", "Ship"],
  ["tree", "Weirwood"],
  ["star", "Star"],
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
  border: "#68716f",
};

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
  };

  if (sigil.field === "quartered") {
    return `linear-gradient(90deg, ${primary} 0 50%, ${secondary} 50% 100%)`;
  }

  return fields[sigil.field] || primary;
}

function getShieldClip(shape) {
  const shapes = {
    heater: "polygon(50% 0, 94% 11%, 88% 72%, 50% 100%, 12% 72%, 6% 11%)",
    kite: "polygon(50% 0, 95% 10%, 82% 66%, 50% 100%, 18% 66%, 5% 10%)",
    round: "ellipse(44% 48% at 50% 45%)",
    banner: "polygon(8% 0, 92% 0, 92% 100%, 50% 82%, 8% 100%)",
    tower: "polygon(8% 8%, 18% 8%, 18% 0, 32% 0, 32% 8%, 44% 8%, 44% 0, 56% 0, 56% 8%, 68% 8%, 68% 0, 82% 0, 82% 8%, 92% 8%, 92% 100%, 8% 100%)",
  };

  return shapes[shape] || shapes.heater;
}

function updateSigilValue(setSigil, key, value) {
  setSigil((sigil) => ({
    ...sigil,
    [key]: value,
    name: key === "charge" ? charges.find(([id]) => id === value)?.[1] || sigil.name : sigil.name,
  }));
}

export default function HouseFounderPage() {
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [sigil, setSigil] = useState(defaultSigil);
  const [savedMessage, setSavedMessage] = useState("");

  const background = useMemo(() => getFieldBackground(sigil), [sigil]);

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
    const chargeName = charges.find(([id]) => id === sigil.charge)?.[1] || sigil.name;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...current,
        houseName: houseName.trim(),
        houseMotto: houseMotto.trim(),
        houseSigil: {
          ...sigil,
          name: chargeName,
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
            Build a custom sigil with shield fields, colors, emblem objects, size, position, and rotation.
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
                <OptionGrid
                  options={fieldLayouts}
                  value={sigil.field}
                  onChange={(value) => updateSigilValue(setSigil, "field", value)}
                />
              </ControlBlock>

              <ControlBlock title="Shield Shape">
                <OptionGrid
                  options={shieldShapes}
                  value={sigil.shield}
                  onChange={(value) => updateSigilValue(setSigil, "shield", value)}
                />
              </ControlBlock>

              <ControlBlock title="Emblem Objects">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {charges.map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => updateSigilValue(setSigil, "charge", id)}
                      className={`border px-3 py-3 text-sm font-bold transition ${
                        sigil.charge === id
                          ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)] text-[var(--gok-silver)]"
                          : "border-[var(--gok-line)] bg-black/40 text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"
                      }`}
                    >
                      <span className="mx-auto mb-2 block h-9 w-9">
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

              <ControlBlock title="Object Size And Placement">
                <div className="grid gap-4 md:grid-cols-2">
                  <RangeControl label="Size" value={sigil.chargeSize} min="28" max="88" onChange={(value) => updateSigilValue(setSigil, "chargeSize", value)} />
                  <RangeControl label="Left / Right" value={sigil.chargeX} min="20" max="80" onChange={(value) => updateSigilValue(setSigil, "chargeX", value)} />
                  <RangeControl label="Up / Down" value={sigil.chargeY} min="22" max="78" onChange={(value) => updateSigilValue(setSigil, "chargeY", value)} />
                  <RangeControl label="Rotation" value={sigil.chargeRotate} min="-35" max="35" onChange={(value) => updateSigilValue(setSigil, "chargeRotate", value)} />
                </div>
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
          {sigil.field === "quartered" && (
            <div className="absolute inset-0 grid grid-cols-2">
              <div style={{ backgroundColor: sigil.color }} />
              <div style={{ backgroundColor: sigil.secondary }} />
              <div style={{ backgroundColor: sigil.secondary }} />
              <div style={{ backgroundColor: sigil.color }} />
            </div>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
          <div
            className="absolute"
            style={{
              left: `${sigil.chargeX}%`,
              top: `${sigil.chargeY}%`,
              width: `${sigil.chargeSize}%`,
              transform: `translate(-50%, -50%) rotate(${sigil.chargeRotate}deg)`,
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
      {options.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
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
        {tinctures.map(([name, color]) => (
          <button
            key={`${title}-${name}`}
            onClick={() => onPick(color)}
            className={`h-11 border transition ${selected === color ? "border-[var(--gok-silver)]" : "border-[var(--gok-line)]"}`}
            style={{ backgroundColor: color }}
            title={name}
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
      {type === "wolf" && <path {...common} d="M12 60 L28 24 L42 42 L58 18 L70 43 L88 36 L78 62 L92 84 L62 75 L48 92 L38 74 L16 78 Z" />}
      {type === "lion" && (
        <>
          <circle {...common} cx="48" cy="42" r="25" />
          <path {...common} d="M22 36 L8 22 L30 25 L35 5 L48 23 L64 6 L66 28 L90 24 L76 42 L91 58 L68 57 L63 80 L49 63 L32 82 L31 58 L10 62 Z" />
          <path {...common} d="M55 58 C66 64 74 72 75 88 L52 79 L34 90 C34 75 42 64 55 58 Z" />
        </>
      )}
      {type === "dragon" && <path {...common} d="M10 63 C30 25 52 45 54 18 L70 36 L90 23 L78 52 L92 70 L67 68 L58 90 L44 70 C34 78 22 76 10 63 Z" />}
      {type === "kraken" && <path {...common} d="M50 10 C70 10 80 25 70 42 C88 45 92 62 82 76 C75 62 63 61 56 72 L62 94 L50 82 L38 94 L44 72 C37 61 25 62 18 76 C8 62 12 45 30 42 C20 25 30 10 50 10 Z" />}
      {type === "stag" && <path {...common} d="M35 90 L42 58 L28 45 L12 55 L23 35 L8 18 L31 26 L36 7 L45 30 L55 30 L64 7 L69 26 L92 18 L77 35 L88 55 L72 45 L58 58 L65 90 L50 76 Z" />}
      {type === "falcon" && <path {...common} d="M7 55 C26 25 44 19 50 42 C56 19 74 25 93 55 C73 50 60 56 54 75 L50 92 L46 75 C40 56 27 50 7 55 Z" />}
      {type === "raven" && <path {...common} d="M16 55 C38 18 65 20 84 49 L97 48 L86 59 C80 76 61 87 40 79 L18 92 L28 70 C18 65 12 61 16 55 Z" />}
      {type === "bear" && <path {...common} d="M23 24 L34 14 L44 24 L56 24 L66 14 L78 24 L80 58 C78 80 63 90 50 90 C37 90 22 80 20 58 Z" />}
      {type === "horse" && <path {...common} d="M27 90 L34 56 L24 45 L30 20 L54 12 L74 28 L66 49 L78 66 L66 90 L58 64 L43 59 L39 90 Z" />}
      {type === "serpent" && <path {...common} d="M67 13 C36 14 26 36 48 46 C72 57 63 80 30 85 L20 70 C49 72 52 60 35 53 C8 41 25 11 67 13 Z M68 13 L88 21 L68 31 Z" />}
      {type === "boar" && <path {...common} d="M16 60 C20 34 47 26 72 35 L88 26 L83 47 L94 61 L78 66 L68 84 L58 68 L34 72 L22 88 L21 69 Z" />}
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
      {type === "sword" && <path {...common} d="M47 9 H53 L58 60 L77 69 L69 80 L56 72 L53 94 H47 L44 72 L31 80 L23 69 L42 60 Z" />}
      {type === "crown" && <path {...common} d="M12 78 L18 30 L38 58 L50 18 L62 58 L82 30 L88 78 Z" />}
      {type === "ship" && <path {...common} d="M15 60 H85 L72 82 H28 Z M48 18 H54 V60 H48 Z M54 24 C70 30 78 42 80 55 H54 Z M47 28 C32 33 24 44 22 56 H47 Z" />}
      {type === "tree" && <path {...common} d="M45 92 L48 64 C29 64 16 51 22 36 C26 25 37 25 41 31 C43 16 58 10 66 20 C75 19 84 29 78 42 C90 50 78 67 58 64 L62 92 Z" />}
      {type === "star" && <path {...common} d="M50 6 L61 37 L94 37 L67 56 L78 90 L50 70 L22 90 L33 56 L6 37 L39 37 Z" />}
    </svg>
  );
}
