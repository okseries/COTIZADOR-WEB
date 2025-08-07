import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { clienteSchema, ClienteFormValues } from '../../quotations/schema/quotatio-schema'
import useStepperStore from '../../quotations/store/useStepperStore'
import { mockAgents, mockClients, mockOffices, mockPlanTypes } from '../../quotations/ui/stepper/DataFicticio'

interface ClientInformationProps {
  onFormChange?: () => void;
}

export interface ClientInformationRef {
  saveToStore: () => void;
  validateAndSave: () => Promise<boolean>;
}

const ClientInformation = forwardRef<ClientInformationRef, ClientInformationProps>(
  ({ onFormChange }, ref) => {
  const { clientData, setClientData } = useStepperStore();
  
  // Estados para los popovers
  const [openClient, setOpenClient] = useState(false);
  const [openOffice, setOpenOffice] = useState(false);
  const [openAgent, setOpenAgent] = useState(false);
  const [openPlanType, setOpenPlanType] = useState(false);
  
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    mode: 'onChange',
    defaultValues: {
      clientChoosen: clientData.clientChoosen || 0,
      identification: clientData.identification || '',
      name: clientData.name || '',
      contact: clientData.contact || '',
      email: clientData.email || '',
      address: clientData.address || '',
      office: clientData.office || '',
      agent: clientData.agent || '',
      tipoPlan: clientData.tipoPlan || 0,
    }
  });

  // Auto-completar datos cuando se selecciona un cliente
  const handleClientSelect = React.useCallback((clientId: number) => {
    if (clientId > 0) {
      const client = mockClients.find(c => c.id === clientId);
      if (client) {
        form.setValue('identification', client.identification);
        form.setValue('name', client.name);
        form.setValue('contact', client.contact);
        form.setValue('email', client.email);
        form.setValue('address', client.address);
      }
    }
  }, [form]);

  // Función para guardar datos en el store
  const saveToStore = React.useCallback(() => {
    const formData = form.getValues();
    setClientData(formData);
  }, [form, setClientData]);

  // Función para validar y guardar
  const validateAndSave = React.useCallback(async () => {
    const isValid = await form.trigger();
    if (isValid) {
      saveToStore();
      return true;
    }
    return false;
  }, [form, saveToStore]);

  // Exponer las funciones a través de ref
  useImperativeHandle(ref, () => ({
    saveToStore,
    validateAndSave
  }), [saveToStore, validateAndSave]);

  return (
    <div>
      
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Seleccionar Cliente */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="clientChoosen"
                render={({ field }) => {
                  const selectedClient = mockClients.find(client => client.id === field.value);
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cliente Existente</FormLabel>
                      <Popover open={openClient} onOpenChange={setOpenClient}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openClient}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedClient
                                ? `${selectedClient.name} - ${selectedClient.identification}`
                                : "Seleccionar cliente existente..."
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                              <CommandGroup>
                                {mockClients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.name} ${client.identification}`}
                                    onSelect={() => {
                                      field.onChange(client.id);
                                      setOpenClient(false);
                                      handleClientSelect(client.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        client.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{client.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {client.identification}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Identificación */}
            <FormField
              control={form.control}
              name="identification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Número de identificación" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nombre completo del cliente" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contacto */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Contacto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Número de teléfono" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="correo@ejemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Dirección completa" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Oficina */}
            <FormField
              control={form.control}
              name="office"
              render={({ field }) => {
                const selectedOffice = mockOffices.find(office => office.name === field.value);
                
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Oficina</FormLabel>
                    <Popover open={openOffice} onOpenChange={setOpenOffice}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openOffice}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedOffice
                              ? selectedOffice.name
                              : "Seleccionar oficina..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar oficina..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron oficinas.</CommandEmpty>
                            <CommandGroup>
                              {mockOffices.map((office) => (
                                <CommandItem
                                  key={office.name}
                                  value={office.name}
                                  onSelect={() => {
                                    field.onChange(office.name);
                                    setOpenOffice(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      office.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span className="font-medium">{office.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Agente */}
            <FormField
              control={form.control}
              name="agent"
              render={({ field }) => {
                const selectedAgent = mockAgents.find(agent => agent.name === field.value);
                
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Agente</FormLabel>
                    <Popover open={openAgent} onOpenChange={setOpenAgent}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAgent}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedAgent
                              ? selectedAgent.name
                              : "Seleccionar agente..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar agente..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron agentes.</CommandEmpty>
                            <CommandGroup>
                              {mockAgents.map((agent) => (
                                <CommandItem
                                  key={agent.name}
                                  value={agent.name}
                                  onSelect={() => {
                                    field.onChange(agent.name);
                                    setOpenAgent(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      agent.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span className="font-medium">{agent.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Tipo de Plan */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="tipoPlan"
                render={({ field }) => {
                  const selectedPlanType = mockPlanTypes.find(planType => planType.id === field.value);
                  
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tipo de Plan</FormLabel>
                      <Popover open={openPlanType} onOpenChange={setOpenPlanType}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPlanType}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedPlanType
                                ? `${selectedPlanType.name} - ${selectedPlanType.description}`
                                : "Seleccionar tipo de plan..."
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar tipo de plan..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron tipos de plan.</CommandEmpty>
                              <CommandGroup>
                                {mockPlanTypes.map((planType) => (
                                  <CommandItem
                                    key={planType.id}
                                    value={`${planType.name} ${planType.description}`}
                                    onSelect={() => {
                                      field.onChange(planType.id);
                                      setOpenPlanType(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        planType.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{planType.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {planType.description}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

          </div>
        </Form>
    </div>
  )
});

ClientInformation.displayName = 'ClientInformation';

export default ClientInformation
