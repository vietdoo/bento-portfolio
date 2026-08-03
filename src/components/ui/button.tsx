import { cn } from "@/lib/utils";

export interface ButtonProps {
  children?: any;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: any) => void;
  [key: string]: any;
}

export function Button(props: ButtonProps) {
  const {
    children,
    className,
    variant = "default",
    size = "default",
    asChild = false,
    type = "button",
    ...rest
  } = props;

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variantStyles = {
    default: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
    outline: "border border-darkslate-400 bg-transparent text-white hover:bg-darkslate-600/50 hover:border-primary-500",
    ghost: "hover:bg-darkslate-600/50 text-white",
    link: "text-primary-400 underline-offset-4 hover:underline",
  };

  const sizeStyles = {
    default: "h-10 px-5 py-2 text-sm rounded-full",
    sm: "h-8 px-4 text-xs rounded-full",
    lg: "h-12 px-8 text-base rounded-full",
    icon: "h-9 w-9 rounded-full",
  };

  const combinedClass = cn(
    baseStyles,
    variantStyles[variant] || variantStyles.default,
    sizeStyles[size] || sizeStyles.default,
    className
  );

  // When asChild is true, we pass the merged className and props to the direct child if possible
  if (asChild && children) {
    if (typeof children === "object" && children !== null && "props" in children) {
      const child = children as any;
      const childProps = child.props || {};
      const mergedClass = cn(combinedClass, childProps.className);
      return {
        ...child,
        props: {
          ...childProps,
          ...rest,
          className: mergedClass,
        },
      };
    }
  }

  return (
    <button type={type} class={combinedClass} {...rest}>
      {children}
    </button>
  );
}
