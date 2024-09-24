import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Badge: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [text, setText] = useState('Public Beta');

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => (prevText === 'Public Beta' ? 'Baustelle' : 'Public Beta'));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="inline-block rounded-full bg-gray-800 px-3 py-1 text-sm text-white transition-all duration-700 ease-in-out"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.1 : [1, 1.05, 1, 1.05, 1],
        boxShadow: hovered ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
      }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      style={{
        width: '100px',
        textAlign: 'center',
      }}
    >
      <div style={{ whiteSpace: 'nowrap' }}>
        {hovered ? 'v0.02' : text === 'Baustelle' ? '🚧' : 'Public Beta'}
      </div>
      {!hovered && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.5, 1] }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        />
      )}
    </motion.div>
  );
};

export default Badge;