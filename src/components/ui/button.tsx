import * as React from "react";
import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/utils/shadcnuiUtils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "",
        link: "underlineAnimation text-primary", // TODO: should have an option for the offset animation
        // to not be so far from text. mainly would be used for smaller text situations
        // TODO: should also have an "activeLink" variant for header links when user is on that page
        underline: "text-primary underline underline-offset-2",
        text: "text-neutral-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        underline: "h-min py-1", // this probably doesn't translate to other text sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const [brightness, setBrightness] = useState(1);

    // Retains the default hover styles, but makes them behave as they should
    // on touch devices as well.
    function getDynamicStyles() {
      if (variant === "default" || variant === undefined) {
        return `${brightness !== 1 ? "bg-primary/90" : ""}`;
      } else if (variant === "destructive") {
        return `${brightness !== 1 ? "bg-destructive/90" : ""}`;
      } else if (variant === "outline") {
        return `${brightness !== 1 ? "bg-accent text-accent-foreground" : ""}`;
      } else if (variant === "secondary") {
        return `${brightness !== 1 ? "bg-secondary/80" : ""}`;
      } else if (variant === "ghost") {
        return `${brightness !== 1 ? "bg-accent text-accent-foreground" : ""}`;
      } else if (variant === "link") {
        return `${brightness !== 1 ? "!text-activeLink" : ""}`; // saturate-200 least sure about this one, kind of just want to make them darker
      }
      // else if (variant === "underline") {
      //   return `${brightness !== 1 ? "text-primary" : ""}`;
      // }
      else if (variant === "text") {
        return `${brightness !== 1 ? "text-neutral-700" : ""}`;
      }
    }

    // TODO: tweak these, for example I don't necessarily think we want the primary button to
    // get 0.9 brightness on hover, the bg-primary/90 is good enough. Just some tweaking necessary

    return (
      <Comp
        onMouseEnter={() => {
          // if (variant === "ghost") {
          //   setAlternateIndicator(true);
          //   return;
          // } ah yeah idk best way since doing every logical check through just brightness is
          // pretty ugly

          setBrightness(0.9);
        }}
        onMouseLeave={() => setBrightness(1)}
        onPointerDown={() => setBrightness(0.75)}
        onPointerUp={() => setBrightness(1)}
        onPointerLeave={() => setBrightness(1)}
        style={{
          filter: `brightness(${brightness}`,
        }}
        className={cn(
          buttonVariants({ variant, size, className }),
          getDynamicStyles(),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
