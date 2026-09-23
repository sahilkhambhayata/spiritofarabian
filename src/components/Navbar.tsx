import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { EASE } from "./ui";

export default function Navbar({
  cartCount = 0,
  onOpenCart,
}: {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenQuiz?: () => void;
  onAddProduct?: any;
}) {
  const { scrollY } = useScroll();

  // Smooth continuous scaling based on scroll position (slowly from 0px to 250px)
  const logoScale = useTransform(scrollY, [0, 250], [1, 0.75]);
  const logoY = useTransform(scrollY, [0, 250], [0, -3]);
  const cartScale = useTransform(scrollY, [0, 250], [1, 0.88]);

  return (
    <>
      {/* Seamless Floating Logo in Top-Left Corner */}
      <motion.div
        style={{
          scale: logoScale,
          y: logoY,
          transformOrigin: "left top",
        }}
        className="fixed top-5 left-5 sm:top-6 sm:left-8 z-50 pointer-events-auto bg-transparent border-0 p-0 shadow-none"
      >
        <Link
          to="/"
          className="group flex items-center gap-2.5 sm:gap-3 focus:outline-none bg-transparent border-0 p-0 shadow-none"
          aria-label="SPIRIT OF ARABIAN — Home"
        >
          {/* Golden Arch Emblem with Animated Breathing Glow */}
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 5px rgba(212, 175, 55, 0.35))",
                "drop-shadow(0 0 14px rgba(212, 175, 55, 0.75))",
                "drop-shadow(0 0 5px rgba(212, 175, 55, 0.35))",
              ],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 transition-transform duration-300 group-hover:scale-105"
          >
            <img
              src="/images/brand-emblem-gold.png"
              alt="SPIRIT OF ARABIAN Logo Emblem"
              className="h-full w-full object-contain"
            />
          </motion.div>

          {/* Luxury Brand Typography */}
          <div className="flex flex-col text-left justify-center">
            <span className="brand-gold-title text-base sm:text-lg font-bold tracking-[0.2em] sm:tracking-[0.24em] uppercase whitespace-nowrap group-hover:brightness-125 transition-all">
              SPIRIT OF ARABIAN
            </span>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-[1px] w-2.5 bg-gradient-to-r from-gold/60 to-transparent" />
              <span className="font-brand-sub text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.45em] text-gold/85 whitespace-nowrap">
                MAISON D'ATTAR
              </span>
              <span className="h-[1px] w-2.5 bg-gradient-to-l from-gold/60 to-transparent" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Floating Minimal Cart Indicator in Top-Right Corner -> Navigates to /cart */}
      <motion.div
        style={{
          scale: cartScale,
          transformOrigin: "right top",
        }}
        className="fixed top-5 right-5 sm:top-6 sm:right-8 z-50 pointer-events-auto"
      >
        <Link
          to="/cart"
          onClick={onOpenCart}
          className="relative grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full border border-gold/40 bg-ink-3/85 backdrop-blur-md text-gold-light shadow-xl transition-all hover:border-gold hover:bg-gold/20 hover:scale-105 active:scale-95"
          aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
        >
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gold" strokeWidth={2.2} />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.25, 1] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-2 px-1 text-[10px] font-black text-ink shadow-[0_0_12px_rgba(212,175,55,0.8)]"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    </>
  );
}
