import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
        const size = Math.random() * 10 + 5; // 5-15px
        const x = Math.random() * window.innerWidth;
        const y = -100 - Math.random() * 200; // Start above the screen
        const finalY = window.innerHeight + 100; // End below the screen
        const rotation = Math.random() * 360;
        const finalRotation = rotation + Math.random() * 720 - 360; // 1-3 rotations either direction
        const color = [
          'bg-red-500',
          'bg-blue-500',
          'bg-green-500',
          'bg-yellow-500',
          'bg-purple-500',
          'bg-pink-500',
          'bg-indigo-500',
        ][Math.floor(Math.random() * 7)];
        const duration = Math.random() * 2 + 2; // 2-4 seconds
        const delay = Math.random() * 0.5; // 0-0.5 seconds

        return (
          <motion.div
            key={i}
            className={`absolute rounded-sm ${color}`}
            style={{ width: `${size}px`, height: `${size}px`, x, y, rotate: rotation }}
            animate={{
              y: finalY,
              rotate: finalRotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: [0.5, 0.05, 1, 0.5], // custom bezier curve
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;
