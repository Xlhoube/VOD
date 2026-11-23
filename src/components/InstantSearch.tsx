"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Star, Loader2 } from "lucide-react";
import { MediaItem } from "@/types/media";

export function InstantSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults((data.results || []).slice(0, 8));
          setOpen(true);
        }
      } catch {
        // Silenciar erro transitório de pesquisa
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Pesquisar filmes ou séries em Portugal..."
          className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/90 py-3.5 pr-12 pl-12 text-sm text-white placeholder-zinc-400 shadow-xl backdrop-blur-md transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
        {loading ? (
          <Loader2 className="absolute right-4 h-5 w-5 animate-spin text-rose-500" />
        ) : (
          query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="absolute right-3.5 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
          <div className="max-h-[420px] divide-y divide-zinc-800/70 overflow-y-auto">
            {results.map((item) => {
              const type = item.media_type || (item.title ? "movie" : "tv");
              const title = item.title || item.name || "Sem título";
              const date = item.release_date || item.first_air_date || "";
              const year = date ? date.slice(0, 4) : "";
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                : "/placeholder-poster.svg";

              return (
                <Link
                  key={`${type}-${item.id}`}
                  href={`/${type}/${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 p-3 transition-colors hover:bg-zinc-900"
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                    <Image
                      src={poster}
                      alt={title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-300">
                        {type === "movie" ? "Filme" : "Série"}
                      </span>
                      {year && <span>{year}</span>}
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {open && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 text-center text-sm text-zinc-400 shadow-2xl">
          Nenhum resultado encontrado para &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
