import {
  Account,
  Client,
  Databases,
  ID,
  Models,
  Query,
} from "appwrite";
import {
  MediaType,
  UserPreferences,
  WatchlistItem,
  WatchlistStatus,
} from "@/types/media";

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "streaming_hub";
const COLLECTION_PREFERENCES =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PREFERENCES || "user_preferences";
const COLLECTION_WATCHLIST =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WATCHLIST || "watchlist";

const client = new Client();

if (PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);

export function isAppwriteConfigured(): boolean {
  return Boolean(PROJECT_ID);
}

// ==========================================
// AUTENTICAÇÃO
// ==========================================

export async function loginWithEmail(
  email: string,
  password: string
): Promise<Models.Session> {
  return account.createEmailPasswordSession(email, password);
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<Models.User<Models.Preferences>> {
  const user = await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return user;
}

export async function logout(): Promise<void> {
  await account.deleteSession("current");
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  if (!isAppwriteConfigured()) return null;
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// ==========================================
// WATCHLIST CRUD
// ==========================================

export async function getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (!isAppwriteConfigured()) return [];
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_WATCHLIST,
    [Query.equal("user_id", userId), Query.orderDesc("added_at"), Query.limit(100)]
  );
  return response.documents as unknown as WatchlistItem[];
}

export async function getWatchlistEntry(
  userId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<WatchlistItem | null> {
  if (!isAppwriteConfigured()) return null;
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_WATCHLIST,
    [
      Query.equal("user_id", userId),
      Query.equal("tmdb_id", tmdbId),
      Query.equal("media_type", mediaType),
      Query.limit(1),
    ]
  );
  if (response.documents.length === 0) return null;
  return response.documents[0] as unknown as WatchlistItem;
}

export async function addToWatchlist(
  item: Omit<WatchlistItem, "$id" | "added_at">
): Promise<WatchlistItem> {
  const existing = await getWatchlistEntry(
    item.user_id,
    item.tmdb_id,
    item.media_type
  );
  if (existing) {
    return existing;
  }

  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_WATCHLIST,
    ID.unique(),
    {
      ...item,
      added_at: new Date().toISOString(),
    }
  );
  return doc as unknown as WatchlistItem;
}

export async function updateWatchlistStatus(
  documentId: string,
  status: WatchlistStatus
): Promise<WatchlistItem> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    COLLECTION_WATCHLIST,
    documentId,
    { status }
  );
  return doc as unknown as WatchlistItem;
}

export async function removeFromWatchlist(documentId: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_WATCHLIST, documentId);
}

// ==========================================
// USER PREFERENCES CRUD
// ==========================================

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  if (!isAppwriteConfigured()) return null;
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_PREFERENCES,
    [Query.equal("user_id", userId), Query.limit(1)]
  );
  if (response.documents.length === 0) return null;
  return response.documents[0] as unknown as UserPreferences;
}

export async function upsertUserPreferences(
  userId: string,
  subscribedProviders: number[],
  region = "PT"
): Promise<UserPreferences> {
  const existing = await getUserPreferences(userId);
  if (existing && existing.$id) {
    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_PREFERENCES,
      existing.$id,
      {
        region,
        subscribed_providers: subscribedProviders,
      }
    );
    return updated as unknown as UserPreferences;
  }

  const created = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_PREFERENCES,
    ID.unique(),
    {
      user_id: userId,
      region,
      subscribed_providers: subscribedProviders,
    }
  );
  return created as unknown as UserPreferences;
}
