import { useMemo, useEffect, useState } from "react";

const COLORS = [
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
];

const PARTICLE_COUNT = 50;

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotation: number;
}

export function Confetti() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      drift: -30 + Math.random() * 60,
      rotation: Math.random() * 360,
    }));
  }, []);

  if (!visible) return null;

  // Per-particle keyframes with drift/rotation baked in (Tailwind can't
  // parameterize keyframes per element, so inline @keyframes are necessary)
  const keyframes = particles
    .map(
      (p) =>
        `@keyframes cf-${p.id}{0%{opacity:1;transform:translateY(0) translateX(0) rotate(0deg)}100%{opacity:0;transform:translateY(100vh) translateX(${p.drift}px) rotate(${p.rotation}deg)}}`,
    )
    .join("\n");

  return (
    <>
      <style>{keyframes}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -top-2.5 rounded-[1px]"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              backgroundColor: p.color,
              animation: `cf-${p.id} ${p.duration}s ease-in ${p.delay}s both`,
            }}
          />
        ))}
      </div>
    </>
  );
}
