const nodemailer = require("nodemailer");
const SiteSetting = require("../models/settings");
const EmailTemplate = require("../models/emailTemplate");

/**
 * Luxury HTML Base Email Wrapper
 */
function getEmailLayout(title, contentHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06100c;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f7f3eb;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #06100c;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(180deg, #0b241c 0%, #061410 100%);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .header {
      text-align: center;
      padding: 36px 24px 20px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      background: rgba(0, 0, 0, 0.25);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.25em;
      color: #d4af37;
      text-transform: uppercase;
      margin: 0;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.4em;
      color: rgba(243, 229, 171, 0.7);
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.65;
      font-size: 14px;
      color: #e5dec9;
    }
    .gold-heading {
      color: #f3e5ab;
      font-size: 22px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .gold-button {
      display: inline-block;
      background: linear-gradient(135deg, #d4af37 0%, #aa820a 100%);
      color: #06100c !important;
      font-weight: 800;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 9999px;
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
    }
    .order-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 14px;
      padding: 20px;
      margin: 24px 0;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13px;
    }
    .order-row:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      padding: 24px 20px;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
      font-size: 11px;
      color: rgba(247, 243, 235, 0.5);
      line-height: 1.6;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-title">SPIRIT OF ARABIAN</div>
        <div class="brand-sub">MAISON D'ATTAR · HAUTE PARFUMERIE</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>This is a confidential communication from the private atelier of Spirit of Arabian.</p>
        <p>Concierge Ateliers: Dubai · London · Mumbai | <a href="https://spiritofarabian.com">spiritofarabian.com</a></p>
        <p>© ${new Date().getFullYear()} SPIRIT OF ARABIAN. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

class EmailService {
  /**
   * Resolve active SMTP transport dynamically from MongoDB settings or environment variables
   */
  async getTransporter() {
    try {
      const setting = await SiteSetting.findOne().lean();
      const smtp = setting?.smtp;

      // Check DB configuration first
      if (smtp && smtp.isEnabled && smtp.host && smtp.username && smtp.password) {
        return {
          transporter: nodemailer.createTransport({
            host: smtp.host,
            port: Number(smtp.port) || 587,
            secure: smtp.encryption === "SSL" || Number(smtp.port) === 465,
            auth: {
              user: smtp.username,
              pass: smtp.password,
            },
            tls: {
              rejectUnauthorized: false,
            },
          }),
          from: `"${smtp.fromName || "SPIRIT OF ARABIAN"}" <${smtp.fromEmail || smtp.username}>`,
        };
      }

      // Fallback to environment variables
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return {
          transporter: nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          }),
          from: `"${process.env.SMTP_FROM_NAME || "SPIRIT OF ARABIAN"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        };
      }

      return null;
    } catch (err) {
      console.error("[EmailService] Error resolving SMTP config:", err.message);
      return null;
    }
  }

  /**
   * Verify SMTP connection with given or stored configuration
   */
  async verifyConnection(customConfig = null) {
    let transporterObj = null;

    if (customConfig && customConfig.host && customConfig.username && customConfig.password) {
      transporterObj = {
        transporter: nodemailer.createTransport({
          host: customConfig.host,
          port: Number(customConfig.port) || 587,
          secure: customConfig.encryption === "SSL" || Number(customConfig.port) === 465,
          auth: {
            user: customConfig.username,
            pass: customConfig.password,
          },
          tls: { rejectUnauthorized: false },
        }),
        from: `"${customConfig.fromName || "SPIRIT OF ARABIAN"}" <${customConfig.fromEmail || customConfig.username}>`,
      };
    } else {
      transporterObj = await this.getTransporter();
    }

    if (!transporterObj) {
      throw new Error("SMTP credentials are not configured or email service is disabled.");
    }

    return await transporterObj.transporter.verify();
  }

  /**
   * Dynamic Template Lookup, Placeholder Replacement & Admin Toggle Check
   */
  async renderTemplate(templateKey, replacements, fallback) {
    try {
      let tpl = await EmailTemplate.findOne({ templateKey });

      // If template was explicitly disabled by admin, return null to skip sending!
      if (tpl && tpl.isEnabled === false) {
        console.log(`[EmailService:Skipped] Notification '${templateKey}' is disabled by admin settings.`);
        return null;
      }

      const subject = tpl?.subject || fallback.subject;
      const heading = tpl?.heading !== undefined ? tpl.heading : fallback.heading;
      const body = tpl?.body || fallback.body;
      const buttonText = tpl?.buttonText !== undefined ? tpl.buttonText : fallback.buttonText;
      const buttonUrl = tpl?.buttonUrl !== undefined ? tpl.buttonUrl : fallback.buttonUrl;

      let renderedSubject = subject;
      let renderedHeading = heading;
      let renderedBody = body;
      let renderedBtnUrl = buttonUrl;

      Object.entries(replacements).forEach(([tag, val]) => {
        renderedSubject = renderedSubject.split(tag).join(val !== undefined && val !== null ? String(val) : "");
        if (renderedHeading) renderedHeading = renderedHeading.split(tag).join(val !== undefined && val !== null ? String(val) : "");
        if (renderedBody) renderedBody = renderedBody.split(tag).join(val !== undefined && val !== null ? String(val) : "");
        if (renderedBtnUrl) renderedBtnUrl = renderedBtnUrl.split(tag).join(val !== undefined && val !== null ? String(val) : "");
      });

      const btnHtml = buttonText && renderedBtnUrl
        ? `<div class="button-container"><a href="${renderedBtnUrl}" class="gold-button">${buttonText}</a></div>`
        : "";

      const contentHtml = `
        ${renderedHeading ? `<h2 class="gold-heading">${renderedHeading}</h2>` : ""}
        <div style="line-height: 1.65; font-size: 14px; color: #e5dec9;">
          ${renderedBody}
        </div>
        ${btnHtml}
      `;

      return {
        subject: renderedSubject,
        html: getEmailLayout(renderedSubject, contentHtml),
      };
    } catch (err) {
      console.error(`[EmailService:TemplateError] Failed rendering '${templateKey}':`, err.message);
      return {
        subject: fallback.subject,
        html: getEmailLayout(fallback.subject, fallback.body),
      };
    }
  }

  /**
   * Generic Send Email Method with Safe Non-Blocking Execution
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!to) return { success: false, error: "No recipient email address" };

      const config = await this.getTransporter();

      if (!config) {
        console.log(`[EmailService:Simulated] Email to <${to}> | Subject: "${subject}" (SMTP inactive/not configured)`);
        return { success: true, simulated: true, message: "Email simulated (SMTP not active)." };
      }

      const mailOptions = {
        from: config.from,
        to,
        subject,
        html,
        text: text || subject,
      };

      const info = await config.transporter.sendMail(mailOptions);
      console.log(`[EmailService:Delivered] ID: ${info.messageId} | To: <${to}> | Subject: "${subject}"`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService:Error] Failed to send email to <${to}>:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. User Registration Welcome Email
   */
  async sendWelcomeEmail(user) {
    const frontendUrl = process.env.FRONTEND_URL || "https://spiritofarabian.com";
    const rendered = await this.renderTemplate(
      "user_registration",
      {
        "{{customerName}}": user.name || "Esteemed Patron",
        "{{customerEmail}}": user.email,
        "{{frontendUrl}}": frontendUrl,
      },
      {
        subject: `Welcome to the Maison Spirit of Arabian, ${user.name || "Esteemed Patron"}`,
        heading: `Welcome to the Atelier, ${user.name || "Esteemed Patron"}`,
        body: `<p>It is our honor to welcome you to the private circle of Spirit of Arabian. For three generations, we have dedicated ourselves to the pure art of artisanal hydro-distillation and natural perfume oils.</p><p>Your sanctuary profile is now active. Explore rare numbered extraits and enjoy complimentary insured express delivery worldwide.</p>`,
        buttonText: "Explore The Collection",
        buttonUrl: `${frontendUrl}/collection`,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: user.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 2. Email Verification / OTP Email
   */
  async sendOtpEmail(email, otp, name = "Patron") {
    const rendered = await this.renderTemplate(
      "otp_verification",
      {
        "{{customerName}}": name,
        "{{otpCode}}": otp,
        "{{customerEmail}}": email,
      },
      {
        subject: `Your Security Verification Code: ${otp}`,
        heading: "Sanctuary Verification Code",
        body: `<p>Greetings ${name},</p><p>Please use the following single-use verification code to complete your verification with Spirit of Arabian:</p><div style="background: rgba(212, 175, 55, 0.1); border: 2px dashed #d4af37; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;"><span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #f3e5ab; font-family: monospace;">${otp}</span></div><p style="font-size: 12px; color: rgba(247, 243, 235, 0.6);">This security token expires in 10 minutes.</p>`,
        buttonText: "",
        buttonUrl: "",
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 3. Password Reset Email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    const rendered = await this.renderTemplate(
      "password_reset",
      {
        "{{customerName}}": user.name || "Patron",
        "{{resetUrl}}": resetUrl,
        "{{customerEmail}}": user.email,
      },
      {
        subject: "Confidential: Password Reset Request — Spirit of Arabian",
        heading: "Access Key Reset",
        body: `<p>Hello ${user.name || "Patron"},</p><p>We received a request to reset your private access password for your Spirit of Arabian account. Click the button below to establish a new password:</p><p style="font-size: 12px; color: rgba(247, 243, 235, 0.6);">This link will expire in 30 minutes.</p>`,
        buttonText: "Reset My Password",
        buttonUrl: resetUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: user.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 4. Order Confirmation Email
   */
  async sendOrderConfirmation(order) {
    const itemsHtml = (order.items || [])
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <td style="padding: 12px 8px; color: #f3e5ab; font-weight: 600;">${it.name} <span style="font-size: 11px; color: rgba(247,243,235,0.6);">(${it.size || "Standard"})</span></td>
          <td style="padding: 12px 8px; text-align: center;">${it.quantity}</td>
          <td style="padding: 12px 8px; text-align: right; color: #f3e5ab; font-weight: 700;">₹${((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const orderSummaryTable = `
      <div class="order-box">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #d4af37; text-transform: uppercase; margin-bottom: 12px;">Order Summary · #${order.orderNumber}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e5dec9;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: rgba(243, 229, 171, 0.7); font-size: 11px; text-transform: uppercase;">
              <th style="text-align: left; padding: 8px;">Extrait</th>
              <th style="text-align: center; padding: 8px;">Qty</th>
              <th style="text-align: right; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Subtotal:</span><span>₹${(order.subTotal || 0).toLocaleString("en-IN")}</span></div>
          ${order.discountAmount > 0 ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #10b981;"><span>Discount (${order.couponApplied || "Promo"}):</span><span>-₹${order.discountAmount.toLocaleString("en-IN")}</span></div>` : ""}
          <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Shipping:</span><span>${order.shippingFee === 0 ? "Complimentary Express" : `₹${order.shippingFee}`}</span></div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 800; color: #f3e5ab; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 8px;"><span>Final Amount:</span><span>₹${(order.totalAmount || 0).toLocaleString("en-IN")}</span></div>
        </div>
      </div>
    `;

    const shippingAddressText = `${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}, ${order.shippingAddress?.country || "India"}`;
    const trackOrderUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/track-order?order=${order.orderNumber}`;

    const rendered = await this.renderTemplate(
      "order_confirmation",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Valued Patron",
        "{{totalAmount}}": `₹${(order.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{subTotal}}": `₹${(order.subTotal || 0).toLocaleString("en-IN")}`,
        "{{orderSummaryTable}}": orderSummaryTable,
        "{{shippingAddress}}": shippingAddressText,
        "{{paymentMethod}}": order.paymentMethod || "Prepaid",
        "{{trackOrderUrl}}": trackOrderUrl,
      },
      {
        subject: `Order Confirmation #${order.orderNumber} — Spirit of Arabian`,
        heading: "Your Order is Confirmed",
        body: `<p>Thank you for choosing Spirit of Arabian, <strong>${order.customerDetails?.fullName || "Valued Patron"}</strong>. Our master perfumers have received your allocation and are preparing your hand-poured flacons with exquisite care.</p>${orderSummaryTable}`,
        buttonText: "Track Your Order",
        buttonUrl: trackOrderUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: order.customerDetails?.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 5. Payment Success Email
   */
  async sendPaymentSuccess(order, transaction) {
    const trackOrderUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/track-order?order=${order.orderNumber}`;
    const rendered = await this.renderTemplate(
      "payment_success",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Patron",
        "{{totalAmount}}": `₹${(order.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{transactionId}}": transaction?.transactionId || transaction?.gatewayOrderId || "TXN-" + Date.now(),
        "{{paymentMethod}}": order.paymentMethod || "Razorpay / Stripe",
        "{{paymentDate}}": new Date().toLocaleString("en-IN"),
        "{{trackOrderUrl}}": trackOrderUrl,
      },
      {
        subject: `Payment Confirmed for Order #${order.orderNumber}`,
        heading: "Payment Received with Thanks",
        body: `<p>Dear ${order.customerDetails?.fullName || "Patron"},</p><p>We have successfully received your payment of <strong>₹${(order.totalAmount || 0).toLocaleString("en-IN")}</strong> for Order <strong>#${order.orderNumber}</strong>.</p>`,
        buttonText: "View Order Details",
        buttonUrl: trackOrderUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: order.customerDetails?.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 6. Payment Failure Email
   */
  async sendPaymentFailure(order, errorReason = "Bank declined transaction") {
    const checkoutUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`;
    const rendered = await this.renderTemplate(
      "payment_failure",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Patron",
        "{{totalAmount}}": `₹${(order.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{failureReason}}": errorReason,
        "{{checkoutUrl}}": checkoutUrl,
      },
      {
        subject: `Payment Unsuccessful for Order #${order.orderNumber}`,
        heading: "Payment Authorization Issue",
        body: `<p>Dear ${order.customerDetails?.fullName || "Patron"},</p><p>We attempted to process your payment of <strong>₹${(order.totalAmount || 0).toLocaleString("en-IN")}</strong> for Order <strong>#${order.orderNumber}</strong>, but the transaction could not be completed.</p>`,
        buttonText: "Complete Payment Now",
        buttonUrl: checkoutUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: order.customerDetails?.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 7. Order Status Update Email (Processing, Shipped, Delivered)
   */
  async sendOrderStatusUpdate(order, previousStatus, newStatus, trackingInfo = null) {
    const trackOrderUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/track-order?order=${order.orderNumber}`;
    const trackingHtml = trackingInfo?.trackingNumber
      ? `
      <div class="order-box">
        <div style="font-size: 12px; font-weight: 700; color: #d4af37; margin-bottom: 8px;">LIVE SHIPMENT TRACKING</div>
        <div><strong>Courier:</strong> ${trackingInfo.courier || "Shiprocket / DHL Express"}</div>
        <div><strong>AWB Tracking Number:</strong> <span style="font-family: monospace; font-size: 14px; color: #f3e5ab;">${trackingInfo.trackingNumber}</span></div>
        ${trackingInfo.trackingUrl ? `<div style="margin-top: 12px;"><a href="${trackingInfo.trackingUrl}" style="color: #d4af37; font-weight: 700; text-decoration: underline;">View Live Dispatch Status →</a></div>` : ""}
      </div>
    `
      : "";

    const rendered = await this.renderTemplate(
      "order_status_update",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Patron",
        "{{newStatus}}": newStatus,
        "{{previousStatus}}": previousStatus,
        "{{trackingBox}}": trackingHtml,
        "{{courierName}}": trackingInfo?.courier || "Express Logistics",
        "{{trackingNumber}}": trackingInfo?.trackingNumber || "",
        "{{trackOrderUrl}}": trackOrderUrl,
      },
      {
        subject: `Order #${order.orderNumber} Status: ${newStatus.toUpperCase()}`,
        heading: "Order Status Update",
        body: `<p>Greetings ${order.customerDetails?.fullName || "Patron"},</p><p>Your order <strong>#${order.orderNumber}</strong> has transitioned to: <strong style="color: #f3e5ab; text-transform: uppercase;">${newStatus}</strong>.</p>${trackingHtml}`,
        buttonText: "Track Parcel Live",
        buttonUrl: trackOrderUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: order.customerDetails?.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 8. Order Cancellation Email
   */
  async sendOrderCancellation(order, reason = "Requested by patron") {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const rendered = await this.renderTemplate(
      "order_cancellation",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Patron",
        "{{totalAmount}}": `₹${(order.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{cancellationReason}}": reason,
        "{{frontendUrl}}": frontendUrl,
      },
      {
        subject: `Cancellation Notice for Order #${order.orderNumber}`,
        heading: "Order Cancellation Confirmation",
        body: `<p>Dear ${order.customerDetails?.fullName || "Patron"},</p><p>Order <strong>#${order.orderNumber}</strong> has been cancelled. Any payments processed will be refunded to your original source within 3-5 business days.</p>`,
        buttonText: "Explore Other Fragrances",
        buttonUrl: `${frontendUrl}/collection`,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: order.customerDetails?.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 9. Admin Order Notification
   */
  async sendAdminOrderAlert(order) {
    const setting = await SiteSetting.findOne().lean();
    const adminRecipient = setting?.supportEmail || process.env.ADMIN_ALERT_EMAIL || "admin@spiritofarabian.com";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const rendered = await this.renderTemplate(
      "admin_order_alert",
      {
        "{{orderNumber}}": order.orderNumber,
        "{{customerName}}": order.customerDetails?.fullName || "Patron",
        "{{customerEmail}}": order.customerDetails?.email || "",
        "{{customerPhone}}": order.customerDetails?.phone || "",
        "{{totalAmount}}": `₹${(order.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{paymentMethod}}": order.paymentMethod || "Prepaid",
        "{{shippingCity}}": order.shippingAddress?.city || "",
        "{{shippingState}}": order.shippingAddress?.state || "",
        "{{itemsCount}}": order.items?.length || 1,
        "{{frontendUrl}}": frontendUrl,
      },
      {
        subject: `[NEW ORDER] #${order.orderNumber} — ₹${(order.totalAmount || 0).toLocaleString("en-IN")} (${order.paymentMethod})`,
        heading: "Royal Flacon Allocation Received",
        body: `<p>A new order has been placed on the live boutique.</p>`,
        buttonText: "Manage in Admin Atelier",
        buttonUrl: `${frontendUrl}/admin/orders`,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: adminRecipient, subject: rendered.subject, html: rendered.html });
  }

  /**
   * 10. Abandoned Cart Reminder Email
   */
  async sendAbandonedCartReminder(cart, reminderNumber = 1) {
    if (!cart?.customer?.email) return { success: false, error: "No customer email" };

    const setting = await SiteSetting.findOne().lean();
    const cartSettings = setting?.abandonedCartSettings || {};
    const discountCode = cartSettings.discountCode || "ROYALRESERVE10";
    const discountPercent = cartSettings.discountPercent || 10;
    const recoveryUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart?recovery=${cart.recoveryToken}&coupon=${discountCode}`;

    const itemsHtml = (cart.items || [])
      .map(
        (it) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <strong style="color: #f3e5ab; font-size: 14px;">${it.name}</strong>
            <div style="font-size: 11px; color: rgba(247,243,235,0.6);">Size: ${it.size || "6ml"} · Qty: ${it.quantity}</div>
          </div>
          <span style="font-weight: 700; color: #f3e5ab;">₹${((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}</span>
        </div>
      `
      )
      .join("");

    const cartItemsBox = `
      <div class="order-box">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #d4af37; margin-bottom: 12px;">RESERVED FLACONS</div>
        ${itemsHtml}
        <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; color: #f3e5ab;">
          <span>Bag Subtotal:</span>
          <span>₹${(cart.subtotal || cart.totalAmount || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>
    `;

    const templateKey = reminderNumber === 1 ? "abandoned_cart_reminder_1" : "abandoned_cart_reminder_2";

    const rendered = await this.renderTemplate(
      templateKey,
      {
        "{{customerName}}": cart.customer?.name || "Perfume Connoisseur",
        "{{cartItemsBox}}": cartItemsBox,
        "{{cartTotal}}": `₹${(cart.subtotal || cart.totalAmount || 0).toLocaleString("en-IN")}`,
        "{{discountCode}}": discountCode,
        "{{discountPercent}}": discountPercent,
        "{{recoveryUrl}}": recoveryUrl,
      },
      {
        subject:
          reminderNumber === 1
            ? cartSettings.emailSubject || "Your Artisanal Reserve is Waiting at the Atelier"
            : `Final Notice: ${discountPercent}% Courtesy Credit on Your Reserved Flacons`,
        heading: "Your Pure Extraits Await Your Return",
        body: `<p>Dear ${cart.customer?.name || "Perfume Connoisseur"},</p><p>During your recent visit to the Maison Spirit of Arabian, you selected rare botanical extraits that currently remain reserved in your bag.</p>${cartItemsBox}`,
        buttonText: `Complete Your Allocation & Save ${discountPercent}%`,
        buttonUrl: recoveryUrl,
      }
    );

    if (!rendered) return { success: true, skipped: true };
    return this.sendEmail({ to: cart.customer.email, subject: rendered.subject, html: rendered.html });
  }

  /**
   * Send Test Email to verify SMTP configuration
   */
  async sendTestEmail(targetEmail, customConfig = null) {
    const subject = "SMTP Test Verification — Spirit of Arabian Atelier";
    const content = `
      <h2 class="gold-heading">SMTP Configuration Verified</h2>
      <p>Congratulations. Your SMTP server and email dispatch pipeline are operating with optimal security and delivery standards.</p>
      <div class="order-box">
        <div><strong>Verified At:</strong> ${new Date().toLocaleString("en-IN")}</div>
        <div><strong>Destination:</strong> ${targetEmail}</div>
        <div><strong>Status:</strong> <span style="color: #10b981; font-weight: 700;">Active & Connected</span></div>
      </div>
    `;

    if (customConfig) {
      const transporterObj = {
        transporter: nodemailer.createTransport({
          host: customConfig.host,
          port: Number(customConfig.port) || 587,
          secure: customConfig.encryption === "SSL" || Number(customConfig.port) === 465,
          auth: {
            user: customConfig.username,
            pass: customConfig.password,
          },
          tls: { rejectUnauthorized: false },
        }),
        from: `"${customConfig.fromName || "SPIRIT OF ARABIAN"}" <${customConfig.fromEmail || customConfig.username}>`,
      };

      const info = await transporterObj.transporter.sendMail({
        from: transporterObj.from,
        to: targetEmail,
        subject,
        html: getEmailLayout(subject, content),
      });

      return { success: true, messageId: info.messageId };
    }

    return this.sendEmail({ to: targetEmail, subject, html: getEmailLayout(subject, content) });
  }
}

module.exports = new EmailService();
module.exports.getEmailLayout = getEmailLayout;
