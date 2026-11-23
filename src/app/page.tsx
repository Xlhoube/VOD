import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Film, Tv, ArrowRight, Star, Info } from "lucide-react";
import { getPopular, getTrending } from "@/lib/tmdb";
import { MediaItem } from "@/types/media";
import { MediaCard } from "@/components/MediaCard";
import { InstantSearch } from "@/components/InstantSearch";

export const revalidate = 3600;

function MediaCarousel({
  title,
  icon,
  items,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  items: MediaItem[];
  href?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>Ver tudo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {items.slice(0, 15).map((item) => (
          <div
            key={`${item.media_type || "media"}-${item.id}`}
            className="w-[155px] shrink-0 sm:w-[185px]"
          >
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  let trending: MediaItem[] = [];
  let popularMovies: MediaItem[] = [];
  let popularTv: MediaItem[] = [];
  let apiError = false;

  try {
    const [t, m, tv] = await Promise.all([
      getTrending("all", "week"),
      getPopular("movie"),
      getPopular("tv"),
    ]);
    trending = t;
    popularMovies = m;
    popularTv = tv;
  } catch {
    apiError = true;
  }

  const heroItem = trending.find((item) => item.backdrop_path) || trending[0];
  const heroType = heroItem?.media_type || (heroItem?.title ? "movie" : "tv");
  const heroTitle = heroItem?.title || heroItem?.name || "CinePT";
  const heroBackdrop = heroItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`
    : null;

  return (
    <div className="pb-16">
      {/* Hero Banner Dinâmico */}
      <section className="relative flex min-h-[500px] w-full items-center overflow-hidden border-b border-zinc-800/80 bg-zinc-950 py-16">
        {heroBackdrop && (
          <>
            <Image
              src={heroBackdrop}
              alt={heroTitle}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-400">
              <Flame className="h-3.5 w-3.5" />
              <span>Em Destaque em Portugal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Descobre onde ver os teus filmes e séries favoritos.
            </h1>

            <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
              Pesquisa no catálogo completo, verifica a disponibilidade oficial
              em Portugal (Netflix, Prime Video, Disney+, Max, SkyShowtime) e
              gere a tua Watchlist pessoal.
            </p>

            {/* Barra de Pesquisa Instantânea */}
            <InstantSearch />

            {heroItem && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/${heroType}/${heroItem.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-colors hover:bg-rose-500"
                >
                  <Info className="h-4 w-4" />
                  <span>Ver Destaque: {heroTitle}</span>
                  {heroItem.vote_average > 0 && (
                    <span className="ml-1 flex items-center gap-1 rounded bg-black/30 px-1.5 py-0.5 text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {heroItem.vote_average.toFixed(1)}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <div className="mx-auto mt-10 max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {apiError ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <h2 className="text-lg font-bold text-amber-300">
              Configuração do TMDB Necessária
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Adiciona a variável{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-amber-200">
                TMDB_READ_ACCESS_TOKEN
              </code>{" "}
              ao ficheiro{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-amber-200">
                .env.local
              </code>{" "}
              para carregar os filmes e séries em tempo real.
            </p>
          </div>
        ) : (
          <>
            <MediaCarousel
              title="Tendências em Portugal"
              icon={<Flame className="h-6 w-6 text-rose-500" />}
              items={trending}
              href="/explorar"
            />

            <MediaCarousel
              title="Filmes Populares"
              icon={<Film className="h-6 w-6 text-amber-400" />}
              items={popularMovies}
              href="/explorar?type=movie"
            />

            <MediaCarousel
              title="Séries em Destaque"
              icon={<Tv className="h-6 w-6 text-sky-400" />}
              items={popularTv}
              href="/explorar?type=tv"
            />
          </>
        )}
      </div>
    </div>
  );
}
