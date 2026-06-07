"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";

const STORAGE_KEY = "game_of_kings_living_realm";

const forumSections = [
  {
    id: "house-lore",
    name: "House Lore",
    description: "Origin stories, house words, sigil meaning, family history, and character writing.",
  },
  {
    id: "theories",
    name: "Theories",
    description: "Book theories, show theories, prophecy talk, mysteries, and castle speculation.",
  },
  {
    id: "suggestions",
    name: "Suggestions",
    description: "Feature ideas, balance notes, map fixes, quality-of-life requests, and realm improvements.",
  },
  {
    id: "debates",
    name: "Debates",
    description: "Respectful arguments about houses, battles, kings, queens, claims, and lore choices.",
  },
  {
    id: "realm-news",
    name: "Realm News",
    description: "Announcements, tournaments, castle claims, event results, and community notices.",
  },
];

const starterThreads = [
  {
    id: "welcome-lore",
    section: "house-lore",
    title: "Introduce your house lore",
    body: "Share your house name, ruler, words, and what your people are known for.",
    author: "Maester Admin",
    avatarUrl: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    upvotes: 12,
    replies: [],
  },
  {
    id: "feature-wishlist",
    section: "suggestions",
    title: "What should the realm build next?",
    body: "Drop suggestions for tournaments, quizzes, house progression, castle pages, and forum rewards.",
    author: "House Rider",
    avatarUrl: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    upvotes: 18,
    replies: [],
  },
];

function timeAgo(value, now) {
  const seconds = Math.max(1, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function authorName(realm) {
  if (realm?.houseName) return `House ${realm.houseName}`;
  if (realm?.username) return realm.username;
  return "Wandering Scribe";
}

export default function ForumPage() {
  const [realm, setRealm] = useState({});
  const [threads, setThreads] = useState(starterThreads);
  const [activeSection, setActiveSection] = useState("house-lore");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [replyDrafts, setReplyDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    setRealm(parsed);
    setThreads(parsed.forumThreads || starterThreads);

    loadCloudRealm().then(({ realm: cloudRealm }) => {
      if (!cloudRealm) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudRealm));
      setRealm(cloudRealm);
      setThreads(cloudRealm.forumThreads || starterThreads);
    });
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return threads.filter((thread) => {
      const matchesSection = thread.section === activeSection;
      const matchesQuery =
        !query ||
        thread.title.toLowerCase().includes(query) ||
        thread.body.toLowerCase().includes(query) ||
        thread.author.toLowerCase().includes(query);
      return matchesSection && matchesQuery;
    });
  }, [activeSection, search, threads]);

  function saveForum(nextThreads, reward = {}) {
    const nextRealm = {
      ...realm,
      forumThreads: nextThreads,
      gold: (realm.gold ?? 350) + (reward.gold || 0),
      renown: (realm.renown ?? 0) + (reward.renown || 0),
    };

    setRealm(nextRealm);
    setThreads(nextThreads);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    saveCloudRealm(nextRealm);
  }

  function createThread(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;

    const nextThread = {
      id: `thread-${Date.now()}`,
      section: activeSection,
      title: draft.title.trim(),
      body: draft.body.trim(),
      author: authorName(realm),
      avatarUrl: realm.avatarUrl || "",
      createdAt: new Date().toISOString(),
      upvotes: 0,
      replies: [],
    };

    saveForum([nextThread, ...threads], { gold: 15, renown: 8 });
    setDraft({ title: "", body: "" });
    setMessage("Thread posted: +15 gold and +8 renown.");
  }

  function replyToThread(threadId) {
    const body = replyDrafts[threadId]?.trim();
    if (!body) return;

    const nextThreads = threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            replies: [
              ...thread.replies,
              {
                id: `reply-${Date.now()}`,
                author: authorName(realm),
                avatarUrl: realm.avatarUrl || "",
                body,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : thread
    );

    saveForum(nextThreads, { gold: 5, renown: 3 });
    setReplyDrafts((current) => ({ ...current, [threadId]: "" }));
    setMessage("Reply posted: +5 gold and +3 renown.");
  }

  function upvoteThread(threadId) {
    const nextThreads = threads.map((thread) =>
      thread.id === threadId ? { ...thread, upvotes: thread.upvotes + 1 } : thread
    );
    saveForum(nextThreads, { renown: 1 });
    setMessage("Vote counted: +1 renown for participating.");
  }

  if (!now) {
    return <main className="gok-page min-h-screen text-stone-100" />;
  }

  return (
    <main className="gok-page min-h-screen px-4 py-6 text-stone-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[rgba(196,193,184,0.14)] pb-4">
        <Link href="/" className="gok-brand text-xl">Game of Kings</Link>
        <div className="flex gap-3">
          <Link href="/map" className="gok-nav-link">Map</Link>
          <Link href="/events" className="gok-nav-link">Events</Link>
          <Link href="/account" className="gok-nav-link">Account</Link>
        </div>
      </nav>

      <section className="mx-auto mt-6 grid max-w-7xl gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="gok-panel p-4">
          <p className="gok-eyebrow">Forum Sections</p>
          <div className="relative z-10 mt-4 grid gap-2">
            {forumSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`border px-3 py-3 text-left transition ${
                  activeSection === section.id
                    ? "border-[var(--gok-line-strong)] bg-[rgba(127,29,29,0.24)] text-[var(--gok-silver)]"
                    : "border-[var(--gok-line)] bg-black/50 text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"
                }`}
              >
                <span className="block font-black">{section.name}</span>
                <span className="mt-1 block text-xs leading-5">{section.description}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="gok-panel p-4">
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="gok-eyebrow">Discussion Board</p>
              <h1 className="mt-2 text-4xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">
                {forumSections.find((section) => section.id === activeSection)?.name}
              </h1>
              <p className="gok-copy mt-2 text-sm">Post, reply, vote, and earn gold and renown for useful activity.</p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="border border-[var(--gok-line)] bg-black/50 p-3">
                Gold: {(realm.gold ?? 350).toLocaleString()}
              </div>
              <div className="border border-[var(--gok-line)] bg-black/50 p-3">
                Renown: {(realm.renown ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {message && <p className="relative z-10 mt-4 border border-[var(--gok-line)] bg-black/50 p-3 text-sm text-[var(--gok-parchment)]">{message}</p>}

          <form onSubmit={createThread} className="relative z-10 mt-5 grid gap-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Thread title"
              className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
            />
            <textarea
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="Write your post"
              rows={4}
              className="border border-[var(--gok-line)] bg-black/70 p-4 outline-none focus:border-[var(--gok-line-strong)]"
            />
            <button className="gok-btn gok-btn-blood min-h-12 px-5 py-3">Post Thread</button>
          </form>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this section"
            className="relative z-10 mt-5 min-h-12 w-full border border-[var(--gok-line)] bg-black/70 px-4 outline-none focus:border-[var(--gok-line-strong)]"
          />

          <div className="relative z-10 mt-5 space-y-4">
            {filteredThreads.map((thread) => (
              <article key={thread.id} className="border border-[var(--gok-line)] bg-black/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl text-[var(--gok-silver)]">{thread.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--gok-dim)]">
                      {thread.author} / {timeAgo(thread.createdAt, now)}
                    </p>
                  </div>
                  <button onClick={() => upvoteThread(thread.id)} className="gok-btn px-3 py-2 text-xs">
                    Upvote {thread.upvotes}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-[rgba(210,205,194,0.72)]">{thread.body}</p>

                <div className="mt-4 space-y-2">
                  {thread.replies.map((reply) => (
                    <div key={reply.id} className="border border-[rgba(196,193,184,0.12)] bg-black/45 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)]">
                        {reply.author} / {timeAgo(reply.createdAt, now)}
                      </p>
                      <p className="mt-2 text-sm text-[rgba(210,205,194,0.72)]">{reply.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <input
                    value={replyDrafts[thread.id] || ""}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [thread.id]: event.target.value }))}
                    placeholder="Reply to this thread"
                    className="min-h-11 border border-[var(--gok-line)] bg-black/70 px-3 outline-none focus:border-[var(--gok-line-strong)]"
                  />
                  <button onClick={() => replyToThread(thread.id)} className="gok-btn px-4 py-2 text-xs">
                    Reply
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
