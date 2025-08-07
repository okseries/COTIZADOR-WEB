import { Button } from '@/components/ui/button'
import React from 'react'

interface Props {
  onCreateNew: () => void
}

const NewQuotation = ({ onCreateNew }: Props) => {
  return (
    <Button onClick={onCreateNew} variant="default" className="whitespace-nowrap bg-[#005BBB] hover:bg-[#003E7E]">
      Crear nueva cotización
    </Button>
  )
}

export default NewQuotation


