import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedBlockProps {
  children: ReactNode;
}

const AnimatedBlock = ({ children }: AnimatedBlockProps) => {
  return (
    <motion.div
      initial={{ opacity: 0.3, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBlock;