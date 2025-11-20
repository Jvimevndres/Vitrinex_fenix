// frontend/src/components/ParticlesBackground.jsx
import { useEffect, useRef } from 'react';

/**
 * 🎨 SISTEMA DE PARTÍCULAS ANIMADAS
 * Renderiza partículas decorativas en canvas con múltiples tipos
 */
export default function ParticlesBackground({ config, colors }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!config?.enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configurar dimensiones
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const particleColor = colors?.primary || '#3b82f6';
    const particleCount = Math.floor((config.density || 50) / 2);
    const particleType = config.type || 'dots';

    // Clase de partícula
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Posición inicial aleatoria
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Resetear cuando sale de la pantalla
        if (this.y > canvas.height + 20) {
          this.reset();
        }
        if (this.x > canvas.width + 20) this.x = -20;
        if (this.x < -20) this.x = canvas.width + 20;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = particleColor;
        ctx.strokeStyle = particleColor;
        ctx.lineWidth = 2;

        switch (particleType) {
          case 'dots':
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'stars':
            this.drawStar(this.x, this.y, 5, this.size * 2, this.size);
            break;

          case 'bubbles':
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            // Brillo interno
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.5, 0, Math.PI * 2);
            ctx.globalAlpha = this.opacity * 0.5;
            ctx.fill();
            break;

          case 'snow':
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            // Destello
            ctx.globalAlpha = this.opacity * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'hearts':
            this.drawHeart(this.x, this.y, this.size * 2);
            break;

          case 'sparkles':
            this.drawSparkle(this.x, this.y, this.size * 2);
            break;

          case 'confetti':
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
            break;

          case 'leaves':
            this.drawLeaf(this.x, this.y, this.size * 2);
            break;

          default:
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
      }

      drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx, y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
      }

      drawHeart(cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + size / 4);
        ctx.bezierCurveTo(cx, cy, cx - size / 2, cy - size / 2, cx, cy - size);
        ctx.bezierCurveTo(cx + size / 2, cy - size / 2, cx, cy, cx, cy + size / 4);
        ctx.fill();
      }

      drawSparkle(cx, cy, size) {
        // Cruz con 4 puntas
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx, cy + size);
        ctx.moveTo(cx - size, cy);
        ctx.lineTo(cx + size, cy);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Punto central
        ctx.beginPath();
        ctx.arc(cx, cy, size / 3, 0, Math.PI * 2);
        ctx.fill();
      }

      drawLeaf(cx, cy, size) {
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, -size / 2, 0, size);
        ctx.quadraticCurveTo(-size, -size / 2, 0, -size);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    // Crear partículas
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle());
    }

    // Loop de animación
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [config, colors]);

  if (!config?.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
