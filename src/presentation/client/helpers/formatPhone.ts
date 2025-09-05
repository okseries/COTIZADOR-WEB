export const formatPhone = (val: string) => {
  if (!val) return "";
  
  const digits = val.replace(/\D/g, "");
  
  // Sin dígitos, retornar vacío
  if (digits.length === 0) return "";
  
  // Para números dominicanos (10 dígitos que empiezan con 809, 829, 849)
  if (digits.length === 10 && (digits.startsWith("809") || digits.startsWith("829") || digits.startsWith("849"))) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Para números internacionales o otros formatos
  if (digits.length > 10) {
    // Formato internacional simple
    const countryCode = digits.slice(0, digits.length - 10);
    const localNumber = digits.slice(-10);
    
    if (localNumber.length >= 7) {
      return `+${countryCode} ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
    } else {
      return `+${countryCode} ${localNumber}`;
    }
  }
  
  // Para números más cortos o formatos locales diferentes
  if (digits.length <= 10) {
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length < 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  
  return digits;
}