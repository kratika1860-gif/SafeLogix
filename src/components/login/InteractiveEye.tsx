import React, { useEffect, useRef, useState } from 'react';

interface InteractiveEyeProps {
  cx: number;
  cy: number;
  r: number;
  pupilR: number;
  eyeColor?: string;
  pupilColor?: string;
  delay?: number;
  isClosed?: boolean;
}

export function InteractiveEye({ cx, cy, r, pupilR, eyeColor = '#FFFFFF', pupilColor = '#1F2937', delay = 0, isClosed = false }: InteractiveEyeProps) {
  const eyeRef = useRef<SVGCircleElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: cx, y: cy });
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = cx;
    let targetY = cy;

    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      const distToMouse = Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY);
      
      const maxPupilDist = r - pupilR - (r * 0.1);
      const dist = Math.min(distToMouse * 0.05, maxPupilDist);

      targetX = cx + Math.cos(angle) * dist;
      targetY = cy + Math.sin(angle) * dist;
    };

    const animate = () => {
      setPupilPos((prev) => ({
        x: prev.x + (targetX - prev.x) * 0.15,
        y: prev.y + (targetY - prev.y) * 0.15,
      }));
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // start tracking
    const startTimer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(startTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cx, cy, r, pupilR, delay]);

  useEffect(() => {
    if (isClosed) {
      setScaleY(0.05);
      return;
    }
    
    setScaleY(1);
    let timeoutId: NodeJS.Timeout;

    const blink = () => {
      setScaleY(0.05);
      setTimeout(() => setScaleY(1), 150);
      timeoutId = setTimeout(blink, 3000 + Math.random() * 5000);
    };

    timeoutId = setTimeout(blink, 1000 + Math.random() * 4000);

    return () => clearTimeout(timeoutId);
  }, [isClosed]);

  return (
    <g style={{ 
      transform: `translate(${cx}px, ${cy}px) scale(1, ${scaleY}) translate(${-cx}px, ${-cy}px)`, 
      transition: 'transform 0.1s ease-out' 
    }}>
      <circle ref={eyeRef} cx={cx} cy={cy} r={r} fill={eyeColor} />
      <circle cx={pupilPos.x} cy={pupilPos.y} r={pupilR} fill={pupilColor} />
    </g>
  );
}
