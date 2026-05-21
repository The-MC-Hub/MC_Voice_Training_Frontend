import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const directionMap = {
  up:    { y: 32, x: 0 },
  down:  { y: -32, x: 0 },
  left:  { x: 32, y: 0 },
  right: { x: -32, y: 0 },
};

const ScrollReveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });

  const initial = { opacity: 0, ...directionMap[direction] };
  const animate = isInView ? { opacity: 1, x: 0, y: 0 } : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
