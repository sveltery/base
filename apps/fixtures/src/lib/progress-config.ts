export interface ProgressConfig {
  value: number | null;
  min?: number;
  max?: number;
  locale?: Intl.LocalesArgument;
  format?: Intl.NumberFormatOptions;
}
export function progressConfig(scenario: string): ProgressConfig {
  const currency = { style: 'currency', currency: 'USD' } as const;
  const configs: Record<string, ProgressConfig> = {
    default: { value: 30 },
    update: { value: 50 },
    cycle: { value: null },
    custom: { value: 30, min: 20, max: 40 },
    over: { value: 50, max: 40 },
    under: { value: 10, min: 20, max: 40 },
    complete: { value: 45, max: 40 },
    equal: { value: 5, min: 5, max: 5 },
    'formatted-over': { value: 50, min: 20, max: 40, format: currency },
    'formatted-under': { value: 10, min: 20, max: 40, format: currency },
    nan: { value: NaN },
    infinity: { value: Infinity },
    negative: { value: -Infinity },
    callback: { value: 30 },
    currency: { value: 30, format: currency },
    locale: {
      value: 70.51,
      locale: 'de-DE',
      format: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    },
    'value-callback': { value: 30, format: currency },
    'value-null': { value: null, format: currency },
    'value-nan': { value: NaN, format: currency },
    determinate: { value: 33 },
    zero: { value: 0 },
    indeterminate: { value: null },
    reversed: { value: 30, min: 40, max: 20 },
    'nan-min': { value: 30, min: NaN },
    'nan-max': { value: 30, max: NaN },
    'infinite-min': { value: 30, min: -Infinity },
    'infinite-max': { value: 30, max: Infinity },
  };
  return configs[scenario] ?? { value: 40 };
}
export function rawValue(value: number | null) {
  return String(value);
}
