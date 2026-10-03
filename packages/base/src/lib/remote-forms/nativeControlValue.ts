import type { NativeValidationControl } from '../field/root/useFieldValidation.svelte.js';

/** Read the native host's semantic value without storing a second selection model. */
export function nativeControlValue(control: NativeValidationControl, option: unknown): unknown {
  if (control.tagName === 'SELECT') {
    const select = control as HTMLSelectElement;
    return select.multiple ? Array.from(select.selectedOptions, (selected) => selected.value) : select.value;
  }
  if (control.tagName === 'TEXTAREA') return control.value;
  const input = control as HTMLInputElement;
  if (input.type === 'file') return input.multiple ? Array.from(input.files ?? []) : input.files?.[0];
  if (input.type === 'radio') return typeof option === 'number' ? Number(input.value) : input.value;
  if (input.type === 'checkbox') {
    // Native option checkboxes share the browser's form/name grouping. The
    // accessor still owns the logical array used by programmatic registration.
    return Array.from(input.form?.elements ?? [input])
      .filter((element): element is HTMLInputElement => element instanceof input.ownerDocument.defaultView!.HTMLInputElement && element.type === 'checkbox' && element.name === input.name && element.checked)
      .map((element) => element.value);
  }
  return input.value;
}
