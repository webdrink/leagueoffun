import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <motion.div
      className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md shadow-md max-w-md w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="font-bold">Fehler:</p>
      <p>{message}</p>
    </motion.div>
  );
};

export default ErrorDisplay;
