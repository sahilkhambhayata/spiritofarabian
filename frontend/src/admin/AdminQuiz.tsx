import React, { useEffect, useState } from "react";
import { Sparkles, Plus, Trash2, Edit2, Save, Check, HelpCircle, Layers } from "lucide-react";
import api from "../services/api";

interface QuizOption {
  label: string;
  description: string;
  tag: string;
  productId: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

export default function AdminQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Quiz questions & Products
  const loadQuizData = async () => {
    try {
      setLoading(true);
      const [settingsRes, prodRes]: any = await Promise.all([
        api.get("/settings"),
        api.get("/products?limit=50"),
      ]);

      const loadedQuestions = settingsRes?.quizQuestions?.length
        ? settingsRes.quizQuestions
        : [
            {
              id: 1,
              question: "Which atmosphere calls to you most?",
              subtitle: "Select the setting where you feel most magnetic and powerful.",
              options: [
                { label: "Royal Evening & Black Tie", description: "Regal presence, smoky fireplace, velvet attire", tag: "Oud & Leather", productId: "oud-imperial-25-year" },
                { label: "Palace Garden at Sunrise", description: "Gilded sunlight, dew-kissed petals, honeyed sweetness", tag: "Velvet Florals", productId: "taif-rose-extrait" },
                { label: "Quiet Luxury & Cashmere Silk", description: "Clean, intimate, serene second-skin aura", tag: "Luminous Musk", productId: "royal-ambergris-silk-musk" },
                { label: "Midnight Fire & Amber Hearth", description: "Warm, intoxicating spices and seductive dark tonka", tag: "Warm Amber", productId: "mukhallat-al-sultan" },
              ],
            },
            {
              id: 2,
              question: "What note family stirs your senses?",
              subtitle: "Choose the aromatic profile that makes you pause.",
              options: [
                { label: "Smoky Cambodian Oud & Aged Oak", description: "Resinous, authoritative, deep woody complexity", tag: "Woody Resin", productId: "oud-imperial-25-year" },
                { label: "Damask Rose & Wild Forest Honey", description: "Velvety, intoxicating, romantic and opulent", tag: "Floral Gourmand", productId: "taif-rose-extrait" },
                { label: "Florentine Orris & White Musk", description: "Clean iris, silky pear blossom, pure tranquility", tag: "Ethereal Clean", productId: "royal-ambergris-silk-musk" },
                { label: "Bourbon Vanilla, Clove & Vintage Tonka", description: "Sultry, smoky gourmand with lingering warmth", tag: "Spiced Tonka", productId: "mukhallat-al-sultan" },
              ],
            },
          ];

      setQuestions(loadedQuestions);
      setProducts(prodRes?.products || prodRes?.data?.products || []);
    } catch (err) {
      console.error("Error loading quiz settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizData();
  }, []);

  const handleAddQuestion = () => {
    const newId = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: newId,
        question: `Question ${newId}: What is your fragrance occasion?`,
        subtitle: "Select the moments you plan to wear this extrait.",
        options: [
          { label: "Daily Signature", description: "Sophisticated everyday aura", tag: "Signature", productId: products[0]?.slug || "oud-imperial-25-year" },
          { label: "Special Ceremonies", description: "Unforgettable sovereign presence", tag: "Royal", productId: products[1]?.slug || "taif-rose-extrait" },
        ],
      },
    ]);
  };

  const handleUpdateQuestion = (qIdx: number, field: "question" | "subtitle", value: string) => {
    const next = [...questions];
    next[qIdx] = { ...next[qIdx], [field]: value };
    setQuestions(next);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(questions.filter((_, i) => i !== qIdx));
  };

  const handleAddOption = (qIdx: number) => {
    const next = [...questions];
    next[qIdx].options.push({
      label: "New Scent Option",
      description: "Atmosphere & vibe description",
      tag: "Note Tag",
      productId: products[0]?.slug || "oud-imperial-25-year",
    });
    setQuestions(next);
  };

  const handleUpdateOption = (qIdx: number, oIdx: number, field: keyof QuizOption, value: string) => {
    const next = [...questions];
    next[qIdx].options[oIdx] = { ...next[qIdx].options[oIdx], [field]: value };
    setQuestions(next);
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    const next = [...questions];
    next[qIdx].options = next[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(next);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await api.put("/settings", { quizQuestions: questions });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save quiz questions: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Scent Diagnostic Quiz CMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build quiz questions, choice options, and match patrons with their signature extrait flacon
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4 text-purple-600" />
            <span>Add Question</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saveSuccess ? "Quiz Saved Successfully!" : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={q.id || qIdx} className="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  {qIdx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Diagnostic Step {qIdx + 1}
                </span>
              </div>
              <button
                onClick={() => handleRemoveQuestion(qIdx)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Question Title & Subtitle Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Title *</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruction Subtitle</label>
                <input
                  type="text"
                  value={q.subtitle}
                  onChange={(e) => handleUpdateQuestion(qIdx, "subtitle", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Selectable Choices & Extrait Match ({q.options?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddOption(qIdx)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options?.map((opt, oIdx) => (
                  <div key={oIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleUpdateOption(qIdx, oIdx, "label", e.target.value)}
                        placeholder="Option Label"
                        className="font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 flex-1 mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIdx, oIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={opt.description}
                      onChange={(e) => handleUpdateOption(qIdx, oIdx, "description", e.target.value)}
                      placeholder="Option sensory description..."
                      className="w-full text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600"
                    />

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="block text-slate-400 font-bold mb-0.5">Scent Tag</label>
                        <input
                          type="text"
                          value={opt.tag}
                          onChange={(e) => handleUpdateOption(qIdx, oIdx, "tag", e.target.value)}
                          placeholder="e.g. Oud & Leather"
                          className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-0.5">Matched Extrait</label>
                        <input
                          type="text"
                          value={opt.productId}
                          onChange={(e) => handleUpdateOption(qIdx, oIdx, "productId", e.target.value)}
                          placeholder="product-slug"
                          className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
