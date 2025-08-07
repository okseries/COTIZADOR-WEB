import { Button } from "@/components/ui/button";
import { ArrowBigLeft, ArrowRight } from "lucide-react";
import React from "react";

interface Props {
  onClick: () => void;
  isNext: boolean;
  isDisabled?: boolean;
}

const StepButton = ({ onClick, isNext, isDisabled }: Props) => {
  const baseClasses = "px-8 py-2.5 rounded-lg font-semibold transition text-[#FFA500] hover:text-[#FFA500] shadow";
  const nextClasses = isDisabled 
    ? " text-[#FFA500] cursor-not-allowed" 
    : " text-[#FFA500] hover:bg-gray-100";
  const prevClasses = "bg-border text-[#FFA500] hover:bg-muted";

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
