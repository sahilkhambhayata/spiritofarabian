import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Edit2, Trash2, CheckSquare, Square, MoreHorizontal, Sparkles, AlertCircle } from "lucide-react";
import adminService from "../services/adminService";
import AdminProductForm from "./AdminProductForm";

import api from "../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes]: any = await Promise.all([
        api.get("/products?limit=100").catch(() => ({ products: [] })),
        adminService.getCategories().catch(() => ({ categories: [] })),
      ]);
      const rawProducts = prodRes?.products || prodRes?.data?.products || (Array.isArray(prodRes) ? prodRes : []);
      setProducts(Array.isArray(rawProducts) ? rawProducts : []);
      setCategories(catRes?.categories || catRes || []);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      p.category?._id === selectedCategory ||
      p.category?.slug === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && p.isActive !== false) ||
      (selectedStatus === "draft" && p.isActive === false) ||
      (selectedStatus === "bestseller" && p.isBestSeller);
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      try {
        await adminService.deleteProduct(id);
        await loadProducts();
      } catch (err: any) {
        alert("Delete failed: " + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header (Matches Screenshot 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products list</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {products.length} artisanal extraits & flacons in Maison collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 shadow-xs transition-colors"
          >
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by extrait name or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="bestseller">Bestseller</option>
          </select>
        </div>
      </div>

      {/* Main Table Card (Matches Screenshot 2 Layout) */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-5 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4 font-semibold text-slate-500">Product Name</th>
                <th className="py-4 px-4 font-semibold text-slate-500">Category</th>
                <th className="py-4 px-4 font-semibold text-slate-500">Price</th>
                <th className="py-4 px-4 font-semibold text-slate-500">Stock</th>
                <th className="py-4 px-4 font-semibold text-slate-500">Status</th>
                <th className="py-4 px-5 text-right font-semibold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading Maison catalog...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p._id);
                  const firstVariant = p.variants?.[0] || {};
                  const price = firstVariant.price || p.price || 0;
                  const stock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock !== undefined ? v.stock : 25), 0) || 50;
                  const status = p.isActive !== false ? "Active" : "Draft";

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-purple-50/30" : ""
                      }`}
                    >
                      <td className="py-4 px-5">
                        <button
                          onClick={() => toggleSelectOne(p._id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || p.image || "/uploads/products/oud-maroki-hero.png"}
                            alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/uploads/products/oud-maroki-hero.png";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{p.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {p.category?.name || "Pure Attar Oils"}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        ₹{price.toLocaleString("en-IN")}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {stock}
                      </td>

                      {/* Status Pill Badge (Matches Screenshot 2) */}
                      <td className="py-4 px-4">
                        {status === "Active" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Draft
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Bestseller
                          </span>
                        )}
                      </td>

                      {/* Action Menu (Matches Screenshot 2: "Details" / "Edit") */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                            className="px-2.5 py-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg font-semibold transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Matches Screenshot 2 Bottom) */}
        <div className="p-4 sm:px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-purple-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal Drawer */}
      {isFormOpen && (
        <AdminProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
