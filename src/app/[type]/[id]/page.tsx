import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Calendar, Clock, Users } from "lucide-react";
import { getMediaDetails, getWatchProviders } from "@/lib/tmdb";
import { MediaType } from "@/types/media";
import { WatchProvidersBox } from "@/components/WatchProvidersBox";
import { TrailerModal } from "@/components/TrailerModal";
import { WatchlistButton } from "@/components/WatchlistButton";

export const revalidate = 3600;

interface DetailPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function MediaDetailPage({ params }: DetailPageProps) {
  const { type, id } = await params;

  if (type !== "movie" && type !== "tv") {
    notFound();
  }

  const mediaType = type as MediaType;

  let details;
  let providers;

  try {
    [details, providers] = await Promise.all([
      getMediaDetails(mediaType, id),
      getWatchProviders(mediaType, id),
    ]);
  } catch {
    notFound();
  }

  const title = details.title || details.name || "Sem título";
  const date = details.release_date || details.first_air_date || "";
  const year = date ? date.slice(0, 4) : "";
  const runtime =
    details.runtime ||
    (details.episode_run_time && details.episode_run_time[0]) ||
    null;

  const backdropUrl = details.backdrop_path
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
    : null;
  const posterUrl = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : "/placeholder-poster.svg";

  const cast = details.credits?.cast.slice(0, 8) || [];

  return (
    <div className="pb-20">
      {/* Hero Backdrop */}
      <section className="relative border-b border-zinc-800/80 bg-zinc-950">
        {backdropUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={backdropUrl}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25 blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Poster */}
            <div className="relative mx-auto aspect-[2/3] w-56 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl md:mx-0 md:w-72">
              <Image
                src={posterUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 224px, 288px"
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <span className="rounded-md bg-rose-600/20 px-2.5 py-1 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                    {mediaType === "movie" ? "Filme" : "Série"}
                  </span>
                  {year && (
                    <span className="inline-flex items-center gap-1 text-zinc-300">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {year}
                    </span>
                  )}
                  {runtime && (
                    <span className="inline-flex items-center gap-1 text-zinc-300">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      {runtime} min
                    </span>
                  )}
                  {details.vote_average > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-400 border border-amber-500/20">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {details.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {title}
                </h1>

                {details.tagline && (
                  <p className="text-sm italic text-zinc-400">
                    &ldquo;{details.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Géneros */}
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Sinopse */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Sinopse
                </h2>
                <p className="max-w-3xl text-sm leading-relaxed text-zinc-200 sm:text-base">
                  {details.overview ||
                    "Sinopse não disponível de momento para este título."}
                </p>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <TrailerModal
                  videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  title={title}
                  posterUrl={backdropUrl || posterUrl}
                />
                <WatchlistButton
                  tmdbId={details.id}
                  mediaType={mediaType}
                  title={title}
                  posterPath={details.poster_path}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onde Ver em Portugal & Elenco */}
      <div className="mx-auto mt-10 max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <WatchProvidersBox providers={providers} />

        {cast.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              <h2 className="text-xl font-bold text-white">Elenco Principal</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50"
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900">
                    <Image
                      src={
                        person.profile_path
                          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                          : "/placeholder-poster.svg"
                      }
                      alt={person.name}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold text-white">
                      {person.name}
                    </p>
                    <p className="truncate text-[11px] text-zinc-400">
                      {person.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
