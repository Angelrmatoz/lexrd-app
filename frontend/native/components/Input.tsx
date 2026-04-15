import React from "react";
import { View, TextInput, TextInputProps } from "react-native";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends TextInputProps {
  containerClassName?: string;
}

export const Input = ({
  containerClassName,
  className,
  ...props
}: InputProps) => {
  return (
    <View
      className={cn(
        "bg-surface-container-lowest rounded-md px-4 py-3 border border-transparent focus:bg-surface-container-highest",
        containerClassName
      )}
    >
      <TextInput
        className={cn("text-on-surface text-base", className)}
        placeholderTextColor="#c4c7c7" // on-surface-variant
        {...props}
      />
    </View>
  );
};
