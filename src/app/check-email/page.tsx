import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const metadata = {
  title: "Check your email — UniMate",
};

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <CardDescription>
            We sent you a confirmation link. Click it to activate your account,
            then you can log straight into your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" href="/login">
            Back to log in
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}