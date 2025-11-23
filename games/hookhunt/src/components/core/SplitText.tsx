/**
 * SplitText Component
 * 
 * A text animation component that splits text into individual characters
 * and animates them with customizable timing and effects using Framer Motion.
 * 
 * Features:
 * - Character-by-character animation
 * - Customizable stagger timing
 * - Multiple HTML tag support (h1-h6, p)
 * - Framer Motion powered smooth animations
 * - Auto-play and visibility-triggered animations
 * 
 * Dependencies: framer-motion
 * Used by: GameShell title animations, intro screens
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface SplitTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  stagger?: number;
  delay?: number;
  duration?: number;
  autoPlay?: boolean;
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  tag = 'p',
  className = '',
  stagger = 0.05,
  delay = 0,
  duration = 0.8,
  autoPlay = true,
  onLetterAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [splitChars, setSplitChars] = useState<string[]>([]);

  useEffect(() => {
    if (text) {
      setSplitChars(text.split(''));
    }
  }, [text]);

  useEffect(() => {
    if (autoPlay) {
      setIsVisible(true);
    }
  }, [autoPlay]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
        onComplete: onLetterAnimationComplete,
      }
    }
  };

  const charVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: "easeOut"
      }
    }
  };

  const classes = `split-text ${className}`.trim();

  const renderChars = () => (
    splitChars.map((char, index) => (
      <motion.span
        key={index}
        variants={charVariants}
        className="inline-block"
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))
  );

  const motionProps = {
    className: classes,
    variants: containerVariants,
    initial: "hidden" as const,
    animate: isVisible ? "visible" as const : "hidden" as const,
    children: renderChars()
  };

  // Render the appropriate motion component based on tag
  switch (tag) {
    case 'h1':
      return <motion.h1 {...motionProps} />;
    case 'h2':
      return <motion.h2 {...motionProps} />;
    case 'h3':
      return <motion.h3 {...motionProps} />;
    case 'h4':
      return <motion.h4 {...motionProps} />;
    case 'h5':
      return <motion.h5 {...motionProps} />;
    case 'h6':
      return <motion.h6 {...motionProps} />;
    default:
      return <motion.p {...motionProps} />;
  }
};

export default SplitText;