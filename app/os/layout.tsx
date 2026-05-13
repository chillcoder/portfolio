import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Pixelify_Sans } from "next/font/google";
import styles from "./os.module.css";

/**
 * Pixelify Sans is loaded only here so the bento route's typography is
 * untouched. Geist Mono is already on <body> via the root layout, so we
 * don't re-load it.
 */
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lucas-OS",
  description: "Lucas O'Brien's portfolio, reimagined as a desktop OS.",
};

export default function OsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.osRoot} ${pixelify.variable}`}>{children}</div>
  );
}
