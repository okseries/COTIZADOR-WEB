import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextQuote } from "lucide-react";
import React from "react";
import NewQuotation from "./new-quotation";

interface Props {
  quantity?: number;
  onCreateNew: () => void;
}

const QuotationTableHeader = ({ quantity, onCreateNew }: Props) => {
  return (
    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 sm:px-0">
      <div className="flex flex-row items-start sm:items-center gap-3 w-full">
        <div className="flex-shrink-0">
          <div className="p-2 sm:p-3 bg-[#009590]/10 rounded-xl">
            <TextQuote size={24} className="text-[#008080]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[#003E7E] truncate">
            <span className="truncate">Cotizaciones Recientes</span>
            <Badge
              variant="secondary"
              className="bg-[#009590]/10 text-[#009590] border-[#009590]/20 font-semibold text-xs px-2 py-0.5 ml-2"
            >
              {quantity ?? 0}
            </Badge>
          </CardTitle>
          <CardDescription className="text-[#009590] mt-1 text-sm truncate">
            Aquí puedes ver y gestionar todas tus cotizaciones guardadas.
          </CardDescription>
        </div>
      </div>

      <div className="w-full sm:w-auto sm:flex-shrink-0">
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <NewQuotation onCreateNew={onCreateNew} />
        </div>
      </div>
    </CardHeader>
  );
};

export default QuotationTableHeader;
