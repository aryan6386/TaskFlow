'use client';
import { useEffect, useRef } from 'react';

export default function StatCard({ label, value, icon, color, bg }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) { el.textContent = value; return; }
    const duration = 800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="stat-card" style={{'--c': color}}>
      <div className="stat-icon" style={{background: bg}}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value" ref={ref}>0</div>
      </div>
    </div>
  );
}
