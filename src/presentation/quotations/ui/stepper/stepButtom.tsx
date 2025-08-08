import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";

interface Props {
  onClick: () => void;
  isNext: boolean;
  isDisabled?: boolean;
}

const StepButton = ({ onClick, isNext, isDisabled }: Props) => {
  const baseClasses = "px-8 py-2.5 rounded-lg font-semibold transition text-[#FFA500] hover:text-[#003E7E] shadow";
  const nextClasses = isDisabled 
    ? " text-[#005BBB] cursor-not-allowed" 
    : " text-[#005BBB] hover:bg-gray-100";
  const prevClasses = "bg-border text-[#005BBB] hover:bg-muted";

  return (
    <Button
      variant="ghost"
      className={`${baseClasses} ${isNext ? nextClasses : prevClasses}`}
      onClick={onClick}
      disabled={isDisabled}
      
    >
      {isNext ? "Siguiente" : "Anterior"}

      <ArrowRight className={`ml-2 ${!isNext ? 'rotate-180' : ''}`} />
    </Button>
  );
};

export default StepButton;
