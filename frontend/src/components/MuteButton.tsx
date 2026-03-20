import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundManager } from "../hooks/useSoundManager";

interface MuteButtonProps {
  className?: string;
}

export function MuteButton({ className }: MuteButtonProps) {
  const { isMuted, toggleMute } = useSoundManager();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className={cn("h-8 w-8", className)}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isMuted ? "Unmute sounds" : "Mute sounds"}
      </TooltipContent>
    </Tooltip>
  );
}
