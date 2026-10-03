require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect to Database
connectDB();

const app = express();

// Global Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads and static media directly from backend
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/public/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "online",
    brand: "Spirit of Arabian",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/upload", require("./Routes/uploadRoutes"));
app.use("/api/users", require("./Routes/userRoutes"));
app.use("/api/categories", require("./Routes/categoryRoutes"));
app.use("/api/products", require("./Routes/productRoutes"));
app.use("/api/orders", require("./Routes/orderRoutes"));
app.use("/api/transactions", require("./Routes/transactionRoutes"));
app.use("/api/video-reviews", require("./Routes/videoReviewRoutes"));
app.use("/api/information", require("./Routes/informationRoutes"));
app.use("/api/banners", require("./Routes/bannerRoutes"));
app.use("/api/coupons", require("./Routes/couponRoutes"));
app.use("/api/settings", require("./Routes/settingsRoutes"));
app.use("/api/concierge", require("./Routes/conciergeRoutes"));
app.use("/api/reviews", require("./Routes/reviewRoutes"));
app.use("/api/journal", require("./Routes/journalRoutes"));
app.use("/api/shipping", require("./Routes/shippingRoutes"));
app.use("/api/cart", require("./Routes/cartRoutes"));
app.use("/api/email-templates", require("./Routes/emailTemplateRoutes"));

// Initialize Background Cron Jobs
const { initAbandonedCartCron } = require("./cron/abandonedCartCron");
initAbandonedCartCron();

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Spirit of Arabian Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
