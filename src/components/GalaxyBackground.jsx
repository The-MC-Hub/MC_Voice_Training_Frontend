import React, { useEffect, useRef } from 'react';

const GalaxyBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    
    const stars = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        currentOpacity: Math.random() * 0.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      });
    }

    let animationId;
    let time = 0;

    const animate = () => {
      
      const gradientBg = ctx.createLinearGradient(0, 0, 0, height);
      gradientBg.addColorStop(0, '#0a0015');
      gradientBg.addColorStop(0.25, '#1a0033');
      gradientBg.addColorStop(0.5, '#2d0052');
      gradientBg.addColorStop(0.75, '#1a0033');
      gradientBg.addColorStop(1, '#0a0015');
      
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, width, height);

      
      const nebula = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.001) * 50,
        height * 0.4 + Math.cos(time * 0.0008) * 50,
        100,
        width * 0.5,
        height * 0.4,
        Math.max(width, height)
      );
      nebula.addColorStop(0, 'rgba(147, 51, 234, 0.15)');
      nebula.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
      nebula.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
      
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      
      stars.forEach((star) => {
        
        star.currentOpacity += star.twinkleSpeed;
        if (
          star.currentOpacity >= star.opacity + 0.3 ||
          star.currentOpacity <= star.opacity - 0.3
        ) {
          star.twinkleSpeed *= -1;
        }

        
        star.x += star.vx;
        star.y += star.vy;

        
        if (star.x < -2) star.x = width + 2;
        if (star.x > width + 2) star.x = -2;
        if (star.y < -2) star.y = height + 2;
        if (star.y > height + 2) star.y = -2;

        
        const glow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3
        );
        glow.addColorStop(0, `rgba(255, 255, 255, ${star.currentOpacity})`);
        glow.addColorStop(0.5, `rgba(147, 51, 234, ${star.currentOpacity * 0.5})`);
        glow.addColorStop(1, 'rgba(147, 51, 234, 0)');

        ctx.fillStyle = glow;
        ctx.fillRect(
          star.x - star.radius * 3,
          star.y - star.radius * 3,
          star.radius * 6,
          star.radius * 6
        );

        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

export default GalaxyBackground;
