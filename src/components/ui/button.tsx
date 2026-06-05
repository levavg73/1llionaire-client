import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-disabled disabled:text-disabledText disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-navy text-white shadow-sm hover:bg-navy-dark",

        primaryCta:
          "bg-navy text-white shadow-sm hover:bg-gradient-to-br hover:from-navy hover:to-lavender hover:shadow-md",

        secondaryCta:
          "border border-navy/20 bg-card text-navy shadow-sm hover:border-lavender hover:bg-lavender-light hover:text-lavender",

        accent:
          "bg-lavender text-white shadow-sm hover:bg-lavender-dark hover:shadow-md",

        tertiary:
          "border border-line bg-transparent text-text hover:border-lavender hover:bg-lavender-light hover:text-lavender",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        outline:
          "border border-line bg-transparent text-text hover:border-lavender hover:bg-lavender-light hover:text-lavender",

        secondary:
          "bg-surface text-text hover:bg-lavender-light hover:text-lavender",

        ghost:
          "bg-transparent text-text hover:bg-surface hover:text-lavender",

        link:
          "text-lavender underline-offset-4 hover:underline",

        gold:
          "bg-navy text-white shadow-sm hover:bg-gradient-to-br hover:from-navy hover:to-lavender hover:shadow-md",

        disabled:
          "cursor-not-allowed bg-disabled text-disabledText",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-[15px]",
        sm: "h-9 rounded-xl px-4 text-[15px]",
        lg: "h-12 rounded-xl px-8 text-[17px]",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };