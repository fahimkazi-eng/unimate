import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset your password — UniMate",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex animate-scale-in items-center gap-2 font-semibold text-foreground"
      >
        <BrandMark />
        UniMate
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Reset your password
          </h1>
          <CardDescription>
            Enter the email you registered with and we&apos;ll send you a
            reset link. It takes about a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}