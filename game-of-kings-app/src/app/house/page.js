"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteNav from "../../components/SiteNav";
import { artifactCatalog } from "../../lib/artifacts";
import { getSessionUser, loadCloudRealm, saveCloudRealm } from "../../lib/realm-cloud";
import { applyRoyalAccountDefaults, getRoyalAccount, normalizeRulerTitle, PUBLIC_TITLES, ROYAL_TITLES, STORAGE_KEY } from "../../lib/realm-identity";
import { generatedSigilCategories } from "../../lib/sigil-manifest";

const sigilCategories = {
  Sigils: [],
};

const tinctures = [
  ["Iron Black", "#070807"], ["Night Charcoal", "#151716"], ["Aged Steel", "#68716f"], ["Muted Silver", "#b7b3a8"],
  ["Dim Parchment", "#a99d86"], ["Blood Red", "#5e1114"], ["Dried Maroon", "#3a0d12"], ["Deep Umber", "#4a3728"],
  ["Forest Shadow", "#153529"], ["Moss Green", "#46523a"], ["Sea Iron", "#183c42"], ["Storm Blue", "#263848"],
  ["Ash Violet", "#3c3346"], ["Old Bone", "#d1c7b5"], ["Soot Brown", "#241b16"], ["Candle Gold", "#8a6d3b"],
  ["Tarnished Brass", "#6f5a2f"], ["Oxidized Copper", "#315d55"], ["Dried Rose", "#6b2635"], ["Deep Plum", "#25182d"],
  ["Frost Grey", "#8d9693"], ["Smoke White", "#d8d2c4"], ["River Slate", "#273541"], ["Pine Black", "#101f19"],
];

const fieldLayouts = [
  ["plain", "Plain"], ["per-pale", "Split Vertical"], ["per-fess", "Split Horizontal"], ["quartered", "Quartered"],
  ["bend", "Diagonal"], ["bend-sinister", "Reverse Bend"], ["cross", "Iron Cross"], ["saltire", "Saltire"],
  ["chevron", "Chevron"], ["pale", "Center Pale"], ["fess", "Center Fess"], ["chief", "Chief"],
  ["base", "Base"], ["bordure", "Bordure"], ["orle", "Inner Orle"], ["gyronny", "Gyronny"],
];

const shieldShapes = [
  ["heater", "Heater"], ["kite", "Kite"], ["round", "Round"], ["banner", "Banner"], ["tower", "Tower"], ["royal", "Royal"], ["pointed", "Pointed"],
];

const defaultSigil = {
  color: "#070807",
  secondary: "#151716",
  accent: "#b7b3a8",
  border: "#68716f",
  glow: "#d8d2c4",
  field: "saltire",
  shield: "heater",
  layers: [],
};

function getFieldBackground(sigil) {
  const primary = sigil.color || defaultSigil.color;
  const secondary = sigil.secondary || defaultSigil.secondary;
  const accent = sigil.accent || defaultSigil.accent;
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

function createLayer(icon, layerIndex = 0, color = "#d8d2c4") {
  return {
    ...icon,
    id: `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    opacity: 1,
    color,
    layerIndex,
  };
}

function normalizeSigil(savedSigil = {}) {
  const oldLayers = Array.isArray(savedSigil.layers) ? savedSigil.layers : [];
  return {
    ...defaultSigil,
    ...savedSigil,
    layers: oldLayers
      .filter((layer) => layer.imageUrl)
      .map((layer, index) => ({
        id: layer.id || `saved-layer-${index}`,
        name: layer.name || "Decorative Element",
        category: layer.category || "Objects",
        imageUrl: layer.imageUrl,
        x: Number(layer.x ?? 50),
        y: Number(layer.y ?? 50),
        scale: Number(layer.scale ?? (layer.size ? layer.size / 58 : 1)),
        rotation: Number(layer.rotation ?? layer.rotate ?? 0),
        opacity: Number(layer.opacity ?? 1),
        color: layer.color || savedSigil.border || "#d8d2c4",
        layerIndex: Number(layer.layerIndex ?? index),
      })),
  };
}

export default function HouseFounderPage() {
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [rulerTitle, setRulerTitle] = useState("Lord");
  const [rulerName, setRulerName] = useState("");
  const [sigil, setSigil] = useState(defaultSigil);
  const [categories, setCategories] = useState(sigilCategories);
  const [selectedCategory, setSelectedCategory] = useState("Sigils");
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [artifactInventory, setArtifactInventory] = useState([]);
  const previewRef = useRef(null);
  const draggingRef = useRef(null);

  const background = useMemo(() => getFieldBackground(sigil), [sigil]);
  const layers = useMemo(() => [...(sigil.layers || [])].sort((a, b) => a.layerIndex - b.layerIndex), [sigil.layers]);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) || layers[0];
  const houseArtifacts = useMemo(() => artifactCatalog.filter((artifact) => artifactInventory.includes(artifact.name)), [artifactInventory]);

  useEffect(() => {
    setCategories({ ...sigilCategories, ...generatedSigilCategories });
    const firstIcon = generatedSigilCategories.Sigils?.[0] || Object.values(generatedSigilCategories).flat()[0];
    setSigil((current) => {
      if (current.layers?.length || !firstIcon) return current;
      const layer = createLayer(firstIcon, 0, current.border);
      setSelectedLayerId(layer.id);
      return { ...current, layers: [layer] };
    });
  }, []);

  useEffect(() => {
    getSessionUser().then(({ user }) => {
      const email = user?.email || "";
      setSessionEmail(email);
      if (!user) return;

      loadCloudRealm().then(({ realm }) => {
        if (!realm) return;
        const realmData = applyRoyalAccountDefaults(realm, email);
        const royalAccount = getRoyalAccount(email);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realmData));
        const normalized = normalizeSigil(realmData.houseSigil || {});
        setHouseName(realmData.houseName || "");
        setHouseMotto(realmData.houseMotto || "");
        setRulerTitle(normalizeRulerTitle(realmData.rulerTitle || "Lord", email));
        setRulerName(realmData.rulerName || (royalAccount ? royalAccount.rulerName : ""));
        setArtifactInventory(realmData.artifactInventory || []);
        setSigil(normalized);
        setSelectedLayerId(normalized.layers[0]?.id || "");
      });
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const normalized = normalizeSigil(data.houseSigil || {});
        setHouseName(data.houseName || "");
        setHouseMotto(data.houseMotto || "");
        setRulerTitle(normalizeRulerTitle(data.rulerTitle || "Lord", ""));
        setRulerName(data.rulerName || "");
        setArtifactInventory(data.artifactInventory || []);
        setSigil(normalized);
        setSelectedLayerId(normalized.layers[0]?.id || "");
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const nextRealm = {
      ...current,
      houseName: houseName.trim(),
      houseMotto: houseMotto.trim(),
      rulerTitle: normalizeRulerTitle(rulerTitle, sessionEmail),
      rulerName: rulerName.trim(),
      houseSigil: {
        ...sigil,
        name: selectedLayer?.name || "Custom Sigil",
        description: selectedLayer ? `A custom heraldic mark from ${selectedLayer.category}.` : "A custom heraldic mark.",
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    window.dispatchEvent(new Event("storage"));
  }, [hasLoaded, houseName, houseMotto, rulerName, rulerTitle, selectedLayer, sessionEmail, sigil]);

  async function saveHouse() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const safeTitle = normalizeRulerTitle(rulerTitle, sessionEmail);
    const nextRealm = {
      ...current,
      houseName: houseName.trim(),
      houseMotto: houseMotto.trim(),
      rulerTitle: safeTitle,
      rulerName: rulerName.trim(),
      houseSigil: { ...sigil, name: selectedLayer?.name || "Custom Sigil" },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRealm));
    const { error } = await saveCloudRealm(nextRealm);
    setRulerTitle(safeTitle);
    setSavedMessage(error?.includes("Not signed in") ? "House updated locally. Sign in on the Account page to update it to your account." : error || "House updated.");
  }

  function updateSigil(key, value) {
    setSigil((current) => ({ ...current, [key]: value }));
  }

  function updateSelectedLayer(values) {
    if (!selectedLayer) return;
    setSigil((current) => ({
      ...current,
      layers: current.layers.map((layer) => (layer.id === selectedLayer.id ? { ...layer, ...values } : layer)),
    }));
  }

  function addLayer(icon = categories[selectedCategory]?.[0]) {
    if (!icon) return;
    const nextLayer = createLayer(icon, layers.length, selectedLayer?.color || sigil.border);
    setSigil((current) => ({ ...current, layers: [...current.layers, nextLayer] }));
    setSelectedLayerId(nextLayer.id);
  }

  function duplicateLayer() {
    if (!selectedLayer) return;
    const nextLayer = {
      ...selectedLayer,
      id: `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      x: Math.min(92, selectedLayer.x + 5),
      y: Math.min(92, selectedLayer.y + 5),
      layerIndex: layers.length,
    };
    setSigil((current) => ({ ...current, layers: [...current.layers, nextLayer] }));
    setSelectedLayerId(nextLayer.id);
  }

  function deleteLayer() {
    if (!selectedLayer || layers.length <= 1) return;
    const nextLayers = layers.filter((layer) => layer.id !== selectedLayer.id).map((layer, index) => ({ ...layer, layerIndex: index }));
    setSigil((current) => ({ ...current, layers: nextLayers }));
    setSelectedLayerId(nextLayers[0]?.id || "");
  }

  function moveLayer(direction) {
    if (!selectedLayer) return;
    const ordered = layers.map((layer) => ({ ...layer }));
    const currentIndex = ordered.findIndex((layer) => layer.id === selectedLayer.id);
    const nextIndex = Math.max(0, Math.min(ordered.length - 1, currentIndex + direction));
    if (currentIndex === nextIndex) return;
    const [layer] = ordered.splice(currentIndex, 1);
    ordered.splice(nextIndex, 0, layer);
    setSigil((current) => ({ ...current, layers: ordered.map((item, index) => ({ ...item, layerIndex: index })) }));
  }

  function startDrag(event, layer) {
    event.preventDefault();
    setSelectedLayerId(layer.id);
    draggingRef.current = layer.id;
  }

  function dragLayer(event) {
    if (!draggingRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100));
    const id = draggingRef.current;
    setSigil((current) => ({
      ...current,
      layers: current.layers.map((layer) => (layer.id === id ? { ...layer, x, y } : layer)),
    }));
  }

  function stopDrag() {
    draggingRef.current = null;
  }

  function resizeLayer(event, layer) {
    event.preventDefault();
    setSelectedLayerId(layer.id);
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    const scale = Math.max(0.28, Math.min(2.6, (layer.scale || 1) + delta));
    setSigil((current) => ({
      ...current,
      layers: current.layers.map((item) => (item.id === layer.id ? { ...item, scale } : item)),
    }));
  }

  const categoryIcons = categories[selectedCategory] || [];

  return (
    <main className="gok-page min-h-screen overflow-x-hidden">
      <SiteNav />
      <section className="mx-auto max-w-[1800px] px-4 py-4">
        <div className="gok-panel mb-4 p-5">
          <p className="gok-eyebrow">House Founder</p>
          <div className="relative z-10 mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_1fr_1.4fr_auto] lg:items-end">
            <LabeledInput label="House Name" value={houseName} onChange={setHouseName} placeholder="Rider" />
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--gok-dim)]">
              Title
              <select value={rulerTitle} onChange={(event) => setRulerTitle(event.target.value)} className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-3 text-sm text-[var(--gok-silver)] outline-none">
                {(getRoyalAccount(sessionEmail) ? ROYAL_TITLES : PUBLIC_TITLES).map((title) => <option key={title}>{title}</option>)}
              </select>
            </label>
            <LabeledInput label="First Name" value={rulerName} onChange={setRulerName} placeholder="Timothy" />
            <LabeledInput label="House Words" value={houseMotto} onChange={setHouseMotto} placeholder="Loyalty Never Dies" />
            <button onClick={saveHouse} disabled={!houseName.trim() || !rulerName.trim()} className="gok-btn gok-btn-blood min-h-12 px-5 py-3 disabled:opacity-45">
              Update House
            </button>
          </div>
          {savedMessage && <p className="relative z-10 mt-3 text-sm font-bold text-[var(--gok-parchment)]">{savedMessage}</p>}
        </div>

        <div className="gok-panel overflow-hidden p-4">
          <div className="relative z-10 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="gok-eyebrow">Sigil Generator</p>
              <h1 className="mt-2 text-3xl uppercase tracking-[0.08em] text-[var(--gok-silver)]">Heraldry Workbench</h1>
            </div>
            <img src="/banners/House.png" alt="" className="h-24 max-w-full border border-[var(--gok-line)] object-cover opacity-80 lg:w-[760px]" />
          </div>

          <div className="relative z-10 grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)_420px] 2xl:grid-cols-[440px_minmax(0,1fr)_460px]">
            <section>
              <div
                ref={previewRef}
                onMouseMove={dragLayer}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                className="relative mx-auto aspect-[3/4] max-h-[64vh] min-h-[32rem] overflow-hidden border border-[var(--gok-line)] bg-black/35 p-4"
              >
                <div
                  className="absolute inset-6 border-[5px]"
                  style={{
                    background,
                    borderColor: sigil.border,
                    clipPath: getShieldClip(sigil.shield),
                    boxShadow: "inset 0 0 42px rgba(0,0,0,.78), 0 26px 60px rgba(0,0,0,.7)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.28))]" />
                  {layers.map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onMouseDown={(event) => startDrag(event, layer)}
                      onWheel={(event) => resizeLayer(event, layer)}
                      className={`absolute block cursor-grab active:cursor-grabbing ${selectedLayer?.id === layer.id ? "rounded-full outline outline-1 outline-[var(--gok-silver)]" : ""}`}
                      style={{
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        width: `${Math.round(96 * (layer.scale || 1))}px`,
                        height: `${Math.round(96 * (layer.scale || 1))}px`,
                        opacity: layer.opacity,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg)`,
                        zIndex: layer.layerIndex + 2,
                        filter: selectedLayer?.id === layer.id ? `drop-shadow(0 0 16px ${sigil.glow || defaultSigil.glow})` : undefined,
                      }}
                      title="Drag to move. Use the mouse wheel to resize."
                    >
                      <span
                        className="block h-full w-full"
                        style={{
                          backgroundColor: layer.color,
                          WebkitMask: `url(${layer.imageUrl}) center / contain no-repeat`,
                          mask: `url(${layer.imageUrl}) center / contain no-repeat`,
                          filter: "drop-shadow(0 8px 10px rgba(0,0,0,.82))",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 text-center">
                <h2 className="text-2xl text-[var(--gok-silver)]">House {houseName || "Unnamed"}</h2>
                <p className="text-sm text-[var(--gok-parchment)]">{rulerTitle} {rulerName || "Unnamed"}</p>
                <p className="text-sm text-[var(--gok-dim)]">&quot;{houseMotto || "Our Words"}&quot;</p>
              </div>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-2">
              <ToolBlock title="Shield Fields">
                <OptionGrid options={fieldLayouts} value={sigil.field} onChange={(value) => updateSigil("field", value)} />
              </ToolBlock>
              <ToolBlock title="Shield Shape">
                <OptionGrid options={shieldShapes} value={sigil.shield} onChange={(value) => updateSigil("shield", value)} />
              </ToolBlock>
              <ToolBlock title="Color Palette">
                <div className="grid gap-3">
                  <ColorPicker title="Primary Field" selected={sigil.color} onPick={(value) => updateSigil("color", value)} />
                  <ColorPicker title="Secondary Field" selected={sigil.secondary} onPick={(value) => updateSigil("secondary", value)} />
                  <ColorPicker title="Field Accent" selected={sigil.accent} onPick={(value) => updateSigil("accent", value)} />
                </div>
              </ToolBlock>
              <ToolBlock title="Selected Icon">
                <div className="grid gap-3">
                  <ColorPicker title="Icon Color" selected={selectedLayer?.color || sigil.border} onPick={(value) => updateSelectedLayer({ color: value })} />
                  <ColorPicker title="Outline / Glow" selected={sigil.glow || defaultSigil.glow} onPick={(value) => updateSigil("glow", value)} />
                </div>
              </ToolBlock>
            </section>

            <section className="grid min-h-0 gap-4">
              <ToolBlock title="Decorative Elements">
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="mb-3 min-h-11 w-full border border-[var(--gok-line)] bg-black/80 px-3 text-sm text-[var(--gok-silver)] outline-none">
                  {Object.keys(categories).map((category) => <option key={category}>{category}</option>)}
                </select>
                <div className="max-h-[34rem] overflow-y-auto border border-[var(--gok-line)] bg-black/35 p-2">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => addLayer(icon)}
                        className="grid aspect-[3/4] min-h-24 place-items-center overflow-hidden border border-[var(--gok-line)] bg-black/50 p-1 transition hover:border-[var(--gok-line-strong)]"
                        title={icon.name}
                      >
                        <img src={icon.previewUrl || icon.imageUrl} alt="" className="h-full w-full object-contain p-2 opacity-95" />
                      </button>
                    ))}
                  </div>
                </div>
              </ToolBlock>

              <ToolBlock title="Object Layers">
                <div className="max-h-48 overflow-y-auto border border-[var(--gok-line)] bg-black/35">
                  {layers.map((layer, index) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex w-full items-center justify-between border-b border-[rgba(196,193,184,0.1)] px-3 py-2 text-left text-xs font-black ${selectedLayer?.id === layer.id ? "bg-[rgba(196,193,184,0.14)] text-[var(--gok-silver)]" : "text-[var(--gok-dim)]"}`}
                    >
                      <span>{index + 1}. {layer.name}</span>
                      <span className="h-4 w-4 border border-black/50" style={{ backgroundColor: layer.color }} />
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <button onClick={() => addLayer()} className="gok-btn px-3 py-2 text-xs">Add New Layer</button>
                  <button onClick={duplicateLayer} className="gok-btn px-3 py-2 text-xs">Duplicate</button>
                  <button onClick={deleteLayer} className="gok-btn px-3 py-2 text-xs">Delete</button>
                  <button onClick={() => moveLayer(1)} className="gok-btn px-3 py-2 text-xs">Bring Forward</button>
                  <button onClick={() => moveLayer(-1)} className="gok-btn px-3 py-2 text-xs">Send Backward</button>
                </div>
              </ToolBlock>

              <div className="border border-[var(--gok-line)] bg-black/35 p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gok-dim)]">House Artifacts</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {houseArtifacts.length ? houseArtifacts.map((artifact) => (
                    <span key={artifact.name} className="border border-[var(--gok-line)] bg-black/45 px-3 py-2 text-xs font-black text-[var(--gok-silver)]">{artifact.name}</span>
                  )) : <span className="text-sm text-[var(--gok-dim)]">No relics in your house archive yet.</span>}
                </div>
                <Link href="/map" className="gok-btn mt-3 inline-flex px-4 py-2 text-xs">Go Claim A Castle</Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--gok-dim)]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 border border-[var(--gok-line)] bg-black/70 px-4 text-sm text-[var(--gok-silver)] outline-none focus:border-[var(--gok-line-strong)]" />
    </label>
  );
}

function ToolBlock({ title, children }) {
  return (
    <section className="min-w-0">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--gok-dim)]">{title}</p>
      {children}
    </section>
  );
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(5.4rem,1fr))] gap-2">
      {options.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`min-h-11 overflow-hidden border px-2 py-2 text-[0.68rem] font-bold leading-tight transition ${value === id ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)] text-[var(--gok-silver)]" : "border-[var(--gok-line)] bg-black/40 text-[var(--gok-dim)] hover:text-[var(--gok-silver)]"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ title, selected, onPick }) {
  return (
    <div>
      <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--gok-dim)]">{title}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(1.85rem,1fr))] gap-1.5">
        {tinctures.map(([name, color]) => (
          <button key={`${title}-${name}`} onClick={() => onPick(color)} className={`aspect-square min-h-7 border transition ${selected === color ? "border-[var(--gok-silver)]" : "border-[var(--gok-line)]"}`} style={{ backgroundColor: color }} title={name} aria-label={name} />
        ))}
      </div>
    </div>
  );
}
