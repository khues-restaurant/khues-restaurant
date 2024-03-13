import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "~/utils/shadcnuiUtils";

export const TextGenerateEffect = ({
  words,
  startDelay = 0,
  className,
}: {
  words: string;
  startDelay?: number;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  useEffect(() => {
    void animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,
        delay: stagger(0.15, { startDelay }),
      },
    );
  }, [scope.current]); // what are proper deps here

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="text-black opacity-0 dark:text-white"
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("", className)}>
      <div className="leading-snug tracking-wide text-black dark:text-white">
        {renderWords()}
      </div>
    </div>
  );
};
