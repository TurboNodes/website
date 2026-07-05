import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SettingsPanel } from "./SettingsPanel";

export function SessionSection() {
  const { signOut } = useAuth();

  return (
    <SettingsPanel
      label="session"
      title="Session"
      description="Sign out of your Turbo account on this device."
    >
      <Button
        variant="outline"
        onClick={signOut}
        className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>
    </SettingsPanel>
  );
}
