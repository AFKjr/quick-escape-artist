export const DELAYS = [
  { label: '10s', ms: 10_000 },
  { label: '30s', ms: 30_000 },
  { label: '1m',  ms: 60_000 },
  { label: '5m',  ms: 5 * 60_000 },
  { label: '10m', ms: 10 * 60_000 },
  { label: '30m', ms: 30 * 60_000 },
  { label: '1hr', ms: 60 * 60_000 }
];

export function parseDelay(triggerNow: boolean, chosenMs: number | null) {
  return triggerNow ? 0 : (chosenMs ?? 0);
}
