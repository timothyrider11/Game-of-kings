"use client";

import { useEffect, useRef, useState } from "react";

export default function RealmAudio() {

  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);

  /* =========================
     AUTO VOLUME
  ========================= */

  useEffect(() => {

    if (audioRef.current) {

      audioRef.current.volume = 0.35;

    }

  }, []);

  /* =========================
     TOGGLE MUSIC
  ========================= */

  const toggleMusic = () => {

    if (!audioRef.current) return;

    if (playing) {

      audioRef.current.pause();

      setPlaying(false);

    } else {

      audioRef.current.play();

      setPlaying(true);

    }

  };

  return (
    <>

      {/* AUDIO */}

      <audio
        ref={audioRef}
        loop
        src="/audio/realm-theme.mp3"
      />

      {/* BUTTON */}

      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-[999] bg-black/80 border border-zinc-700 hover:border-emerald-500 transition backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl"
      >

        <div className="flex items-center gap-3">

          <div className={`
            w-3 h-3 rounded-full

            ${
              playing
                ? "bg-emerald-400 animate-pulse"
                : "bg-zinc-500"
            }
          `} />

          <span className="font-bold tracking-wide">

            {playing
              ? "Realm Music: ON"
              : "Realm Music: OFF"}

          </span>

        </div>

      </button>

    </>
  );
}