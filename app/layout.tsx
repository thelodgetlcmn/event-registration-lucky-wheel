import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { ToastViewport } from "@/components/ui/ToastViewport";

export const metadata: Metadata = {
  title: "Event Registration + Lucky Wheel",
  description: "Registration, admin dashboard, and lucky wheel backed by Google Sheets.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}",
          }}
        />
        <ToastViewport />
        {children}
      </body>
    </html>
  );
}
