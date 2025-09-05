import { Input } from "@/components/ui/input";
import {
  formatAndLimitIdentification,
  validateIdentification,
} from "../helpers/indentification-format";
import { forwardRef } from "react";

interface IdentificationInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  tipoDocumento?: "1" | "2" | "3" | "";
  helperText?: string;
}

export const IdentificationInput = forwardRef<
  HTMLInputElement,
  IdentificationInputProps
>(
  (
    {
      value,
      onChange,
      id,
      error,
      placeholder,
      tipoDocumento = "1",
      helperText,
    },
    ref
  ) => {
    // Determinar el tipo de documento válido
    const docType = tipoDocumento === "" ? "1" : tipoDocumento;

    // Formatear el valor para mostrar
    const formattedValue = formatAndLimitIdentification(docType, value);

    // Validar el documento
    const isValid = validateIdentification(docType, value);

    // Obtener placeholder dinámico según el tipo
    const getDynamicPlaceholder = () => {
      if (placeholder) return placeholder;

      switch (docType) {
        case "1":
          return "000-0000000-0 (Cédula)";
        case "2":
          return "Pasaporte (máx. 20 caracteres)";
        case "3":
          return "0-00000000-0 (RNC)";
        default:
          return "Ingrese identificación";
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;

      // Filtrar y limitar según el tipo de documento
      switch (docType) {
        case "1": // Cédula
          rawValue = rawValue.replace(/\D/g, "").slice(0, 11);
          break;
        case "2": // Pasaporte - permitir letras, números, guiones y espacios
          rawValue = rawValue
            .replace(/[^a-zA-Z0-9\-\s]/g, "")
            .toUpperCase()
            .slice(0, 20);
          break;
        case "3": // RNC
          rawValue = rawValue.replace(/\D/g, "").slice(0, 9);
          break;
        default:
          rawValue = rawValue.replace(/\D/g, "").slice(0, 11);
      }

      // Enviar el valor limpio (sin formato) al componente padre
      onChange(rawValue);
    };

    const errorText = () => {
      if (!value || isValid) return "";
      switch (docType) {
        case "1":
          return "La cédula debe tener exactamente 11 dígitos";
        case "2":
          return "El pasaporte debe tener entre 6 y 20 caracteres (letras, números, guiones)";
        case "3":
          return "El RNC debe tener exactamente 9 dígitos";
        default:
          return "Formato de identificación inválido";
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          placeholder={getDynamicPlaceholder()}
          value={formattedValue}
          onChange={handleInputChange}
          className={`h-10.5 transition-colors ${
            error || errorText()
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#005BBB]/20 focus:border-[#005BBB] focus:ring-[#005BBB]/20"
          }`}
        />

        {helperText && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}

        {errorText() && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1">
            <p className="text-xs text-red-500 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
              {errorText()}
            </p>
          </div>
        )}
      </div>
    );
  }
);

IdentificationInput.displayName = "IdentificationInput";
