import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { MediaItem, MediaType } from "@/types/media";

interface MediaCardProps {
  item: MediaItem;
  forcedType?: MediaType;
}

export function MediaCard({ item, forcedType }: MediaCardProps) {
  const mediaType: MediaType =
    forcedType || item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Sem título";
  const date = item.release_date || item.first_air_date || "";
  const year = date ? date.slice(0, 4) : "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder-poster.svg";

  return (
    <Link
      href={`/${mediaType}/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Hover CTA */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="rounded-full bg-rose-600/95 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
            Ver detalhes
          </span>
        </div>

        {/* Badge Tipo */}
        <span className="absolute top-2.5 left-2.5 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-sm border border-zinc-800">
          {mediaType === "movie" ? "Filme" : "Série"}
        </span>

        {/* Badge Classificação */}
        {rating && Number(rating) > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-zinc-950/85 px-2 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-sm border border-zinc-800">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 group-hover:text-rose-400 transition-colors">
          {title}
        </h3>
        {year && (
          <p className="mt-1 text-xs font-medium text-zinc-500">{year}</p>
        )}
      </div>
    </Link>
  );
}
