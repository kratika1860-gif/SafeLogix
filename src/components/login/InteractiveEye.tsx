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

export function InteractiveEye({ 
  cx, 
  cy, 
  r, 
  pupilR, 
  eyeColor = '#FFFFFF', 
  pupilColor = '#1F2937', 
  delay = 0, 
  isClosed = false 
}: InteractiveEyeProps) {
  const eyeRef = useRef<SVGCircleElement>(null);
  const pupilRef = useRef<SVGCircleElement>(null);
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = cx;
    let targetY = cy;
    let currentX = cx;
    let currentY = cy;

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
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      
      if (pupilRef.current) {
        pupilRef.current.setAttribute('cx', currentX.toFixed(2));
        pupilRef.current.setAttribute('cy', currentY.toFixed(2));
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
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
      setTimeout(() => setScaleY(1), 140);
      timeoutId = setTimeout(blink, 3500 + Math.random() * 4500);
    };

    timeoutId = setTimeout(blink, 1500 + Math.random() * 3500);

    return () => clearTimeout(timeoutId);
  }, [isClosed]);

  return (
    <g style={{ 
      transform: `translate(${cx}px, ${cy}px) scale(1, ${scaleY}) translate(${-cx}px, ${-cy}px)`, 
      transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)' 
    }}>
      <circle ref={eyeRef} cx={cx} cy={cy} r={r} fill={eyeColor} />
      <circle ref={pupilRef} cx={cx} cy={cy} r={pupilR} fill={pupilColor} />
    </g>
  );
}
