import React from 'react'
import QuotationTable from '../ui/table/quotation-table';
import { useQuotations } from '../hooks/useQuotations';

const DashboardContent = () => {
  const { quotations, isLoading, error } = useQuotations();

  // Ordenar las cotizaciones por fecha de creación (más recientes primero)
  const quotationsOrder = React.useMemo(() => {
    if (!quotations || quotations.length === 0) return [];
    return [...quotations].sort((a, b) => {
      return new Date(b.fecha_creado).getTime() - new Date(a.fecha_creado).getTime();
    });
  }, [quotations]);

  if (error) {
    return (
      <div className="flex-1 p-6 space-y-6 justify-center items-center">
        <div className="text-center text-red-600">
          <p>Error al cargar las cotizaciones: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 h-full min-h-0">
      <QuotationTable data={quotationsOrder} isLoading={isLoading} />
    </div>
  )
}

export default DashboardContent