import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealFromTop {
  initialDelay: number;
  className?: string;
  children: ReactNode;
}

function RevealFromTop({ initialDelay, className, children }: RevealFromTop) {
  const revealVariants = {
    hidden: {
      clipPath: "inset(0 0 100% 0)", // Start with full vertical clipping
      opacity: 0,
    },
    visible: {
      clipPath: "inset(0 0 0 0)", // End with no clipping
      opacity: 1,
      transition: {
        delay: initialDelay, // Delay the animation start
        duration: 1.5, // Adjust the animation duration as needed
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={revealVariants}
      style={{ overflow: "hidden" }} // Ensure the overflow content is hidden during animation
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default RevealFromTop;
