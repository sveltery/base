// Supplemental native context error regression; no upstream declaration credit.
import { expect, it, vi } from 'vitest';
import { mount } from 'svelte';
import Fixture from './ToastMissingProviderFixture.svelte';
it('getToastManager without a Provider retains its descriptive error', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect(() => mount(Fixture, { target: document.createElement('main') })).toThrow(
      'Base UI: getToastManager must be used within <Toast.Provider>.',
    );
  } finally {
    spy.mockRestore();
  }
});
