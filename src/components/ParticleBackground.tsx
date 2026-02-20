import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  isHub: boolean;
  type: "neuron" | "molecule" | "data";
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dimensionsRef = useRef({ w: 0, h: 0 });
  const prefersReducedMotion = useReducedMotion();

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    dimensionsRef.current = { w: width, h: height };
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const initParticles = () => {
      const { w, h } = dimensionsRef.current;
      // Reduce particle count on mobile for better performance
      const isMobile = w < 768;
      const divisor = isMobile ? 45000 : 35000;
      const particleCount = Math.min(Math.floor((w * h) / divisor), isMobile ? 20 : 40);
      particlesRef.current = [];

      const types: ("neuron" | "molecule" | "data")[] = ["neuron", "molecule", "data"];

      for (let i = 0; i < particleCount; i++) {
        const isHub = Math.random() < 0.15;
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          size: isHub ? Math.random() * 2.5 + 1.5 : Math.random() * 1.2 + 0.4,
          opacity: isHub ? Math.random() * 0.4 + 0.3 : Math.random() * 0.3 + 0.1,
          pulsePhase: Math.random() * Math.PI * 2,
          isHub,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }
    };

    const getParticleColor = (type: string, opacity: number) => {
      switch (type) {
        case "neuron": return `rgba(0, 200, 255, ${opacity})`;
        case "molecule": return `rgba(100, 220, 255, ${opacity})`;
        case "data": return `rgba(150, 240, 255, ${opacity})`;
        default: return `rgba(0, 200, 255, ${opacity})`;
      }
    };

    const drawParticles = (time: number) => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const len = particles.length;

      // Draw connections - batched into fewer draw calls
      // Batch thin lines
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 200, 255, 0.06)";
      ctx.lineWidth = 0.25;
      for (let i = 0; i < len; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < len; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const maxDistance = (pi.isHub || pj.isHub) ? 150 : 100;
          if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;
          const distSq = dx * dx + dy * dy;
          if (distSq > maxDistance * maxDistance) continue;
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
        }
      }
      ctx.stroke();

      // Batch mouse interaction lines
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 220, 255, 0.15)";
      ctx.lineWidth = 0.35;
      for (let i = 0; i < len; i++) {
        const pi = particles[i];
        const mouseDx = pi.x - mouse.x;
        const mouseDy = pi.y - mouse.y;
        if (Math.abs(mouseDx) < 180 && Math.abs(mouseDy) < 180) {
          const mouseDistSq = mouseDx * mouseDx + mouseDy * mouseDy;
          if (mouseDistSq < 32400) {
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouse.x, mouse.y);
          }
        }
      }
      ctx.stroke();

      // Draw particles
      const timeFactor = time * 0.001;
      for (let i = 0; i < len; i++) {
        const particle = particles[i];
        const pulse = Math.sin(timeFactor + particle.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;

      // Simple filled circles — skip per-particle radial gradients for performance
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particle.type, currentOpacity * 0.8);
        ctx.fill();

        if (particle.isHub) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.6})`;
          ctx.fill();
        }
      }
    };

    // Use passive event listener for mouse
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const updateParticles = () => {
      const { w, h } = dimensionsRef.current;
      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > w) particle.vx *= -1;
        if (particle.y < 0 || particle.y > h) particle.vy *= -1;
      }
    };

    const animate = (time: number) => {
      updateParticles();
      drawParticles(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [prefersReducedMotion, resizeCanvas]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.18 }}
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
