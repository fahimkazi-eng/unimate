import { requireUser } from "@/lib/auth";
import { getOrCreateProfile, getStudyStats } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SignOutDialog } from "@/components/dashboard/sign-out-dialog";
import { Flame, GraduationCap, Timer, TrendingUp, Trophy } from "lucide-react";

export const metadata = {
  title: "Profile — UniMate",
};

export const dynamic = "force-dynamic";

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * V2 Phase 3 (spec 28) — the profile page. Reads the real profile row (never
 * a hard-coded persona) and lets the user edit the identity + academic
 * fields. Fields that need a pending migration are handled gracefully by the
 * action, so this page works on the current live database.
 */
export default async function ProfilePage() {
  const user = await requireUser();
  const [profile, studyStats] = await Promise.all([
    getOrCreateProfile(user.id),
    getStudyStats(user.id),
  ]);

  const displayName =
    profile?.nickname ??
    profile?.display_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "Student";

  const initials = initialsFor(displayName);
  const email = user.email ?? "—";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-center gap-4">
        {profile?.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google photo from the provider
          <img
            src={profile.photo_url}
            alt=""
            className="h-16 w-16 rounded-xl object-cover ring-1 ring-border"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground"
          >
            {initials || <GraduationCap className="h-6 w-6" />}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-foreground">
            {displayName}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="default">
              <Trophy className="h-3 w-3" />
              Level {profile?.level ?? 1}
            </Badge>
            <Badge variant="outline">{profile?.xp ?? 0} XP</Badge>
            <Badge variant="warning">
              <Flame className="h-3 w-3" />
              {profile?.streak ?? 0} day streak
            </Badge>
          </div>
        </div>
      </header>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            How UniMate knows you — nickname shows across the app, the rest
            helps your planner tailor a semester.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            nickname={profile?.nickname ?? ""}
            university={profile?.university ?? ""}
            department={profile?.department ?? ""}
            semester={profile?.semester != null ? String(profile.semester) : ""}
            academicYear={
              profile?.academic_year != null
                ? String(profile.academic_year)
                : ""
            }
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>At a glance</CardTitle>
          <CardDescription>
            Your live stats — earned from real activity, never faked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid [&>*]:min-w-0 grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat icon={Trophy} label="Level" value={String(profile?.level ?? 1)} />
            <Stat icon={TrendingUp} label="XP" value={String(profile?.xp ?? 0)} />
            <Stat icon={Flame} label="Streak" value={`${profile?.streak ?? 0}d`} />
            <Stat
              icon={Timer}
              label="Focus this week"
              value={`${studyStats.minutes}m`}
            />
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Signing out keeps your data intact — you can come back anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutDialog />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      <dt className="mt-2 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-bold text-foreground">{value}</dd>
    </div>
  );
}