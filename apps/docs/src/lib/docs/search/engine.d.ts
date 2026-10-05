// Native service boundary for the selected published untyped useSearch bodies.
// React hook/state types are not imported; actual native sitemap fields and
// used Orama grouped results define this docs-private call surface.
import type { SearchResult } from './searchUtils.js';
interface GroupedResults {
  results: { group: string; items: SearchResult[] }[];
}
export declare function createSearchEngine(options: {
  sitemap: () => Promise<typeof import('./sitemap.js')>;
  tolerance?: number;
  limit?: number;
  maxDefaultResults?: number;
  enableStemming?: boolean;
  includeCategoryInGroup?: boolean;
  excludeSections?: boolean;
  showPrivatePages?: boolean;
}): {
  ready: Promise<void>;
  readonly results: GroupedResults;
  readonly defaultResults: GroupedResults;
  readonly isReady: boolean;
  search(value: string, options?: { groupBy?: { properties: string[]; maxResult: number }; limit?: number }): Promise<void>;
  buildResultUrl(result: SearchResult): string;
};
