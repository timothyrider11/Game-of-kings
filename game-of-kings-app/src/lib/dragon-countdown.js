export const dragonEpisodeSchedule = [
  { episode: 2, at: "2026-06-28T20:00:00-05:00" },
  { episode: 3, at: "2026-07-05T20:00:00-05:00" },
  { episode: 4, at: "2026-07-12T20:00:00-05:00" },
  { episode: 5, at: "2026-07-19T20:00:00-05:00" },
  { episode: 6, at: "2026-07-26T20:00:00-05:00" },
  { episode: 7, at: "2026-08-02T20:00:00-05:00" },
  { episode: 8, at: "2026-08-09T20:00:00-05:00" },
];

export function getNextDragonEpisode(now = Date.now()) {
  return dragonEpisodeSchedule.find((item) => new Date(item.at).getTime() > now) || null;
}

export function formatDragonCountdown(targetTime, now) {
  const distance = Math.max(0, targetTime - now);
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
