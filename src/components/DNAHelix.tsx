import { useEffect, useRef } from "react";

interface HelixConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  speed: number;
  opacity: number;
}

const DNAHelix = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // Multiple helix configurations at different positions and scales
    const helixes: HelixConfig[] = [
      { x: 0.15, y: 0.3, scale: 1, rotation: 0, speed: 0.0003, opacity: 0.08 },
      { x: 0.85, y: 0.6, scale: 0.7, rotation: Math.PI / 4, speed: 0.0004, opacity: 0.06 },
      { x: 0.5, y: 0.8, scale: 0.5, rotation: -Math.PI / 6, speed: 0.0005, opacity: 0.05 },
    ];

    const drawHelix = (
      time: number,
      config: HelixConfig
    ) => {
      const centerX = canvas.width * config.x;
      const centerY = canvas.height * config.y;
      const amplitude = 40 * config.scale;
      const wavelength = 80 * config.scale;
      const numPoints = 20;
      const helixHeight = 300 * config.scale;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(config.rotation + time * config.speed);

      // 3D rotation effect
      const rotationPhase = time * config.speed * 2;
      const amplitudeMultiplier = Math.cos(rotationPhase) * 0.5 + 0.5;

      // Draw the two strands
      for (let strand = 0; strand < 2; strand++) {
        const phaseOffset = strand * Math.PI;
        
        ctx.beginPath();
        
        for (let i = 0; i <= numPoints; i++) {
          const progress = i / numPoints;
          const y = (progress - 0.5) * helixHeight;
          const phase = progress * Math.PI * 4 + time * 0.001 + phaseOffset;
          const x = Math.sin(phase) * amplitude * amplitudeMultiplier;
          
          // Z-depth for 3D effect
          const z = Math.cos(phase);
          const depthScale = 0.5 + z * 0.3;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        const gradient = ctx.createLinearGradient(0, -helixHeight / 2, 0, helixHeight / 2);
        gradient.addColorStop(0, `hsla(190, 95%, 55%, ${config.opacity * 0.3})`);
        gradient.addColorStop(0.5, `hsla(200, 100%, 60%, ${config.opacity})`);
        gradient.addColorStop(1, `hsla(190, 95%, 55%, ${config.opacity * 0.3})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 * config.scale;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Draw connecting rungs
      for (let i = 0; i <= numPoints; i++) {
        const progress = i / numPoints;
        const y = (progress - 0.5) * helixHeight;
        const phase = progress * Math.PI * 4 + time * 0.001;
        
        const x1 = Math.sin(phase) * amplitude * amplitudeMultiplier;
        const x2 = Math.sin(phase + Math.PI) * amplitude * amplitudeMultiplier;
        
        // Only draw rungs at certain intervals
        if (i % 2 === 0) {
          const rungOpacity = (Math.cos(phase) + 1) / 2 * config.opacity * 0.6;
          
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `hsla(190, 95%, 65%, ${rungOpacity})`;
          ctx.lineWidth = 1 * config.scale;
          ctx.stroke();

          // Draw nucleotide nodes at rung endpoints
          const nodeRadius = 2 * config.scale;
          
          ctx.beginPath();
          ctx.arc(x1, y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(190, 95%, 70%, ${config.opacity * 0.8})`;
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(x2, y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(200, 100%, 70%, ${config.opacity * 0.8})`;
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const helix of helixes) {
        drawHelix(time, helix);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

export default DNAHelix;
