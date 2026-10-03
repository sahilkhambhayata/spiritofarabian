import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Clock, ArrowLeft, Loader2, Share2, Sparkles } from "lucide-react";
import { journalService, type JournalArticleDocument } from "../services/journalService";

export default function JournalArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<JournalArticleDocument | null>(null);
  const [related, setRelated] = useState<JournalArticleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    setLoading(true);
    setNotFound(false);

    journalService
      .getBySlug(slug)
      .then((doc) => {
        if (!isMounted) return;
        setArticle(doc);
      })
      .catch((err) => {
        console.error("Error fetching journal article:", err);
        if (isMounted) setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Fetch related articles
    journalService
      .getArticles({ limit: 4 })
      .then((res) => {
        if (!isMounted) return;
        const filtered = (res.articles || []).filter((a) => a.slug !== slug);
        setRelated(filtered.slice(0, 2));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (notFound) {
    return <Navigate to="/journal" replace />;
  }

  if (loading || !article) {
    return (
      <div className="min-h-screen pt-40 pb-24 text-center text-cream bg-[#041d14]">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
        <p className="mt-3 text-xs text-sand/60">Opening master perfume manuscript...</p>
      </div>
    );
  }

  // Handle paragraph splitting
  const paragraphs = Array.isArray(article.content)
    ? article.content
    : typeof article.content === "string"
    ? article.content.split("\n\n").filter(Boolean)
    : ["Artisanal extraction archives..."];

  const articleImg = article.image || (article as any).coverImage || "/images/cambodian-oud.jpg";

  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream bg-[#041d14]">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <Link to="/journal" className="hover:text-gold-light transition-colors">Journal</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
            <span className="rounded-full bg-gold/15 px-3 py-1">{article.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {article.readTime || "5 min read"}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-medium text-cream leading-[1.15]">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs text-sand/60 pt-2">
            <span>By <strong className="text-cream">{article.author}</strong></span>
            <span>•</span>
            <span>
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "Artisanal Edition"}
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gold/25 aspect-[16/9] shadow-2xl bg-[#03140e]">
          <img
            src={articleImg}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="mt-12 space-y-6 text-sm sm:text-base leading-relaxed text-sand/90 border-b border-gold/15 pb-12">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="first-letter:font-display first-letter:text-4xl first-letter:font-bold first-letter:text-gold-light first-letter:mr-1">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Author Footer & Share */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold font-display font-bold">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-cream">{article.author}</p>
              <p className="text-[10px] text-sand/60">SPIRIT OF ARABIAN Editorial Board</p>
            </div>
          </div>

          <Link
            to="/collection"
            className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-xs font-black uppercase tracking-wider text-[#041d14] hover:bg-white hover:shadow-lg transition-all"
          >
            <span>Explore The Collection</span>
          </Link>
        </div>

        {/* More Articles */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gold/15">
            <h3 className="font-display text-2xl font-medium text-cream mb-6">
              More From The Scent Journal
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/journal/${r.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-[#031911]/80 backdrop-blur-md p-4 transition-all hover:border-gold/40 shadow-lg"
                >
                  <span className="text-[9px] font-bold uppercase text-gold block">{r.category}</span>
                  <h4 className="font-display text-lg font-semibold text-cream mt-1 group-hover:text-gold-light transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-sand/70 mt-1 line-clamp-2">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
