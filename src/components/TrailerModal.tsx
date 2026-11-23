"use client";

import React, { useState, useEffect } from "react";
import { Play, X, Subtitles } from "lucide-react";

export interface SubtitleTrack {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

interface TrailerModalProps {
  videoUrl: string;
  title: string;
  posterUrl?: string;
  subtitles?: SubtitleTrack[];
}

export function TrailerModal({
  videoUrl,
  title,
  posterUrl,
  subtitles = [],
}: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg transition-all hover:bg-zinc-200 active:scale-95"
      >
        <Play className="h-4 w-4 fill-zinc-950" />
        <span>Ver Vídeo</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
              <div className="flex items-center gap-2 truncate">
                <h3 className="truncate text-sm font-semibold text-white">
                  {title}
                </h3>
                {subtitles.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                    <Subtitles className="h-3 w-3 text-rose-400" />
                    Legendas
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Fechar vídeo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <video
                src={videoUrl}
                poster={posterUrl}
                controls
                autoPlay
                playsInline
                crossOrigin="anonymous"
                className="h-full w-full"
              >
                {subtitles.map((track) => (
                  <track
                    key={track.srcLang}
                    kind="subtitles"
                    src={track.src}
                    srcLang={track.srcLang}
                    label={track.label}
                    default={track.default}
                  />
                ))}
                O teu navegador não suporta a reprodução de vídeo HTML5.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
