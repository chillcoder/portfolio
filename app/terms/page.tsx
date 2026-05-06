import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 md:px-6">
      <h1 className="text-2xl font-medium">Terms of Use</h1>
      <p className="mt-4 text-sm text-[var(--color-fg-muted)]">
        All site content is provided for informational purposes. External links are provided as-is.
      </p>
      <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
        Code snippets and assets remain property of their respective owners unless explicitly
        stated.
      </p>
    </main>
  );
}
