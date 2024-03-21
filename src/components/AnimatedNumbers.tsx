import { useEffect } from "react";
import {
  type MotionValue,
  useSpring,
  useTransform,
  motion,
} from "framer-motion";

interface AnimatedNumbers {
  value: number;
  fontSize?: number;
  padding?: number;
}

function AnimatedNumbers({
  value,
  fontSize = 30,
  padding = 15,
}: AnimatedNumbers) {
  const height = fontSize + padding;

  return (
    <div
      style={{ fontSize }}
      className="flex space-x-0 overflow-hidden rounded"
    >
      {value > 999 && <Digit place={1000} value={value} height={height} />}
      {value > 99 && <Digit place={100} value={value} height={height} />}
      {value > 9 && <Digit place={10} value={value} height={height} />}
      <Digit place={1} value={value} height={height} />
    </div>
  );
}

export default AnimatedNumbers;

function Digit({
  place,
  value,
  height,
}: {
  place: number;
  value: number;
  height: number;
}) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

function Number({
  mv,
  number,
  height,
}: {
  mv: MotionValue;
  number: number;
  height: number;
}) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
