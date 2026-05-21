import React from 'react';
import { motion } from 'framer-motion';
import { Mic2 } from 'lucide-react';

const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] gap-6"
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className="text-[#f5a623]"
    >
      <Mic2 size={36} />
    </motion.div>

    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [-5, 0, -5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          className="block w-1.5 h-1.5 rounded-full bg-[#f5a623]"
        />
      ))}
    </div>
  </motion.div>
);

export default PageLoader;
