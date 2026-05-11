import { describe, expect, it } from "vitest";
import { sumContributionsTrailingNDays } from "@/lib/githubContributions";

describe("sumContributionsTrailingNDays", () => {
  it("sums the last 7 calendar days ending on the latest day in the calendar", () => {
    const days = [
      { date: "2026-05-01T00:00:00Z", contributionCount: 99 },
      { date: "2026-05-05T00:00:00Z", contributionCount: 2 },
      { date: "2026-05-07T00:00:00Z", contributionCount: 4 },
      { date: "2026-05-08T00:00:00Z", contributionCount: 3 },
    ];
    // Anchor 2026-05-08; trailing 7 days are May 2–May 8 (May 1 excluded)
    expect(sumContributionsTrailingNDays(days, 7)).toBe(0 + 0 + 2 + 0 + 4 + 3 + 0);
  });

  it("merges duplicate date keys", () => {
    const days = [
      { date: "2026-05-08", contributionCount: 2 },
      { date: "2026-05-08", contributionCount: 1 },
    ];
    expect(sumContributionsTrailingNDays(days, 1)).toBe(3);
  });
});
