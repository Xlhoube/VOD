import {
  DiscoverFilters,
  Genre,
  MediaDetails,
  MediaItem,
  MediaType,
  WatchProvidersPT,
} from "@/types/media";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getImageUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_READ_ACCESS_TOKEN não está definido nas variáveis de ambiente do servidor."
    );
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Erro na API do TMDB (${response.status}): ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBListResponse<MediaItem>>(
    `/trending/${mediaType}/${timeWindow}`,
    {
      language: "pt-PT",
      region: "PT",
    }
  );
  return data.results.filter(
    (item) => item.media_type !== "person" as unknown as MediaType
  );
}

export async function getPopular(type: MediaType): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBListResponse<MediaItem>>(`/${type}/popular`, {
    language: "pt-PT",
    region: "PT",
  });
  return data.results.map((item) => ({ ...item, media_type: type }));
}

export async function searchMulti(
  query: string,
  page = 1
): Promise<TMDBListResponse<MediaItem>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const data = await tmdbFetch<TMDBListResponse<MediaItem>>("/search/multi", {
    query: query.trim(),
    language: "pt-PT",
    region: "PT",
    include_adult: "false",
    page,
  });

  return {
    ...data,
    results: data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ),
  };
}

export async function discoverMedia(
  filters: DiscoverFilters = {}
): Promise<TMDBListResponse<MediaItem>> {
  const type: MediaType = filters.type || "movie";
  const params: Record<string, string | number | undefined> = {
    language: "pt-PT",
    watch_region: "PT",
    sort_by: filters.sortBy || "popularity.desc",
    page: filters.page || 1,
    include_adult: "false",
  };

  if (filters.genre) {
    params.with_genres = filters.genre;
  }

  if (filters.year) {
    if (type === "movie") {
      params.primary_release_year = filters.year;
    } else {
      params.first_air_date_year = filters.year;
    }
  }

  if (filters.providers && filters.providers.length > 0) {
    params.with_watch_providers = filters.providers.join("|");
    params.with_watch_monetization_types = "flatrate";
  }

  const data = await tmdbFetch<TMDBListResponse<MediaItem>>(
    `/discover/${type}`,
    params
  );

  return {
    ...data,
    results: data.results.map((item) => ({ ...item, media_type: type })),
  };
}

export async function getMediaDetails(
  type: MediaType,
  id: number | string
): Promise<MediaDetails> {
  const data = await tmdbFetch<MediaDetails>(`/${type}/${id}`, {
    language: "pt-PT",
    append_to_response: "credits,videos",
  });

  // Fallback para en-US se a sinopse em PT-PT estiver vazia
  if (!data.overview || data.overview.trim() === "") {
    try {
      const fallback = await tmdbFetch<MediaDetails>(`/${type}/${id}`, {
        language: "en-US",
      });
      if (fallback.overview) {
        data.overview = fallback.overview;
      }
      if (!data.tagline && fallback.tagline) {
        data.tagline = fallback.tagline;
      }
    } catch {
      // Ignora erro de fallback e mantém os dados originais
    }
  }

  return { ...data, media_type: type };
}

export async function getWatchProviders(
  type: MediaType,
  id: number | string
): Promise<WatchProvidersPT | null> {
  interface ProvidersResponse {
    id: number;
    results: Record<string, WatchProvidersPT>;
  }

  const data = await tmdbFetch<ProvidersResponse>(`/${type}/${id}/watch/providers`);
  return data.results?.PT || null;
}

export async function getGenres(type: MediaType): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(`/genre/${type}/list`, {
    language: "pt-PT",
  });
  return data.genres;
}
