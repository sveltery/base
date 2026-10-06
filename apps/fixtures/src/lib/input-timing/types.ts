export type TimingFramework =
  | 'react'
  | 'input'
  | 'native-value'
  | 'native-bind'
  | 'native-bind-accessor'
  | 'input-final-wrapper'
  | 'input-owned-final-wrapper';
export type TimingDecision = 'accept' | 'reject' | 'rewrite';
export interface TimingObservation {
  stage: string;
  value: string;
  formData: string | null;
  requested?: string;
}
export interface TimingResult {
  framework: TimingFramework;
  decision: TimingDecision;
  immediate: TimingObservation[];
  settled: TimingObservation[];
  owner: string;
  preventBase?: true;
}
export type TimingRecorder = (stage: string, requested?: string) => void;
