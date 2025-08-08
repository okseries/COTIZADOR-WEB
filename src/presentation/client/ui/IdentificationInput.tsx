import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatAndLimitIdentification, validateIdentification } from "../helpers/indentification-format"
import { forwardRef } from "react"

interface IdentificationInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
  error?: boolean
  required?: boolean
  placeholder?: string
  tipoDocumento?: "1" | "2" | "3" | ""
  helperText?: string
}

export const IdentificationInput = forwardRef<HTMLInputElement, IdentificationInputProps>(({
  value,
  onChange,
  id,
  label,
  error,
  required,
  placeholder,
  tipoDocumento = "1",
  helperText,
}, ref) => {
  // Determinar el tipo de documento válido
  const docType = tipoDocumento === "" ? "1" : tipoDocumento
  
  // Formatear el valor para mostrar
  const formattedValue = formatAndLimitIdentification(docType, value)
  
  // Validar el documento
  const isValid = validateIdentification(docType, value)
  
  // Obtener placeholder dinámico según el tipo
  const getDynamicPlaceholder = () => {
    if (placeholder) return placeholder
    
    switch (docType) {
      case "1":
        return "000-0000000-0 (Cédula)"
      case "2":
        return "Pasaporte (máx. 20 caracteres)"
      case "3":
        return "0-00000000-0 (RNC)"
      default:
        return "Ingrese identificación"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value

    // Filtrar y limitar según el tipo de documento
    switch (docType) {
      case "1": // Cédula
        rawValue = rawValue.replace(/\D/g, "").slice(0, 11)
        break
      case "2": // Pasaporte
        rawValue = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 20)
        break
      case "3": // RNC
        rawValue = rawValue.replace(/\D/g, "").slice(0, 9)
        break
      default:
        rawValue = rawValue.replace(/\D/g, "").slice(0, 11)
    }

    // Enviar el valor limpio (sin formato) al componente padre
    onChange(rawValue)
  }

  const getHelperText = () => {
    if (helperText) return helperText
    
    if (value && !isValid) {
      switch (docType) {
        case "1":
          return "La cédula debe tener exactamente 11 dígitos"
        case "2":
          return "El pasaporte debe tener entre 6 y 20 caracteres"
        case "3":
          return "El RNC debe tener exactamente 9 dígitos"
        default:
          return "Formato de identificación inválido"
      }
    }
    
    return ""
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        ref={ref}
        id={id}
        placeholder={getDynamicPlaceholder()}
        value={formattedValue} // Muestra con formato
        onChange={handleInputChange}
        className={`h-11 transition-colors ${
          error || (value && !isValid) 
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
            : "border-[#005BBB]/20 focus:border-[#005BBB] focus:ring-[#005BBB]/20"
        }`}
        autoComplete="off"
      />
      {getHelperText() && (
        <p className={`text-xs ${
          value && !isValid ? "text-red-500" : "text-gray-500"
        }`}>
          {getHelperText()}
        </p>
      )}
    </div>
  )
})

IdentificationInput.displayName = "IdentificationInput"
