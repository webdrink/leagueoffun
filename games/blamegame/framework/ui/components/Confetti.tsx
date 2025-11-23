import React, { useState, useEffect } from 'react';

interface ConfettiProps {
  duration?: number;
  pieces?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ duration = 3000, pieces = 100 }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => {
        const size = Math.random() * 10 + 5;        
        const x = Math.random() * window.innerWidth;
        const y = -100 - Math.random() * 200;        
        const finalY = window.innerHeight + 100;        
        const rotation = Math.random() * 360;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${x}px`,
              top: `${y}px`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              transform: `rotate(${rotation}deg)`,
              animation: `fall ${duration / 1000}s linear forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(${typeof window !== 'undefined' ? window.innerHeight + 100 : 1000}px) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
