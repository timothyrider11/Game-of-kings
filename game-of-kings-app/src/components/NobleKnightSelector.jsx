"use client";

import { useEffect, useMemo, useState } from "react";

const flavorTitles = {
  male: ["The White Cloak", "The Iron Sentinel", "The Silver Lance", "The Black Shield", "The Oathsworn"],
  female: ["The Silver Rose", "The Shieldmaiden", "The Queensguard", "The Storm Spear", "The Dawn Blade"],
};

function mod(value, length) {
  return ((value % length) + length) % length;
}

export default function NobleKnightSelector({ initialGender = "male", initialIndex = 1, onSelect, signedIn = false }) {
  const [knights, setKnights] = useState({ male: [], female: [] });
  const [gender, setGender] = useState(initialGender || "male");
  const [index, setIndex] = useState(Math.max(1, Number(initialIndex) || 1));
  const [ceremony, setCeremony] = useState("");

  useEffect(() => {
    fetch("/knights/manifest.json")
      .then((response) => response.json())
      .then((items) => {
        const grouped = {
          male: items.filter((item) => item.gender === "male").sort((a, b) => a.index - b.index),
          female: items.filter((item) => item.gender === "female").sort((a, b) => a.index - b.index),
        };
        setKnights(grouped);
      })
      .catch(() => setKnights({ male: [], female: [] }));
  }, []);

  const list = knights[gender] || [];
  const selectedPosition = list.length ? mod(index - 1, list.length) : 0;
  const selected = list[selectedPosition];
  const previous = list.length ? list[mod(selectedPosition - 1, list.length)] : null;
  const next = list.length ? list[mod(selectedPosition + 1, list.length)] : null;
  const title = selected?.title || flavorTitles[gender][selectedPosition % flavorTitles[gender].length];

  function move(step) {
    if (!list.length) return;
    setIndex(mod(selectedPosition + step, list.length) + 1);
  }

  function selectKnight() {
    if (!selected) return;
    onSelect?.({
      selectedKnightGender: gender,
      selectedKnightIndex: selected.index,
      selectedKnightImage: selected.imageUrl,
      selectedKnightTitle: title,
    });
    setCeremony(`${title} now serves your house. ${signedIn ? "Realm Saved" : "Sign in to save your knight"}`);
    window.setTimeout(() => setCeremony(""), 2600);
  }

  return (
    <section className="gok-panel relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(196,193,184,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
      <div className="relative z-10">
        <p className="gok-eyebrow text-center">Noble Knight</p>
        <h2 className="mt-2 text-center text-3xl uppercase tracking-[0.16em] text-[var(--gok-silver)] md:text-4xl">
          Choose Your Knight
        </h2>

        <div className="mt-5 flex justify-center">
          <div className="inline-grid grid-cols-2 border border-[var(--gok-line)] bg-black/60">
            {["male", "female"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setGender(item);
                  setIndex(1);
                }}
                className={`min-w-36 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                  gender === item ? "bg-[rgba(196,193,184,0.14)] text-[var(--gok-silver)]" : "text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"
                }`}
              >
                {item === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[72px_minmax(0,1fr)_72px] items-center gap-2 md:grid-cols-[120px_minmax(0,1fr)_120px]">
          <button
            type="button"
            onClick={() => move(-1)}
            className="gok-btn flex aspect-square items-center justify-center text-4xl"
            aria-label="Previous knight"
          >
            &lsaquo;
          </button>

          <div className="gok-knight-frame relative min-h-[24rem]">
            {previous && <img src={previous.imageUrl} alt="" className="gok-knight-image-faded absolute left-2 top-10 h-[78%] w-[32%] object-contain opacity-28 blur-[1px]" />}
            {next && <img src={next.imageUrl} alt="" className="gok-knight-image-faded absolute right-2 top-10 h-[78%] w-[32%] object-contain opacity-28 blur-[1px]" />}
            {selected && (
              <img
                src={selected.imageUrl}
                alt={title}
                className="gok-knight-image absolute inset-x-0 bottom-0 mx-auto h-[96%] w-[64%] object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,0.9)]"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => move(1)}
            className="gok-btn flex aspect-square items-center justify-center text-4xl"
            aria-label="Next knight"
          >
            &rsaquo;
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl tracking-[0.16em] text-[var(--gok-silver)]">{selected ? `${selected.index} / ${list.length || 60}` : "0 / 60"}</p>
          <p className="mt-1 text-lg text-[var(--gok-parchment)]">{title}</p>
          <button type="button" onClick={selectKnight} className="gok-btn gok-btn-blood mt-4 min-h-12 min-w-64 px-6 py-3">
            Select Knight
          </button>
          {ceremony && (
            <p className="mx-auto mt-4 max-w-xl border border-[var(--gok-line-strong)] bg-black/70 p-3 text-sm font-black text-[var(--gok-silver)] shadow-[0_0_28px_rgba(196,193,184,0.16)]">
              {ceremony}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
