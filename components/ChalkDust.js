"use client";
import { useEffect, useState } from 'react';

export default function ChalkDust() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 45 particles — mix of white, faint yellow, faint blue
    const colors = [
      'rgba(248,248,242,0.45)',
      'rgba(248,248,242,0.3)',
      'rgba(248,225,108,0.2)',
      'rgba(127,214,255,0.15)',
    ];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.8 + 0.8,
      left: Math.random() * 100,
      delay: Math.random() * -25,
      duration: Math.random() * 22 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      blur: Math.random() > 0.5 ? '0.5px' : '1px',
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="dust-particle"
          style={{
            width:           `${p.size}px`,
            height:          `${p.size}px`,
            left:            `${p.left}%`,
            animationDelay:  `${p.delay}s`,
            animationDuration:`${p.duration}s`,
            background:      p.color,
            filter:          `blur(${p.blur})`,
          }}
        />
      ))}
    </div>
  );
}
