import { brand } from "@/lib/brand";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={compact ? "brand-mark brand-mark--compact" : "brand-mark"}
      aria-hidden="true"
    >
      <span className="brand-mark__dot" />
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-lockup brand-lockup--compact" : "brand-lockup"}>
      <BrandMark compact={compact} />
      <span className="brand-lockup__word">{brand.name}</span>
    </span>
  );
}
