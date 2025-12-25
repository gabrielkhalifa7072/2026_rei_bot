import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DirectionFilterProps {
  value: "call" | "put" | "";
  onChange: (value: "call" | "put" | "") => void;
}

export function DirectionFilter({ value, onChange }: DirectionFilterProps) {
  const getLabel = () => {
    switch (value) {
      case "call":
        return "CALL (Alta)";
      case "put":
        return "PUT (Baixa)";
      default:
        return "Filtrar por direção";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800 w-full justify-between"
        >
          <span>{getLabel()}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700 w-56">
        <DropdownMenuItem
          onClick={() => onChange("")}
          className={`cursor-pointer ${
            value === "" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          Todas as direções
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange("call")}
          className={`cursor-pointer ${
            value === "call" ? "bg-green-500/20 text-green-400" : "text-slate-400"
          }`}
        >
          CALL (Alta)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange("put")}
          className={`cursor-pointer ${
            value === "put" ? "bg-red-500/20 text-red-400" : "text-slate-400"
          }`}
        >
          PUT (Baixa)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
