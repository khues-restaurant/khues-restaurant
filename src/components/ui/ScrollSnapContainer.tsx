import { type ReactNode } from "react";

interface ScrollSnapContainer {
  children: ReactNode;
}

function ScrollSnapContainer({ children }: ScrollSnapContainer) {
  return (
    <div className="baseFlex snap-x snap-mandatory !justify-start space-x-4 overflow-x-auto p-4 tablet:!justify-center">
      {children.map((child, index) => (
        <div key={index} className="shrink-0 snap-center first:pl-4 last:pr-4">
          {child}
        </div>
      ))}
    </div>
  );
}

export default ScrollSnapContainer;
