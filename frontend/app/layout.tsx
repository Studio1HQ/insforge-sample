import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsForge Analytics",
  description: "Real-time analytics dashboard powered by InsForge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
