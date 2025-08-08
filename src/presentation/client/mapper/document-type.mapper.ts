// Mapper para convertir tipos de documento string a número
export const documentTypeToNumber = (documentType: string): number => {
  const mapping: Record<string, number> = {
    'CEDULA': 1,
    'PASAPORTE': 2,
    'RNC': 3,
  };
  
  return mapping[documentType] || 1; // Default a cédula si no se encuentra
};

// Mapper para convertir números a tipos de documento string
export const numberToDocumentType = (documentTypeNumber: number): string => {
  const mapping: Record<number, string> = {
    1: 'CEDULA',
    2: 'PASAPORTE', 
    3: 'RNC',
  };
  
  return mapping[documentTypeNumber] || 'CEDULA';
};
