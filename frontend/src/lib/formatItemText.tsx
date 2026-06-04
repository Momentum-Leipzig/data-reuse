import React from "react";

/**
 * Inserts line breaks before wave/instrument indicators like [T6-T35] or [Diary Daily],
 * but not between consecutive indicators like "[Survey] [T3, T4]".
 */
export function formatItemText(text: string): string {
  // Insert newline before [bracket] groups that are NOT preceded by another closing bracket
  return text.replace(/(?<!\])\s+(\[[^\]]+\])/g, "\n$1");
}

interface FormattedItemTextProps {
  text: string;
  className?: string;
}

export function FormattedItemText({ text, className }: FormattedItemTextProps) {
  const formatted = formatItemText(text);
  return (
    <span className={className} style={{ whiteSpace: "pre-line" }}>
      {formatted}
    </span>
  );
}
