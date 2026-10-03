import type { RemoteForm } from '@sveltejs/kit';

export type Input = {
  storageType: 'cloud' | 'local';
  size: number;
  enabled: boolean;
  tags: string[];
  upload: File;
  uploads: File[];
  settings?: { label: string; quota: number };
  rows: Array<{ title: string; active: boolean }>;
  value: string;
  issues: number;
  as: boolean;
  set: string;
  allIssues: string;
};
export declare const survey: RemoteForm<Input, { saved: true }>;
export declare const other: RemoteForm<{ title: string; count: number }, { id: number }>;
export declare const transformed: RemoteForm<{ quantity: string }, { quantity: number }>;
export type Tree = { label: string; count: number; active?: boolean; value: string; issues: number; children: Tree[] };
export declare const tree: RemoteForm<Tree, { saved: true }>;
