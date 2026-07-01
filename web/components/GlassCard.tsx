import React from 'react';

interface Props {
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlassCard({ children, glow, className = '', style, onClick }: Props) {
  return (
    <div
      className={`glass-card ${glow ? 'glow' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
