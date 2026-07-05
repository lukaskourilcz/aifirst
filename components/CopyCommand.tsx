"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        border: "1px solid var(--color-fog)",
        background: "var(--color-paper)",
        fontFamily: "var(--font-display)",
        fontSize: "0.8rem",
        color: "var(--ink-primary)",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--color-blueprint-blue)" }}>$</span>
      <code style={{ background: "transparent", border: "none", padding: 0 }}>
        {command}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label="copy command"
        className="label"
        style={{
          marginLeft: "auto",
          background: "transparent",
          color: copied ? "var(--color-blueprint-blue)" : "var(--ink-muted)",
          border: "1px solid var(--color-fog)",
          padding: "2px 8px",
          cursor: "pointer",
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
