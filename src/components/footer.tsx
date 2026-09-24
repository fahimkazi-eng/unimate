import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <BrandMark />
              <span>UniMate</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Everything a student needs to survive university — in one place.
              Plan your semester, manage deadlines, study smarter, and prepare
              for your career.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#roadmap" className="text-muted-foreground transition-colors hover:text-foreground">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted-foreground transition-colors hover:text-foreground">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} UniMate. Made for students everywhere.
        </div>
      </div>
    </footer>
  );
}