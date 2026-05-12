type Props = {
  src: string;
  alt: string;
};

const corner: React.CSSProperties = {
  position: "absolute",
  width: 24,
  height: 24,
  borderColor: "var(--accent-cyan)",
  borderStyle: "solid",
};

export function CoverFrame({ src, alt }: Props) {
  return (
    <figure
      style={{
        position: "relative",
        margin: 0,
        padding: 12,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
      }}
    >
      <span style={{ ...corner, top: -1, left: -1, borderWidth: "1px 0 0 1px" }} />
      <span style={{ ...corner, top: -1, right: -1, borderWidth: "1px 1px 0 0" }} />
      <span style={{ ...corner, bottom: -1, left: -1, borderWidth: "0 0 1px 1px" }} />
      <span style={{ ...corner, bottom: -1, right: -1, borderWidth: "0 1px 1px 0" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "3 / 2",
          objectFit: "cover",
        }}
      />
    </figure>
  );
}
