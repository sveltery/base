import type { createStarryNight } from '@wooorm/starry-night';
type Root = ReturnType<
  Awaited<ReturnType<typeof createStarryNight>>['highlight']
>;
export type HastNode = Root['children'][number] & {
  data?: { fallback?: Root['children'] };
};
export type HastRoot = Omit<Root, 'children' | 'data'> & {
  children: HastNode[];
  data?: NonNullable<Root['data']> & {
    totalLines?: number;
    frameSize?: number;
  };
};
export type ParseSource = (
  source: string,
  fileName?: string,
  language?: string,
) => HastRoot;
