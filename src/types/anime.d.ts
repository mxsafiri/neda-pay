// Type definitions for anime.js with better CommonJS/ESM compatibility
declare module 'animejs' {
  // Define the main anime function and its properties
  interface AnimeInstance {
    play(): void;
    pause(): void;
    restart(): void;
    seek(time: number): void;
    [key: string]: any;
  }

  interface AnimeParams {
    targets: string | HTMLElement | NodeList | HTMLElement[] | string[] | unknown;
    [key: string]: unknown;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    stagger(value: number | string, options?: Record<string, unknown>): (el: HTMLElement, i: number, t: number) => number;
    random(min: number, max: number): number;
    timeline(params?: AnimeParams): AnimeInstance;
  }

  // Export the main anime function as the default export
  const anime: AnimeStatic;
  export default anime;
}
