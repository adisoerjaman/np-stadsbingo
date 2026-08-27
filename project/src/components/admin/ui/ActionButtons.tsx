import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onAdd: () => void;
  onCancel: () => void;
  showCancel: boolean;
  addLabel: string;
}

export default function ActionButtons({
  onAdd,
  onCancel,
  showCancel,
  addLabel,
}: ActionButtonsProps) {
  return (
    <div className="mb-6 flex gap-4">
      <Button
        onClick={onAdd}
        className="bg-[#FFE600] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FFE600]"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>
      {showCancel && (
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Annuleren
        </Button>
      )}
    </div>
  );
}
