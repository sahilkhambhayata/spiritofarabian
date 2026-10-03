import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  TicketPercent,
  Sliders,
  Video,
  Sparkles,
  MessageSquareCheck,
  BookOpen,
  HelpCircle,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Compass,
  FileText,
  Gift,
  Landmark,
  ShoppingCart,
  Mail,
} from "lucide-react";
import adminService from "../services/adminService";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(
    location.pathname.includes("/admin/products") || location.pathname.includes("/admin/categories")
  );
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentUser = adminService.getCurrentUser() || {
    name: "Atelier Master Admin",
    email: "admin@spiritofarabian.com",
    role: "superadmin",
  };

  const handleLogout = () => {
    adminService.logout();
    navigate("/admin/login");
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-purple-50 text-purple-700 font-semibold shadow-xs"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const subNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 pl-9 pr-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? "text-purple-700 font-semibold bg-purple-50/70"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex antialiased">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100/90 z-30 shrink-0 select-none">
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900">Spirit of Arabian</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Admin Atelier</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
          <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">Main Menu</div>

          {/* 1. Dashboard */}
          <NavLink to="/admin/dashboard" className={navLinkClasses}>
            <LayoutDashboard className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Products Accordion */}
          <div>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname.includes("/admin/products") || location.pathname.includes("/admin/categories")
                  ? "bg-purple-50/50 text-purple-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Products</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${
                  productsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {productsOpen && (
              <div className="mt-1 space-y-1">
                <NavLink to="/admin/products" className={subNavLinkClasses} end>
                  <span>Product List</span>
                </NavLink>
                <NavLink to="/admin/categories" className={subNavLinkClasses}>
                  <span>Categories & Families</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. Discovery & Free Samples */}
          <NavLink to="/admin/samples" className={navLinkClasses}>
            <Gift className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Discovery & Samples</span>
          </NavLink>

          {/* 4. Orders */}
          <NavLink to="/admin/orders" className={navLinkClasses}>
            <ShoppingBag className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Orders & Shipping</span>
          </NavLink>

          {/* 4b. Abandoned Carts */}
          <NavLink to="/admin/abandoned-carts" className={navLinkClasses}>
            <ShoppingCart className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Abandoned Carts</span>
          </NavLink>

          {/* 5. Coupons */}
          <NavLink to="/admin/coupons" className={navLinkClasses}>
            <TicketPercent className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Flash & Coupons</span>
          </NavLink>

          <div className="pt-4 text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Store Experience
          </div>

          {/* 6. Banners */}
          <NavLink to="/admin/banners" className={navLinkClasses}>
            <Sliders className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Hero & Banners</span>
          </NavLink>

          {/* 7. Videos */}
          <NavLink to="/admin/videos" className={navLinkClasses}>
            <Video className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Shoppable Reels</span>
          </NavLink>

          {/* 8. Scent Diagnostic Quiz CMS */}
          <NavLink to="/admin/quiz" className={navLinkClasses}>
            <Sparkles className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Scent Quiz CMS</span>
          </NavLink>

          {/* 9. Concierge Leads */}
          <NavLink to="/admin/concierge" className={navLinkClasses}>
            <Compass className="h-4 w-4 shrink-0 text-slate-500" />
            <span>VIP Concierge</span>
          </NavLink>

          {/* 10. Reviews Moderation */}
          <NavLink to="/admin/reviews" className={navLinkClasses}>
            <MessageSquareCheck className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Reviews Moderation</span>
          </NavLink>

          <div className="pt-4 text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Content & CMS
          </div>

          {/* 11. Journal */}
          <NavLink to="/admin/journal" className={navLinkClasses}>
            <BookOpen className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Maison Journal</span>
          </NavLink>

          {/* 12. Heritage & Boutiques */}
          <NavLink to="/admin/heritage" className={navLinkClasses}>
            <Landmark className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Heritage & Boutiques</span>
          </NavLink>

          {/* 13. Information Pages & Policies */}
          <NavLink to="/admin/information" className={navLinkClasses}>
            <FileText className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Information Pages</span>
          </NavLink>

          {/* 14. FAQs */}
          <NavLink to="/admin/faq-policy" className={navLinkClasses}>
            <HelpCircle className="h-4 w-4 shrink-0 text-slate-500" />
            <span>FAQs Accordion</span>
          </NavLink>

          {/* 15. Email Templates Studio */}
          <NavLink to="/admin/email-templates" className={navLinkClasses}>
            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Email Studio & Templates</span>
          </NavLink>

          {/* 16. Settings */}
          <NavLink to="/admin/settings" className={navLinkClasses}>
            <Settings className="h-4 w-4 shrink-0 text-slate-500" />
            <span>Settings & APIs</span>
          </NavLink>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 max-w-[80%] bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Admin Atelier</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5" onClick={() => setMobileMenuOpen(false)}>
              <NavLink to="/admin/dashboard" className={navLinkClasses}>Dashboard</NavLink>
              <NavLink to="/admin/products" className={navLinkClasses}>Product List</NavLink>
              <NavLink to="/admin/categories" className={navLinkClasses}>Categories</NavLink>
              <NavLink to="/admin/samples" className={navLinkClasses}>Discovery & Samples</NavLink>
              <NavLink to="/admin/orders" className={navLinkClasses}>Orders</NavLink>
              <NavLink to="/admin/abandoned-carts" className={navLinkClasses}>Abandoned Carts</NavLink>
              <NavLink to="/admin/coupons" className={navLinkClasses}>Coupons</NavLink>
              <NavLink to="/admin/banners" className={navLinkClasses}>Banners</NavLink>
              <NavLink to="/admin/videos" className={navLinkClasses}>Shoppable Reels</NavLink>
              <NavLink to="/admin/quiz" className={navLinkClasses}>Scent Quiz CMS</NavLink>
              <NavLink to="/admin/concierge" className={navLinkClasses}>VIP Concierge</NavLink>
              <NavLink to="/admin/reviews" className={navLinkClasses}>Reviews</NavLink>
              <NavLink to="/admin/journal" className={navLinkClasses}>Journal</NavLink>
              <NavLink to="/admin/heritage" className={navLinkClasses}>Heritage & Boutiques</NavLink>
              <NavLink to="/admin/information" className={navLinkClasses}>Information Pages</NavLink>
              <NavLink to="/admin/faq-policy" className={navLinkClasses}>FAQs Accordion</NavLink>
              <NavLink to="/admin/email-templates" className={navLinkClasses}>Email Studio & Templates</NavLink>
              <NavLink to="/admin/settings" className={navLinkClasses}>Settings</NavLink>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile trigger & Global Search */}
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, orders, patrons..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Right: Actions, Live Store link, Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Live Boutique</span>
            </Link>

            <button
              title="Notifications"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser?.name?.charAt(0) || "A"}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
