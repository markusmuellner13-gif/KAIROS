import React from 'react';

export default function HUDShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hud-shell">
      <div className="hud-grid" />
      <div className="hud-scanline" />
      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />
      <div className="hud-content">{children}</div>
    </div>
  );
}
