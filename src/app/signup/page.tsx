import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { BrandMark } from "@/components/brand/brand-mark";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Get started — UniMate",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex animate-scale-in items-center gap-2 font-semibold text-foreground">
        <BrandMark />
        UniMate
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create your account</h1>
          <CardDescription>
            Free during V1. Your student dashboard takes under a minute to set
            up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}