import { motion } from 'framer-motion';

export function PageFade({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  );
}
