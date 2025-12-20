"use client";

export default function ProfileScore({ place }) {
  if (!place) return null;

  const hasComponent = (type) =>
    place.addressComponents?.some(c => c.types.includes(type));

  let score = 0;
  const breakdown = [];

  // Core Identity (20)
  let core = 0;
  if (place.id) core += 10;
  if (place.displayName?.text) core += 10;
  score += core;
  breakdown.push({ label: "Core Identity", value: core });

  // Address (20)
  let address = 0;
  if (hasComponent("locality")) address += 5;
  if (hasComponent("administrative_area_level_1")) address += 5;
  if (hasComponent("country")) address += 5;
  if (hasComponent("postal_code")) address += 5;
  score += address;
  breakdown.push({ label: "Address Completeness", value: address });

  // Geo (15)
  let geo = 0;
  if (place.location?.latitude && place.location?.longitude) geo += 10;
  if (place.viewport?.low && place.viewport?.high) geo += 5;
  score += geo;
  breakdown.push({ label: "Geo Accuracy", value: geo });

  // Types (10)
  let types = 0;
  if (place.types?.length) types += 5;
  if (place.types?.includes("locality")) types += 5;
  score += types;
  breakdown.push({ label: "Business Type", value: types });

  // Photos (20)
  let photos = 0;
  if (place.photos?.length >= 1) photos += 10;
  if (place.photos?.length >= 3) photos += 5;
  if (place.photos?.some(p => p.authorAttributions?.length)) photos += 5;
  score += photos;
  breakdown.push({ label: "Photos & Visuals", value: photos });

  // Maps (10)
  let maps = place.googleMapsUri ? 10 : 0;
  score += maps;
  breakdown.push({ label: "Maps Visibility", value: maps });

  // Extra (5)
  let extra = 0;
  if (place.utcOffsetMinutes) extra += 2;
  if (place.shortFormattedAddress) extra += 3;
  score += extra;
  breakdown.push({ label: "Extra Signals", value: extra });

  return (
    <div className="mt-6 p-6 bg-white border rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">Profile Score</h3>

      {/* SCORE */}
      <div className="mb-4">
        <div className="text-4xl font-extrabold text-green-600">
          {score}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* BREAKDOWN */}
      <div className="space-y-2 text-sm">
        {breakdown.map((b, i) => (
          <div key={i} className="flex justify-between">
            <span>{b.label}</span>
            <span className="font-semibold">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
