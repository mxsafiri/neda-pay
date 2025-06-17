// Type definitions for anime.js
declare module 'animejs' {
  interface AnimeParams {
    targets: HTMLElement | HTMLElement[] | string | string[] | NodeList | null;
    [key: string]: unknown;
  }

  interface AnimeInstance {
    play: () => void;
    pause: () => void;
    restart: () => void;
    seek: (time: number) => void;
    [key: string]: unknown;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    stagger: (value: number, options?: Record<string, unknown>) => unknown;
    random: (min: number, max: number) => number;
    timeline: (params?: Record<string, unknown>) => AnimeInstance;
    // Add other anime.js static methods as needed
    default?: AnimeStatic; // Handle nested default for CommonJS/ESM compatibility
  }

  // Define the default export as the AnimeStatic interface
  const anime: AnimeStatic;
  export default anime;
}
