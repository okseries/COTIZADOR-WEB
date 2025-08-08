'use client';

import React from 'react';
// import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../../components/ui/card';
import { PlanPaymentCard } from './ui/PlanPaymentCard';
import { PaymentSummary } from './ui/PaymentSummary';
import { usePaymentOptions, PeriodoPago } from './hooks/usePaymentOptions';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useQuotationStore } from '../quotations/store/useQuotationStore';
import { useAuth } from '../auth/store/useAuth.store';

export const PaymentOptions: React.FC = () => {
  const {getFinalObject} = useQuotationStore();
  const { user: authUser } = useAuth();
  // const router = useRouter();
  const {
    paymentPlans,
    isSubmitting,
    error,
    isFormValid,
    totalGeneral,
    handlePeriodChange,
    submitQuotation
  } = usePaymentOptions();

  // const handleBack = () => {
  //   router.push('/dashboard/cotizacion?step=3');
  // };

  const handleSubmit = async () => {
    const payload = getFinalObject();
    
    // Asegurarse de que el usuario esté incluido desde el store de auth
    const finalPayload = {
      ...payload,
      user: authUser?.data?.user || null
    };
    
    console.log("=== DEBUG PAYLOAD ===");
    console.log("payload original:", payload);
    console.log("authUser completo:", authUser);
    console.log("authUser.data:", authUser?.data);
    console.log("authUser.data.user:", authUser?.data?.user);
    console.log("finalPayload:", finalPayload);
    console.log("usuario en finalPayload:", finalPayload.user);
    
    await submitQuotation();
  };

  // Loading state
  if (paymentPlans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#005BBB] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-600">Cargando información de pagos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
     

      {/* Error Global */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Payment Cards */}
      <div className="space-y-4">
        {paymentPlans.map((plan) => (
          <PlanPaymentCard
            key={plan.plan}
            plan={plan}
            selectedPeriod={plan.selectedPeriod}
            onPeriodChange={(period: PeriodoPago) => handlePeriodChange(plan.plan, period)}
          />
        ))}
      </div>

      {/* Payment Summary */}
      <PaymentSummary
        totalGeneral={totalGeneral}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />

      
    </div>
  );
};

export default PaymentOptions;
