import { Button } from "@/components/ui/button";
import React from "react";

interface Props {
  onClick: () => void;
  isNext: boolean;
  isDisabled?: boolean;
}

const StepButton = ({ onClick, isNext, isDisabled }: Props) => {
  const baseClasses = "px-8 py-2.5 rounded-lg font-semibold transition text-base shadow";
  const nextClasses = isDisabled 
    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
    : "bg-primary text-white hover:bg-primary-dark";
  const prevClasses = "bg-border text-foreground hover:bg-muted";

  return (
    <Button
      variant="ghost"
      className={`${baseClasses} ${isNext ? nextClasses : prevClasses}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isNext ? "Siguiente" : "Anterior"}
    </Button>
  );
};

export default StepButton;
