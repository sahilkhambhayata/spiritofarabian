import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock, Droplets, Layers, ShoppingBag, Sparkles } from "lucide-react";
import { PRODUCTS, type Product, type ProductSize } from "../data";
import { EASE, Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";
import BottleScene from "./BottleScene";

function Intensity({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Sillage intensity ${level} of 5`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold/70">Sillage</span>
      <span className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i < level ? "w-5 bg-gradient-to-r from-gold to-gold-2 shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "w-2.5 bg-cream/15"
            )}
          />
        ))}
      </span>
    </div>
  );
}

export default function Collection({
  onAdd,
}: {
  onAdd: (product: Product, selectedSize: ProductSize) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"notes" | "sillage" | "layering">("notes");
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1); // default 12ml
  const [addedAnimation, setAddedAnimation] = useState(false);

  const p = PRODUCTS[idx];
  const currentSize = p.sizes[selectedSizeIndex] || p.sizes[0];

  const go = (n: number) => {
    setIdx((n + PRODUCTS.length) % PRODUCTS.length);
    setSelectedSizeIndex(1);
  };
  const step = (d: number) => {
    setIdx((i) => (i + d + PRODUCTS.length) % PRODUCTS.length);
    setSelectedSizeIndex(1);
  };

  const handleAdd = () => {
    onAdd(p, currentSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <section
      id="collection"
      className="relative overflow-hidden py-24 sm:py-32"
      aria-label="The attar collection"
    >
      {/* Ambient Radial Hue Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(1000px 600px at 30% 50%, ${p.hue}18, transparent 75%)`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHead
          eyebrow="Maison Extraits Portfolio"
          title={
            <>
              Rare Botanical Oils. <em className="gold-text font-semibold italic">Immortal Sillage.</em>
            </>
          }
          copy="Four distinct olfactory architectures, each hydro-distilled in pure copper stills over twelve weeks. 100% lipid-bound fragrance that evolves uniquely with your body heat."
        />

        <div className="mt-14 grid items-center gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: 3D Bottle View & Thumbnails */}
          <div className="lg:col-span-6">
            <Reveal className="relative">
              <div className="relative aspect-square w-full sm:aspect-[4/3] lg:aspect-square rounded-3xl border border-gold/20 bg-gradient-to-b from-panel/30 to-ink-2/60 p-4 shadow-2xl backdrop-blur-md overflow-hidden">
                {/* 3D Bottle canvas with smooth transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="absolute inset-0 z-10"
                  >
                    <BottleScene
                      oilColor={p.hue}
                      className="h-full w-full cursor-grab active:cursor-grabbing"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badge Tag */}
                {p.badge && (
                  <div className="absolute left-6 top-6 z-30 flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-gold-light backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                    <Sparkles className="h-3 w-3 text-gold" />
                    {p.badge}
                  </div>
                )}

                <div className="absolute bottom-5 left-6 z-30">
                  <span className="rounded-full bg-ink/70 border border-gold/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-sand/70 backdrop-blur-sm">
                    {p.family}
                  </span>
                </div>

                {/* Arrow Controls */}
                <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3">
                  {([-1, 1] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => step(d)}
                      className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-ink/80 text-sand hover:border-gold hover:text-gold transition-all shadow-lg backdrop-blur-sm"
                      aria-label={d === 1 ? "Next fragrance" : "Previous fragrance"}
                    >
                      {d === 1 ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnails to switch scents */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {PRODUCTS.map((pr, i) => (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => go(i)}
                    className={cn(
                      "group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition-all duration-500",
                      i === idx
                        ? "border-gold scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        : "border-gold/15 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={pr.image}
                      alt={pr.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-cream truncate">
                        {pr.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Scent Details, Notes, Sizes & Add To Cart */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="space-y-6"
              >
                <div>
                  <p className="eyebrow">{p.tagline}</p>
                  <h3 className="font-display mt-1 text-4xl sm:text-5xl font-medium leading-[1.05] text-cream">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
                    {p.accent}
                  </p>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-sand">
                    {p.description}
                  </p>
                </div>

                {/* Tab Navigation for Notes / Sillage / Layering */}
                <div className="flex border-b border-gold/15 gap-2">
                  {[
                    { id: "notes", label: "Fragrance Pyramid", icon: Droplets },
                    { id: "sillage", label: "Longevity & Aura", icon: Clock },
                    { id: "layering", label: "Artisanal Layering", icon: Layers },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "relative flex items-center gap-1.5 pb-3 pt-1 text-xs font-bold tracking-wider uppercase transition-colors",
                        activeTab === tab.id
                          ? "text-gold-light"
                          : "text-sand/50 hover:text-cream"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="active-collection-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-2"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[140px]">
                  {activeTab === "notes" && (
                    <div className="space-y-3.5">
                      {[
                        { label: "Top Notes", list: p.notes.top },
                        { label: "Heart Notes", list: p.notes.heart },
                        { label: "Base Notes", list: p.notes.base },
                      ].map((section) => (
                        <div key={section.label} className="flex items-start gap-3">
                          <span className="w-24 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-wider text-gold/70">
                            {section.label}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {section.list.map((n) => (
                              <span
                                key={n.name}
                                title={n.desc}
                                className="rounded-xl border border-gold/20 bg-panel/40 px-3 py-1 text-xs font-semibold text-cream/90 transition-colors hover:border-gold hover:text-gold-light"
                              >
                                {n.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "sillage" && (
                    <div className="space-y-4 rounded-2xl border border-gold/15 bg-panel/25 p-4">
                      <div className="flex items-center justify-between">
                        <Intensity level={p.intensity} />
                        <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold-light">
                          {p.longevityHours} On Skin
                        </span>
                      </div>
                      <p className="text-xs text-sand leading-relaxed">
                        <strong className="text-gold-light">Occasion & Aura:</strong> {p.mood}. Because our oils contain zero alcohol, they do not evaporate aggressively — instead creating an alluring halo of presence.
                      </p>
                    </div>
                  )}

                  {activeTab === "layering" && (
                    <div className="space-y-3 rounded-2xl border border-gold/15 bg-panel/25 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-light">
                        <Sparkles className="h-4 w-4 text-gold" />
                        Harmonious Pairing: {p.layeringPartner}
                      </div>
                      <p className="text-xs text-sand leading-relaxed">
                        {p.layeringTip}
                      </p>
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                <div className="space-y-2 pt-2 border-t border-gold/15">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-sand/70">
                    <span>Select Flacon Volume</span>
                    <span className="text-gold-light">{currentSize.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {p.sizes.map((size, sIdx) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSizeIndex(sIdx)}
                        className={cn(
                          "flex flex-col items-center rounded-2xl border p-3 text-center transition-all",
                          selectedSizeIndex === sIdx
                            ? "border-gold bg-gold/15 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                        )}
                      >
                        <span className="text-xs font-bold">{size.volume}</span>
                        <span className="font-display mt-0.5 text-base font-semibold">
                          ${size.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price and Add To Bag Button */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl font-bold text-gold-light">
                        ${currentSize.price}
                      </span>
                      {currentSize.compareAt && (
                        <span className="text-sm font-semibold text-sand/40 line-through">
                          ${currentSize.compareAt}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sand/60">
                      Free Insured Worldwide Express Delivery
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    className={cn(
                      "btn-gold flex-1 min-w-[200px] flex items-center justify-center gap-2.5 rounded-full py-4 text-xs font-black uppercase tracking-[0.2em]",
                      addedAnimation && "bg-emerald-400 text-ink"
                    )}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} />
                        Added to Imperial Bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        Add to Imperial Bag — ${currentSize.price}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
