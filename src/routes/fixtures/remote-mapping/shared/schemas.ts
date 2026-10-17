import * as v from 'valibot';

// One form per control. Each server rejects one value with an issue on its field.
export const textSchema = v.object({ email: v.pipe(v.string(), v.email('Enter a valid email')) });
export const checkboxSchema = v.object({ agree: v.optional(v.boolean(), false) });
export const switchSchema = v.object({ notify: v.optional(v.boolean(), false) });
export const numberSchema = v.object({ age: v.number() });
export const radioSchema = v.object({ plan: v.picklist(['free', 'pro']) });
export const selectSchema = v.object({ country: v.string() });
export const checkboxGroupSchema = v.object({ toppings: v.array(v.string()) });
export const comboboxSchema = v.object({ fruit: v.string() });
export const sliderSchema = v.object({ volume: v.number() });
