export const TOURNAMENT_INTERVAL_MS = 12 * 60 * 60 * 1000;
export const TOURNAMENT_DURATION_MS = 30 * 60 * 1000;
export const TOURNAMENT_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

export const scheduledTournamentTypes = ["Joust", "Melee", "Archery", "Horse Racing"];

export function getTournamentCycle(now = Date.now()) {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const elapsed = Math.max(0, safeNow - TOURNAMENT_EPOCH_MS);
  const cycleIndex = Math.floor(elapsed / TOURNAMENT_INTERVAL_MS);
  const startTime = TOURNAMENT_EPOCH_MS + cycleIndex * TOURNAMENT_INTERVAL_MS;
  const endTime = startTime + TOURNAMENT_DURATION_MS;
  const nextStartTime = safeNow < endTime ? startTime + TOURNAMENT_INTERVAL_MS : startTime + TOURNAMENT_INTERVAL_MS;
  const type = scheduledTournamentTypes[cycleIndex % scheduledTournamentTypes.length];
  const isLive = safeNow >= startTime && safeNow < endTime;
  const startsToday = !isLive && new Date(nextStartTime).toDateString() === new Date(safeNow).toDateString();
  const startDate = new Date(startTime);

  return {
    cycleIndex,
    tournamentKey: `cycle-${cycleIndex}-${slugifyScheduleValue(type)}`,
    type,
    startTime,
    endTime,
    nextStartTime,
    durationMinutes: Math.round(TOURNAMENT_DURATION_MS / 60000),
    isLive,
    startsToday,
    isSunday: startDate.getDay() === 0,
  };
}

export function formatTournamentCountdown(targetTime, now = Date.now()) {
  const remaining = Math.max(0, targetTime - now);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function slugifyScheduleValue(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
