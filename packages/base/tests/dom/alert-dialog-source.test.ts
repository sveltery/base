// Native whole-component lifecycle/cancellation supplements, zero ordinary Source credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { AlertDialog, Dialog } from '@sveltery/base';
import Fixture from '../../../../apps/fixtures/src/lib/AlertDialogSourceFixture.svelte';
const instances: ReturnType<typeof mount>[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 65));
  await tick();
}
afterEach(async () => {
  for (const app of instances.splice(0)) await unmount(app);
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function setup(props: ComponentProps<typeof Fixture>) {
  const target = document.createElement('div');
  document.body.append(target);
  const app = mount(Fixture, { target, props });
  instances.push(app);
  return () =>
    (
      document.querySelector('main') as HTMLElement & {
        alertApi: {
          open(id: string | null): void;
          payload(value: number): void;
          close(): void;
          isOpen(): boolean;
          unmount(): void;
          exportedClose(): void;
          exportedUnmount(): void;
          overwriteActions(value: AlertDialog.Root.Actions | null): void;
          replaceCallbacks(
            change: NonNullable<AlertDialog.Root.Props<number>['onOpenChange']>,
            complete: NonNullable<AlertDialog.Root.Props<number>['onOpenChangeComplete']>,
          ): void;
          recreate(): Promise<void>;
          remove(): Promise<void>;
          mount(): Promise<void>;
          snapshot(): {
            actions: boolean;
            completed: boolean[];
            changes: { open: boolean; reason: string }[];
          };
        };
      }
    ).alertApi;
}
it('uses actual component aliases and the real nominal handle subclass', () => {
  for (const part of [
    'Trigger',
    'Backdrop',
    'Close',
    'Description',
    'Popup',
    'Portal',
    'Title',
    'Viewport',
  ] as const)
    expect(AlertDialog[part]).toBe(Dialog[part]);
  expect(AlertDialog.createHandle()).toBeInstanceOf(Dialog.Handle);
});
it('preserves cancellable payload-before-open and ignores detached calls after cleanup', async () => {
  const handle = AlertDialog.createHandle<number>();
  const api = setup({ handle, cancellation: true });
  await settle();
  handle.openWithPayload(8);
  await settle();
  expect(handle.isOpen).toBe(false);
  expect(handle.store.state.payload).toBe(8);
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  expect(api().snapshot().changes).toEqual([{ open: true, reason: 'imperative-action' }]);
  await api().remove();
  await settle();
  expect(api().snapshot().actions).toBe(false);
  expect(handle.store).toBe(handle.serverStore);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  handle.openWithPayload(16);
  expect(handle.isOpen).toBe(false);
  expect(warn).toHaveBeenCalled();
});
it('retains Root actions/exported methods, focus/presence and null publication on destruction', async () => {
  const handle = AlertDialog.createHandle<number>();
  const api = setup({ handle, retention: true });
  await settle();
  handle.open('trigger');
  await settle();
  expect(document.querySelector('[role=alertdialog]')).not.toBeNull();
  const attachedStore = handle.store;
  api().exportedClose();
  await settle();
  expect(handle.isOpen).toBe(false);
  expect(handle.store.state.mounted).toBe(true);
  api().exportedUnmount();
  await settle();
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  expect(handle.store.state.mounted).toBe(false);
  expect(api().snapshot().completed).toEqual([true, false]);
  expect(document.activeElement?.id).toBe('trigger');
  await api().remove();
  await settle();
  expect(api().snapshot().actions).toBe(false);
  expect(document.querySelector('[data-base-ui-portal]')).toBeNull();
  expect(attachedStore.context.triggerElements.size).toBe(0);
  // The still-rendered detached trigger migrates to the original inert fallback after Root removal.
  expect(handle.store).toBe(handle.serverStore);
  expect(handle.store.context.triggerElements.size).toBe(1);
});
it('keeps an open store while rebinding handles and gives a remounted Root fresh state', async () => {
  const handle = AlertDialog.createHandle<number>();
  const api = setup({ handle });
  await settle();
  handle.open('trigger');
  await settle();
  const popup = document.querySelector('[role=alertdialog]');
  await api().recreate();
  await settle();
  expect(handle.isOpen).toBe(false);
  expect(api().isOpen()).toBe(true);
  expect(document.querySelector('[role=alertdialog]')).toBe(popup);
  await api().remove();
  await settle();
  expect(api().isOpen()).toBe(false);
  await api().mount();
  await settle();
  expect(api().isOpen()).toBe(false);
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  api().open('trigger');
  await settle();
  expect(api().isOpen()).toBe(true);
});
it('enforces alert state even with a real detached generic handle', async () => {
  const handle = AlertDialog.createHandle<number>();
  setup({ handle, line: 868 });
  await settle();
  const state = document.querySelector('[data-testid=alert-dialog-state]')!;
  expect(state.getAttribute('data-modal')).toBe('true');
  expect(state.getAttribute('data-disable-pointer-dismissal')).toBe('true');
  expect(state.getAttribute('data-role')).toBe('alertdialog');
  handle.open('trigger');
  await settle();
  document
    .querySelector('[role=presentation]')!
    .dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  await settle();
  expect(handle.isOpen).toBe(true);
  expect(document.querySelector('[role=alertdialog]')).not.toBeNull();
});

// Native action ownership and live-prop supplements; zero ordinary Source assertion credit.
it('keeps exported Root methods owned when the consumer replaces the actions binding', async () => {
  const handle = AlertDialog.createHandle<number>();
  const api = setup({ handle, retention: true });
  await settle();
  handle.open('trigger');
  await settle();
  api().overwriteActions(null);
  await tick();
  api().exportedClose();
  await settle();
  expect(handle.isOpen).toBe(false);
  expect(handle.store.state.mounted).toBe(true);
  const close = vi.fn();
  const unmount = vi.fn();
  api().overwriteActions({ close, unmount });
  await tick();
  api().exportedUnmount();
  await settle();
  expect(handle.store.state.mounted).toBe(false);
  expect(document.querySelector('[role=alertdialog]')).toBeNull();
  expect(close).not.toHaveBeenCalled();
  expect(unmount).not.toHaveBeenCalled();
});
it('reads replaced callback props for each request and transition completion', async () => {
  const handle = AlertDialog.createHandle<number>();
  const api = setup({ handle });
  await settle();
  const firstChange = vi.fn();
  const firstComplete = vi.fn();
  api().replaceCallbacks(firstChange, firstComplete);
  await tick();
  handle.open('trigger');
  await settle();
  expect(firstChange).toHaveBeenCalledTimes(1);
  expect(firstChange.mock.calls[0][0]).toBe(true);
  expect(firstComplete).toHaveBeenCalledWith(true);
  const secondChange = vi.fn();
  const secondComplete = vi.fn();
  api().replaceCallbacks(secondChange, secondComplete);
  await tick();
  api().exportedClose();
  await settle();
  expect(secondChange).toHaveBeenCalledTimes(1);
  expect(secondChange.mock.calls[0][0]).toBe(false);
  expect(secondComplete).toHaveBeenCalledWith(false);
  expect(firstChange).toHaveBeenCalledTimes(1);
  expect(firstComplete).toHaveBeenCalledTimes(1);
});
