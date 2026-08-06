import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxAlpha: number;
  pulseSpeed: number;
}

export const AnimatedBackground: React.FC = () => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palettes
    const darkColors = [
      'rgba(99, 102, 241,', // indigo
      'rgba(168, 85, 247,', // purple
      'rgba(56, 189, 248,', // sky blue
      'rgba(236, 72, 153,', // pink
      'rgba(52, 211, 153,', // emerald
    ];

    const lightColors = [
      'rgba(99, 102, 241,', // indigo
      'rgba(139, 92, 246,', // violet
      'rgba(14, 165, 233,', // cyan
      'rgba(244, 63, 94,',  // rose
    ];

    // Responsive particle count (fewer on mobile for max battery/60fps)
    const isMobile = width < 768;
    const particleCount = isMobile ? 22 : 45;

    const particles: Particle[] = [];
    const colors = isDark ? darkColors : lightColors;

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = isDark ? Math.random() * 0.4 + 0.15 : Math.random() * 0.25 + 0.08;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        size: Math.random() * (isDark ? 2.5 : 2) + 1,
        alpha: baseAlpha,
        maxAlpha: baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        // Draw connections between close particles
        const maxDist = isMobile ? 80 : 130;
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];

          // Update position
          p1.x += p1.vx * (delta * 60);
          p1.y += p1.vy * (delta * 60);

          // Wrap edges
          if (p1.x < -20) p1.x = width + 20;
          else if (p1.x > width + 20) p1.x = -20;
          if (p1.y < -20) p1.y = height + 20;
          else if (p1.y > height + 20) p1.y = -20;

          // Pulse opacity
          p1.alpha += Math.sin(time * 0.001 + i) * 0.002;
          const currentAlpha = Math.max(0.05, Math.min(p1.alpha, p1.maxAlpha));

          // Draw particle
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p1.color} ${currentAlpha})`;
          ctx.fill();

          // Connect with neighbor
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              const lineAlpha = (1 - Math.sqrt(distSq) / maxDist) * (isDark ? 0.12 : 0.06);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = isDark
                ? `rgba(147, 197, 253, ${lineAlpha})`
                : `rgba(99, 102, 241, ${lineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDark, reducedMotion]);

  return (
    <div
      id="vsa-animated-background"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Base Gradient Canvas Layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isDark
            ? 'bg-[#09090c]'
            : 'bg-gradient-to-br from-slate-50 via-indigo-50/25 to-purple-50/20'
        }`}
      />

      {/* Luminous Ambient Glowing Blobs with smooth hardware-accelerated animations */}
      {isDark ? (
        <>
          {/* Dark Mode: Futuristic Nebula & Luminous Aura */}
          <div
            className="absolute -top-[25%] -left-[10%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full blur-[120px] opacity-35 mix-blend-screen animate-vsa-blob-1"
            style={{
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.25) 45%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[130px] opacity-30 mix-blend-screen animate-vsa-blob-2"
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-[20%] left-[20%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[110px] opacity-25 mix-blend-screen animate-vsa-blob-3"
            style={{
              background:
                'radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 70%)',
            }}
          />
          {/* Subtle Cyber Grid Texture */}
          <div
            className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
          />
        </>
      ) : (
        <>
          {/* Light Mode: Iridescent Aurora & Soft Sunlight */}
          <div
            className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-40 animate-vsa-blob-1"
            style={{
              background:
                'radial-gradient(circle, rgba(199, 210, 254, 0.7) 0%, rgba(224, 231, 255, 0.3) 50%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-[25%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[110px] opacity-35 animate-vsa-blob-2"
            style={{
              background:
                'radial-gradient(circle, rgba(233, 213, 255, 0.6) 0%, rgba(253, 230, 138, 0.25) 50%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-[15%] left-[25%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full blur-[90px] opacity-30 animate-vsa-blob-3"
            style={{
              background:
                'radial-gradient(circle, rgba(186, 230, 253, 0.6) 0%, rgba(209, 250, 229, 0.3) 50%, transparent 70%)',
            }}
          />
          {/* Subtle Dot Matrix Texture */}
          <div
            className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]"
          />
        </>
      )}

      {/* Interactive Particle Constellation Canvas */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-70"
          style={{ willChange: 'transform' }}
        />
      )}
    </div>
  );
};
