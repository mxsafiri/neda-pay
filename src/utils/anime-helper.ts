/**
 * Helper utility for working with anime.js
 * This centralizes the import logic and provides proper TypeScript typing
 */

// We're using a dynamic import pattern for anime.js to avoid SSR issues
export async function getAnime() {
  try {
    // Import anime.js - our type declaration in src/types/anime.d.ts handles the typing
    const animeModule = await import('animejs');
    
    // anime.js has different export patterns depending on the build (ESM vs CommonJS)
    // We need to handle both cases
    let anime: any;
    
    // Try to get the function from various possible locations
    if (typeof animeModule.default === 'function') {
      // ESM direct export
      anime = animeModule.default;
    } else if (animeModule.default && typeof animeModule.default.default === 'function') {
      // CommonJS nested default
      anime = animeModule.default.default;
    } else {
      throw new Error('Could not find anime.js function in the imported module');
    }
    
    return anime;
  } catch (error) {
    console.error('Failed to load anime.js:', error);
    throw error;
  }
}
