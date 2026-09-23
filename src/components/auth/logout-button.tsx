import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline" type="submit">
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </form>
  );
}