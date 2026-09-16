import { useCallback, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import ScentQuizModal from "./components/ScentQuizModal";
import Toast, { type ToastMessage } from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import HeritagePage from "./pages/HeritagePage";
import JournalPage from "./pages/JournalPage";
import JournalArticlePage from "./pages/JournalArticlePage";
import ConciergePage from "./pages/ConciergePage";

import { FREE_SAMPLES, type CartItem, type Product, type ProductSize } from "./data";

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedSample, setSelectedSample] = useState(FREE_SAMPLES[0].id);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = useCallback(
    (title: string, description?: string, type: "success" | "info" | "gold" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add Product to Cart with chosen size
  const handleAddProduct = useCallback(
    (product: Product, selectedSize?: ProductSize) => {
      const size = selectedSize || product.sizes[1] || product.sizes[0];
      const itemId = `${product.id}-${size.id}`;

      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === itemId);
        if (existing) {
          return prev.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            name: product.name,
            sizeLabel: size.label,
            volume: size.volume,
            price: size.price,
            image: product.image,
            quantity: 1,
            hue: product.hue,
          },
        ];
      });

      addToast(
        `Added to Imperial Bag`,
        `${product.name} (${size.volume}) — $${size.price}`,
        "gold"
      );
      setIsCartOpen(true);
    },
    [addToast]
  );

  // Add Discovery Ritual ($59) to Bag
  const handleAddDiscovery = useCallback(() => {
    const itemId = "discovery-ritual-5x2ml";

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: "discovery-set",
          name: "The Discovery Ritual (5 × 2ml Vials)",
          sizeLabel: "Full $59 Store Credit Voucher Included",
          volume: "5 × 2ml",
          price: 59,
          image: "/images/discovery-set.jpg",
          quantity: 1,
          hue: "#d4af37",
        },
      ];
    });

    addToast(
      `Discovery Ritual Added`,
      `The 5-Extrait Discovery Coffret ($59 credited toward your flacon)`,
      "gold"
    );
    setIsCartOpen(true);
  }, [addToast]);

  // Cart quantity controls
  const handleUpdateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Promo Code Validation
  const handleApplyPromo = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (
        normalized === "ROYAL15" ||
        normalized === "ARABIAN15" ||
        normalized === "SPIRIT15" ||
        normalized === "VIP15"
      ) {
        setDiscountPercent(15);
        addToast("VIP Privilege Applied!", "15% discount has been applied to your order.", "gold");
        return true;
      }
      return false;
    },
    [addToast]
  );

  // Clear Cart after checkout
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setDiscountPercent(0);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount) + (subtotal >= 95 ? 0 : subtotal > 0 ? 15 : 0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="noise relative min-h-screen bg-ink font-sans text-cream antialiased selection:bg-gold/30">
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />

        <main id="main-content" className="min-h-[70vh]">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onAddProduct={handleAddProduct}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                />
              }
            />
            <Route
              path="/collection"
              element={<CollectionPage onAddProduct={handleAddProduct} />}
            />
            <Route
              path="/product/:id"
              element={<ProductDetailPage onAddProduct={handleAddProduct} />}
            />
            <Route
              path="/discovery"
              element={
                <DiscoveryPage
                  onAddDiscovery={handleAddDiscovery}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                />
              }
            />
            <Route path="/heritage" element={<HeritagePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<JournalArticlePage />} />
            <Route path="/concierge" element={<ConciergePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer onOpenQuiz={() => setIsQuizOpen(true)} />

        {/* Global Slide-Out Cart Drawer */}
        <CartDrawer
          open={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          discountPercent={discountPercent}
          onApplyPromo={handleApplyPromo}
          selectedSample={selectedSample}
          onSelectSample={setSelectedSample}
        />

        {/* Global Checkout Modal */}
        <CheckoutModal
          open={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          totalPrice={finalTotal}
          selectedSample={selectedSample}
          onClearCart={handleClearCart}
        />

        {/* Global Scent Diagnostic Quiz Modal */}
        <ScentQuizModal
          open={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onAddProduct={(p) => handleAddProduct(p)}
        />

        {/* Global Toast Notification System */}
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  );
}
