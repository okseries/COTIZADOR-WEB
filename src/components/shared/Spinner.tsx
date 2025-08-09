"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "secondary" | "white" | "gray";
  variant?: "spinner" | "dots" | "pulse";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const colorClasses = {
  primary: "text-[#005BBB]",
  secondary: "text-[#FFA500]",
  white: "text-white",
  gray: "text-gray-500"
};

export const Spinner = ({ 
  size = "md", 
  className,
  color = "primary",
  variant = "spinner"
}: SpinnerProps) => {
  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-pulse",
              sizeClasses[size],
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div 
        className={cn(
          "rounded-full animate-pulse",
          sizeClasses[size],
          colorClasses[color],
          className
        )} 
      />
    );
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  );
};

export default Spinner;
