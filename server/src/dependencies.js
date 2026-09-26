import { createStore } from './store/index.js';

/**
 * The single repository bundle shared by every route.
 * `createStore()` is synchronous, so this is just a module-level singleton.
 */
export const store = createStore();
