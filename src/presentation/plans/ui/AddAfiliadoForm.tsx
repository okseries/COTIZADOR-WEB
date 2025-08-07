"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useParentesco } from '@/presentation/parentesco/hooks/useParentesco'
import { usePrimaPlan } from '../hooks/usePrimaPlan'
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore'
import { LoadingSpinner } from '@/components/shared/loading'
import React, { useState, useEffect } from 'react'
import { Afiliado } from '@/presentation/quotations/interface/createQuotation.interface'
import { Plan } from '../interface/plan.interface'

interface Props {
  plan: Plan
  onAddAfiliado: (afiliado: Afiliado) => void
}

const AddAfiliadoForm = ({ plan, onAddAfiliado }: Props) => {
  const [parentescoId, setParentescoId] = useState<string>('')
  const [edad, setEdad] = useState<string>('')
  const [errors, setErrors] = useState<{ parentesco?: string; edad?: string }>({})

  const { getFinalObject } = useQuotationStore()
  const { data: parentescos, isLoading: loadingParentescos, error: errorParentescos } = useParentesco()
  
  // Obtener tipoPlan y clientChoosen del store
  const tipoPlan = getFinalObject().cliente?.tipoPlan ?? 0
  const clientChoosen = getFinalObject().cliente?.clientChoosen ?? 0
  
  // Obtener prima cuando tenemos todos los datos necesarios
  const shouldFetchPrima = edad !== '' && !isNaN(Number(edad)) && Number(edad) > 0
  const { data: prima, isLoading: loadingPrima } = usePrimaPlan(
    plan.plan_name, 
    Number(edad), 
    tipoPlan, 
    clientChoosen, 
    shouldFetchPrima
  )

  const validateForm = () => {
    const newErrors: { parentesco?: string; edad?: string } = {}
    
    if (!parentescoId) {
      newErrors.parentesco = 'El parentesco es obligatorio'
    }
    
    if (!edad) {
      newErrors.edad = 'La edad es obligatoria'
    } else if (isNaN(Number(edad)) || Number(edad) <= 0 || Number(edad) > 120) {
      newErrors.edad = 'Ingrese una edad válida (1-120)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAfiliado = () => {
    if (!validateForm()) return

    const selectedParentesco = parentescos?.find(p => p.id.toString() === parentescoId)
    if (!selectedParentesco) return

    const primaValue = prima || 1186.57 // Valor por defecto

    const newAfiliado: Afiliado = {
      plan: plan.plan_name,
      parentesco: selectedParentesco.nomebreParentesco,
      edad: Number(edad),
      subtotal: primaValue.toFixed(2),
      cantidadAfiliados: 1
    }

    onAddAfiliado(newAfiliado)
    
    // Reset form
    setParentescoId('')
    setEdad('')
    setErrors({})
  }

  if (loadingParentescos) return <LoadingSpinner className="h-6 w-6" />
  if (errorParentescos) return <div className="text-red-500 text-sm">Error al cargar parentescos</div>

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h4 className="font-medium text-sm text-gray-700">Agregar afiliado a {plan.plan_name}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Parentesco */}
        <div className="space-y-2">
          <Label htmlFor={`parentesco-${plan.id}`}>
            Parentesco *
          </Label>
          <Select value={parentescoId} onValueChange={setParentescoId}>
            <SelectTrigger className={`h-10 ${errors.parentesco ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Seleccionar parentesco" />
            </SelectTrigger>
            <SelectContent>
              {parentescos?.map((parentesco) => (
                <SelectItem key={parentesco.id} value={parentesco.id.toString()}>
                  {parentesco.nomebreParentesco}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parentesco && (
            <p className="text-red-500 text-xs">{errors.parentesco}</p>
          )}
        </div>

        {/* Edad */}
        <div className="space-y-2">
          <Label htmlFor={`edad-${plan.id}`}>
            Edad *
          </Label>
          <Input
            id={`edad-${plan.id}`}
            type="number"
            placeholder="Ingrese edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className={`h-10 ${errors.edad ? 'border-red-500' : ''}`}
            min="1"
            max="120"
          />
          {errors.edad && (
            <p className="text-red-500 text-xs">{errors.edad}</p>
          )}
        </div>

        {/* Prima Plan */}
        <div className="space-y-2">
          <Label>Prima Plan</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 flex items-center text-sm">
            {loadingPrima ? (
              <LoadingSpinner className="h-4 w-4 mr-2" />
            ) : (
              `DOP ${prima ? prima.toFixed(2) : shouldFetchPrima ? '0.00' : '--'}`
            )}
          </div>
        </div>

        {/* Botón agregar */}
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button 
            onClick={handleAddAfiliado}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700"
            disabled={loadingPrima}
          >
            {loadingPrima ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddAfiliadoForm
