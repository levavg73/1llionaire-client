import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-disabled disabled:text-disabledText disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-indigo text-white hover:bg-indigo/90",

        primaryCta:
          "bg-coral text-white shadow-sm hover:bg-gradient-to-br hover:from-prism hover:to-coral hover:shadow-md",

        secondaryCta:
          "bg-prism text-white shadow-sm hover:bg-gradient-to-br hover:from-prism hover:to-coral hover:shadow-md",

        tertiary:
          "border border-line bg-transparent text-indigo hover:border-prism hover:bg-prism-light hover:text-prism",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        outline:
          "border border-line bg-transparent text-indigo hover:border-prism hover:bg-prism-light hover:text-prism",

        secondary:
          "bg-mist text-indigo hover:bg-line/70",

        ghost:
          "text-indigo hover:bg-mist hover:text-prism",

        link:
          "text-prism underline-offset-4 hover:underline",

        disabled:
          "bg-disabled text-disabledText cursor-not-allowed",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
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