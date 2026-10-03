import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, BookOpen, Loader2 } from "lucide-react";
import { Reveal, SectionHead } from "../components/ui";
import { journalService, type JournalArticleDocument } from "../services/journalService";

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    journalService
      .getArticles({ limit: 10 })
      .then((res) => {
        if (!isMounted) return;
        setArticles(res.articles || []);
      })
      .catch((err) => console.error("Error loading journal articles:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featured = articles[0];
  const others = articles.slice(1);

  return (
    <div className="relative pt-32 sm:pt-36 pb-24 sm:pb-32 text-cream bg-[#041d14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-sand/60">
          <Link to="/" className="hover:text-gold-light transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gold-light font-semibold">The Scent Journal</span>
        </nav>

        {/* Section Head */}
        <SectionHead
          eyebrow="The Scent Journal · Edition VII"
          title={
            <>
              Chronicles of <em className="gold-text font-semibold italic">Haute Perfumery.</em>
            </>
          }
          copy="Essays, harvest chronicles, and masterclasses in rare botanical oil perfumery from our master distillers and cosmetic chemists."
        />

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
            <p className="mt-3 text-xs text-sand/60">Retrieving artisanal archives...</p>
          </div>
        ) : (
          <>
            {/* Featured Article Card */}
            {featured && (
              <div className="mt-14">
                <Reveal>
                  <article className="group relative overflow-hidden rounded-3xl border border-gold/30 bg-[#031911]/90 backdrop-blur-md p-6 sm:p-10 transition-all hover:border-gold/50 shadow-2xl">
                    <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                      <div className="lg:col-span-6 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                          <span className="rounded-full bg-gold/15 px-3 py-1">{featured.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {featured.readTime || "5 min read"}
                          </span>
                        </div>

                        <h2 className="font-display text-3xl sm:text-4xl font-medium text-cream group-hover:text-gold-light transition-colors">
                          <Link to={`/journal/${featured.slug}`}>{featured.title}</Link>
                        </h2>

                        <p className="text-xs sm:text-sm text-sand/85 leading-relaxed">
                          {featured.excerpt}
                        </p>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-sand/60">By {featured.author || "Master Perfumer"}</span>
                          <Link
                            to={`/journal/${featured.slug}`}
                            className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#041d14] hover:bg-white hover:shadow-lg transition-all"
                          >
                            <span>Read Full Article</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="lg:col-span-6 overflow-hidden rounded-2xl aspect-[16/10] border border-gold/20 bg-[#03140e]">
                        <img
                          src={featured.image || (featured as any).coverImage || "/images/cambodian-oud.jpg"}
                          alt={featured.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </article>
                </Reveal>
              </div>
            )}

            {/* Remaining Articles Grid */}
            {others.length > 0 && (
              <div className="mt-12 grid gap-8 md:grid-cols-2">
                {others.map((art, i) => (
                  <Reveal key={art.slug} delay={i * 0.1}>
                    <article className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-[#031911]/80 backdrop-blur-md p-6 transition-all hover:border-gold/40 hover:-translate-y-1 shadow-xl">
                      <div>
                        <Link to={`/journal/${art.slug}`} className="block overflow-hidden rounded-2xl aspect-[16/10] border border-white/10 bg-[#03140e]">
                          <img
                            src={art.image || (art as any).coverImage || "/images/hero-perfume.jpg"}
                            alt={art.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>

                        <div className="mt-5 space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                            <span>{art.category}</span>
                            <span>•</span>
                            <span>{art.readTime || "4 min read"}</span>
                          </div>

                          <h3 className="font-display text-2xl font-semibold text-cream group-hover:text-gold-light transition-colors">
                            <Link to={`/journal/${art.slug}`}>{art.title}</Link>
                          </h3>

                          <p className="text-xs text-sand/80 line-clamp-3 leading-relaxed">
                            {art.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                        <span className="text-sand/60">By {art.author}</span>
                        <Link
                          to={`/journal/${art.slug}`}
                          className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-gold-light hover:text-gold transition-colors"
                        >
                          <span>Explore Note</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
