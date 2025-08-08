import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../ui/command'
import { Command } from '../ui/command'
import { useState } from 'react'

/**
 * Reusable select field for react-hook-form
 */

import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

type FormFieldSelectProps<TOption, TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  label: string;
  options: TOption[];
  getOptionLabel?: (opt: TOption) => string;
  getOptionValue?: (opt: TOption) => string | number;
  renderOption?: (opt: TOption) => React.ReactNode;
  placeholder?: string;
  onChange?: (value: string | number) => void;
};

function FormFieldSelect<TOption, TForm extends FieldValues = FieldValues>({
  form,
  name,
  label,
  options = [],
  getOptionLabel = (opt: TOption) => (opt as unknown as { name: string }).name,
  getOptionValue = (opt: TOption) => (opt as unknown as { id: string | number }).id,
  renderOption,
  placeholder = 'Seleccionar...',
  onChange
}: FormFieldSelectProps<TOption, TForm>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Find selected option - moved inside render to avoid subscription issues
        const selectedOption = options.find(opt => getOptionValue(opt) === field.value);
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {selectedOption
                      ? getOptionLabel(selectedOption)
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={`Buscar...`} />
                  <CommandList>
                    <CommandEmpty>No se encontraron opciones.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option, index) => {
                        const optionValue = getOptionValue(option);
                        const optionLabel = getOptionLabel(option);
                        return (
                          <CommandItem
                            key={`${optionValue}-${index}`}
                            value={optionLabel}
                            onSelect={() => {
                              field.onChange(optionValue);
                              setOpen(false);
                              onChange?.(optionValue);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                optionValue === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {renderOption
                              ? renderOption(option)
                              : <div className="flex flex-col">
                                  <span className="font-medium">{optionLabel}</span>
                                </div>
                            }
                          </CommandItem>
                        );
                      })}
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
  )
}

export default FormFieldSelect
