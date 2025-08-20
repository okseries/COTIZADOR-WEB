"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useStepNavigation } from "@/core";
import StepContent from "./estep-content";

const steps = [
  { key: "step1", label: "INFORMACIÓN DEL CLIENTE" },
  { key: "step2", label: "CATEGORÍA PLAN" },
  { key: "step3", label: "COBERTURAS OPCIONALES" },
  { key: "step4", label: "OPCIONES DE PAGO" },
];

export function Stepper() {
  const { currentStep, setCurrentStep } = useStepNavigation();
  const currentStepIdx = steps.findIndex((s) => s.key === currentStep);

  return (
     <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Stepper Header limpio y sincronizado */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10 px-2">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.key;
          const isCompleted = idx < currentStepIdx;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s.key} className="flex items-center flex-1">
              {/* Paso */}
              <div className="flex flex-col items-center relative min-w-[60px] sm:min-w-[70px] z-10">
                <motion.div
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-white border-2 border-[#005BBB] text-[#005BBB] shadow-lg shadow-[#005BBB]/30"
                      : isCompleted
                      ? "bg-[#005BBB] text-white border-2 border-[#005BBB]"
                      : "bg-white text-muted-foreground border-2 border-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isCompleted && !isActive ? (
                        <motion.svg
                          key="check"
                          className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <motion.span
                          key="number"
                          className="text-xs sm:text-sm font-bold"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {idx + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
                <span
                  className={`mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-center leading-tight tracking-wide max-w-[80px] sm:max-w-none ${
                    isActive
                      ? "text-[#005BBB]"
                      : isCompleted
                      ? "text-[#005BBB]/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Línea entre pasos */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                    idx < currentStepIdx ? "bg-[#005BBB]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <StepContent step={currentStep} setStep={setCurrentStep} />
    </div>
  );
}
