import React, { useRef } from 'react'
import ClientInformation, { ClientInformationRef } from '../../../client/ui/ClientInformation';
import StepButton from './stepButtom';
import { useQuotationStore } from '../../store/useQuotationStore';
import CategoryPlan from '@/presentation/plans/ui/CategoryPlan';
import { ClientSearchProvider } from '@/presentation/client/hooks/useClientSearch';
import CoberturasOpcionales from '@/presentation/coberturasOpcionales/ui/CoberturasOptinals';
import PaymentOptions from '@/presentation/payments/PaymentOptions';

interface Props {
    step: string;
    setStep: (step: string) => void;
}

const StepContent = ({ step, setStep }: Props) => {
  const { getFinalObject, isComplete } = useQuotationStore();
  const clientInfoRef = useRef<ClientInformationRef>(null);

  const handleNext = async (nextStep: string) => {
    if (step === "step1") {
      const isValid = await clientInfoRef.current?.validateAndSave();
      if (isValid) {
        setStep(nextStep);
      }
      return; // evita continuar si no es válido
    }

    setStep(nextStep);
  };

  return (
    <ClientSearchProvider>
      <div className="bg-white rounded-2xl shadow-lg p-10 h-[500px] flex flex-col gap-8 border border-border overflow-auto">
          {step === "step1" && (
            <>
              <ClientInformation ref={clientInfoRef} />
              <div className="flex justify-end">
                <StepButton
                  onClick={() => handleNext("step2")}
                  isNext={true}
                  isDisabled={false}
                />
              </div>
            </>
          )}
        {step === "step2" && (
          <>
            <CategoryPlan/>
            <div className="flex justify-between">
              <StepButton
                onClick={() => setStep("step1")}
                isNext={false}
                isDisabled={false}
              />
              <StepButton
                onClick={() => handleNext("step3")}
                isNext={true}
                isDisabled={false}
              />
            </div>
          </>
        )}
        {step === "step3" && (
          <>
            <CoberturasOpcionales/>
            
            <div className="flex justify-between">
              <StepButton
                onClick={() => setStep("step2")}
                isNext={false}
                isDisabled={false}
              />
              <StepButton
                onClick={() => handleNext("step4")}
                isNext={true}
                isDisabled={false}
              />
            </div>
          </>
        )}
        {step === "step4" && (
          <PaymentOptions />
        )}
      </div>
    </ClientSearchProvider>
  )
}

export default StepContent
