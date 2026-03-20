import { cn } from "@/lib/utils";

const AVATAR_BG_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-slate-500",
  "bg-red-600",
  "bg-blue-600",
  "bg-amber-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-pink-600",
];

// Each avatar is a unique combination of face features rendered as SVG paths
// viewBox is 0 0 100 100

interface FaceConfig {
  eyes: React.ReactNode;
  mouth: React.ReactNode;
  accessory?: React.ReactNode;
}

const EYES = {
  round: (
    <>
      <circle cx="35" cy="42" r="5" fill="white" />
      <circle cx="65" cy="42" r="5" fill="white" />
      <circle cx="36" cy="42" r="2.5" fill="#1a1a2e" />
      <circle cx="66" cy="42" r="2.5" fill="#1a1a2e" />
    </>
  ),
  dots: (
    <>
      <circle cx="35" cy="42" r="3" fill="#1a1a2e" />
      <circle cx="65" cy="42" r="3" fill="#1a1a2e" />
    </>
  ),
  wink: (
    <>
      <circle cx="35" cy="42" r="5" fill="white" />
      <circle cx="36" cy="42" r="2.5" fill="#1a1a2e" />
      <path
        d="M60 42 Q65 38 70 42"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  sleepy: (
    <>
      <path
        d="M30 42 Q35 38 40 42"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60 42 Q65 38 70 42"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  wide: (
    <>
      <ellipse cx="35" cy="42" rx="6" ry="7" fill="white" />
      <ellipse cx="65" cy="42" rx="6" ry="7" fill="white" />
      <circle cx="36" cy="43" r="3" fill="#1a1a2e" />
      <circle cx="66" cy="43" r="3" fill="#1a1a2e" />
    </>
  ),
  star: (
    <>
      <polygon
        points="35,37 37,41 41,41 38,44 39,48 35,45 31,48 32,44 29,41 33,41"
        fill="#1a1a2e"
      />
      <polygon
        points="65,37 67,41 71,41 68,44 69,48 65,45 61,48 62,44 59,41 63,41"
        fill="#1a1a2e"
      />
    </>
  ),
};

const MOUTHS = {
  smile: (
    <path
      d="M38 60 Q50 72 62 60"
      stroke="#1a1a2e"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  ),
  grin: (
    <path
      d="M35 58 Q50 72 65 58"
      stroke="#1a1a2e"
      strokeWidth="2.5"
      fill="white"
      strokeLinecap="round"
    />
  ),
  open: <ellipse cx="50" cy="62" rx="8" ry="6" fill="#1a1a2e" />,
  flat: (
    <line
      x1="38"
      y1="62"
      x2="62"
      y2="62"
      stroke="#1a1a2e"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  ),
  cat: (
    <>
      <path
        d="M40 60 Q45 65 50 60"
        stroke="#1a1a2e"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 60 Q55 65 60 60"
        stroke="#1a1a2e"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  tongue: (
    <>
      <path
        d="M38 60 Q50 70 62 60"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="66" rx="4" ry="5" fill="#ff6b6b" />
    </>
  ),
};

const ACCESSORIES = {
  topHat: (
    <>
      <rect x="32" y="10" width="36" height="18" rx="2" fill="#1a1a2e" />
      <rect x="26" y="26" width="48" height="5" rx="2" fill="#1a1a2e" />
    </>
  ),
  beanie: (
    <>
      <path
        d="M25 35 Q25 12 50 10 Q75 12 75 35"
        fill="#1a1a2e"
        stroke="#1a1a2e"
        strokeWidth="1"
      />
      <circle cx="50" cy="10" r="3" fill="#1a1a2e" />
    </>
  ),
  horns: (
    <>
      <path d="M30 32 L22 14 L38 28" fill="white" opacity="0.6" />
      <path d="M70 32 L78 14 L62 28" fill="white" opacity="0.6" />
    </>
  ),
  crown: (
    <polygon
      points="30,30 35,15 42,25 50,10 58,25 65,15 70,30"
      fill="#ffd700"
      stroke="#daa520"
      strokeWidth="1"
    />
  ),
  antennae: (
    <>
      <line
        x1="38"
        y1="30"
        x2="32"
        y2="12"
        stroke="white"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle cx="32" cy="12" r="4" fill="white" opacity="0.6" />
      <line
        x1="62"
        y1="30"
        x2="68"
        y2="12"
        stroke="white"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle cx="68" cy="12" r="4" fill="white" opacity="0.6" />
    </>
  ),
  headband: (
    <rect
      x="22"
      y="32"
      width="56"
      height="5"
      rx="2"
      fill="white"
      opacity="0.4"
    />
  ),
  glasses: (
    <>
      <circle
        cx="35"
        cy="42"
        r="10"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
      />
      <circle
        cx="65"
        cy="42"
        r="10"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
      />
      <line
        x1="45"
        y1="42"
        x2="55"
        y2="42"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
      />
    </>
  ),
  mohawk: <path d="M44 30 Q47 5 50 8 Q53 5 56 30" fill="white" opacity="0.5" />,
};

const FACE_CONFIGS: FaceConfig[] = [
  { eyes: EYES.round, mouth: MOUTHS.smile },
  { eyes: EYES.dots, mouth: MOUTHS.grin },
  { eyes: EYES.wink, mouth: MOUTHS.smile },
  { eyes: EYES.wide, mouth: MOUTHS.open },
  { eyes: EYES.sleepy, mouth: MOUTHS.flat },
  { eyes: EYES.star, mouth: MOUTHS.grin },
  { eyes: EYES.round, mouth: MOUTHS.cat },
  { eyes: EYES.dots, mouth: MOUTHS.tongue },
  { eyes: EYES.round, mouth: MOUTHS.grin, accessory: ACCESSORIES.topHat },
  { eyes: EYES.wide, mouth: MOUTHS.smile, accessory: ACCESSORIES.crown },
  { eyes: EYES.dots, mouth: MOUTHS.flat, accessory: ACCESSORIES.glasses },
  { eyes: EYES.wink, mouth: MOUTHS.grin, accessory: ACCESSORIES.horns },
  { eyes: EYES.round, mouth: MOUTHS.open, accessory: ACCESSORIES.antennae },
  { eyes: EYES.sleepy, mouth: MOUTHS.smile, accessory: ACCESSORIES.beanie },
  { eyes: EYES.star, mouth: MOUTHS.cat, accessory: ACCESSORIES.headband },
  { eyes: EYES.dots, mouth: MOUTHS.smile, accessory: ACCESSORIES.mohawk },
  { eyes: EYES.wide, mouth: MOUTHS.tongue, accessory: ACCESSORIES.glasses },
  { eyes: EYES.wink, mouth: MOUTHS.flat, accessory: ACCESSORIES.crown },
  { eyes: EYES.round, mouth: MOUTHS.tongue, accessory: ACCESSORIES.horns },
  { eyes: EYES.sleepy, mouth: MOUTHS.grin, accessory: ACCESSORIES.antennae },
  { eyes: EYES.star, mouth: MOUTHS.open, accessory: ACCESSORIES.topHat },
  { eyes: EYES.dots, mouth: MOUTHS.cat, accessory: ACCESSORIES.mohawk },
  { eyes: EYES.wide, mouth: MOUTHS.flat, accessory: ACCESSORIES.headband },
  { eyes: EYES.wink, mouth: MOUTHS.tongue, accessory: ACCESSORIES.beanie },
];

interface AvatarProps {
  avatarIndex: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export function PlayerAvatar({
  avatarIndex,
  size = "md",
  className,
}: AvatarProps) {
  const face = FACE_CONFIGS[avatarIndex % FACE_CONFIGS.length];
  const bgColor = AVATAR_BG_COLORS[avatarIndex % AVATAR_BG_COLORS.length];

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden shrink-0",
        SIZE_CLASSES[size],
        bgColor,
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {face.accessory}
        {face.eyes}
        {face.mouth}
      </svg>
    </div>
  );
}
