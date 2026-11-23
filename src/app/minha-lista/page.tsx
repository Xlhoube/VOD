"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Check,
  Loader2,
  Settings2,
  Trash2,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserWatchlist,
  removeFromWatchlist,
  updateWatchlistStatus,
  upsertUserPreferences,
} from "@/lib/appwrite";
import {
  PT_STREAMING_PROVIDERS,
  WATCHLIST_STATUS_LABELS,
  WatchlistItem,
  WatchlistStatus,
} from "@/types/media";

export default function MinhaListaPage() {
  const { user, preferences, loading: authLoading, refreshPreferences } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<WatchlistStatus>("plan_to_watch");
  const [loadingList, setLoadingList] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSavedMsg, setPrefsSavedMsg] = useState(false);

  useEffect(() => {
    if (preferences?.subscribed_providers) {
      setSelectedProviders(preferences.subscribed_providers);
    }
  }, [preferences]);

  const loadWatchlist = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    try {
      const data = await getUserWatchlist(user.$id);
      setItems(data);
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleStatusChange = async (docId: string, status: WatchlistStatus) => {
    const updated = await updateWatchlistStatus(docId, status);
    setItems((prev) =>
      prev.map((item) => (item.$id === docId ? updated : item))
    );
  };

  const handleRemove = async (docId: string) => {
    await removeFromWatchlist(docId);
    setItems((prev) => prev.filter((item) => item.$id !== docId));
  };

  const toggleProvider = (providerId: number) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleSaveProviders = async () => {
    if (!user) return;
    setSavingPrefs(true);
    setPrefsSavedMsg(false);
    try {
      await upsertUserPreferences(user.$id, selectedProviders, "PT");
      await refreshPreferences();
      setPrefsSavedMsg(true);
      setTimeout(() => setPrefsSavedMsg(false), 3000);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <Bookmark className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-2xl font-bold text-white">
            A Tua Lista Pessoal
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Inicia sessão para gerires a tua Watchlist e configurares as tuas
            plataformas de streaming em Portugal.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Iniciar Sessão</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => item.status === activeTab);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2.5">
          <Bookmark className="h-7 w-7 text-rose-500" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Minha Lista
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Gere os teus filmes e séries e configura as tuas subscrições em
          Portugal.
        </p>
      </div>

      {/* Configuração Rápida de Plataformas */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-bold text-white">
              As Minhas Plataformas (Portugal)
            </h2>
          </div>
          <button
            onClick={handleSaveProviders}
            disabled={savingPrefs}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
          >
            {savingPrefs ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>Guardar Preferências</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PT_STREAMING_PROVIDERS.map((provider) => {
            const active = selectedProviders.includes(provider.id);
            return (
              <button
                key={provider.id}
                onClick={() => toggleProvider(provider.id)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "border-rose-500 bg-rose-500/15 text-white"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {provider.name}
              </button>
            );
          })}
        </div>

        {prefsSavedMsg && (
          <p className="mt-3 text-xs font-medium text-emerald-400">
            Preferências guardadas com sucesso! Já podes usar o filtro
            &ldquo;Nas minhas plataformas&rdquo; em Explorar.
          </p>
        )}
      </section>

      {/* Separadores da Watchlist */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          {(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map(
            (statusKey) => {
              const count = items.filter((i) => i.status === statusKey).length;
              const isActive = activeTab === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => setActiveTab(statusKey)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-rose-600 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <span>{WATCHLIST_STATUS_LABELS[statusKey]}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-black/25 text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {loadingList ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <p className="text-sm text-zinc-400">
              Ainda não tens títulos em &ldquo;
              {WATCHLIST_STATUS_LABELS[activeTab]}&rdquo;.
            </p>
            <Link
              href="/explorar"
              className="mt-4 inline-block text-xs font-semibold text-rose-400 hover:underline"
            >
              Explorar catálogo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                : "/placeholder-poster.svg";

              return (
                <div
                  key={item.$id}
                  className="flex gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5"
                >
                  <Link
                    href={`/${item.media_type}/${item.tmdb_id}`}
                    className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900"
                  >
                    <Image
                      src={poster}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                        {item.media_type === "movie" ? "Filme" : "Série"}
                      </span>
                      <Link
                        href={`/${item.media_type}/${item.tmdb_id}`}
                        className="mt-0.5 block truncate text-sm font-bold text-white hover:text-rose-400"
                      >
                        {item.title}
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          item.$id &&
                          handleStatusChange(
                            item.$id,
                            e.target.value as WatchlistStatus
                          )
                        }
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-200 focus:border-rose-500 focus:outline-none"
                      >
                        {(
                          Object.keys(
                            WATCHLIST_STATUS_LABELS
                          ) as WatchlistStatus[]
                        ).map((statusKey) => (
                          <option key={statusKey} value={statusKey}>
                            {WATCHLIST_STATUS_LABELS[statusKey]}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => item.$id && handleRemove(item.$id)}
                        title="Remover"
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 transition-colors hover:border-rose-500/50 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
