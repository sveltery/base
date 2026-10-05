// Complete body adapters use immutable DialogRoot.detached-triggers.test.tsx line IDs.
// MIT: parity/dialog/UPSTREAM_LICENSE. Assertions, source guards and credits stay separate.
export type Payload = number | (() => number);
export interface HandleFixtureApi {
  open(id: string | null, which?: 'A' | 'B'): void;
  payload(value: number, which?: 'A' | 'B'): void;
  close(which?: 'A' | 'B'): void;
  isOpen(which?: 'A' | 'B'): boolean;
  phase(value: 'outgoing' | 'overlap' | 'incoming'): Promise<void>;
  wrappers(value: number, recreate?: boolean): Promise<void>;
  recreate(): Promise<void>;
  mount(): Promise<void>;
  warnings: string[];
}
export const containedCases = [939, 987, 1020, 1048, 1078, 1100, 1157];
export const overlapCases = [700, 738, 775, 845, 871];
export const reparentCases = [1646, 1664, 1682, 1711, 1746];
export const noTriggerCases = [99, 126, 159, 700, 738, 775, 845, 1389];
// These exact bodies omit Trigger.id. Preserve generated IDs and their replacement lifecycle.
export const generatedTriggerCases = [939, 987, 1020, 1048, 1274, 1646, 1664, 1682, 1746, 1764, 1802, 1891];
