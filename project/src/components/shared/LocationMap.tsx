interface LocationMapProps {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Lichtgewicht kaart via een OpenStreetMap-embed: geen API-key, geen externe
 * library en geen SSR-problemen. Toont een marker op de opdrachtlocatie.
 */
export default function LocationMap({
  latitude,
  longitude,
  label,
}: LocationMapProps) {
  const delta = 0.004;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join("%2C");

  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const fullSrc = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
      <iframe
        title={label ?? "Kaart van de locatie"}
        src={embedSrc}
        className="w-full h-56"
        loading="lazy"
      />
      <a
        href={fullSrc}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm py-2 bg-[#F5F0E8] text-[#2C2C2C] hover:underline"
      >
        Grotere kaart openen
      </a>
    </div>
  );
}
