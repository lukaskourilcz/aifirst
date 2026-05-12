type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

const corner: React.CSSProperties = {
  position: "absolute",
  width: 28,
  height: 28,
  borderColor: "var(--accent-cyan)",
  borderStyle: "solid",
  pointerEvents: "none",
};

export function CoverFrame({ src, alt, priority }: Props) {
  return (
    <figure
      style={{
        position: "relative",
        margin: 0,
        padding: 12,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
        boxShadow: "0 30px 80px -40px rgba(92, 240, 255, 0.45)",
      }}
    >
      <span style={{ ...corner, top: -1, left: -1, borderWidth: "1px 0 0 1px" }} />
      <span style={{ ...corner, top: -1, right: -1, borderWidth: "1px 1px 0 0" }} />
      <span style={{ ...corner, bottom: -1, left: -1, borderWidth: "0 0 1px 1px" }} />
      <span style={{ ...corner, bottom: -1, right: -1, borderWidth: "0 1px 1px 0" }} />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 12,
          background:
            "linear-gradient(135deg, rgba(92,240,255,0.08), transparent 35%, transparent 65%, rgba(255,79,216,0.08))",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "3 / 2",
          objectFit: "cover",
          filter: "saturate(1.05) contrast(1.05)",
        }}
      />
      <figcaption
        style={{
          position: "absolute",
          left: 24,
          bottom: 24,
          padding: "6px 10px",
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-primary)",
          background: "rgba(5, 7, 13, 0.65)",
          border: "1px solid var(--hairline-strong)",
          zIndex: 2,
        }}
      >
        cover · ai-generated
      </figcaption>
    </figure>
  );
}
