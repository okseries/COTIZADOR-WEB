import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Download } from 'lucide-react';
import { formatCurrency } from '@/presentation/helpers/FormattCurrency';
import { useMode } from '@/core/store';

interface PaymentSummaryProps {
  totalGeneral: number;
  isFormValid: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalGeneral,
  isFormValid,
  isSubmitting,
  error,
  onSubmit
}) => {


  const mode = useMode();
  

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Resumen Final
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total General */}
        <div className="p-3 bg-gradient-to-r from-[#005BBB]/10 to-[#005BBB]/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
            <span className="text-sm sm:text-lg font-medium text-gray-700">
              Total General a Pagar:
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#005BBB] truncate">
              {formatCurrency(totalGeneral)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Warning */}
        {!isFormValid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Por favor, selecciona el período de pago para todos los planes antes de continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex bg-[#005BBB] hover:bg-[#003E7E] items-center justify-center gap-2 w-full h-10"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {mode !== "create" ? "Actualizar Cotización" : "Finalizar Cotización"}
              </>
            )}
          </Button>
        </div>

        
      </CardContent>
    </Card>
  );
};
