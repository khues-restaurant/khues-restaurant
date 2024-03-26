import React, { useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface ScrollSnapXContainer {
  children: React.ReactNode;
}

const ScrollSnapXContainer = ({ children }: ScrollSnapXContainer) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const initialScrollLeft = useRef(0);
  const control = useAnimation(); // Control for the bounce-back animation

  function handleMouseDown(e) {
    console.log("down");

    isDragging.current = true;
    startX.current = e.pageX;
    initialScrollLeft.current = containerRef.current.scrollLeft;
    // Stop any current animations when a new drag starts
    control.stop();
  }

  function handleMouseMove(e) {
    console.log("move");
    if (!isDragging.current) return;
    const dx = e.pageX - startX.current;
    const newScrollPosition = initialScrollLeft.current - dx;
    containerRef.current.scrollLeft = newScrollPosition;
  }

  function handleMouseUp() {
    console.log("up");
    if (!isDragging.current) return;
    isDragging.current = false;

    // Calculate overscroll amount
    const overscrollLeft = containerRef.current.scrollLeft < 0;
    const overscrollRight =
      containerRef.current.scrollLeft >
      containerRef.current.scrollWidth - containerRef.current.clientWidth;

    // If overscroll occurred, animate back to the closest valid scroll position
    if (overscrollLeft || overscrollRight) {
      let targetX = 0;
      if (overscrollLeft) {
        console.log("over left");
        // If overscrolled to the left, animate back to the start
        targetX = 0;
      } else if (overscrollRight) {
        console.log("over right");
        // If overscrolled to the right, calculate how much to move back
        targetX =
          containerRef.current.scrollWidth - containerRef.current.clientWidth;
      }

      // Use a spring animation for the bounce-back effect
      void control
        .start({
          x: -targetX,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        })
        .then(() => {
          // Reset animation
          control.set({ x: 0 });
          containerRef.current.scrollLeft = targetX;
        });
    }
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="cursor-grab overflow-hidden"
    >
      <motion.div
        ref={containerRef}
        animate={control}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-auto"
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="shrink-0 snap-start first:pl-4 last:pr-4">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollSnapXContainer;
