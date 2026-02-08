import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  isHub: boolean; // Hub nodes are larger, brighter
  type: "neuron" | "molecule" | "data"; // Different particle types
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const initParticles = () => {
      // Fewer, more spread out particles for elegance
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000);
      particlesRef.current = [];
      
      const types: ("neuron" | "molecule" | "data")[] = ["neuron", "molecule", "data"];
      
      for (let i = 0; i < particleCount; i++) {
        // 15% chance of being a hub node
        const isHub = Math.random() < 0.15;
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
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
        case "neuron":
          return `rgba(0, 200, 255, ${opacity})`; // Cyan - neural
        case "molecule":
          return `rgba(100, 220, 255, ${opacity})`; // Light blue - molecular
        case "data":
          return `rgba(150, 240, 255, ${opacity})`; // White-blue - data
        default:
          return `rgba(0, 200, 255, ${opacity})`;
      }
    };

    const drawParticles = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      
      // Draw connections - thinner, more elegant lines with varying thickness
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Hub nodes connect at longer distances
          const maxDistance = (particles[i].isHub || particles[j].isHub) ? 200 : 140;
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.1;
            // Thicker lines for hub connections
            const lineWidth = (particles[i].isHub && particles[j].isHub) ? 0.6 : 0.25;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            // Draw small nodes at midpoint for molecular bond effect
            if (particles[i].type === "molecule" && particles[j].type === "molecule" && distance < 80) {
              const midX = (particles[i].x + particles[j].x) / 2;
              const midY = (particles[i].y + particles[j].y) / 2;
              ctx.beginPath();
              ctx.arc(midX, midY, 0.8, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(100, 220, 255, ${opacity * 0.5})`;
              ctx.fill();
            }
          }
        }
        
        // Draw connection to mouse if close - activation ripple effect
        const mouseDx = particles[i].x - mouse.x;
        const mouseDy = particles[i].y - mouse.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        if (mouseDistance < 200) {
          const opacity = (1 - mouseDistance / 200) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 220, 255, ${opacity})`;
          ctx.lineWidth = particles[i].isHub ? 0.6 : 0.35;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          
          // Activation glow on nearby particles
          if (mouseDistance < 100) {
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].size * 4, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
              particles[i].x, particles[i].y, 0,
              particles[i].x, particles[i].y, particles[i].size * 4
            );
            glowGradient.addColorStop(0, `rgba(0, 220, 255, ${(1 - mouseDistance / 100) * 0.15})`);
            glowGradient.addColorStop(1, "rgba(0, 220, 255, 0)");
            ctx.fillStyle = glowGradient;
            ctx.fill();
          }
        }
      }
      
      // Draw particles with subtle pulse
      for (const particle of particles) {
        const pulse = Math.sin(time * 0.001 + particle.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;
        
        // Outer glow - larger for hub nodes
        const glowMultiplier = particle.isHub ? 4 : 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * glowMultiplier, 0, Math.PI * 2);
        const outerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * glowMultiplier
        );
        outerGradient.addColorStop(0, getParticleColor(particle.type, currentOpacity * 0.15));
        outerGradient.addColorStop(1, "rgba(0, 200, 255, 0)");
        ctx.fillStyle = outerGradient;
        ctx.fill();
        
        // Core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particle.type, currentOpacity * 0.8);
        ctx.fill();
        
        // Bright center for hub nodes
        if (particle.isHub) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.6})`;
          ctx.fill();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const updateParticles = () => {
      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges smoothly
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      }
    };

    const animate = (time: number) => {
      updateParticles();
      drawParticles(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ParticleBackground;
