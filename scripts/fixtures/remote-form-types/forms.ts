import type { RemoteForm, RemoteFormFields } from '@sveltejs/kit';

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
export declare const uncertainName: 'title' | 'count';
export declare const stringName: 'storageType' | 'set';
export declare const correlated: { name: 'title'; as: 'text' } | { name: 'count'; as: 'number' };
export declare const matrix: {
  fields: RemoteFormFields<{
    cells: Array<Array<{ label: string }>>;
    _key: string;
    $key: string;
    A1: string;
    'bad-key': string;
    'cash$amount': string;
  }>;
};
export type BlockedInput = {
  __proto__: string;
  constructor: { label: string };
  prototype: string;
  nested: { __proto__: string; constructor: string; prototype: string; constructorValue: string };
  rows: Array<{
    __proto__: string;
    constructor: string;
    prototype: string;
    prototypeValue: string;
  }>;
  Constructor: string;
};
export declare const blocked: RemoteForm<BlockedInput, { saved: true }>;
export declare const transformed: RemoteForm<{ quantity: string }, { quantity: number }>;
export type Tree = {
  label: string;
  count: number;
  active?: boolean;
  value: string;
  issues: number;
  children: Tree[];
};
export declare const tree: RemoteForm<Tree, { saved: true }>;
