"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game_of_kings_living_realm";

const symbols = ["Wolf", "Lion", "Dragon", "Kraken", "Stag", "Falcon", "Rose", "Sun"];
const colors = [
  ["Stark Grey", "#94a3b8"],
  ["Lannister Gold", "#d97706"],
  ["Dragon Red", "#991b1b"],
  ["Sea Blue", "#155e75"],
  ["Forest Green", "#166534"],
  ["Royal Purple", "#6d28d9"],
  ["Iron Black", "#1c1917"],
  ["Bone White", "#e7e5e4"],
];
const patterns = ["Plain Field", "Center Stripe", "Split Shield", "Crossed Field"];

export default function HouseFounderPage() {
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [symbol, setSymbol] = useState("Wolf");
  const [primary, setPrimary] = useState("#991b1b");
  const [secondary, setSecondary] = useState("#d97706");
  const [pattern, setPattern] = useState("Plain Field");
  const [savedMessage, setSavedMessage] = useState("");

  const background = useMemo(() => {
    if (pattern === "Center Stripe") {
      return `linear-gradient(90deg, ${primary} 0 38%, ${secondary} 38% 62%, ${primary} 62% 100%)`;
    }

    if (pattern === "Split Shield") {
      return `linear-gradient(135deg, ${primary} 0 50%, ${secondary} 50% 100%)`;
    }

    if (pattern === "Crossed Field") {
      return `linear-gradient(90deg, transparent 42%, ${secondary} 42% 58%, transparent 58%), linear-gradient(0deg, transparent 42%, ${secondary} 42% 58%, transparent 58%), ${primary}`;
    }

    return primary;
  }, [pattern, primary, secondary]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      setHouseName(data.houseName || "");
      setHouseMotto(data.houseMotto || "");
      setSymbol(data.houseSigil?.name || "Wolf");
      setPrimary(data.houseSigil?.color || "#991b1b");
      setSecondary(data.houseSigil?.secondary || "#d97706");
      setPattern(data.houseSigil?.pattern || "Plain Field");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveHouse() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...current,
        houseName: houseName.trim(),
        houseMotto: houseMotto.trim(),
        houseSigil: {
          name: symbol,
          color: primary,
          secondary,
          pattern,
        },
      })
    );
    setSavedMessage("House saved. You can claim a castle now.");
  }

  return (
    <main className="min-h-screen bg-[#070707] text-stone-100">
      <nav className="border-b border-stone-800 bg-black px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
            Game of Kings
          </Link>
          <div className="flex gap-2">
            <Link href="/map" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Map
            </Link>
            <Link href="/events" className="rounded-md bg-stone-900 px-4 py-2 text-sm font-black text-stone-200">
              Events
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="border border-stone-700 bg-stone-900 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">House Founder</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Create your noble house.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Keep it simple: name your house, write your words, design a sigil, then claim one castle on the map.
          </p>

          <div className="mt-5 space-y-3">
            <input
              value={houseName}
              onChange={(event) => setHouseName(event.target.value)}
              placeholder="House name"
              className="min-h-12 w-full rounded-md border border-stone-700 bg-black px-4 py-3 outline-none focus:border-amber-300"
            />
            <input
              value={houseMotto}
              onChange={(event) => setHouseMotto(event.target.value)}
              placeholder="House words"
              className="min-h-12 w-full rounded-md border border-stone-700 bg-black px-4 py-3 outline-none focus:border-amber-300"
            />
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="min-h-12 w-full rounded-md border border-stone-700 bg-black px-4 py-3"
            >
              {symbols.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="min-h-12 w-full rounded-md border border-stone-700 bg-black px-4 py-3"
            >
              {patterns.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-stone-700 bg-stone-900 p-5">
          <h2 className="text-2xl font-black">Sigil Generator</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
            <div className="mx-auto w-full max-w-[260px]">
              <div
                className="flex aspect-[3/4] items-center justify-center rounded-t-[48%] border-4 border-amber-300 shadow-2xl"
                style={{ background }}
              >
                <span className="px-4 text-center text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {symbol}
                </span>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-black">House {houseName || "Unnamed"}</h3>
                <p className="mt-1 text-stone-400">&quot;{houseMotto || "Our Words"}&quot;</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-stone-500">Primary Color</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {colors.map(([name, color]) => (
                  <button
                    key={`primary-${name}`}
                    onClick={() => setPrimary(color)}
                    className={`min-h-14 rounded-md border p-2 text-xs font-bold ${
                      primary === color ? "border-amber-300" : "border-stone-700"
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>

              <p className="mt-5 text-sm font-bold uppercase tracking-wider text-stone-500">Secondary Color</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {colors.map(([name, color]) => (
                  <button
                    key={`secondary-${name}`}
                    onClick={() => setSecondary(color)}
                    className={`min-h-14 rounded-md border p-2 text-xs font-bold ${
                      secondary === color ? "border-amber-300" : "border-stone-700"
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>

              <button
                onClick={saveHouse}
                disabled={!houseName.trim()}
                className="mt-6 min-h-12 w-full rounded-md bg-amber-400 px-5 py-3 font-black text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
              >
                Save House
              </button>
              {savedMessage && <p className="mt-3 text-sm font-bold text-emerald-300">{savedMessage}</p>}
              <Link
                href="/map"
                className="mt-3 block min-h-12 rounded-md bg-stone-100 px-5 py-3 text-center font-black text-stone-950"
              >
                Go Claim A Castle
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
