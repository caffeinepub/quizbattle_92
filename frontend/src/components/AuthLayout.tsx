import { useState } from "react";
import { Loader2, Pencil, LogOut } from "lucide-react";
import { Outlet } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useActor } from "../hooks/useActor";
import { useProfile } from "../hooks/useQueries";
import { LandingPage } from "./LandingPage";
import { ProfileSetupDialog } from "./ProfileSetupDialog";
import { ThemeToggle } from "./ThemeToggle";

export function AuthLayout() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { isFetching, actor } = useActor();
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useProfile();
  const [editNameOpen, setEditNameOpen] = useState(false);

  const isAuthenticated = !!identity;
  const hasProfile = profile && profile.name;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (isInitializing || !actor || isFetching || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  const handleLogout = () => {
    queryClient.clear();
    clear();
  };

  return (
    <>
      <ProfileSetupDialog open={!hasProfile} />
      {hasProfile ? (
        <div className="min-h-screen flex flex-col bg-background">
          <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">QuizBattle</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Welcome, {profile.name}!
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditNameOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit Profile Name
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <Outlet />
        </div>
      ) : (
        <div className="min-h-screen bg-background" />
      )}
      <ProfileSetupDialog
        open={editNameOpen}
        onOpenChange={setEditNameOpen}
        currentName={profile?.name}
      />
    </>
  );
}
