import * as React from "react";

import { cn } from "~/utils/shadcnuiUtils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        // not using because of the scale approach doesn't work for <textarea> (shrinks width and I don't
        // want to do any % based hacks to get it back to 100% width) - trying to get around safari auto-zooming on focus
        // h-12 origin-[left_center] scale-y-[0.875] tablet:h-10 tablet:origin-center tablet:scale-100
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background transition-[box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 tablet:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
