// Complete portable Root bodies expanded over the exact three source helper topologies.
// MIT: parity/dialog/UPSTREAM_LICENSE. Pinned declarations retain their immutable inventory IDs.
export type RootVariant = 'contained' | 'detached' | 'multiple';
export interface RootFixtureApi {
  calls: { open: boolean; reason: string; hasTrigger: boolean }[];
  events: { open: boolean; reason: string }[];
  completions: boolean[];
}
