"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  addToWatchlist,
  getWatchlistEntry,
  removeFromWatchlist,
  updateWatchlistStatus,
} from "@/lib/appwrite";
import {
  MediaType,
  WATCHLIST_STATUS_LABELS,
  WatchlistItem,
  WatchlistStatus,
} from "@/types/media";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
}

export function WatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
}: WatchlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [entry, setEntry] = useState<WatchlistItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!user) {
        setEntry(null);
        setChecking(false);
        return;
      }
      try {
        const found = await getWatchlistEntry(user.$id, tmdbId, mediaType);
        if (active) setEntry(found);
      } catch {
        // Ignorar
      } finally {
        if (active) setChecking(false);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [user, tmdbId, mediaType]);

  const handleAdd = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const created = await addToWatchlist({
        user_id: user.$id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title,
        poster_path: posterPath || "",
        status: "plan_to_watch",
      });
      setEntry(created);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: WatchlistStatus) => {
    if (!entry?.$id) return;
    setLoading(true);
    try {
      const updated = await updateWatchlistStatus(entry.$id, newStatus);
      setEntry(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!entry?.$id) return;
    setLoading(true);
    try {
      await removeFromWatchlist(entry.$id);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="h-11 w-48 animate-pulse rounded-xl bg-zinc-800/80" />
    );
  }

  if (!entry) {
    return (
      <button
        onClick={handleAdd}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:border-rose-500 hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className="h-4 w-4 text-rose-500" />
        )}
        <span>Adicionar à Minha Lista</span>
      </button>
    );
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-semibold text-emerald-400">
        <Check className="h-4 w-4" />
        <span>Na Minha Lista</span>
      </div>

      <select
        value={entry.status}
        onChange={(e) => handleStatusChange(e.target.value as WatchlistStatus)}
        disabled={loading}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-200 focus:border-rose-500 focus:outline-none"
      >
        {(Object.keys(WATCHLIST_STATUS_LABELS) as WatchlistStatus[]).map(
          (statusKey) => (
            <option key={statusKey} value={statusKey}>
              {WATCHLIST_STATUS_LABELS[statusKey]}
            </option>
          )
        )}
      </select>

      <button
        onClick={handleRemove}
        disabled={loading}
        title="Remover da Minha Lista"
        className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
