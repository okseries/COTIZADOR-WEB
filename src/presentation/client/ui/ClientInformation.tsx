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
    mode: "onSubmit", // Cambiar de onChange a onSubmit para evitar revalidaciones constantes
    reValidateMode: "onSubmit", // Solo revalidar en submit
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

  // Estados locales para los campos problemáticos (email y teléfono)
  const [localContact, setLocalContact] = React.useState<string>("");
  const [localEmail, setLocalEmail] = React.useState<string>("");
  const [emailError, setEmailError] = React.useState<string>("");
  const [phoneError, setPhoneError] = React.useState<string>("");

  // Función para validar email
  const validateEmail = React.useCallback((email: string) => {
    if (!email || email.trim() === "") {
      setEmailError("");
      return true; // Email vacío es válido (opcional)
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Debe ser un email válido");
      return false;
    }
    
    setEmailError("");
    return true;
  }, []);

  // Función para validar teléfono
  const validatePhone = React.useCallback((phone: string) => {
    if (!phone || phone.trim() === "") {
      setPhoneError("");
      return true; // Teléfono vacío es válido (opcional)
    }
    
    const digits = phone.replace(/\D/g, "");
    
    // Validar longitud mínima y máxima
    if (digits.length < 10) {
      setPhoneError("El teléfono debe tener al menos 10 dígitos");
      return false;
    }
    
    if (digits.length > 15) {
      setPhoneError("El teléfono no puede tener más de 15 dígitos");
      return false;
    }
    
    // Validar formato dominicano específico
    if (digits.length === 10) {
      if (!digits.startsWith("809") && !digits.startsWith("829") && !digits.startsWith("849")) {
        setPhoneError("Número dominicano debe empezar con 809, 829 o 849");
        return false;
      }
    }
    
    setPhoneError("");
    return true;
  }, []);

  // Función para guardar datos en el store (memoizada para evitar ciclos)
  const saveToStore = React.useCallback(() => {
    const formData = getValues();
    // Usar los estados locales para email y teléfono en lugar de los datos del formulario
    const cleanedData = {
      ...formData,
      contact: localContact?.trim() || undefined,
      email: localEmail?.trim() || undefined,
    };
    
    console.log('💾 [ClientInformation] Saving to store:', {
      original: formData,
      cleaned: cleanedData,
      localContact,
      localEmail
    });
    
    setCliente(cleanedData);
  }, [getValues, setCliente, localContact, localEmail]);

  // Estado para controlar si el formulario fue inicializado
  const [isFormInitialized, setIsFormInitialized] = React.useState(false);

  // Efecto para resetear el formulario cuando cambien los datos del store SOLO al cargar inicial
  React.useEffect(() => {
    console.log('🔄 [ClientInformation] Effect - cliente reset:', {
      hasCliente: !!cliente,
      isFormInitialized,
      clienteContact: cliente?.contact,
      clienteEmail: cliente?.email,
      clientDataName: clientData?.NOMBRE_COMPLETO
    });
    
    if (cliente && !isFormInitialized) {
      console.log('✅ [ClientInformation] Resetting form with cliente data:', {
        contact: cliente.contact,
        email: cliente.email
      });
      
      const nameToUse = clientData?.NOMBRE_COMPLETO || cliente.name;

      // Inicializar estados locales
      setLocalContact(cliente.contact || "");
      setLocalEmail(cliente.email || "");
      setEmailError(""); // Limpiar cualquier error al cargar datos válidos
      setPhoneError(""); // Limpiar cualquier error de teléfono

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
      setIsFormInitialized(true);
    }
  }, [cliente, reset, clientData, isFormInitialized]);

  // Efecto separado para resetear cuando se limpia el store
  React.useEffect(() => {
    console.log('🧹 [ClientInformation] Effect - clear form:', {
      hasCliente: !!cliente
    });
    
    if (!cliente) {
      console.log('🧹 [ClientInformation] Clearing form - no cliente');
      
      // Limpiar estados locales
      setLocalContact("");
      setLocalEmail("");
      setEmailError(""); // Limpiar error de email
      setPhoneError(""); // Limpiar error de teléfono
      
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
      setIsFormInitialized(false); // Permitir re-inicialización cuando se limpia
      setProcessedClientData(null); // Resetear el estado de clientData procesado
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

  // Estado para rastrear si ya se procesó el clientData
  const [processedClientData, setProcessedClientData] = React.useState<string | null>(null);

  // Efecto para llenar el nombre del cliente encontrado
  React.useEffect(() => {
    console.log('👤 [ClientInformation] Client found effect:', {
      hasClientData: !!clientData?.NOMBRE_COMPLETO,
      clientDataName: clientData?.NOMBRE_COMPLETO,
      processedClientData,
      isNewClientData: clientData?.NOMBRE_COMPLETO !== processedClientData
    });
    
    if (clientData?.NOMBRE_COMPLETO && clientData.NOMBRE_COMPLETO !== processedClientData) {
      console.log('👤 [ClientInformation] NEW client data - Setting name and saving to store');
      setValue("name", clientData.NOMBRE_COMPLETO);
      setProcessedClientData(clientData.NOMBRE_COMPLETO);
      saveToStore(); // Llamar directamente sin setTimeout
    }
  }, [clientData, setValue, saveToStore, processedClientData]);

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
    // Usar los estados locales para email y teléfono
    const cleanedData: Cliente = {
      ...data,
      contact: localContact?.trim() || undefined,
      email: localEmail?.trim() || undefined,
    };
    setCliente(cleanedData);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <FilterClient onClearForm={() => {
        console.log('🧹 [ClientInformation] Manual clear form triggered');
        
        // Limpiar estados locales
        setLocalContact("");
        setLocalEmail("");
        setEmailError(""); // Limpiar error de email
        setPhoneError(""); // Limpiar error de teléfono
        
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
        setIsFormInitialized(false); // Permitir re-inicialización después de limpiar
        setProcessedClientData(null); // Resetear el estado de clientData procesado
      }} />

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
                <Input
                  id="contact"
                  value={localContact}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    
                    console.log('📞 [Contact Field] onChange:', {
                      inputValue,
                      currentLocalContact: localContact,
                      isEmpty: inputValue === ""
                    });
                    
                    // Si el input está vacío, limpiar el campo
                    if (inputValue === "") {
                      console.log('📞 [Contact Field] Clearing local state');
                      setLocalContact("");
                      setPhoneError("");
                      return;
                    }
                    
                    // Verificar longitud máxima antes del formateo
                    const digits = inputValue.replace(/\D/g, "");
                    if (digits.length > 15) {
                      setPhoneError("El teléfono no puede tener más de 15 dígitos");
                      return; // No actualizar el estado si excede el límite
                    }
                    
                    const formatted = formatPhone(inputValue);
                    console.log('📞 [Contact Field] Formatted:', formatted);
                    setLocalContact(formatted || "");
                    validatePhone(formatted || "");
                    
                    // Actualizar el store con el nuevo teléfono
                    const formData = getValues();
                    const cleanedData = {
                      ...formData,
                      contact: formatted?.trim() || undefined,
                      email: localEmail?.trim() || undefined,
                    };
                    setCliente(cleanedData);
                  }}
                  placeholder="Ejemplo: +1 555 123 4567 o (809) 555-1234"
                  className={`h-11 ${phoneError ? 'border-red-500' : ''}`}
                />
                {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  value={localEmail}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    console.log('📧 [Email Field] onChange:', {
                      inputValue: value,
                      currentLocalEmail: localEmail,
                      isEmpty: value === ""
                    });
                    
                    setLocalEmail(value);
                    validateEmail(value);
                    
                    // Actualizar el store con el nuevo email
                    const formData = getValues();
                    const cleanedData = {
                      ...formData,
                      email: value?.trim() || undefined,
                      contact: localContact?.trim() || undefined,
                    };
                    setCliente(cleanedData);
                  }}
                  placeholder="ejemplo@correo.com"
                  className={`h-11 ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
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
