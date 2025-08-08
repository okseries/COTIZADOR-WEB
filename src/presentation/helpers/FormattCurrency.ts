type FormatCurrencyOptions = {
    locale?: string;
    currency?: string;
    // minimumFractionDigits?: number;
    // maximumFractionDigits?: number;
  };
  
 export  const formatCurrency = (
    value: number | string,
    { 
      locale = 'es-DO', 
      currency = 'DOP', // Default to Dominican Peso
    }: FormatCurrencyOptions = {}
  ): string => {
    // Convertir el valor a número
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
    // Verificar si el valor es un número válido
    if (isNaN(numberValue)) {
      return 'Valor no válido';
    }
  
    // Formatear el número a moneda
    return numberValue.toLocaleString(locale, {
      style: 'currency',
      currency,
    });
  };
  
  // Ejemplo de uso
  //console.log(formatCurrency('12345.67')); // Resultado: RD$ 12,345.67
  //console.log(formatCurrency(12345.67, { currency: 'USD', locale: 'en-US' })); // Resultado: $12,345.67
  