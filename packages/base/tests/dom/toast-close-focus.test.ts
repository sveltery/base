// Authored pinned business scenarios; zero Original declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { ToastStore } from '../../src/lib/toast/store';

const stores: ToastStore[] = [];
function setup() {
  const store = new ToastStore();
  stores.push(store);
  const outside = document.createElement('button');
  outside.textContent = 'Outside';
  const viewport = document.createElement('div');
  viewport.tabIndex = -1;
  document.body.append(outside, viewport);
  store.setViewport(viewport);
  store.set('prevFocusElement', outside);
  const roots = ['oldest', 'middle', 'newest'].map((id) => {
    const root = document.createElement('button');
    root.id = id;
    viewport.append(root);
    store.addToast({ id, timeout: 0 });
    store.updateToastInternal(id, { ref: root });
    return root;
  });
  return { store, outside, viewport, roots };
}
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispose());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('moves focus to the next then previous non-ending toast after close callbacks', () => {
  const { store, roots, outside } = setup();
  roots[2].focus();
  store.closeToast('newest');
  expect(document.activeElement).toBe(roots[1]);
  store.closeToast('oldest');
  expect(document.activeElement).toBe(roots[1]);
  store.closeToast('middle');
  expect(document.activeElement).toBe(outside);
});

it('uses the viewport and active element changed by the entire close callback loop', () => {
  const { store, roots, outside } = setup();
  const observations: string[] = [];
  store.updateToast('newest', {
    onClose: () => {
      observations.push(document.activeElement!.id);
      roots[0].focus();
    },
  });
  store.updateToast('middle', {
    onClose: () => {
      observations.push(document.activeElement!.id);
    },
  });
  roots[2].focus();
  store.closeToast();
  expect(observations).toEqual(['newest', 'oldest']);
  expect(document.activeElement).toBe(outside);
});

it('retains consumer focus moved outside and propagates a throwing close callback before transfer', () => {
  const { store, roots, outside } = setup();
  store.updateToast('newest', { onClose: () => outside.focus() });
  roots[2].focus();
  store.closeToast('newest');
  expect(document.activeElement).toBe(outside);
  const failure = new Error('close');
  store.updateToast('middle', {
    onClose: () => {
      throw failure;
    },
  });
  roots[1].focus();
  expect(() => store.closeToast('middle')).toThrow(failure);
  expect(document.activeElement).toBe(roots[1]);
});

it('finds keyboard focus inside a shadow tree using canonical containment', () => {
  const { store, viewport, outside } = setup();
  const host = document.createElement('div');
  viewport.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const input = document.createElement('button');
  shadow.append(input);
  input.focus();
  store.closeToast();
  expect(document.activeElement).toBe(outside);
  // Shared focus-visible platform behavior is checked in the real browser suite;
  // jsdom's canonical selector fallback is intentionally true.
});

it('resumes outside touch before interaction publication, preserving inside touch and mouse state', () => {
  const { store, viewport, outside } = setup();
  const resume = vi.spyOn(store, 'resumeTimers');
  const event = (pointerType: string, target: EventTarget) =>
    ({ pointerType, target, composedPath: () => [target] }) as PointerEvent;
  store.update({ hovering: true, focused: true });
  store.pauseTimers();
  store.handleDocumentPointerDown(event('mouse', outside));
  store.handleDocumentPointerDown(event('touch', viewport));
  expect(resume).not.toHaveBeenCalled();
  expect(store.state.focused).toBe(true);
  const observations: boolean[] = [];
  store.subscribe(() => observations.push(resume.mock.calls.length > 0));
  store.handleDocumentPointerDown(event('touch', outside));
  expect(observations).toEqual([true]);
  expect(store.state.hovering).toBe(false);
  expect(store.state.focused).toBe(false);
});
