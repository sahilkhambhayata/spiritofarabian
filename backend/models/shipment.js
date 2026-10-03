const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    rawProviderStatus: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    // Provider Agnostic Identifier
    provider: {
      type: String,
      enum: ["shiprocket", "dhl", "custom_courier"],
      required: true,
      default: "shiprocket",
      index: true,
    },

    providerOrderId: {
      type: String,
      trim: true,
    },
    providerShipmentId: {
      type: String,
      trim: true,
      index: true,
    },

    // Courier Specific Details returned by Provider
    awbCode: {
      type: String,
      trim: true,
      index: true,
    },
    courierName: {
      type: String,
      trim: true,
    },
    courierCompanyId: {
      type: Number,
    },
    serviceType: {
      type: String,
      default: "Standard",
      trim: true,
    },

    // Pickup & Warehouse Details
    pickupLocation: {
      type: String,
      trim: true,
    },
    pickupScheduledDate: {
      type: Date,
    },
    pickupTokenNumber: {
      type: String,
      trim: true,
    },

    // Document URLs
    labelUrl: {
      type: String,
      trim: true,
    },
    manifestUrl: {
      type: String,
      trim: true,
    },
    invoiceUrl: {
      type: String,
      trim: true,
    },

    // Pricing & Applied Currency
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    appliedCurrency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    // Physical Package Metrics at Dispatch
    totalWeightGrams: {
      type: Number,
      required: true,
      min: 1,
    },
    dimensions: {
      lengthCm: { type: Number, default: null },
      widthCm: { type: Number, default: null },
      heightCm: { type: Number, default: null },
    },

    // Normalized Internal Shipping Status
    status: {
      type: String,
      enum: [
        "pending",
        "created",
        "awb_assigned",
        "pickup_scheduled",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed",
        "rto_initiated",
        "rto_delivered",
        "return_requested",
        "returned",
      ],
      default: "pending",
      index: true,
    },

    // Real-Time Courier Tracking Timeline
    trackingEvents: [trackingEventSchema],

    // Raw Audit Response from Provider
    providerRawResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    lastTrackedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

shipmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Shipment", shipmentSchema);
