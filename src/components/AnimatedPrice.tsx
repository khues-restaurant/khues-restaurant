import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedPrice {
  price: string;
  excludeAnimatePresence?: boolean;
}

// TODO: this still doesn't work on the inflection point

function AnimatedPrice({ price, excludeAnimatePresence }: AnimatedPrice) {
  const [currentPrice, setCurrentPrice] = useState(price);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down">();

  useEffect(() => {
    if (price === currentPrice) return;

    if (Number(price) >= Number(currentPrice)) {
      setAnimationDirection("up");
    } else {
      setAnimationDirection("down");
    }

    setCurrentPrice(price);
  }, [price, currentPrice]);

  const content = (
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
  );

  return excludeAnimatePresence ? (
    content
  ) : (
    <AnimatePresence mode={"popLayout"}>{content}</AnimatePresence>
  );
}

export default AnimatedPrice;
