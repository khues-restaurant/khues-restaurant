import * as React from "react";
import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/utils/shadcnuiUtils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-offwhite",
        orderOutline: "outline outline-1 outline-input bg-offwhite",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "",
        link: "underlineAnimation text-primary tracking-wide",
        activeLink: "activeUnderline text-primary font-semibold",
        underline: "text-primary underline underline-offset-2",
        text: "text-neutral-400",
        rewards: "text-offwhite [text-shadow:_0_1px_4px_rgb(0_0_0_/_25%)]",
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
        return `${brightness !== 1 ? "" : ""}`; // had /90
      } else if (variant === "destructive") {
        return `${brightness !== 1 ? "" : ""}`; // had /90
      } else if (variant === "outline") {
        return `${brightness !== 1 ? "bg-offwhite text-accent-foreground" : ""}`; // is text-accent-foreground what we want btw?
      } else if (variant === "orderOutline") {
        return `${brightness !== 1 ? "bg-offwhite text-accent-foreground" : ""}`; // is text-accent-foreground what we want btw?
      } else if (variant === "secondary") {
        return `${brightness !== 1 ? "" : ""}`; // had /80
      } else if (variant === "ghost") {
        return `${brightness !== 1 ? "bg-offwhite text-accent-foreground" : ""}`; // is text-accent-foreground what we want btw?
      } else if (variant === "link" || variant === "activeLink") {
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
        onMouseEnter={() => setBrightness(0.9)}
        onPointerDown={() => setBrightness(0.75)}
        onPointerUp={() => setBrightness(1)}
        onPointerLeave={() => setBrightness(1)}
        style={{
          background:
            variant === "rewards"
              ? "linear-gradient(to right bottom, oklch(0.9 0.13 87.8) 0%, oklch(0.70 0.13 87.8) 100%)"
              : "",
        }}
        className={cn(
          buttonVariants({ variant, size, className }),
          getDynamicStyles(),
          variant === "orderOutline"
            ? "hover:shadow-[0px_0px_0px_3px_hsl(144,61%,20%)]"
            : // making these !important as a result of order button specific UX that I want. Might
              // cause other issues though
              "hover:!brightness-90 active:!brightness-75",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
