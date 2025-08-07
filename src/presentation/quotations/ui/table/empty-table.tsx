import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FileSearch, PlusCircle } from "lucide-react";
import NewQuotation from "./new-quotation";

interface Props {
    onCreateNew: () => void;
}

export default function EmptyState({ onCreateNew }: Props) {
  return (
    <div className="h-full flex flex-col">
      <Card className="shadow-lg border-0 bg-white flex-1 flex flex-col">
        <CardContent className="flex flex-col items-center justify-center py-20 flex-1">
          <div className="p-4 bg-muted/20 rounded-full mb-6">
            <FileSearch className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl mb-2 text-center text-foreground">
            No se encontraron cotizaciones
          </CardTitle>
          <CardDescription className="mb-8 text-center max-w-md">
            Parece que aún no has creado ninguna cotización. Comienza creando tu
            primera cotización.
          </CardDescription>
          <NewQuotation onCreateNew={onCreateNew} />
        </CardContent>
      </Card>
    </div>
  );
}