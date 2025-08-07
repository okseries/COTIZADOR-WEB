"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FiltrarClientFormValues,
  filtrarClientSchema,
} from "../schema/filtrar-client.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SelectSimple } from "@/components/shared/FormFieldSelectSimple";
import { usePlans, useSubPlansType } from "@/presentation/plans/hooks/usePlans";

const FilterClient = () => {

  const { data: plans } = usePlans();
  const { data: subPlans } = useSubPlansType();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FiltrarClientFormValues>({
    resolver: zodResolver(filtrarClientSchema),
    defaultValues: {
      tipoPoliza: "",
      subTipoPoliza: "",
      tipoDocumento: "",
      identificacion: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      {/* filtrar cliente */}
      <div className="grid grid-cols-5 gap-6  items-center  py-2">
        <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="tipoPoliza">
            {errors.tipoPoliza ? errors.tipoPoliza.message : "Tipo de poliza *"}
          </Label>
          <Controller
            name="tipoPoliza"
            control={control}
            render={({ field }) => (
              <SelectSimple
                {...field}
                id="tipoPoliza"
                placeholder="Selecciona tipo"
                options={
                  plans?.map((plan) => ({
                    label: plan.tipoPlanName,
                    value: String(plan.id),
                  })) || []
                }
                error={!!errors.tipoPoliza}
                className="mt-1 h-10"
              />
            )}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="subTipoPoliza">
            {errors.subTipoPoliza
              ? errors.subTipoPoliza.message
              : "Sub tipo de póliza *"}
          </Label>
          <Controller
            name="subTipoPoliza"
            control={control}
            render={({ field }) => (
              <SelectSimple
                {...field}
                id="subTipoPoliza"
                placeholder="Selecciona sub tipo"
                options={
                  subPlans?.map((plan) => ({
                    label: plan.nameCotizante,
                    value: String(plan.id),
                  })) || []
                }
                error={!!errors.subTipoPoliza}
                className="mt-1 h-10"
              />
            )}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="tipoDocumento">
            {errors.tipoDocumento
              ? errors.tipoDocumento.message
              : "Tipo documento *"}
          </Label>
          <Controller
            name="tipoDocumento"
            control={control}
            render={({ field }) => (
              <SelectSimple
                {...field}
                id="tipoDocumento"
                placeholder="Selecciona tipo doc."
                options={[
                  { label: "Cédula", value: "Cedula" },
                  { label: "Pasaporte", value: "Pasaporte" },
                  { label: "RNC", value: "Rnc" },
                ]}
                error={!!errors.tipoDocumento}
                className="mt-1 h-10"
              />
            )}
          />
        </div>

        <div className="space-y-2 mb-2 flex flex-col justify-center">
          <Label htmlFor="identificacion">
            {errors.identificacion
              ? errors.identificacion.message
              : "Identificación *"}
          </Label>
          <Controller
            name="identificacion"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="identificacion"
                placeholder="Identificación"
                className={`py-5 ${
                  errors.identificacion ? "border-red-500" : ""
                }`}
              />
            )}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          {/* Label invisible para mantener la altura */}
          <Label className="invisible">Buscar</Label>
          <Button
            type="submit"
            className="bg-[#005BBB] hover:bg-[#003E7E] text-white rounded-full h-10 w-10 flex items-center justify-center shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#005BBB] focus:ring-offset-2"
            aria-label="Buscar cliente"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FilterClient;
