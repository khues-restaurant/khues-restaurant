import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "~/components/ui/button";

const ButtonState = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

interface AsyncButton {
  initialWord: string;
  vertWord: string;
  pastTenseWord: string;
  overrideDisabled?: boolean;
  showCheckmarkAfterSuccess?: boolean;
  performMutation: () => Promise<void>; // prob have to just accept any here?
  className?: string;
}

// kinda tired rn but don't you need to also pass a function in for basically the "onSuccess"
// and optionally the onError too?

function AsyncButton({
  initialWord,
  vertWord,
  pastTenseWord,
  overrideDisabled,
  showCheckmarkAfterSuccess = true,
  performMutation,
  className,
}: AsyncButton) {
  const [buttonState, setButtonState] = useState(ButtonState.IDLE);

  let buttonText = initialWord;
  if (buttonState === ButtonState.LOADING) buttonText = vertWord;
  else if (buttonState === ButtonState.SUCCESS) buttonText = pastTenseWord;
  else if (buttonState === ButtonState.ERROR) buttonText = "Error";

  const handleClick = async () => {
    try {
      await performMutation();

      setTimeout(() => setButtonState(ButtonState.SUCCESS), 2000);

      // Optionally reset to IDLE after a delay
      setTimeout(() => setButtonState(ButtonState.IDLE), 4000);
    } catch (error) {
      setButtonState(ButtonState.ERROR);
      // Handle error state or retry logic
    }
  };

  // ah only really want this flow to

  // ___pushing off development of this component for now, and just doing individual button components___

  return (
    <Button
      disabled={overrideDisabled ?? buttonState !== ButtonState.IDLE}
      className={className}
      onClick={handleClick}
    >
      <AnimatePresence mode={"popLayout"}>
        <motion.div
          key={buttonState}
          layout
          // whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: 0.25,
          }}
          className="baseFlex gap-2"
        >
          {buttonText}
          {buttonState === ButtonState.LOADING && (
            <div
              className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          )}
          {buttonState === ButtonState.SUCCESS && showCheckmarkAfterSuccess && (
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="size-4 text-white"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  delay: 0.2,
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.3,
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

export default AsyncButton;
