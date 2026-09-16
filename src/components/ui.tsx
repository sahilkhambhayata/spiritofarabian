import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "../utils/cn";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------------------------- Reveal --------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------- Section head ------------------------------ */
export function SectionHead({
  eyebrow,
  title,
  copy,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <Reveal>
        <p className="eyebrow mb-4 flex items-center justify-center gap-3 data-[align=left]:justify-start" data-align={align}>
          <span className="inline-block h-px w-8 bg-gradient-to-r from-transparent via-gold to-gold" />
          {eyebrow}
          <span className="inline-block h-px w-8 bg-gradient-to-l from-transparent via-gold to-gold" />
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display text-3xl leading-[1.08] text-cream sm:text-4xl lg:text-[3.2rem]">
          {title}
        </h2>
      </Reveal>
      {copy && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-sand">{copy}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------------------------- CountUp --------------------------------- */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
  duration = 1.4,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [val, setVal] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: EASE as unknown as [number, number, number, number],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ----------------------------------- Tilt ----------------------------------- */
export function Tilt({
  children,
  className,
  max = 6,
  scale = 1.01,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [t, setT] = useState({ rx: 0, ry: 0, s: 1 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * max, ry: px * max, s: scale });
  };

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        ...style,
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.s})`,
        transition: "transform 0.25s ease-out",
      }}
      onPointerMove={onMove}
      onPointerLeave={() => setT({ rx: 0, ry: 0, s: 1 })}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Stars ------------------------------------ */
export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)} aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn("h-3.5 w-3.5", i < n ? "fill-gold" : "fill-cream/15")}
          aria-hidden
        >
          <path d="M10 1.4l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.6 1-5.8L1.5 7.6l5.9-.9L10 1.4z" />
        </svg>
      ))}
    </span>
  );
}

/* ------------------------------- Divider glyph ------------------------------ */
export function Flourish({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold/50", className)} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/40" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M12 1c1.8 4.2 4.4 6.8 8.6 8.6-4.2 1.8-6.8 4.4-8.6 8.6-1.8-4.2-4.4-6.8-8.6-8.6C7.6 7.8 10.2 5.2 12 1z" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/40" />
    </div>
  );
}
