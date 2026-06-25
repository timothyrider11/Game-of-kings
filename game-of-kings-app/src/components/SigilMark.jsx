"use client";

function getSigilFieldBackground(sigil = {}) {
  const primary = sigil.color || "#5e1114";
  const secondary = sigil.secondary || "#070807";
  const accent = sigil.accent || "#b7b3a8";

  return {
    plain: primary,
    "per-pale": `linear-gradient(90deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    "per-fess": `linear-gradient(180deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    quartered: `linear-gradient(90deg, transparent 0 50%, rgba(0,0,0,0.001) 50%), linear-gradient(180deg, ${primary} 0 50%, ${secondary} 50% 100%)`,
    bend: `linear-gradient(135deg, transparent 0 39%, ${accent} 39% 50%, transparent 50% 100%), ${primary}`,
    "bend-sinister": `linear-gradient(45deg, transparent 0 39%, ${accent} 39% 50%, transparent 50% 100%), ${primary}`,
    cross: `linear-gradient(90deg, transparent 0 42%, ${accent} 42% 58%, transparent 58%), linear-gradient(180deg, transparent 0 42%, ${accent} 42% 58%, transparent 58%), ${primary}`,
    saltire: `linear-gradient(45deg, transparent 0 43%, ${accent} 43% 55%, transparent 55%), linear-gradient(135deg, transparent 0 43%, ${accent} 43% 55%, transparent 55%), ${primary}`,
    chevron: `linear-gradient(135deg, transparent 0 41%, ${accent} 41% 52%, transparent 52%), linear-gradient(45deg, transparent 0 41%, ${accent} 41% 52%, transparent 52%), ${primary}`,
    pale: `linear-gradient(90deg, ${primary} 0 36%, ${accent} 36% 64%, ${primary} 64% 100%)`,
    fess: `linear-gradient(180deg, ${primary} 0 37%, ${accent} 37% 63%, ${primary} 63% 100%)`,
    chief: `linear-gradient(180deg, ${accent} 0 30%, ${primary} 30% 100%)`,
    base: `linear-gradient(180deg, ${primary} 0 70%, ${accent} 70% 100%)`,
    bordure: `radial-gradient(closest-side, ${primary} 72%, transparent 73%), ${accent}`,
    orle: `radial-gradient(closest-side, ${primary} 60%, transparent 61% 67%, ${primary} 68%), ${accent}`,
    gyronny: `conic-gradient(from 45deg, ${primary} 0 12.5%, ${secondary} 12.5% 25%, ${primary} 25% 37.5%, ${secondary} 37.5% 50%, ${primary} 50% 62.5%, ${secondary} 62.5% 75%, ${primary} 75% 87.5%, ${secondary} 87.5% 100%)`,
  }[sigil.field] || primary;
}

function getShieldClip(shape) {
  return {
    heater: "polygon(50% 0, 94% 11%, 88% 72%, 50% 100%, 12% 72%, 6% 11%)",
    kite: "polygon(50% 0, 95% 10%, 82% 66%, 50% 100%, 18% 66%, 5% 10%)",
    round: "ellipse(44% 48% at 50% 45%)",
    banner: "polygon(8% 0, 92% 0, 92% 100%, 50% 82%, 8% 100%)",
    tower: "polygon(8% 8%, 18% 8%, 18% 0, 32% 0, 32% 8%, 44% 8%, 44% 0, 56% 0, 56% 8%, 68% 8%, 68% 0, 82% 0, 82% 8%, 92% 8%, 92% 100%, 8% 100%)",
    royal: "polygon(50% 0, 90% 8%, 96% 28%, 88% 76%, 50% 100%, 12% 76%, 4% 28%, 10% 8%)",
    pointed: "polygon(50% 0, 97% 18%, 80% 82%, 50% 100%, 20% 82%, 3% 18%)",
  }[shape] || "polygon(50% 0, 94% 11%, 88% 72%, 50% 100%, 12% 72%, 6% 11%)";
}

function normalizeLayer(layer = {}, index) {
  const scale = Number(layer.scale ?? (layer.size ? layer.size / 58 : 1));
  return {
    id: layer.id || `sigil-layer-${index}`,
    imageUrl: layer.imageUrl || "",
    charge: layer.charge || "",
    color: layer.color || "#d8d2c4",
    x: Number(layer.x ?? 50),
    y: Number(layer.y ?? 50),
    width: Number(layer.width ?? 58 * scale),
    opacity: Number(layer.opacity ?? 1),
    rotation: Number(layer.rotation ?? layer.rotate ?? 0),
    stretch: Number(layer.stretch ?? 100),
    layerIndex: Number(layer.layerIndex ?? index),
  };
}

function fallbackLayers(label) {
  return [{
    id: "fallback",
    color: "#b7b3a8",
    x: 50,
    y: 52,
    width: 54,
    opacity: 0.92,
    rotation: 0,
    stretch: 100,
    fallback: label.slice(0, 1).toUpperCase(),
  }];
}

export default function SigilMark({ sigil = {}, label = "House sigil", className = "", showBorder = true }) {
  const layers = (sigil.layers?.length ? sigil.layers : fallbackLayers(label))
    .map(normalizeLayer)
    .sort((a, b) => a.layerIndex - b.layerIndex);

  return (
    <div className={`relative h-full w-full ${className}`} aria-label={label}>
      <div
        className={`absolute inset-0 ${showBorder ? "border-2" : ""}`}
        style={{
          background: getSigilFieldBackground(sigil),
          borderColor: sigil.border || "#8a6d3b",
          clipPath: getShieldClip(sigil.shield),
          boxShadow: "inset 0 0 18px rgba(0,0,0,.72)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.32))]" />
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="absolute aspect-square"
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              width: `${layer.width}%`,
              opacity: layer.opacity > 1 ? layer.opacity / 100 : layer.opacity,
              transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scaleX(${layer.stretch / 100})`,
              zIndex: layer.layerIndex + 2,
            }}
          >
            {layer.imageUrl ? (
              <span
                aria-hidden="true"
                className="block h-full w-full"
                style={{
                  backgroundColor: layer.color,
                  WebkitMask: `url(${layer.imageUrl}) center / contain no-repeat`,
                  mask: `url(${layer.imageUrl}) center / contain no-repeat`,
                  filter: "drop-shadow(0 7px 8px rgba(0,0,0,.72))",
                }}
              />
            ) : (
              <span className="grid h-full w-full place-items-center font-serif text-4xl font-black" style={{ color: layer.color }}>
                {layer.fallback || sigil.initial || label.slice(0, 1)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

