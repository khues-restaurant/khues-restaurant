import * as React from "react";

import { cn } from "~/utils/shadcnuiUtils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // not using because of the scale approach doesn't work for <textarea> (shrinks width and I don't
        // want to do any % based hacks to get it back to 100% width) - trying to get around safari auto-zooming on focus
        // h-12 origin-[left_center] scale-y-[0.875] tablet:h-10 tablet:origin-center tablet:scale-100
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 tablet:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
