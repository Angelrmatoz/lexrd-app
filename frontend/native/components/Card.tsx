import React from "react";
import {View, Text, ViewProps} from "react-native";
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
    variant?: "low" | "high";
    children: React.ReactNode;
}

export const Card = ({
                         variant = "low",
                         className,
                         children,
                         ...props
                     }: CardProps) => {
    const variants = {
        low: "bg-surface-container-low",
        high: "bg-surface-container-high",
    };

    return (
        <View
            className={cn("rounded-2xl p-4", variants[variant], className)}
            {...props}
        >
            {children}
        </View>
    );
};
