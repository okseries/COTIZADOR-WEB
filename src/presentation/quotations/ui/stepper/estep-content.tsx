import React, { useRef } from 'react'
import ClientInformation, { ClientInformationRef } from '../../../client/ui/ClientInformation';
import StepButton from './stepButtom';
import { useQuotationStore } from '../../store/useQuotationStore';
import CategoryPlan from '@/presentation/plans/ui/CategoryPlan';
import { ClientSearchProvider } from '@/presentation/client/hooks/useClientSearch';

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

  const handleFinish = () => {
    const quotationObject = getFinalObject();
    if (isComplete()) {
      console.log('🚀 Objeto de cotización generado:', quotationObject);
      // Aquí harías la llamada a la API
    } else {
      console.error('❌ Error: No se pudo generar el objeto de cotización');
    }
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
            <div className="text-lg font-medium">Coberturas Opcionales - En desarrollo</div>
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
          <>
            <div className="text-lg font-medium">Opciones de Pago - En desarrollo</div>
            <div className="flex justify-between">
              <StepButton
                onClick={() => setStep("step3")}
                isNext={false}
                isDisabled={false}
              />
              <button
                className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition text-base shadow"
                onClick={handleFinish}
                disabled={!isComplete()}
              >
                Generar Cotización
              </button>
            </div>
          </>
        )}
      </div>
    </ClientSearchProvider>
  )
}

export default StepContent
