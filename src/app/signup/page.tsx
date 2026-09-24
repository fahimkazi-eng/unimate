import Link from "next/link";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Get started — UniMate",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
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