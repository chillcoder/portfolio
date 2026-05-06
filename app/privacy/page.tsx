import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 md:px-6">
      <h1 className="text-2xl font-medium">Privacy Policy</h1>
      <p className="mt-4 text-sm text-[var(--color-fg-muted)]">
        This site uses privacy-conscious analytics (PostHog) to understand aggregate engagement. No
        user accounts are created. No sensitive personal data is collected through forms.
      </p>
      <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
        Third-party APIs (GitHub, Spotify, WakaTime, Cloudinary) process requests under their own
        privacy policies.
      </p>
    </main>
  );
}
