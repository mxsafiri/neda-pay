/**
 * Wrapper module for anime.js in Next.js
 *
 * This approach uses a namespace import to handle inconsistencies between
 * CommonJS and ES Module versions of the library.
 */
import * as anime from 'animejs';

// The actual anime function might be on the 'default' property of the module object.
export default (anime as any).default || anime;
