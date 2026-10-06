// Native HAST metadata and selected frame types from published
// @mui/internal-docs-infra 0.12.1-canary.42; MIT, copyright 2019 Material-UI SAS.
import type { createStarryNight } from '@wooorm/starry-night';

// Use the installed engine's HAST types rather than a second tree model or a
// direct dependency on its transitive @types/hast package. These are type-only
// edges, so the lightweight renderer/cache still defer the regex engine.
export type StarryNight = Awaited<ReturnType<typeof createStarryNight>>;
export type GrammarGlobal = typeof globalThis & {
  __docs_infra_starry_night_instance__?: StarryNight;
};
type Root = ReturnType<StarryNight['highlight']>;
type Element = Extract<Root['children'][number], { type: 'element' }>;

export type FrameType =
  | 'normal'
  | 'padding-top'
  | 'highlighted'
  | 'highlighted-unfocused'
  | 'focus'
  | 'focus-unfocused'
  | 'padding-bottom'
  | 'comment';
export type FrameTruncated = 'visible' | 'hidden';

export type HastElement = Omit<Element, 'children' | 'data' | 'properties'> & {
  children: HastElementContent[];
  properties: Element['properties'] & {
    dataLn?: number;
    dataLined?: string;
    dataFrameType?: FrameType;
    dataFrameIndent?: number;
    dataFrameTruncated?: FrameTruncated;
  };
  data?: NonNullable<Element['data']> & {
    fallback?: HastElementContent[];
  };
};
export type HastElementContent =
  Exclude<Element['children'][number], { type: 'element' }> | HastElement;
export type HastNode = Exclude<Root['children'][number], { type: 'element' }> | HastElement;
export type HastRoot = Omit<Root, 'children' | 'data'> & {
  children: HastNode[];
  data?: NonNullable<Root['data']> & {
    totalLines?: number;
    frameSize?: number;
  };
};
export type ParseSource = (source: string, fileName?: string, language?: string) => HastRoot;
