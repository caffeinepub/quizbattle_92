import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";

interface PodiumBlockConfig {
  label: string;
  height: string;
  bg: string;
  icon: LucideIcon;
  iconColor: string;
  textSize: string;
}

interface PodiumBlockProps {
  entry: {
    displayName: string;
    avatarIndex: number;
    score: number;
  };
  config: PodiumBlockConfig;
  revealed: boolean;
}

export function PodiumBlock({ entry, config, revealed }: PodiumBlockProps) {
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        revealed ? "animate-pop-in" : "opacity-0",
      )}
    >
      <Icon
        className={cn(
          "h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2",
          config.iconColor,
        )}
      />
      <PlayerAvatar
        avatarIndex={entry.avatarIndex}
        size="lg"
        className="mb-2"
      />
      <p
        className={cn(
          "font-bold text-foreground mb-1 text-center truncate max-w-[8rem] sm:max-w-[10rem]",
          config.textSize,
        )}
      >
        {entry.displayName}
      </p>
      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3">
        {entry.score.toLocaleString()} pts
      </p>
      <div
        className={cn(
          "w-20 sm:w-28 lg:w-36 rounded-t-lg flex items-center justify-center",
          config.height,
          config.bg,
        )}
      >
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {config.label}
        </span>
      </div>
    </div>
  );
}
