import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function StatusFilter({
  value,
  onChange,
  options,
}: StatusFilterProps) {
  return (
    <div className="mb-6 flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[#6B7280]" />
        <Label htmlFor="statusFilter">Status:</Label>
      </div>
      <select
        id="statusFilter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE600] focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
