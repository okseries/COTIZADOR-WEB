"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImprovedAgentSelector } from "@/components/improved/ImprovedAgentSelector";
import React, { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";

import { Label } from "@/components/ui/label";
import FilterClient from "./FilterClient";
import { SelectSimple } from "@/components/shared/FormFieldSelectSimple";
import { useDynamicSelectOptions } from "@/presentation/client/hooks/useDynamicSelectOptions";
import { useUnifiedQuotationStore } from "@/core";
import { clienteSchema } from "../schema/ClientInfo.schema";
import { Cliente } from "@/core/types";
import { useClientSearchAdapter } from "../hooks/useClientSearchAdapter";
import { usePlans, useSubPlansType } from "@/presentation/plans/hooks/usePlans";
import { formatPhone } from "../helpers/formatPhone";

// Tipo específico para el formulario que matchea exactamente con el esquema
interface FormClienteValues {
  clientChoosen: number;
  identification: string;
  name: string;
  contact?: string;
  email?: string;
  address: string;
  office: string;
  agent: string;
  agentId: number;
  tipoPlan: number;
}

interface ClientInformationProps {
  onFormChange?: () => void;
}

export interface ClientInformationRef {
  saveToStore: () => void;
  validateAndSave: () => Promise<boolean>;
}

const ClientInformation = forwardRef<
  ClientInformationRef,
  ClientInformationProps
>((_props, ref) => {
  // Obtener datos del store principal de cotización
  const {
    cliente,
    setCliente,
    filterData,
    setFilterData,
    agentOptions,
    setAgentOptions,
  } = useUnifiedQuotationStore();
  // Obtener datos de búsqueda del filtro (solo para tipo documento e identificación)
  const { searchData, clientData } = useClientSearchAdapter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    getValues,
    watch,
    setError,
    clearErrors,
  } = useForm<FormClienteValues>({
    resolver: zodResolver(clienteSchema),
    mode: "onChange", // Habilitar validación en tiempo real
    defaultValues: {
      clientChoosen: cliente?.clientChoosen || 0,
      identification: cliente?.identification || "",
      name: cliente?.name || "",
      contact: cliente?.contact || undefined,
      email: cliente?.email || undefined,
      address: cliente?.address || "",
      office: cliente?.office || "",
      agent: cliente?.agent || "",
      agentId: cliente?.agentId || 0,
      tipoPlan: cliente?.tipoPlan || 0,
    },
  });

  // Función para guardar datos en el store (memoizada para evitar ciclos)
  const saveToStore = React.useCallback(() => {
    const formData = getValues();
    // Limpiar campos opcionales vacíos antes de guardar
    const cleanedData = {
      ...formData,
      contact: formData.contact?.trim() || undefined,
      email: formData.email?.trim() || undefined,
    };
    setCliente(cleanedData);
  }, [getValues, setCliente]);

  // Efecto para resetear el formulario cuando cambien los datos del store
  React.useEffect(() => {
    if (cliente) {
      const nameToUse = clientData?.NOMBRE_COMPLETO || cliente.name;

      reset({
        clientChoosen: cliente.clientChoosen,
        identification: cliente.identification,
        name: nameToUse,
        contact: cliente.contact || undefined,
        email: cliente.email || undefined,
        address: cliente.address,
        office: cliente.office,
        agent: cliente.agent,
        agentId: cliente.agentId || 0,
        tipoPlan: cliente.tipoPlan,
      });
    }
  }, [cliente, reset, clientData]);

  // Efecto separado para resetear cuando se limpia el store
  React.useEffect(() => {
    if (!cliente) {
      reset({
        clientChoosen: 0,
        identification: "",
        name: "",
        contact: undefined,
        email: undefined,
        address: "",
        office: "",
        agent: "",
        agentId: 0,
        tipoPlan: 0,
      });
    }
  }, [cliente, reset]);

  // Efecto para llenar el formulario con datos de búsqueda (solo identificación)
  React.useEffect(() => {
    if (searchData) {
      setValue("identification", searchData.identificacion);

      if (
        !filterData ||
        filterData.tipoDocumento !== searchData.tipoDocumento ||
        filterData.identificacion !== searchData.identificacion
      ) {
        setFilterData({
          tipoDocumento: searchData.tipoDocumento,
          identificacion: searchData.identificacion,
        });
      }
    }
  }, [searchData, setValue, setFilterData, filterData]);

  // Efecto para llenar el nombre del cliente encontrado
  React.useEffect(() => {
    if (clientData?.NOMBRE_COMPLETO) {
      setValue("name", clientData.NOMBRE_COMPLETO);
      saveToStore(); // Llamar directamente sin setTimeout
    }
  }, [clientData, setValue, saveToStore]);

  const canal = watch("office");
  const { data: dynamicOptions = [] } = useDynamicSelectOptions(canal);
  const { data: plans } = usePlans();
  const { data: subPlans } = useSubPlansType();

  // Efecto para guardar las opciones de agente en el store
  React.useEffect(() => {
    if (
      dynamicOptions &&
      dynamicOptions.length > 0 &&
      JSON.stringify(agentOptions) !== JSON.stringify(dynamicOptions)
    ) {
      setAgentOptions(dynamicOptions);
    }
  }, [dynamicOptions, setAgentOptions, agentOptions]);

  // COMENTADO: Auto-save eliminado para evitar bucles infinitos
  // El guardado ahora se hace solo cuando es necesario (al cambiar de paso, etc.)
  /*
  React.useEffect(() => {
    const subscription = watch((_value, { name }) => {
      // Auto-save logic here
    });
    return () => subscription.unsubscribe();
  }, [watch]);
  */

  // Función para validar y guardar
  const validateAndSave = React.useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      saveToStore();
      return true;
    }
    return false;
  }, [trigger, saveToStore]);

  // Exponer las funciones al padre
  // ejemplo de uso: <ClientInformation ref={clientInfoRef} /> , lo cual sirve para que el componente padre pueda llamar a estas funciones
  // es decir el padre puede llamar a clientInfoRef.current.saveToStore() o clientInfoRef.current.validateAndSave() para validar y guardar
  useImperativeHandle(ref, () => ({
    saveToStore,
    validateAndSave,
  }));

  const onSubmit = (data: FormClienteValues) => {
    // Limpiar campos opcionales vacíos antes de guardar
    const cleanedData: Cliente = {
      ...data,
      contact: data.contact?.trim() || undefined,
      email: data.email?.trim() || undefined,
    };
    setCliente(cleanedData);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <FilterClient onClearForm={() => reset({
        clientChoosen: 0,
        identification: "",
        name: "",
        contact: undefined,
        email: undefined,
        address: "",
        office: "",
        agent: "",
        agentId: 0,
        tipoPlan: 0,
      })} />

      {/* Información del Cliente */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-4 lg:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 lg:space-y-4">
            {/* Información básica del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="Ingrese el nombre completo"
                      className={`h-11  ${clientData?.NOMBRE_COMPLETO ? " text-green-500" : ""} ${errors.name ? "border-red-500" : ""}`}
                      readOnly={!!clientData?.NOMBRE_COMPLETO}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Teléfono de contacto</Label>
                <Controller
                  name="contact"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="contact"
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted || undefined);
                        
                        // Validación en tiempo real solo si hay contenido
                        if (formatted && formatted.trim() !== "") {
                          const phoneWithoutFormat = formatted.replace(/\D/g, '');
                          
                          // Validar longitud (7-15 dígitos para teléfonos internacionales)
                          if (phoneWithoutFormat.length < 7 || phoneWithoutFormat.length > 15) {
                            setError('contact', {
                              type: 'manual',
                              message: 'El teléfono debe tener entre 7 y 15 dígitos'
                            });
                          } else {
                            clearErrors('contact');
                          }
                        } else {
                          clearErrors('contact');
                        }
                      }}
                      placeholder="Ejemplo: +1 555 123 4567 o (809) 555-1234"
                      className={`h-11 ${
                        errors.contact ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.contact && (
                  <p className="text-sm text-red-500">
                    {errors.contact.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="email"
                      {...field}
                      id="email"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value || undefined);
                      }}
                      placeholder="ejemplo@correo.com"
                      className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="address"
                      placeholder="Dirección completa"
                      className={`h-11 ${
                        errors.address ? "border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full border-[0.5px] border-border/30 my-3 lg:my-4"></div>

            {/* Tipo de póliza y sub tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoPlan">Tipo de póliza *</Label>
                <Controller
                  name="tipoPlan"
                  control={control}
                  render={({ field }) => (
                    <SelectSimple
                      {...field}
                      id="tipoPlan"
                      placeholder="Selecciona tipo de póliza"
                      value={String(field.value || "")}
                      onChange={(value) => field.onChange(Number(value))}
                      options={
                        plans?.map((plan) => ({
                          label: plan.tipoPlanName,
                          value: String(plan.id),
                        })) || []
                      }
                      error={!!errors.tipoPlan}
                      className="h-11"
                    />
                  )}
                />
                {errors.tipoPlan && (
                  <p className="text-sm text-red-500">
                    {errors.tipoPlan.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientChoosen">Sub tipo de póliza *</Label>
                <Controller
                  name="clientChoosen"
                  control={control}
                  render={({ field }) => (
                    <SelectSimple
                      {...field}
                      id="clientChoosen"
                      placeholder="Selecciona sub tipo"
                      value={String(field.value || "")}
                      onChange={(value) => field.onChange(Number(value))}
                      options={
                        subPlans?.map((plan) => ({
                          label: plan.nameCotizante,
                          value: String(plan.id),
                        })) || []
                      }
                      error={!!errors.clientChoosen}
                      className="h-11"
                    />
                  )}
                />
                {errors.clientChoosen && (
                  <p className="text-sm text-red-500">
                    {errors.clientChoosen.message}
                  </p>
                )}
              </div>
            </div>

            {/* Canal y Agente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 bg-red-500Z">
              <div className="space-y-2">
                <Label htmlFor="office">Canal *</Label>
                <Controller
                  name="office"
                  control={control}
                  render={({ field }) => (
                    <SelectSimple
                      {...field}
                      id="office"
                      placeholder="Selecciona el canal"
                      options={[
                        { label: "Sucursales", value: "Sucursales" },
                        { label: "Intermediarios", value: "Intermediarios" },
                        { label: "Negocios", value: "Negocios" },
                      ]}
                      error={!!errors.office}
                      className="h-11"
                    />
                  )}
                />
                {errors.office && (
                  <p className="text-sm text-red-500">
                    {errors.office.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentId">Agente *</Label>
                <Controller
                  name="agentId"
                  control={control}
                  render={({ field }) => (
                    <ImprovedAgentSelector
                      value={field.value || 0}
                      onValueChange={(agentId, agentName) => {
                        field.onChange(agentId);
                        setValue("agent", agentName);
                      }}
                      options={dynamicOptions.map(item => ({
                        id: item.id,
                        label: item.label,
                        subLabel: item.subLabel,
                        isActive: true
                      }))}
                      isLoading={false}
                      error={errors.agentId?.message}
                      placeholder="Seleccionar agente..."
                      required={true}
                    />
                  )}
                />
                
              </div>
            </div>

            {/* Campos ocultos */}
            {/*Estos campos son usados */}
            {/* por ejemplo para guardar el agente y la identificación en el store, aunque no se muestren en el formulario */}
            {/* son importantes para el store */}
            <div className="hidden">
              <Controller
                name="agent"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name="identification"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

ClientInformation.displayName = "ClientInformation";

export default ClientInformation;
