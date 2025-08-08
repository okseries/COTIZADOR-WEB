"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { LoginFormData } from "../schemas/auth.schema"
interface LoginFormFieldsProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  disabled?: boolean
}

export function LoginFormFields({ register, errors, disabled = false }: LoginFormFieldsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="Usuario">Usuario</Label>
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="user"
          type="text"
          placeholder="Ej: pedro.perez"
          className="pl-10"
          disabled={disabled}
          {...register("user")}
          aria-invalid={errors.user ? "true" : "false"}
        />
      </div>
      {errors.user?.message && (
        <p className="text-sm text-destructive">{String(errors.user.message)}</p>
      )}
    </div>
  )
}
