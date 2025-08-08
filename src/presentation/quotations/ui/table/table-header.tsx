import { Badge } from '@/components/ui/badge'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TextQuote } from 'lucide-react'
import React from 'react'
import NewQuotation from './new-quotation'

interface Props {
    quantity?: number;
    onCreateNew: () => void
}

const QuotationTableHeader = ({ quantity, onCreateNew }: Props) => {
  return (
   <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div className="flex flex-row items-center gap-4">
    <div className="flex-shrink-0">
      <div className="p-3 bg-primary/10 rounded-xl">
        <TextQuote size={28} className="text-[#008080]" />
      </div>
    </div>
    <div className="flex-1">
      <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#005BBB]">
        Cotizaciones Recientes
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 font-semibold"
        >
          {quantity ?? 0}
        </Badge>
      </CardTitle>
      <CardDescription className="text-[#FFA500] mt-1">
        Aquí puedes ver y gestionar todas tus cotizaciones guardadas.
      </CardDescription>
    </div>
  </div>

  <div>
    <NewQuotation onCreateNew={onCreateNew} />
  </div>
</CardHeader>
  )
}

export default QuotationTableHeader

