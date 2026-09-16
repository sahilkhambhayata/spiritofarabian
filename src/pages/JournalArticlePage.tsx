import { Link, useParams, Navigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { JOURNAL_ARTICLES } from "../data";

export default function JournalArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = JOURNAL_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/journal" replace />;
  }

  const related = JOURNAL_ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <div className="relative pt-28 pb-24 sm:pb-32 text-cream">
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
              <Clock className="h-3 w-3" /> {article.readTime}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-medium text-cream leading-[1.1]">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs text-sand/60 pt-2">
            <span>By <strong className="text-cream">{article.author}</strong></span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gold/25 aspect-[16/9] shadow-2xl">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="mt-12 space-y-6 text-sm sm:text-base leading-relaxed text-sand/90 border-b border-gold/15 pb-12">
          {article.content.map((paragraph, i) => (
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
            className="btn-gold rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider"
          >
            Explore The Collection
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
                  className="glass-card group block rounded-2xl p-4 transition-all hover:border-gold/40"
                >
                  <span className="text-[9px] font-bold uppercase text-gold block">{r.category}</span>
                  <h4 className="font-display text-lg font-semibold text-cream mt-1 group-hover:text-gold-light transition-colors">
                    {r.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
