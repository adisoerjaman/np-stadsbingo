"use client";

import { X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { downloadSinglePhoto } from "@/lib/photoDownload";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
  downloadFilename?: string;
}

export default function ImageModal({
  imageUrl,
  onClose,
  title,
  downloadFilename,
}: ImageModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const filename = downloadFilename || `foto_${Date.now()}.jpg`;
      await downloadSinglePhoto(imageUrl, filename);
    } catch (error) {
      toast.error("Kon foto niet downloaden. Probeer het opnieuw.");
    } finally {
      setDownloading(false);
    }
  };
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: overlay sluit ook met Escape (zie useEffect)
    // biome-ignore lint/a11y/noStaticElementInteractions: decoratieve overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopt enkel klik-propagatie */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stopt enkel klik-propagatie */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action buttons */}
        <div className="absolute -top-12 right-0 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#FFE600] hover:bg-[#FFE600]/90 rounded-full p-2 transition-colors shadow-lg disabled:opacity-50"
            aria-label="Download foto"
            title="Download foto"
          >
            <Download className="h-6 w-6 text-[#2C2C2C]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
            aria-label="Sluiten"
          >
            <X className="h-6 w-6 text-[#2C2C2C]" />
          </button>
        </div>

        {/* Title */}
        {title && (
          <div className="absolute -top-12 left-0 bg-white rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm font-medium text-[#2C2C2C]">{title}</p>
          </div>
        )}

        {/* Image */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={imageUrl}
            alt="Afbeelding preview"
            className="w-full h-full object-contain max-h-[85vh]"
          />
        </div>

        {/* Helper text */}
        <p className="text-center text-white text-sm mt-4">
          Klik buiten de afbeelding of druk op ESC om te sluiten
        </p>
      </div>
    </div>
  );
}
