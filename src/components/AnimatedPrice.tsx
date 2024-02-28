import React, { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedPrice {
  price: string;
}

function AnimatedPrice({ price }: AnimatedPrice) {
  const [currentPrice, setCurrentPrice] = useState(price);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down">();

  useLayoutEffect(() => {
    if (price !== currentPrice) {
      if (Number(price) >= Number(currentPrice)) {
        setAnimationDirection("up");
      } else {
        setAnimationDirection("down");
      }

      setCurrentPrice(price);
    }
  }, [price, currentPrice]);

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={currentPrice}
        initial={{
          opacity: 0,
          y:
            animationDirection === "up"
              ? 10
              : animationDirection === "down"
                ? -10
                : 0,
        }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y:
            animationDirection === "up"
              ? -10
              : animationDirection === "down"
                ? 10
                : 0,
        }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        {currentPrice}
      </motion.div>
    </AnimatePresence>
  );
}

export default AnimatedPrice;
