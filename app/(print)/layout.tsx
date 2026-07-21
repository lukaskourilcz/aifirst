import type { ReactNode } from "react";
import "../globals.css";
import "./print.css";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <main className="print-route">{children}</main>;
}
