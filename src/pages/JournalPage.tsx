import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { JOURNAL_ARTICLES } from "../data";
import { Reveal, SectionHead } from "../components/ui";

export default function JournalPage() {
  const featured = JOURNAL_ARTICLES[0];
  const others = JOURNAL_ARTICLES.slice(1);

  return (
    <div className="relative pt-28 pb-24 sm:pb-32 text-cream">
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

        {/* Featured Article Card */}
        {featured && (
          <div className="mt-14">
            <Reveal>
              <article className="glass-card group relative overflow-hidden rounded-3xl border border-gold/30 p-6 sm:p-10 transition-all hover:border-gold/50">
                <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                      <span className="rounded-full bg-gold/15 px-3 py-1">{featured.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {featured.readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-3xl sm:text-4xl font-medium text-cream group-hover:text-gold-light transition-colors">
                      <Link to={`/journal/${featured.slug}`}>{featured.title}</Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-sand/85 leading-relaxed">
                      {featured.excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-sand/60">{featured.author}</span>
                      <Link
                        to={`/journal/${featured.slug}`}
                        className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                      >
                        Read Full Article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 overflow-hidden rounded-2xl aspect-[16/10] border border-gold/20">
                    <img
                      src={featured.image}
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
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {others.map((art, i) => (
            <Reveal key={art.slug} delay={i * 0.1}>
              <article className="glass-card group flex h-full flex-col justify-between rounded-3xl p-6 transition-all hover:border-gold/40 hover:-translate-y-1">
                <div>
                  <Link to={`/journal/${art.slug}`} className="block overflow-hidden rounded-2xl aspect-[16/10] border border-gold/15">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                      <span>{art.category}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-cream group-hover:text-gold-light transition-colors">
                      <Link to={`/journal/${art.slug}`}>{art.title}</Link>
                    </h3>

                    <p className="text-xs text-sand/80 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gold/10 flex items-center justify-between text-xs text-sand/60">
                  <span>{art.author}</span>
                  <Link to={`/journal/${art.slug}`} className="text-gold-light font-bold hover:underline flex items-center gap-1">
                    Read Story <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
