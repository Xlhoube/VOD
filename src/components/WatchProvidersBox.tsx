import React from "react";
import Image from "next/image";
import { Tv, ExternalLink } from "lucide-react";
import { WatchProvider, WatchProvidersPT } from "@/types/media";

interface WatchProvidersBoxProps {
  providers: WatchProvidersPT | null;
}

function ProviderGroup({
  title,
  items,
}: {
  title: string;
  items?: WatchProvider[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h4>
      <div className="flex flex-wrap gap-3">
        {items.map((provider) => (
          <div
            key={provider.provider_id}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 pr-3.5 pl-1.5 py-1.5 shadow-sm"
            title={provider.provider_name}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`}
                alt={provider.provider_name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-zinc-200">
              {provider.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WatchProvidersBox({ providers }: WatchProvidersBoxProps) {
  const hasAny =
    providers &&
    ((providers.flatrate && providers.flatrate.length > 0) ||
      (providers.rent && providers.rent.length > 0) ||
      (providers.buy && providers.buy.length > 0));

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-6 backdrop-blur-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Onde Ver em Portugal
            </h3>
            <p className="text-xs text-zinc-400">
              Disponibilidade oficial em plataformas de streaming (PT)
            </p>
          </div>
        </div>

        {providers?.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <span>Ver no TMDB / JustWatch</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-5 text-center">
          <p className="text-sm text-zinc-400">
            De momento não existem informações de disponibilidade em plataformas
            portuguesas para este título.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <ProviderGroup title="Subscrição" items={providers?.flatrate} />
          <ProviderGroup title="Aluguer" items={providers?.rent} />
          <ProviderGroup title="Compra" items={providers?.buy} />
        </div>
      )}
    </div>
  );
}
