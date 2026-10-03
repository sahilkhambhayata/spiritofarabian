import { useCallback, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CheckoutModal from "./components/CheckoutModal";
import ScentQuizModal from "./components/ScentQuizModal";
import Toast, { type ToastMessage } from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import cartService from "./services/cartService";

// Storefront Pages
import HomePage from "./pages/HomePage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import HeritagePage from "./pages/HeritagePage";
import JournalPage from "./pages/JournalPage";
import JournalArticlePage from "./pages/JournalArticlePage";
import ConciergePage from "./pages/ConciergePage";
import CartPage from "./pages/CartPage";
import PolicyPage from "./pages/PolicyPage";
import TrackOrderPage from "./pages/TrackOrderPage";

// Admin Architecture
import AdminRoute from "./admin/AdminRoute";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminOrders from "./admin/AdminOrders";
import AdminCoupons from "./admin/AdminCoupons";
import AdminBanners from "./admin/AdminBanners";
import AdminVideos from "./admin/AdminVideos";
import AdminConcierge from "./admin/AdminConcierge";
import AdminReviews from "./admin/AdminReviews";
import AdminJournal from "./admin/AdminJournal";
import AdminInformation from "./admin/AdminInformation";
import AdminFaqPolicy from "./admin/AdminFaqPolicy";
import AdminSettings from "./admin/AdminSettings";
import AdminQuiz from "./admin/AdminQuiz";
import AdminHeritage from "./admin/AdminHeritage";
import AdminSamples from "./admin/AdminSamples";
import AdminAbandonedCarts from "./admin/AdminAbandonedCarts";
import AdminEmailTemplates from "./admin/AdminEmailTemplates";

import { FREE_SAMPLES, type CartItem, type Product, type ProductSize } from "./data";

function StorefrontLayout({
  cartItems,
  onAddProduct,
  onOpenQuiz,
}: {
  cartItems: CartItem[];
  onAddProduct: (product: Product, selectedSize?: ProductSize) => void;
  onOpenQuiz: () => void;
}) {
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="noise relative min-h-screen bg-ink font-sans text-cream antialiased selection:bg-gold/30">
      <Navbar
        cartCount={totalCartCount}
        onOpenQuiz={onOpenQuiz}
        onAddProduct={onAddProduct}
      />
      <main id="main-content" className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer onOpenQuiz={onOpenQuiz} onAddProduct={onAddProduct} />
    </div>
  );
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedSample, setSelectedSample] = useState(FREE_SAMPLES[0].id);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = useCallback(
    (
      title: string,
      description?: string,
      type: "success" | "info" | "gold" = "success",
      actionLink?: string,
      actionText?: string
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [
        ...prev,
        { id, title, description, type, actionLink, actionText },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Background Abandoned Cart Sync
  useEffect(() => {
    if (cartItems.length > 0) {
      cartService.syncCart(cartItems);
    }
  }, [cartItems]);

  // URL Abandoned Cart Recovery Listener (?recovery=TOKEN&coupon=CODE)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const recoveryToken = urlParams.get("recovery");
    const coupon = urlParams.get("coupon");

    if (coupon) {
      setDiscountPercent(10);
      addToast("Privilege Code Activated", `Courtesy recovery promo code ${coupon} applied.`, "gold");
    }

    if (recoveryToken) {
      cartService
        .recoverCart(recoveryToken)
        .then((res: any) => {
          if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
            const restored: CartItem[] = res.items.map((it: any) => ({
              id: `${it.slug || it.product || "item"}-${it.size || "6ml"}`,
              productId: it.slug || it.product || "attar",
              name: it.name,
              sizeLabel: it.size || "6ml Flacon",
              volume: it.size || "6ml",
              price: it.price,
              image: it.image || "/images/product-amber-oud.jpg",
              quantity: it.quantity || 1,
              hue: "#d4af37",
            }));
            setCartItems(restored);
            addToast("Your Reserved Bag is Restored", "Your rare flacons have been restored to your bag.", "gold", "/cart", "View Bag");
          }
        })
        .catch((e) => console.warn("Cart recovery:", e));
    }
  }, [addToast]);

  // Add Product to Cart
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
        `Added to Bag`,
        `${product.name} (${size.volume}) — ₹${size.price.toLocaleString("en-IN")}`,
        "gold",
        "/cart",
        "View Cart & Checkout"
      );
    },
    [addToast]
  );

  // Add Discovery Ritual
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
          sizeLabel: "Full ₹2,999 Store Credit Voucher Included",
          volume: "5 × 2ml",
          price: 2999,
          image: "/images/discovery-set.jpg",
          quantity: 1,
          hue: "#d4af37",
        },
      ];
    });

    addToast(
      `Discovery Ritual Added`,
      `The 5-Extrait Discovery Coffret (₹2,999 voucher credited toward full flacon)`,
      "gold",
      "/cart",
      "View Cart & Checkout"
    );
  }, [addToast]);

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
        addToast(
          "VIP Privilege Applied!",
          "15% privilege discount has been applied to your order.",
          "gold"
        );
        return true;
      }
      return false;
    },
    [addToast]
  );

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setDiscountPercent(0);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal =
    Math.max(0, subtotal - discountAmount) +
    (subtotal >= 95 ? 0 : subtotal > 0 ? 15 : 0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ================= ADMIN AUTH ROUTE ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ADMIN PROTECTED ATELIER ROUTES ================= */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="samples" element={<AdminSamples />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="quiz" element={<AdminQuiz />} />
            <Route path="concierge" element={<AdminConcierge />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="journal" element={<AdminJournal />} />
            <Route path="heritage" element={<AdminHeritage />} />
            <Route path="information" element={<AdminInformation />} />
            <Route path="faq-policy" element={<AdminFaqPolicy />} />
            <Route path="email-templates" element={<AdminEmailTemplates />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ================= STOREFRONT ROUTES ================= */}
        <Route
          element={
            <StorefrontLayout
              cartItems={cartItems}
              onAddProduct={handleAddProduct}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          }
        >
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
          <Route
            path="/cart"
            element={
              <CartPage
                items={cartItems}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onAddProduct={handleAddProduct}
                onCheckout={() => setIsCheckoutOpen(true)}
                discountPercent={discountPercent}
                onApplyPromo={handleApplyPromo}
                selectedSample={selectedSample}
                onSelectSample={setSelectedSample}
              />
            }
          />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/about" element={<HeritagePage />} />
          <Route path="/about-us" element={<HeritagePage />} />

          <Route path="/journal" element={<JournalPage />} />
          <Route path="/blogs" element={<JournalPage />} />
          <Route path="/blog" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalArticlePage />} />

          <Route path="/concierge" element={<ConciergePage />} />
          <Route path="/contact" element={<ConciergePage />} />
          <Route path="/contact-us" element={<ConciergePage />} />

          {/* Interactive Track Order Page */}
          <Route path="/track-order" element={<TrackOrderPage />} />

          {/* Policy & FAQ Pages */}
          <Route path="/shipping-policy" element={<PolicyPage initialTab="shipping" />} />
          <Route path="/return-policy" element={<PolicyPage initialTab="return" />} />
          <Route path="/return-exchange-policy" element={<PolicyPage initialTab="return" />} />
          <Route path="/privacy-policy" element={<PolicyPage initialTab="privacy" />} />
          <Route path="/terms-of-service" element={<PolicyPage initialTab="terms" />} />
          <Route path="/terms" element={<PolicyPage initialTab="terms" />} />
          <Route path="/refund-policy" element={<PolicyPage initialTab="refund" />} />
          <Route path="/faqs" element={<PolicyPage initialTab="faqs" />} />
          <Route path="/faq" element={<PolicyPage initialTab="faqs" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

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

      {/* Global Floating Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </BrowserRouter>
  );
}
