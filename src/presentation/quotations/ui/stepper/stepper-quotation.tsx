"use client"

import { motion, AnimatePresence } from "framer-motion";
import useStepperStore from "../../store/useStepperStore";
import StepContent from "./estep-content";

const steps = [
  { key: "step1", label: "INFORMACIÓN DEL CLIENTE" },
  { key: "step2", label: "CATEGORÍA PLAN" },
  { key: "step3", label: "COBERTURAS OPCIONALES" },
  { key: "step4", label: "OPCIONES DE PAGO" },
];

export function Stepper() {
  const { currentStep, setCurrentStep, isStepValid } = useStepperStore();
  const currentStepIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stepper Header limpio y sincronizado */}
      <div className="flex justify-between items-center mb-10 px-2">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.key;
          const isCompleted = idx < currentStepIdx;
          const isLast = idx === steps.length - 1;

          return (
            <div key={s.key} className="flex items-center flex-1">
              {/* Paso */}
              <div className="flex flex-col items-center relative min-w-[70px] z-10">
                <motion.div
                  className="relative"
                  initial={false}
                  animate={{
                    scale: isActive ? 1.18 : 1,
                    boxShadow: isActive
                      ? "0 4px 16px 0 rgba(0,91,187,0.10)"
                      : "none",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-base font-bold bg-white`}
                    style={{
                      borderColor:
                        isActive || isCompleted ? "#005BBB" : "#D1D5DB",
                      color: isActive || isCompleted ? "#005BBB" : "#D1D5DB",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.svg
                          key="check"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <motion.span
                          key="number"
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
                  className={`mt-3 text-sm font-medium text-center leading-tight tracking-wide ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Línea entre pasos */}
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    idx < currentStepIdx ? "bg-primary" : "bg-gray-200"
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
