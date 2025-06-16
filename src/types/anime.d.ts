// Type definitions for anime.js
declare module 'animejs' {
  interface AnimeParams {
    targets: any;
    [key: string]: any;
  }

  interface AnimeInstance {
    play: () => void;
    pause: () => void;
    restart: () => void;
    seek: (time: number) => void;
    [key: string]: any;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    stagger: (value: number, options?: any) => any;
    random: (min: number, max: number) => number;
    timeline: (params?: any) => AnimeInstance;
    // Add other anime.js static methods as needed
    default?: AnimeStatic; // Handle nested default for CommonJS/ESM compatibility
  }

  // Define the default export as the AnimeStatic interface
  const anime: AnimeStatic;
  export default anime;
}
