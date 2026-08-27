"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "password";
  confirmText?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export default function PromptModal({
  isOpen,
  title,
  label,
  placeholder,
  inputType = "text",
  confirmText = "Opslaan",
  onClose,
  onSubmit,
}: PromptModalProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      // Focus de input bij openen (toegankelijke vervanging van autoFocus).
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#2C2C2C]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
          }}
          className="p-6"
        >
          {label && (
            <label
              htmlFor="prompt-modal-input"
              className="block text-sm font-medium text-[#2C2C2C] mb-2"
            >
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id="prompt-modal-input"
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full border rounded-lg px-3 py-2 mb-6"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-11"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={!value.trim()}
            >
              {confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
