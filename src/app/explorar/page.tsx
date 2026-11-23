"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Filter, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MediaCard } from "@/components/MediaCard";
import { MediaItem, MediaType, PT_STREAMING_PROVIDERS } from "@/types/media";

const MOVIE_GENRES = [
  { id: "28", name: "Ação" },
  { id: "12", name: "Aventura" },
  { id: "16", name: "Animação" },
  { id: "35", name: "Comédia" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentário" },
  { id: "18", name: "Drama" },
  { id: "14", name: "Fantasia" },
  { id: "27", name: "Terror" },
  { id: "878", name: "Ficção Científica" },
  { id: "53", name: "Thriller" },
];

const TV_GENRES = [
  { id: "10759", name: "Ação e Aventura" },
  { id: "16", name: "Animação" },
  { id: "35", name: "Comédia" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentário" },
  { id: "18", name: "Drama" },
  { id: "10765", name: "Sci-Fi e Fantasia" },
  { id: "9648", name: "Mistério" },
];

function ExplorarContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as MediaType) || "movie";

  const { user, preferences } = useAuth();
  const [type, setType] = useState<MediaType>(initialType);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [onlyMyPlatforms, setOnlyMyPlatforms] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const subscribedIds = preferences?.subscribed_providers || [];

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        page: String(page),
      });
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);
      if (onlyMyPlatforms && subscribedIds.length > 0) {
        params.set("providers", subscribedIds.join(","));
      }

      const res = await fetch(`/api/tmdb/discover?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      }
    } finally {
      setLoading(false);
    }
  }, [type, genre, year, onlyMyPlatforms, subscribedIds, page]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const genresList = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => String(currentYear - i));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-rose-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Explorar Catálogo
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Filtra filmes e séries disponíveis em Portugal por género, ano e
            subscrições.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mr-2">
            <Filter className="h-4 w-4 text-rose-500" />
            <span>Filtros</span>
          </div>

          {/* Tipo: Filme / Série */}
          <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              onClick={() => {
                setType("movie");
                setGenre("");
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                type === "movie"
                  ? "bg-rose-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Filmes
            </button>
            <button
              onClick={() => {
                setType("tv");
                setGenre("");
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                type === "tv"
                  ? "bg-rose-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Séries
            </button>
          </div>

          {/* Género */}
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:border-rose-500 focus:outline-none"
          >
            <option value="">Todos os Géneros</option>
            {genresList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Ano */}
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:border-rose-500 focus:outline-none"
          >
            <option value="">Todos os Anos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Filtro Rápido: Nas minhas plataformas */}
          <button
            onClick={() => {
              if (!user) return;
              setOnlyMyPlatforms((prev) => !prev);
              setPage(1);
            }}
            disabled={!user || subscribedIds.length === 0}
            title={
              !user
                ? "Inicia sessão para usar as tuas plataformas"
                : subscribedIds.length === 0
                  ? "Configura as tuas plataformas em Minha Lista"
                  : "Filtrar pelas tuas subscrições"
            }
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              onlyMyPlatforms
                ? "border-rose-500 bg-rose-500/15 text-rose-400"
                : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nas minhas plataformas</span>
            {subscribedIds.length > 0 && (
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                {subscribedIds.length}
              </span>
            )}
          </button>

          {user && subscribedIds.length === 0 && (
            <Link
              href="/minha-lista"
              className="text-xs font-medium text-rose-400 hover:underline"
            >
              Configurar plataformas →
            </Link>
          )}
        </div>

        {onlyMyPlatforms && subscribedIds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
            <span>A mostrar apenas em:</span>
            {PT_STREAMING_PROVIDERS.filter((p) =>
              subscribedIds.includes(p.id)
            ).map((p) => (
              <span
                key={p.id}
                className="rounded-md bg-zinc-800 px-2 py-0.5 font-medium text-zinc-200"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grelha de Resultados */}
      {loading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <p className="text-sm text-zinc-400">
            Nenhum título encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((item) => (
              <MediaCard key={item.id} item={item} forcedType={type} />
            ))}
          </div>

          {/* Paginação */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            <span className="text-xs font-medium text-zinc-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              <span>Seguinte</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <ExplorarContent />
    </Suspense>
  );
}
