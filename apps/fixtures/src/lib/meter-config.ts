export interface MeterConfig { value: number; min?: number; max?: number; locale?: Intl.LocalesArgument; format?: Intl.NumberFormatOptions }
export function meterConfig(scenario: string): MeterConfig {
  const currency = { style: 'currency', currency: 'USD' } as const;
  const configs: Record<string, MeterConfig> = {
    default: { value: 30 }, update: { value: 50 }, 'value-update': { value: 30 },
    'de-percent': { value: 30, locale: 'de-DE' }, rounded: { value: 33.333 },
    custom: { value: .5, min: 0, max: 1 }, nonzero: { value: 30, min: 20, max: 40 },
    'range-update': { value: 20, min: 10, max: 30 },
    over: { value: 150 }, under: { value: -10 }, equal: { value: 5, min: 5, max: 5 }, nan: { value: NaN },
    callback: { value: 30 }, currency: { value: 30, format: currency },
    'formatted-over': { value: 150, format: currency },
    locale: { value: 86.49, locale: 'de-DE', format: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 } },
    'value-callback': { value: 30, format: currency },
    determinate: { value: 33 }, 'replacement-indicator': { value: 33 }, nested: { value: 50 }, zero: { value: 0 },
    reversed: { value: 30, min: 40, max: 20 }, 'nan-min': { value: 30, min: NaN }, 'nan-max': { value: 30, max: NaN },
    'infinite-min': { value: 30, min: -Infinity }, 'infinite-max': { value: 30, max: Infinity },
    infinity: { value: Infinity }, negative: { value: -Infinity }, 'nan-custom': { value: NaN, min: 20, max: 40 },
    'raw-callback': { value: 150, format: currency },
  };
  return configs[scenario] ?? { value: 40 };
}
export function rawValue(value: number) { return String(value); }
