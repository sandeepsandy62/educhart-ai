/**
 * Asset-provider abstraction.
 *
 * The editor and search panel never talk to Pixabay/Unsplash directly —
 * they call `searchImages()`. Swapping providers, adding a third one, or
 * later plugging in AI-generated illustrations means editing this file
 * only. Nothing upstream changes.
 */

export interface ImageResult {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  source: 'pixabay' | 'unsplash';
  attribution: string;
}

export interface SearchPage {
  results: ImageResult[];
  hasMore: boolean;
}

export class MissingApiKeyError extends Error {
  constructor(public provider: string, public envVar: string) {
    super(`${provider} API key missing. Set ${envVar} in your .env file.`);
  }
}

const PIXABAY_KEY = process.env.EXPO_PUBLIC_PIXABAY_KEY;
const UNSPLASH_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;

const PER_PAGE = 24;

async function searchPixabay(query: string, page: number): Promise<SearchPage> {
  if (!PIXABAY_KEY) {
    throw new MissingApiKeyError('Pixabay', 'EXPO_PUBLIC_PIXABAY_KEY');
  }
  const url =
    `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}` +
    `&image_type=photo&safesearch=true&page=${page}&per_page=${PER_PAGE}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay request failed (${res.status})`);
  const data = await res.json();

  const results: ImageResult[] = (data.hits ?? []).map((hit: any) => ({
    id: `pixabay-${hit.id}`,
    thumbUrl: hit.webformatURL,
    fullUrl: hit.largeImageURL ?? hit.webformatURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    source: 'pixabay' as const,
    attribution: `Photo by ${hit.user} on Pixabay`,
  }));

  const totalHits = data.totalHits ?? 0;
  return { results, hasMore: page * PER_PAGE < totalHits };
}

async function searchUnsplash(query: string, page: number): Promise<SearchPage> {
  if (!UNSPLASH_KEY) {
    throw new MissingApiKeyError('Unsplash', 'EXPO_PUBLIC_UNSPLASH_ACCESS_KEY');
  }
  const url =
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
    `&page=${page}&per_page=${PER_PAGE}&client_id=${UNSPLASH_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Unsplash request failed (${res.status})`);
  const data = await res.json();

  const results: ImageResult[] = (data.results ?? []).map((photo: any) => ({
    id: `unsplash-${photo.id}`,
    thumbUrl: photo.urls.small,
    fullUrl: photo.urls.regular,
    width: photo.width,
    height: photo.height,
    source: 'unsplash' as const,
    attribution: `Photo by ${photo.user?.name ?? 'unknown'} on Unsplash`,
  }));

  return { results, hasMore: page < (data.total_pages ?? 0) };
}

/**
 * Tries Pixabay first (no attribution requirement, generous free tier),
 * falls back to Unsplash if Pixabay has no key configured. Throws
 * MissingApiKeyError if neither provider is configured, so the UI can
 * show setup instructions instead of a generic error.
 */
export async function searchImages(query: string, page: number): Promise<SearchPage> {
  if (PIXABAY_KEY) return searchPixabay(query, page);
  if (UNSPLASH_KEY) return searchUnsplash(query, page);
  throw new MissingApiKeyError(
    'Pixabay or Unsplash',
    'EXPO_PUBLIC_PIXABAY_KEY or EXPO_PUBLIC_UNSPLASH_ACCESS_KEY'
  );
}

export function hasAnyProviderConfigured(): boolean {
  return Boolean(PIXABAY_KEY || UNSPLASH_KEY);
}
