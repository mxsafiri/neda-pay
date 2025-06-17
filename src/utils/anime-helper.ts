/**
 * Helper utility for working with anime.js
 * This centralizes the import logic and provides proper TypeScript typing
 */

// Define our anime.js interface for proper typing
interface AnimeInstance {
  (params: { 
    targets: HTMLElement | HTMLElement[] | string | string[] | Element | Element[] | NodeList | null; 
    [key: string]: unknown 
  }): Record<string, unknown>;
  stagger: (value: number, options?: Record<string, unknown>) => unknown;
  random: (min: number, max: number) => number;
  timeline: (params?: Record<string, unknown>) => AnimeInstance;
}

// We're using a dynamic import pattern for anime.js to avoid SSR issues
export async function getAnime(): Promise<AnimeInstance> {
  try {
    // Import anime.js - our type declaration in src/types/anime.d.ts handles the typing
    const animeModule = await import('animejs');
    
    // anime.js has different export patterns depending on the build (ESM vs CommonJS)
    // We need to handle both cases
    let animeFunc: unknown;
    
    // Try to get the function from various possible locations
    if (typeof animeModule.default === 'function') {
      // ESM direct export
      animeFunc = animeModule.default;
    } else if (animeModule.default && typeof animeModule.default.default === 'function') {
      // CommonJS nested default
      animeFunc = animeModule.default.default;
    } else {
      throw new Error('Could not find anime.js function in the imported module');
    }
    
    // Cast to our interface type
    return animeFunc as AnimeInstance;
  } catch (error) {
    console.error('Error loading anime.js:', error);
    // Create a dummy function with the required interface structure
    const dummyAnime = function() { return {}; } as unknown as AnimeInstance;
    dummyAnime.stagger = () => ({});
    dummyAnime.random = () => 0;
    dummyAnime.timeline = () => dummyAnime;
    return dummyAnime;
  }
}
