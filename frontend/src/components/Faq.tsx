import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { FAQS, type FaqCategory } from "../data";
import { EASE, Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";
import api from "../services/api";

const CATEGORIES: FaqCategory[] = [
  "All",
  "Art & Application",
  "Purity & Sourcing",
  "Orders & Shipping",
];

export default function Faq() {
  const [faqsList, setFaqsList] = useState<any[]>(FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    api.get("/settings")
      .then((res: any) => {
        if (!isMounted || !res) return;
        if (Array.isArray(res.faqs) && res.faqs.length > 0) {
          setFaqsList(res.faqs);
        }
      })
      .catch((err) => console.warn("FAQ settings fetch:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFaqs = faqsList.filter((f) => {
    const matchesCategory =
      selectedCategory === "All" || f.category === selectedCategory;
    const matchesSearch =
      f.q?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative py-24 sm:py-32" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <SectionHead
          eyebrow="Concierge Knowledge Base"
          title={
            <>
              Questions, <em className="gold-text font-semibold italic">Answered.</em>
            </>
          }
          copy="Everything patrons ask before receiving their first flacon. Need bespoke assistance? Our fragrance concierge is at your service 24/7."
        />

        {/* Search & Category Filter */}
        <div className="mt-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers (e.g. skin safety, longevity, shipping, oud)..."
              className="field w-full rounded-2xl pl-11 pr-4 py-3.5 text-xs text-cream"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(null);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-wider",
                  selectedCategory === cat
                    ? "border border-gold bg-gold/20 text-gold-light shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "border border-gold/15 bg-panel/30 text-sand hover:border-gold/30 hover:text-cream"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="mt-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-gold/15 bg-panel/20 p-8 text-center text-sand/70 text-xs">
              No matching questions found. Contact our concierge directly at{" "}
              <a href="mailto:concierge@arabianspirit.com" className="text-gold-light underline">
                concierge@arabianspirit.com
              </a>
            </div>
          ) : (
            filteredFaqs.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <Reveal key={f.q} delay={i * 0.04}>
                  <div
                    className={cn(
                      "glass-card overflow-hidden rounded-2xl transition-all duration-300",
                      isOpen && "border-gold/40 bg-panel/60 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-cream"
                    >
                      <span className="font-display text-base font-semibold sm:text-lg text-cream">
                        {f.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                          isOpen
                            ? "border-gold bg-gold text-ink"
                            : "border-gold/25 text-sand hover:border-gold hover:text-gold"
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 text-xs sm:text-[13.5px] leading-relaxed text-sand/90">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
