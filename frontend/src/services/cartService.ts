import api from "./api";

function getSessionId(): string {
  let sid = localStorage.getItem("soa_cart_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("soa_cart_session_id", sid);
  }
  return sid;
}

let syncTimeout: any = null;

export const cartService = {
  getSessionId,

  syncCart: (items: any[], customer?: { name?: string; email?: string; phone?: string }) => {
    if (syncTimeout) clearTimeout(syncTimeout);

    syncTimeout = setTimeout(async () => {
      try {
        const sessionId = getSessionId();
        const savedCustomer = customer || {
          email: localStorage.getItem("soa_checkout_email") || undefined,
          name: localStorage.getItem("soa_checkout_name") || undefined,
          phone: localStorage.getItem("soa_checkout_phone") || undefined,
        };

        await api.post("/cart/sync", {
          sessionId,
          items: items.map((it) => ({
            product: it.productId || it.id,
            name: it.name,
            size: it.sizeLabel || it.volume || "Standard",
            price: it.price,
            quantity: it.quantity,
            image: it.image,
            slug: it.productId || it.id,
          })),
          customer: savedCustomer,
        });
      } catch (err) {
        // Non-blocking sync failure
        console.warn("[CartSync] Background sync silently failed:", err);
      }
    }, 800);
  },

  recoverCart: async (token: string) => {
    return await api.get(`/cart/recover/${token}`);
  },
};

export default cartService;
