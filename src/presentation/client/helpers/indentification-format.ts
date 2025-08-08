export const formatAndLimitIdentification = (
  type: '1' | '2' | '3', 
  value: string
): string => {
  if (type === "1") {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`
  }

  if (type === "2") {
    return value.toUpperCase().slice(0, 20) // alfanumérico limitado para pasaporte
  }

  if (type === "3") {
    const digits = value.replace(/\D/g, "").slice(0, 9)
    if (digits.length <= 1) return digits
    if (digits.length <= 8) return `${digits.slice(0, 1)}-${digits.slice(1)}`
    return `${digits.slice(0, 1)}-${digits.slice(1, 8)}-${digits.slice(8)}`
  }

  return value
}

/**
 * Valida si la identificación cumple con las reglas del tipo de documento
 */
export const validateIdentification = (
  type: '1' | '2' | '3',
  value: string
): boolean => {
  const cleanValue = value.replace(/\D/g, "")
  
  switch (type) {
    case "1": // Cédula dominicana (11 dígitos)
      return cleanValue.length === 11 && /^\d{11}$/.test(cleanValue)
    
    case "2": // Pasaporte (6-20 caracteres alfanuméricos)
      return value.length >= 6 && value.length <= 20 && /^[A-Z0-9]+$/.test(value.toUpperCase())

    case "3": // RNC (9 dígitos)
      return cleanValue.length === 9 && /^\d{9}$/.test(cleanValue)
    
    default:
      return false
  }
}

/**
 * Obtiene el valor limpio (sin formato) para enviar a la API
 */
export const getCleanIdentification = (
  type: '1' | '2' | '3',
  value: string
): string => {
  switch (type) {
    case "1": // Cédula (solo números)
    case "3": // RNC (solo números)
      return value.replace(/\D/g, "")
    case "2": // Pasaporte (alfanumérico)
      return value.toUpperCase()
    default:
      return value
  }
}
