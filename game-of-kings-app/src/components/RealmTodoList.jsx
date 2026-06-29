"use client";

import Link from "next/link";

const realmSteps = [
  {
    title: "Create an account",
    text: "Use an email and password so your house, castle, gold, renown, knight, and sigil stay saved.",
    href: "/account",
  },
  {
    title: "Forge your house",
    text: "Pick your title, house name, words, colors, and build the sigil players will recognize.",
    href: "/house",
  },
  {
    title: "Claim one castle",
    text: "Open the map, choose an unclaimed seat, and make it the home of your house.",
    href: "/map",
  },
  {
    title: "Earn gold and renown",
    text: "Quizzes and quests give you the resources to grow your army and reputation.",
    href: "/events",
  },
  {
    title: "Watch the tournaments",
    text: "A new tournament cycle runs every 12 hours, with brackets, stories, and realm glory.",
    href: "/tournaments",
  },
];

export default function RealmTodoList({ className = "", wide = false }) {
  return (
    <section className={`relative z-10 border border-[var(--gok-line)] bg-black/45 p-4 shadow-[inset_0_0_32px_rgba(0,0,0,0.55)] ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="gok-eyebrow">Realm To-Do List</p>
          <h2 className="mt-2 text-2xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">Start your kingdom.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--gok-dim)]">
          Follow these steps and the website starts making sense fast.
        </p>
      </div>

      <div className={`mt-4 grid gap-2 ${wide ? "sm:grid-cols-2 xl:grid-cols-5" : ""}`}>
        {realmSteps.map((step, index) => (
          <Link
            key={step.title}
            href={step.href}
            className="group min-h-32 border border-[var(--gok-line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.42))] p-3 transition hover:border-[var(--gok-line-strong)] hover:bg-black/60"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-red-bright)]">
              Step {index + 1}
            </span>
            <h3 className="mt-2 font-serif text-lg text-[var(--gok-parchment)] group-hover:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-[var(--gok-dim)]">{step.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
