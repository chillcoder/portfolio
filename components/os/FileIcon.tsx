"use client";

import styles from "@/app/os/os.module.css";

export type FileExtension = ".md" | ".txt" | ".app" | ".exe" | ".jpg";

interface FileIconProps {
  label: string;
  extension: FileExtension;
  onClick?: () => void;
}

function ExtensionGlyph({ extension }: { extension: FileExtension }) {
  const stroke = "#1a1a1a";
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke,
    strokeWidth: 1,
    strokeLinejoin: "miter" as const,
    strokeLinecap: "square" as const,
  };

  switch (extension) {
    case ".md":
    case ".txt":
      // Document with folded top-right corner.
      return (
        <svg {...common} aria-hidden>
          <path d="M3 1.5 L10.5 1.5 L13 4 L13 14.5 L3 14.5 Z" />
          <path d="M10.5 1.5 L10.5 4 L13 4" />
          <path d="M5 7 L11 7 M5 9 L11 9 M5 11 L9 11" strokeWidth={0.75} />
        </svg>
      );
    case ".app":
      // Gear: octagon w/ inner circle.
      return (
        <svg {...common} aria-hidden>
          <path d="M8 1.5 L9.5 2 L10.5 1 L12 2.5 L11 3.5 L11.5 5 L13 5.5 L13 7.5 L11.5 8 L11 9.5 L12 10.5 L10.5 12 L9.5 11 L8 11.5 L8 13 L6 13 L6 11.5 L4.5 11 L3.5 12 L2 10.5 L3 9.5 L2.5 8 L1 7.5 L1 5.5 L2.5 5 L3 3.5 L2 2.5 L3.5 1 L4.5 2 L6 1.5 L6 0.5 L8 0.5 Z" />
          <circle cx={7} cy={6.5} r={2} />
        </svg>
      );
    case ".exe":
      // Monitor: rectangle w/ stand.
      return (
        <svg {...common} aria-hidden>
          <rect x={1} y={2} width={14} height={9} />
          <path d="M5 14 L11 14 M8 11 L8 14" />
          <path d="M3.5 4.5 L5 6 L3.5 7.5" strokeWidth={0.75} />
          <path d="M6 8 L9 8" strokeWidth={0.75} />
        </svg>
      );
    case ".jpg":
      // Photo frame: rectangle w/ inner sun + horizon.
      return (
        <svg {...common} aria-hidden>
          <rect x={1.5} y={2.5} width={13} height={11} />
          <circle cx={5} cy={6} r={1.25} />
          <path d="M1.5 11 L5.5 8 L9 10.5 L11.5 9 L14.5 11.5" />
        </svg>
      );
  }
}

export function FileIcon({ label, extension, onClick }: FileIconProps) {
  return (
    <button
      type="button"
      className={styles.fileIcon}
      onClick={onClick}
      aria-label={`${label}${extension}`}
    >
      <span className={styles.fileIconArt}>
        <ExtensionGlyph extension={extension} />
      </span>
      <span>
        {label}
        <span aria-hidden style={{ opacity: 0.6 }}>
          {extension}
        </span>
      </span>
    </button>
  );
}
