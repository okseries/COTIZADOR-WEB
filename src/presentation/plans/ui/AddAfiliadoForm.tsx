"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParentesco } from "@/presentation/parentesco/hooks/useParentesco";
import { usePrimaPlan } from "../hooks/usePrimaPlan";
import { useCliente } from "@/core";
import { Spinner } from "@/components/shared/Spinner";
import React, { useState, useEffect } from "react";
import { Afiliado } from "@/presentation/quotations/interface/createQuotation.interface";
import { Plan } from "../interface/plan.interface";

interface Props {
  selectedPlans: Plan[];
  onAddAfiliado: (planName: string, afiliado: Afiliado) => void;
  clienteChousen: number; // Agregado para pasar el tipo de cliente
}

const AddAfiliadoForm = ({
  selectedPlans,
  onAddAfiliado,
  clienteChousen,
}: Props) => {
  const [selectedPlanName, setSelectedPlanName] = useState<string>("Todos");
  const [parentescoId, setParentescoId] = useState<string>("");
  const [edad, setEdad] = useState<string>("");
  const [errors, setErrors] = useState<{
    plan?: string;
    parentesco?: string;
    edad?: string;
  }>({});

  // Acceder directamente a los datos del store sin usar getFinalObject en cada render  
  const cliente = useCliente();
  const {
    data: parentescos,
    isLoading: loadingParentescos,
    error: errorParentescos,
  } = useParentesco();

  const tipoPlan = cliente?.tipoPlan ?? 0;
  const clientChoosen = cliente?.clientChoosen ?? 0;

  // Obtener prima cuando tenemos todos los datos necesarios (no para "Todos")
  const shouldFetchPrima =
    selectedPlanName !== "" &&
    selectedPlanName !== "Todos" &&
    edad !== "" &&
    !isNaN(Number(edad)) &&
    Number(edad) > 0;
  
  // Para colectivos (tanto voluntario como complementario), usar la cantidad como edad para el cálculo de prima
  const edadParaCalculo = clientChoosen === 2 ? Number(edad) : Number(edad);
  
  const { data: prima, isLoading: loadingPrima, error: primaError } = usePrimaPlan(
    selectedPlanName,
    edadParaCalculo,
    tipoPlan,
    clientChoosen,
    shouldFetchPrima
  );

  // Resetear plan seleccionado si ya no está en la lista (excepto "Todos")
  useEffect(() => {
    if (
      selectedPlanName &&
      selectedPlanName !== "Todos" &&
      !selectedPlans.find((p) => p.plan_name === selectedPlanName)
    ) {
      setSelectedPlanName("Todos");
    }
  }, [selectedPlans, selectedPlanName]);

  const validateForm = () => {
    const newErrors: { plan?: string; parentesco?: string; edad?: string } = {};

    if (!selectedPlanName) {
      newErrors.plan = "Debe seleccionar un plan";
    }

    if (!parentescoId) {
      newErrors.parentesco = "El parentesco es obligatorio";
    }

    if (!edad) {
      newErrors.edad = clienteChousen === 2 ? "La cantidad es obligatoria" : "La edad es obligatoria";
    } else if (isNaN(Number(edad)) || Number(edad) <= 0) {
      newErrors.edad = clienteChousen === 2 ? "Ingrese una cantidad válida (mayor a 0)" : "Ingrese una edad válida (1-120)";
    } else if (clienteChousen !== 2 && Number(edad) > 120) {
      newErrors.edad = "Ingrese una edad válida (1-120)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAfiliado = () => {
    if (!validateForm()) return;

    // Si hay error en la prima y no es "Todos", no permitir agregar
    if (selectedPlanName !== "Todos" && primaError) {
      return;
    }

    const selectedParentesco = parentescos?.find(
      (p) => p.id.toString() === parentescoId
    );
    if (!selectedParentesco) return;

    if (selectedPlanName === "Todos") {
      // Para "Todos", crear un afiliado base sin prima específica
      const newAfiliado: Afiliado = {
        plan: "Todos", // Se actualizará en CategoryPlan
        parentesco: selectedParentesco.nomebreParentesco,
        edad: clienteChousen === 2 ? 0 : Number(edad), // Para colectivos, edad es 0
        subtotal: "0", // Se calculará por cada plan en CategoryPlan
        cantidadAfiliados: clienteChousen === 2 ? Number(edad) : 1, // Para colectivos, cantidad va aquí
      };
      
      onAddAfiliado(selectedPlanName, newAfiliado);
    } else {
      // Para plan específico
      const primaValue = prima || 1186.57; // Valor por defecto
      // Para colectivos, multiplicar prima por cantidad
      const cantidad = clienteChousen === 2 ? Number(edad) : 1;
      const totalPrima = primaValue * cantidad;
      
      const newAfiliado: Afiliado = {
        plan: selectedPlanName,
        parentesco: selectedParentesco.nomebreParentesco,
        edad: clienteChousen === 2 ? 0 : Number(edad), // Para colectivos, edad es 0
        subtotal: totalPrima.toFixed(2),
        cantidadAfiliados: cantidad, // La cantidad real va aquí
      };
      
      onAddAfiliado(selectedPlanName, newAfiliado);
    }

    // Reset form (mantener plan seleccionado)
    setParentescoId("");
    setEdad("");
    setErrors({});
  };

  if (loadingParentescos)
    return <Spinner size="md" color="primary" className="mx-auto" />;
  if (errorParentescos)
    return (
      <div className="text-red-500 text-sm">Error al cargar parentescos</div>
    );

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h4 className="font-medium text-sm text-gray-700">Agregar afiliado</h4>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Selección de Plan */}
        {/* <div className="space-y-2">
          <Label htmlFor="plan-select">Plan *</Label>
          <div className="flex items-center space-x-2">
            <Select value={selectedPlanName} onValueChange={setSelectedPlanName}>
              <SelectTrigger className={`h-10 flex-1 min-w-0 ${errors.plan ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los planes</SelectItem>
                {selectedPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.plan_name}>
                    {plan.plan_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.plan && <p className="text-red-500 text-xs">{errors.plan}</p>}
        </div> */}

        {/* Parentesco */}
        <div className="space-y-2">
          <Label htmlFor="parentesco-select">Parentesco *</Label>
          <div className="flex items-center space-x-2">
            <Select value={parentescoId} onValueChange={setParentescoId}>
              <SelectTrigger className={`h-10 flex-1 min-w-0 ${errors.parentesco ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {clientChoosen !== 2
                  ? parentescos?.map((parentesco) => (
                      <SelectItem
                        key={parentesco.id}
                        value={parentesco.id.toString()}
                      >
                        {parentesco.nomebreParentesco}
                      </SelectItem>
                    ))
                  : parentescos?.[0] && (
                      <SelectItem
                        key={parentescos[0].id}
                        value={parentescos[0].id.toString()}
                      >
                        {parentescos[0].nomebreParentesco}
                      </SelectItem>
                    )}
              </SelectContent>
            </Select>
          </div>
          {errors.parentesco && (
            <p className="text-red-500 text-xs">{errors.parentesco}</p>
          )}
        </div>

        {/* Edad / Cantidad */}
        <div className="space-y-2">
          <Label htmlFor="edad-input">
            {clienteChousen === 2 ? "Cantidad *" : "Edad *"}
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="edad-input"
              type="number"
              placeholder={
                clienteChousen === 2 ? "Ingrese cantidad" : "Ingrese edad"
              }
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className={`h-10 flex-1 min-w-0 ${errors.edad ? "border-red-500" : ""}`}
              min="1"
              max={clienteChousen === 2 ? "999999" : "120"}
            />
          </div>
          {errors.edad && <p className="text-red-500 text-xs">{errors.edad}</p>}
        </div>

        {/* Prima Plan */}
        {/* <div className="space-y-2">
          <Label>Prima Plan</Label>
          <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 flex items-center text-sm justify-end w-36 min-w-0">
            <span className="truncate">
              {selectedPlanName === "Todos" ? (
                "Variable por plan"
              ) : loadingPrima ? (
                <span className="inline-flex items-center"><Spinner size="sm" color="primary" className="mr-2" /></span>
              ) : primaError ? (
                <span className="text-red-500 text-xs">Error</span>
              ) : (
                `RD$ ${
                  prima
                    ? prima.toFixed(2) + (clienteChousen === 2 && edad ? ` x ${edad} = ${(prima * Number(edad)).toFixed(2)}` : "")
                    : shouldFetchPrima ? "0.00" : "--"
                }`
              )}
            </span>
          </div>
          {primaError && (
            <p className="text-red-500 text-xs">
              {primaError instanceof Error && primaError.message.includes('No se encontraron planes para la edad') 
                ? primaError.message 
                : 'Error al obtener la prima del plan'}
            </p>
          )}
        </div> */}

        {/* Botón agregar */}
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button
            onClick={handleAddAfiliado}
            className="w-full h-10 bg-[#005BBB] hover:bg-[#003E7E]"
            disabled={loadingPrima}
          >
            {loadingPrima ? (
              <Spinner size="sm" color="white" className="mr-2" />
            ) : null}
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAfiliadoForm;
