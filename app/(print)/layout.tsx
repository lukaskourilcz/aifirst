import type { ReactNode } from "react";
import "../globals.css";
import "./print.css";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="print-body">{children}</body>
    </html>
  );
}
