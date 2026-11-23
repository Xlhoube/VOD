export type MediaType = "movie" | "tv";

export type WatchlistStatus = "plan_to_watch" | "watching" | "completed";

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MediaDetails extends MediaItem {
  genres: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: VideoResult[];
  };
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProvidersPT {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface DiscoverFilters {
  type?: MediaType;
  genre?: string;
  year?: string;
  sortBy?: string;
  providers?: number[];
  page?: number;
}

export interface WatchlistItem {
  $id?: string;
  user_id: string;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string;
  status: WatchlistStatus;
  added_at: string;
}

export interface UserPreferences {
  $id?: string;
  user_id: string;
  region: string;
  subscribed_providers: number[];
}

export interface StreamingProviderOption {
  id: number;
  name: string;
  color: string;
}

export const PT_STREAMING_PROVIDERS: StreamingProviderOption[] = [
  { id: 8, name: "Netflix", color: "#E50914" },
  { id: 119, name: "Prime Video", color: "#00A8E1" },
  { id: 337, name: "Disney+", color: "#113CCF" },
  { id: 1899, name: "Max", color: "#002BE7" },
  { id: 1773, name: "SkyShowtime", color: "#0078FF" },
  { id: 350, name: "Apple TV+", color: "#555555" },
];

export const WATCHLIST_STATUS_LABELS: Record<WatchlistStatus, string> = {
  plan_to_watch: "Para Ver",
  watching: "A Ver",
  completed: "Visto",
};
