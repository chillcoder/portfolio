"use client";

import Image from "next/image";
import { track } from "@/lib/track";

const TWEETS = [
  { id: "1", src: "/tweet-1.png", alt: "Tweet screenshot 1" },
  { id: "2", src: "/tweet-2.png", alt: "Tweet screenshot 2" },
  { id: "3", src: "/tweet-3.png", alt: "Tweet screenshot 3" },
];

export default function TweetsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 md:px-6">
      <h1 className="text-3xl font-medium">Tweet Gallery</h1>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
        Selected tweets and threads that represent how I think about building.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {TWEETS.map((tweet, idx) => (
          <article key={tweet.id} className="rounded-xl border border-[var(--color-border)] p-2">
            <Image
              src={tweet.src}
              alt={tweet.alt}
              width={1200}
              height={675}
              className="h-auto w-full rounded-lg"
              onLoad={() => track("tweet_viewed", { id: tweet.id, index: idx })}
            />
          </article>
        ))}
      </div>
    </main>
  );
}
