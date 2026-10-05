// Native types for the selected @mui/internal-docs-infra 0.12.1-canary.42
// useSearch/createSitemap declarations; MIT, copyright 2019 Material-UI SAS.
// Authored native pages have real titles; no Next/React metadata is imported.
import type {
  ElapsedTime,
  Orama,
  Result,
  SearchParams,
  SearchParamsFullText,
} from '@orama/orama';
import type { SearchSchema } from './engine.js';

export interface SitemapSection {
  title: string;
  children?: Record<string, SitemapSection>;
}
export interface SitemapPart {
  props?: string[];
  dataAttributes?: string[];
  cssVariables?: string[];
}
export interface SitemapPage {
  title: string;
  slug: string;
  path: string;
  description?: string;
  keywords?: string[];
  sections?: Record<string, SitemapSection>;
  parts?: Record<string, SitemapPart>;
  exports?: Record<string, SitemapPart>;
  types?: string[];
  audience?:
    'private' | 'introductory' | 'intermediate' | 'advanced' | 'business';
}
export interface SitemapSectionData {
  title: string;
  prefix: string;
  pages: SitemapPage[];
}
export interface Sitemap {
  data: Record<string, SitemapSectionData>;
}

interface BaseSearchResult {
  id?: string;
  title: string;
  description?: string;
  slug: string;
  path: string;
  sectionTitle: string;
  prefix: string;
  keywords?: string;
  score?: number;
  group?: string;
}
export interface PageSearchResult extends BaseSearchResult {
  type: 'page';
  page?: string;
  pageKeywords?: string;
  types?: string;
  sections?: string;
  subsections?: string;
}
interface ApiSearchResult extends BaseSearchResult {
  export: string;
  props?: string;
  dataAttributes?: string;
  cssVariables?: string;
}
export interface PartSearchResult extends ApiSearchResult {
  type: 'part';
  part: string;
}
export interface ExportSearchResult extends ApiSearchResult {
  type: 'export';
}
export interface SectionSearchResult extends BaseSearchResult {
  type: 'section';
  section: string;
}
export interface SubsectionSearchResult extends BaseSearchResult {
  type: 'subsection';
  subsection: string;
}
export type SearchResult =
  | PageSearchResult
  | PartSearchResult
  | ExportSearchResult
  | SectionSearchResult
  | SubsectionSearchResult;
export interface GroupedResults {
  results: { group: string; items: SearchResult[] }[];
  count: number;
  elapsed: ElapsedTime;
}
export type SearchIndex = Orama<SearchSchema>;
export type SearchBy = Pick<
  SearchParams<SearchIndex, SearchResult>,
  'facets' | 'groupBy' | 'limit' | 'where'
>;
export type GenerateSlug = (text: string, parentTitles: string[]) => string;
export interface SearchEngineOptions {
  sitemap: () => Promise<{ sitemap?: Sitemap }>;
  maxDefaultResults?: number;
  tolerance?: number;
  limit?: number;
  boost?: SearchParamsFullText<SearchIndex>['boost'];
  enableStemming?: boolean;
  generateSlug?: GenerateSlug;
  flattenPage?: (
    page: SitemapPage,
    sectionData: SitemapSectionData,
    includeCategoryInGroup: boolean,
    excludeSections?: boolean,
    generateSlug?: GenerateSlug,
  ) => SearchResult[];
  formatResult?: (hit: Result<SearchResult>) => SearchResult;
  showPrivatePages?: boolean;
  includeCategoryInGroup?: boolean;
  excludeSections?: boolean;
}
