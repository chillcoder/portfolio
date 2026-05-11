/**
 * Sum contribution counts for the last N calendar days ending on `endKey` (YYYY-MM-DD).
 * Anchors to GitHub's last calendar day in the payload so counts align with the profile graph.
 */
export function sumContributionsTrailingNDays(
  days: { date: string; contributionCount: number }[],
  n: number,
): number {
  const byDay = new Map<string, number>();
  for (const d of days) {
    const key = d.date.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + d.contributionCount);
  }
  if (byDay.size === 0) return 0;
  const keys = [...byDay.keys()].sort();
  const endKey = keys[keys.length - 1]!;
  const parts = endKey.split("-").map(Number);
  const y = parts[0]!;
  const mo = parts[1]!;
  const da = parts[2]!;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const dt = new Date(Date.UTC(y, mo - 1, da));
    dt.setUTCDate(dt.getUTCDate() - i);
    const key = dt.toISOString().slice(0, 10);
    sum += byDay.get(key) ?? 0;
  }
  return sum;
}
