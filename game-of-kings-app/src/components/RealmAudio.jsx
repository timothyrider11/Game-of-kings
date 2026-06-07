"use client";

import { useRef, useState } from "react";

function createOscillator(context, destination, frequency, type, gainValue) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();

  return { oscillator, gain };
}

export default function RealmAudio() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function stopRealmAudio() {
    const current = audioRef.current;
    if (!current) return;

    current.master.gain.setTargetAtTime(0, current.context.currentTime, 0.08);
    window.setTimeout(() => {
      current.nodes.forEach(({ oscillator }) => oscillator.stop());
      current.context.close();
      audioRef.current = null;
    }, 180);
    setPlaying(false);
  }

  async function startRealmAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const delay = context.createDelay();
    const feedback = context.createGain();

    master.gain.value = 0.0001;
    filter.type = "lowpass";
    filter.frequency.value = 720;
    delay.delayTime.value = 0.42;
    feedback.gain.value = 0.18;

    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    filter.connect(master);
    master.connect(context.destination);

    const nodes = [
      createOscillator(context, filter, 73.42, "sine", 0.09),
      createOscillator(context, filter, 110.0, "triangle", 0.035),
      createOscillator(context, filter, 146.83, "sine", 0.025),
      createOscillator(context, filter, 220.0, "triangle", 0.012),
    ];

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.055;
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    nodes.push({ oscillator: lfo, gain: lfoGain });

    master.gain.setTargetAtTime(0.28, context.currentTime, 0.45);
    audioRef.current = { context, master, nodes };
    setPlaying(true);
  }

  function toggleAudio() {
    if (playing) {
      stopRealmAudio();
      return;
    }

    startRealmAudio();
  }

  return (
    <button
      onClick={toggleAudio}
      className="fixed bottom-4 right-4 z-[999] border border-[rgba(196,193,184,0.22)] bg-black/80 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-silver)] shadow-2xl shadow-black/70 backdrop-blur transition hover:border-[var(--gok-line-strong)] sm:bottom-6 sm:right-6"
      aria-pressed={playing}
    >
      <span className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${playing ? "bg-red-700 shadow-[0_0_12px_rgba(127,29,29,0.9)]" : "bg-stone-600"}`}
        />
        {playing ? "Realm Sound On" : "Realm Sound"}
      </span>
    </button>
  );
}
