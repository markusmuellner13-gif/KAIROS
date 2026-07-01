import React from 'react';

interface Props {
  isActive?: boolean;
  isSpeaking?: boolean;
  size?: number;
}

// Jarvis-style arc-reactor HUD core, pure SVG + CSS animation (no JS ticking).
export default function HUDAvatar({ isActive, isSpeaking, size = 84 }: Props) {
  const engaged = isActive || isSpeaking;
  const half = (size + 44) / 2;
  const outerR = size / 2 + 20;
  const midR = size / 2 + 10;
  const coreR = size / 2 - 6;

  const tickCount = 24;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const angle = (i / tickCount) * Math.PI * 2;
    const inner = outerR - 5;
    return (
      <line
        key={i}
        x1={half + inner * Math.cos(angle)}
        y1={half + inner * Math.sin(angle)}
        x2={half + outerR * Math.cos(angle)}
        y2={half + outerR * Math.sin(angle)}
        stroke="var(--primary)"
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeOpacity={i % 3 === 0 ? 0.8 : 0.35}
      />
    );
  });

  return (
    <div style={{ width: half * 2, height: half * 2, position: 'relative' }}>
      <svg width={half * 2} height={half * 2}>
        <defs>
          <radialGradient id="kairos-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
            <stop offset="55%" stopColor="var(--primary-dim)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--surface-elevated)" stopOpacity={1} />
          </radialGradient>
        </defs>

        <g>{ticks}</g>

        <g style={{ transformOrigin: `${half}px ${half}px`, animation: 'hud-spin-cw 12s linear infinite' }}>
          <circle
            cx={half} cy={half} r={outerR - 3}
            stroke="var(--secondary)" strokeWidth={2}
            strokeDasharray="10 14" fill="none" strokeOpacity={0.7}
          />
        </g>

        <g style={{ transformOrigin: `${half}px ${half}px`, animation: 'hud-spin-ccw 7s linear infinite' }}>
          <circle
            cx={half} cy={half} r={midR}
            stroke="var(--primary)" strokeWidth={1.5}
            strokeDasharray="2 6" fill="none" strokeOpacity={0.6}
          />
        </g>

        {isSpeaking && (
          <circle
            cx={half} cy={half} r={midR + 4}
            stroke="var(--accent)" strokeWidth={1.5} fill="none" strokeOpacity={0.5}
            style={{ animation: 'hud-pulse-ring 0.6s ease-in-out infinite alternate' }}
          />
        )}

        <circle
          cx={half} cy={half} r={coreR}
          fill="url(#kairos-core)"
          style={{
            opacity: engaged ? undefined : 0.4,
            animation: engaged ? 'hud-core-pulse 1.4s ease-in-out infinite' : undefined,
          }}
        />
        <circle cx={half} cy={half} r={coreR} stroke="var(--primary)" strokeWidth={2} fill="none" />
      </svg>

      <style>{`
        @keyframes hud-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hud-spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes hud-core-pulse { 0% { opacity: 0.55; } 50% { opacity: 1; } 100% { opacity: 0.55; } }
        @keyframes hud-pulse-ring { from { r: ${midR + 2}; opacity: 0.3; } to { r: ${midR + 6}; opacity: 0.6; } }
      `}</style>
    </div>
  );
}
