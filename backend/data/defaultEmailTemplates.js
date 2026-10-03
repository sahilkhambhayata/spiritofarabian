const DEFAULT_EMAIL_TEMPLATES = [
  {
    templateKey: "user_registration",
    name: "Welcome to Maison (New Registration)",
    category: "Authentication",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent automatically to a customer immediately after registering a sanctuary account.",
    subject: "Welcome to the Maison Spirit of Arabian, {{customerName}}",
    heading: "Welcome to the Atelier, {{customerName}}",
    body: `<p>It is our profound pleasure to welcome you to the private circle of Spirit of Arabian. For three generations, we have dedicated ourselves to the pure art of artisanal hydro-distillation and natural perfume oils.</p>
<p>Your sanctuary profile is now active. Explore rare numbered extraits, reserve private olfactory discovery coffrets, and enjoy complimentary insured express delivery worldwide.</p>`,
    buttonText: "Explore The Collection",
    buttonUrl: "{{frontendUrl}}/collection",
    availablePlaceholders: [
      { tag: "{{customerName}}", description: "Customer's full name", example: "Alexandre Vance" },
      { tag: "{{customerEmail}}", description: "Customer's email address", example: "alexandre@domain.com" },
      { tag: "{{frontendUrl}}", description: "Base boutique URL", example: "https://spiritofarabian.com" },
    ],
  },
  {
    templateKey: "otp_verification",
    name: "Security OTP Verification Code",
    category: "Authentication",
    recipient: "Customer",
    isEnabled: true,
    description: "Dispatched when a patron requests a 6-digit one-time password / security code.",
    subject: "Your Security Verification Code: {{otpCode}}",
    heading: "Sanctuary Verification Code",
    body: `<p>Greetings {{customerName}},</p>
<p>Please use the following single-use verification code to complete your secure action with Spirit of Arabian:</p>
<div style="background: rgba(212, 175, 55, 0.1); border: 2px dashed #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
  <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #f3e5ab; font-family: monospace;">{{otpCode}}</span>
</div>
<p style="font-size: 12px; color: rgba(247, 243, 235, 0.6);">This security token expires in 10 minutes. If you did not initiate this request, please disregard this communication.</p>`,
    buttonText: "",
    buttonUrl: "",
    availablePlaceholders: [
      { tag: "{{customerName}}", description: "Customer's name", example: "Patron" },
      { tag: "{{otpCode}}", description: "6-digit generated OTP code", example: "849201" },
      { tag: "{{customerEmail}}", description: "Recipient email", example: "patron@domain.com" },
    ],
  },
  {
    templateKey: "password_reset",
    name: "Password Reset Request",
    category: "Authentication",
    recipient: "Customer",
    isEnabled: true,
    description: "Dispatched when a user requests to reset their password.",
    subject: "Confidential: Password Reset Request — Spirit of Arabian",
    heading: "Access Key Reset",
    body: `<p>Hello {{customerName}},</p>
<p>We received a request to reset your private access password for your Spirit of Arabian account. Click the button below to establish a new password:</p>
<p style="font-size: 12px; color: rgba(247, 243, 235, 0.6);">This link will expire in 30 minutes. If you did not request this, your account remains fully secure.</p>`,
    buttonText: "Reset My Password",
    buttonUrl: "{{resetUrl}}",
    availablePlaceholders: [
      { tag: "{{customerName}}", description: "Customer's name", example: "Alexandre" },
      { tag: "{{resetUrl}}", description: "Secure password reset link with token", example: "https://spiritofarabian.com/reset-password?token=..." },
      { tag: "{{customerEmail}}", description: "Customer email", example: "alexandre@domain.com" },
    ],
  },
  {
    templateKey: "order_confirmation",
    name: "Customer Order Confirmation",
    category: "Orders & Shipping",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent to the customer immediately upon successful placement of a new order.",
    subject: "Order Confirmation #{{orderNumber}} — Spirit of Arabian",
    heading: "Your Order is Confirmed",
    body: `<p>Thank you for choosing Spirit of Arabian, <strong>{{customerName}}</strong>. Our master perfumers have received your allocation and are preparing your hand-poured flacons with exquisite care.</p>
{{orderSummaryTable}}
<div style="background: rgba(0,0,0,0.25); border-radius: 12px; padding: 16px; font-size: 12px; margin-top: 20px;">
  <strong style="color: #f3e5ab;">Delivery Address:</strong><br>
  {{shippingAddress}}<br><br>
  <strong>Payment Method:</strong> {{paymentMethod}}
</div>`,
    buttonText: "Track Your Order",
    buttonUrl: "{{trackOrderUrl}}",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Unique Order identifier", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer Full Name", example: "Lord Vance" },
      { tag: "{{totalAmount}}", description: "Order Total formatted with currency", example: "₹4,200" },
      { tag: "{{subTotal}}", description: "Order subtotal", example: "₹4,200" },
      { tag: "{{orderSummaryTable}}", description: "Auto-generated luxury table of flacons & prices", example: "[Items Table]" },
      { tag: "{{shippingAddress}}", description: "Formatted delivery destination", example: "Mumbai, Maharashtra - 400001" },
      { tag: "{{paymentMethod}}", description: "Payment Gateway or COD", example: "Razorpay" },
      { tag: "{{trackOrderUrl}}", description: "Direct live order tracking link", example: "https://spiritofarabian.com/track-order?order=SOA-84912" },
    ],
  },
  {
    templateKey: "payment_success",
    name: "Payment Success & Verification",
    category: "Payments",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent when an online payment (Razorpay / Stripe / UPI) is successfully captured.",
    subject: "Payment Confirmed for Order #{{orderNumber}}",
    heading: "Payment Received with Thanks",
    body: `<p>Dear {{customerName}},</p>
<p>We have successfully received your payment of <strong>{{totalAmount}}</strong> for Order <strong>#{{orderNumber}}</strong>.</p>
<div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 20px; margin: 24px 0; font-size: 12px; line-height: 1.8;">
  <strong>Transaction ID:</strong> {{transactionId}}<br>
  <strong>Payment Method:</strong> {{paymentMethod}}<br>
  <strong>Status:</strong> <span style="color: #10b981; font-weight: 700;">Captured & Authenticated</span><br>
  <strong>Timestamp:</strong> {{paymentDate}}
</div>
<p>Your flacon is now scheduled for velvet presentation box sealing and insured courier dispatch.</p>`,
    buttonText: "View Order Details",
    buttonUrl: "{{trackOrderUrl}}",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Order reference number", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer name", example: "Alexandre" },
      { tag: "{{totalAmount}}", description: "Payment total amount", example: "₹4,200" },
      { tag: "{{transactionId}}", description: "Gateway Transaction reference", example: "TXN-SOA-8912" },
      { tag: "{{paymentMethod}}", description: "Payment method used", example: "Razorpay UPI" },
      { tag: "{{paymentDate}}", description: "Date and time of capture", example: "03/10/2026, 11:30 PM" },
      { tag: "{{trackOrderUrl}}", description: "Live tracking URL", example: "https://spiritofarabian.com/track-order?order=SOA-84912" },
    ],
  },
  {
    templateKey: "payment_failure",
    name: "Payment Failed / Declined Alert",
    category: "Payments",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent when an online payment attempt fails, is declined, or encounters an issue.",
    subject: "Payment Unsuccessful for Order #{{orderNumber}}",
    heading: "Payment Authorization Issue",
    body: `<p>Dear {{customerName}},</p>
<p>We attempted to process your payment of <strong>{{totalAmount}}</strong> for Order <strong>#{{orderNumber}}</strong>, but the transaction could not be completed.</p>
<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #fca5a5;">
  <strong>Reason:</strong> {{failureReason}}
</div>
<p>Your reserved flacons are held temporarily in our atelier vault. You may retry your payment via UPI, Card, or Cash on Delivery:</p>`,
    buttonText: "Complete Payment Now",
    buttonUrl: "{{checkoutUrl}}",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Order reference", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer name", example: "Lord Vance" },
      { tag: "{{totalAmount}}", description: "Order total amount", example: "₹4,200" },
      { tag: "{{failureReason}}", description: "Error reason from bank/gateway", example: "Bank server timeout" },
      { tag: "{{checkoutUrl}}", description: "Retry payment link", example: "https://spiritofarabian.com/checkout" },
    ],
  },
  {
    templateKey: "order_status_update",
    name: "Order Status & Shipment Tracking Update",
    category: "Orders & Shipping",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent when admin updates order status (Bottling, Dispatched, Shipped, Delivered) or adds tracking.",
    subject: "Order #{{orderNumber}} Status: {{newStatus}}",
    heading: "Order Status Update",
    body: `<p>Greetings {{customerName}},</p>
<p>Your order <strong>#{{orderNumber}}</strong> has transitioned to: <strong style="color: #f3e5ab; text-transform: uppercase;">{{newStatus}}</strong>.</p>
{{trackingBox}}
<p>Each parcel is sealed with royal wax and temperature-insulated to preserve pure botanical aromatics during transit.</p>`,
    buttonText: "Track Parcel Live",
    buttonUrl: "{{trackOrderUrl}}",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Order Number", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer Name", example: "Alexandre" },
      { tag: "{{newStatus}}", description: "Updated order state", example: "Shipped" },
      { tag: "{{previousStatus}}", description: "Previous order state", example: "Dispatched" },
      { tag: "{{trackingBox}}", description: "Courier & AWB Tracking summary", example: "BlueDart BD-849102" },
      { tag: "{{courierName}}", description: "Courier Name", example: "BlueDart Express" },
      { tag: "{{trackingNumber}}", description: "AWB Tracking ID", example: "BD-8891024" },
      { tag: "{{trackOrderUrl}}", description: "Tracking link", example: "https://spiritofarabian.com/track-order?order=SOA-84912" },
    ],
  },
  {
    templateKey: "order_cancellation",
    name: "Order Cancellation Notice",
    category: "Orders & Shipping",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent when an order is cancelled by the customer or admin atelier.",
    subject: "Cancellation Notice for Order #{{orderNumber}}",
    heading: "Order Cancellation Confirmation",
    body: `<p>Dear {{customerName}},</p>
<p>Order <strong>#{{orderNumber}}</strong> has been cancelled. Any payments processed will be refunded to your original source within 3-5 business days.</p>
<div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
  <strong>Cancellation Reason:</strong> {{cancellationReason}}<br>
  <strong>Refundable Value:</strong> {{totalAmount}}
</div>
<p>Should you wish to explore bespoke alternatives, our master fragrance concierge remains at your service.</p>`,
    buttonText: "Explore Other Fragrances",
    buttonUrl: "{{frontendUrl}}/collection",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Order Number", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer name", example: "Lord Vance" },
      { tag: "{{totalAmount}}", description: "Order total amount", example: "₹4,200" },
      { tag: "{{cancellationReason}}", description: "Reason for cancellation", example: "Requested by patron" },
      { tag: "{{frontendUrl}}", description: "Storefront URL", example: "https://spiritofarabian.com" },
    ],
  },
  {
    templateKey: "admin_order_alert",
    name: "Admin New Order Alert",
    category: "Admin Alerts",
    recipient: "Admin Concierge",
    isEnabled: true,
    description: "Sent immediately to admin/concierge email when a new customer order is placed.",
    subject: "[NEW ORDER] #{{orderNumber}} — {{totalAmount}} ({{paymentMethod}})",
    heading: "Royal Flacon Allocation Received",
    body: `<p>A new order has been placed on the live boutique.</p>
<div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 14px; padding: 20px; margin: 24px 0; font-size: 13px; line-height: 1.8;">
  <div><strong>Order:</strong> #{{orderNumber}}</div>
  <div><strong>Patron:</strong> {{customerName}} ({{customerEmail}})</div>
  <div><strong>Phone:</strong> {{customerPhone}}</div>
  <div><strong>Total:</strong> {{totalAmount}}</div>
  <div><strong>Payment Method:</strong> {{paymentMethod}}</div>
  <div><strong>Destination:</strong> {{shippingCity}}, {{shippingState}}</div>
  <div><strong>Items:</strong> {{itemsCount}} flacon(s)</div>
</div>`,
    buttonText: "Manage in Admin Atelier",
    buttonUrl: "{{frontendUrl}}/admin/orders",
    availablePlaceholders: [
      { tag: "{{orderNumber}}", description: "Order identifier", example: "SOA-84912" },
      { tag: "{{customerName}}", description: "Customer Name", example: "Alexandre" },
      { tag: "{{customerEmail}}", description: "Customer Email", example: "alexandre@domain.com" },
      { tag: "{{customerPhone}}", description: "Customer Phone", example: "+91 98765 43210" },
      { tag: "{{totalAmount}}", description: "Total Order Value", example: "₹4,200" },
      { tag: "{{paymentMethod}}", description: "Payment Method", example: "Prepaid Razorpay" },
      { tag: "{{shippingCity}}", description: "Destination City", example: "Mumbai" },
      { tag: "{{shippingState}}", description: "Destination State", example: "Maharashtra" },
      { tag: "{{itemsCount}}", description: "Total flacons count", example: "2" },
      { tag: "{{frontendUrl}}", description: "Boutique Admin URL", example: "https://spiritofarabian.com" },
    ],
  },
  {
    templateKey: "abandoned_cart_reminder_1",
    name: "Abandoned Cart Reminder #1 (First Notice)",
    category: "Abandoned Cart & Recovery",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent after initial cart inactivity delay (e.g. 1 hour) with reserved flacon overview.",
    subject: "Your Artisanal Reserve is Waiting at the Atelier",
    heading: "Your Pure Extraits Await Your Return",
    body: `<p>Dear {{customerName}},</p>
<p>During your recent visit to the Maison Spirit of Arabian, you selected rare botanical extraits that currently remain reserved in your shopping bag.</p>
{{cartItemsBox}}
<div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
  <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #f3e5ab; text-transform: uppercase;">Courtesy Private Privilege</div>
  <p style="margin: 6px 0; font-size: 13px;">Enjoy <strong style="color: #d4af37;">{{discountPercent}}% Complimentary Savings</strong> with code <span style="font-family: monospace; font-weight: 800; color: #f3e5ab; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 4px;">{{discountCode}}</span></p>
</div>`,
    buttonText: "Complete Your Allocation & Save {{discountPercent}}%",
    buttonUrl: "{{recoveryUrl}}",
    availablePlaceholders: [
      { tag: "{{customerName}}", description: "Customer Name", example: "Alexandre" },
      { tag: "{{cartItemsBox}}", description: "HTML table of items in cart", example: "[Cart Items]" },
      { tag: "{{cartTotal}}", description: "Subtotal value of cart", example: "₹4,200" },
      { tag: "{{discountCode}}", description: "Recovery Promo Coupon", example: "ROYALRESERVE10" },
      { tag: "{{discountPercent}}", description: "Discount percentage", example: "10" },
      { tag: "{{recoveryUrl}}", description: "Direct cart recovery URL with auto-applied discount", example: "https://spiritofarabian.com/cart?recovery=...&coupon=..." },
    ],
  },
  {
    templateKey: "abandoned_cart_reminder_2",
    name: "Abandoned Cart Reminder #2 (Final Privilege Notice)",
    category: "Abandoned Cart & Recovery",
    recipient: "Customer",
    isEnabled: true,
    description: "Sent after second cart inactivity delay (e.g. 24 hours) as a final recovery reminder.",
    subject: "Final Notice: {{discountPercent}}% Courtesy Credit on Your Reserved Flacons",
    heading: "Final Reservation Privilege",
    body: `<p>Dear {{customerName}},</p>
<p>This is a courtesy notice that your artisanal flacons reservation will shortly expire and be returned to the open boutique archive.</p>
{{cartItemsBox}}
<div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
  <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #f3e5ab; text-transform: uppercase;">Courtesy Private Privilege</div>
  <p style="margin: 6px 0; font-size: 13px;">Apply code <span style="font-family: monospace; font-weight: 800; color: #f3e5ab; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 4px;">{{discountCode}}</span> for <strong style="color: #d4af37;">{{discountPercent}}% Savings</strong> before checkout closes.</p>
</div>`,
    buttonText: "Claim Your Reserved Flacons Now",
    buttonUrl: "{{recoveryUrl}}",
    availablePlaceholders: [
      { tag: "{{customerName}}", description: "Customer Name", example: "Lord Vance" },
      { tag: "{{cartItemsBox}}", description: "HTML table of items in cart", example: "[Cart Items]" },
      { tag: "{{cartTotal}}", description: "Total value of cart", example: "₹4,200" },
      { tag: "{{discountCode}}", description: "Recovery Promo Coupon", example: "ROYALRESERVE10" },
      { tag: "{{discountPercent}}", description: "Discount percentage", example: "10" },
      { tag: "{{recoveryUrl}}", description: "Direct 1-click recovery link", example: "https://spiritofarabian.com/cart?recovery=...&coupon=..." },
    ],
  },
];

module.exports = DEFAULT_EMAIL_TEMPLATES;
