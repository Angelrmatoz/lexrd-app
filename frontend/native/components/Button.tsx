import React from "react";
import { Pressable, Text, PressableProps } from "react-native";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  labelClassName?: string;
}

export const Button = ({
  label,
  variant = "primary",
  className,
  labelClassName,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-primary active:opacity-80",
    secondary: "bg-secondary active:opacity-80",
    outline: "border border-outline bg-transparent active:bg-surface-container-low",
    ghost: "bg-transparent active:bg-surface-container-low",
  };

  const labelVariants = {
    primary: "text-on-primary font-semibold",
    secondary: "text-white font-semibold",
    outline: "text-on-surface font-medium",
    ghost: "text-on-surface font-medium",
  };

  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-xl px-6 py-3",
        variants[variant],
        className
      )}
      {...props}
    >
      <Text className={cn("text-base", labelVariants[variant], labelClassName)}>
        {label}
      </Text>
    </Pressable>
  );
};
