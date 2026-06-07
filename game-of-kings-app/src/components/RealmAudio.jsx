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

function createNoise(context, destination, gainValue, filterFrequency) {
  const bufferSize = context.sampleRate * 2;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = filterFrequency;
  filter.Q.value = 0.7;
  gain.gain.value = gainValue;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start();

  return { source, gain, filter };
}

export default function RealmAudio() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function stopRealmAudio() {
    const current = audioRef.current;
    if (!current) return;

    current.master.gain.setTargetAtTime(0, current.context.currentTime, 0.08);
    window.clearInterval(current.bellTimer);
    window.setTimeout(() => {
      current.nodes.forEach((node) => {
        if (node.oscillator) node.oscillator.stop();
        if (node.source) node.source.stop();
      });
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
    const windBus = context.createGain();
    const crackleBus = context.createGain();

    master.gain.value = 0.0001;
    filter.type = "lowpass";
    filter.frequency.value = 940;
    delay.delayTime.value = 0.58;
    feedback.gain.value = 0.24;
    windBus.gain.value = 0.22;
    crackleBus.gain.value = 0.055;

    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    filter.connect(master);
    windBus.connect(master);
    crackleBus.connect(master);
    master.connect(context.destination);

    const nodes = [
      createOscillator(context, filter, 55.0, "sine", 0.045),
      createOscillator(context, filter, 82.41, "triangle", 0.026),
      createOscillator(context, filter, 146.83, "sine", 0.018),
      createOscillator(context, filter, 246.94, "triangle", 0.008),
      createNoise(context, windBus, 0.2, 360),
      createNoise(context, crackleBus, 0.055, 2200),
    ];

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.055;
    lfoGain.gain.value = 130;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    nodes.push({ oscillator: lfo, gain: lfoGain });

    const bellTimer = window.setInterval(() => {
      if (!audioRef.current) return;
      const bell = context.createOscillator();
      const bellGain = context.createGain();
      bell.type = "sine";
      bell.frequency.value = [329.63, 392.0, 493.88][Math.floor(Math.random() * 3)];
      bellGain.gain.value = 0.0001;
      bell.connect(bellGain);
      bellGain.connect(delay);
      bell.start();
      bellGain.gain.setTargetAtTime(0.035, context.currentTime, 0.16);
      bellGain.gain.setTargetAtTime(0.0001, context.currentTime + 1.2, 0.8);
      window.setTimeout(() => bell.stop(), 3200);
    }, 9000);

    master.gain.setTargetAtTime(0.18, context.currentTime, 0.6);
    audioRef.current = { context, master, nodes, bellTimer };
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
