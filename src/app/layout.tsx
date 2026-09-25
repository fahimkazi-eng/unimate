import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PageAurora } from "@/components/layout/page-aurora";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniMate — Everything a student needs, in one place",
  description:
    "Plan your semester, manage deadlines, study smarter, and prepare for your career — all in one student dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PageAurora />
        {children}
      </body>
    </html>
  );
}