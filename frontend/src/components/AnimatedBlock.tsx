import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedBlockProps {
  children: ReactNode;
  className?: string;
}

const AnimatedBlock = ({ children, className="" }: AnimatedBlockProps) => {
  return (
    <motion.div
      initial={{ opacity: 0.3, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBlock;