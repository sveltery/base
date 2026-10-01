// Direct native assertion ports from mui/base-ui v1.8.0 at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: parity/toast/UPSTREAM_LICENSE.
// React fixtures/user/act map to Svelte mount/flushSync and real native DOM events.
// Complete eligible leaves are named by immutable source ID. Shared conformance,
// replacement render and non-native button leaves remain unported.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAttachmentKey } from 'svelte/attachments';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ToastPartsFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
function setup(props: Record<string, unknown> = {}) {
  const host = document.createElement('section'); document.body.append(host);
  const component = mount(Fixture, { target: host, props });
  mounted.push(component); flushSync();
  return component;
}
function getTestId(id: string) { const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`); if (!element) throw new Error(`Missing ${id}`); return element; }
function queryTestId(id: string) { return document.querySelector<HTMLElement>(`[data-testid="${id}"]`); }
function button(name: string) { const element = [...document.querySelectorAll<HTMLButtonElement>('button')].find(node => (node.getAttribute('aria-label') ?? node.textContent) === name); if (!element) throw new Error(`Missing button ${name}`); return element; }
function click(element: HTMLElement) { element.click(); flushSync(); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Toast native complete upstream assertion ports', () => {
  it('T:29 throws a descriptive error when rendered outside <Toast.Root>', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(Promise.resolve().then(() => setup({ mode: 'outside' }))).rejects.toThrow('Base UI: ToastRootContext is missing. Toast parts must be used within <Toast.Root>.');
    } finally { errorSpy.mockRestore(); }
  });
  it('T:49 adds aria-labelledby to the root element', () => {
    setup(); click(button('add'));
    const titleElement = getTestId('title'); const titleId = titleElement.id;
    const rootElement = getTestId('root');
    expect(rootElement).not.toBe(null);
    expect(rootElement.getAttribute('aria-labelledby')).toBe(titleId);
  });
  it('T:70 does not render if it has no children', () => {
    setup({ options: { title: undefined } }); click(button('add'));
    const titleElement = queryTestId('title'); expect(titleElement).toBe(null);
  });
  it('T:96 renders the title by default', () => {
    setup(); click(button('add'));
    const titleElement = getTestId('title'); expect(titleElement).not.toBe(null); expect(titleElement.textContent).toBe('title');
  });
  it('T:172 renders a numeric zero child', () => {
    setup({ mode: 'labels', initialTitle: 0 }); expect(document.querySelector('h2')?.textContent).toBe('0');
    expect([...document.querySelectorAll('h2')].find(node => node.textContent === '0') ?? null).not.toBe(null);
  });
  it('T:201 clears aria-labelledby from the root when the title content is removed', () => {
    setup({ mode: 'labels' });
    const rootElement = getTestId('root'); expect(rootElement.getAttribute('aria-labelledby')).not.toBe(null);
    click(button('clear'));
    expect([...document.querySelectorAll('h2')].find(node => node.textContent === 'Toast title') ?? null).toBe(null);
    expect(rootElement.getAttribute('aria-labelledby')).toBe(null);
  });
  it('T:229 does not let an older title cleanup clear a newer title', () => {
    const component = setup({ mode: 'older' }); const root = getTestId('root');
    expect(root.getAttribute('aria-labelledby')).toBe('old-title');
    component.setTitles('both'); flushSync(); expect(root.getAttribute('aria-labelledby')).toBe('new-title');
    component.setTitles('new'); flushSync(); expect(root.getAttribute('aria-labelledby')).toBe('new-title');
  });
  it('D:28 adds aria-describedby to the root element', () => {
    setup(); click(button('add'));
    const descriptionElement = getTestId('description'); const descriptionId = descriptionElement.id;
    const rootElement = getTestId('root'); expect(rootElement).not.toBe(null); expect(rootElement.getAttribute('aria-describedby')).toBe(descriptionId);
  });
  it('D:49 does not render if it has no children', () => {
    setup({ options: { description: undefined } }); click(button('add'));
    const descriptionElement = queryTestId('description'); expect(descriptionElement).toBe(null);
  });
  it('D:75 renders the description by default', () => {
    setup(); click(button('add'));
    const titleElement = getTestId('description'); expect(titleElement).not.toBe(null); expect(titleElement.textContent).toBe('description');
  });
  it('A:30 performs an action when clicked', () => {
    setup(); click(button('add')); expect(getTestId('action').id).toBe('action');
  });
  it('A:47 does not render if it has no children', () => {
    setup({ options: { actionProps: { children: undefined } } }); click(button('add'));
    const actionElement = queryTestId('action'); expect(actionElement).toBe(null);
  });
  it('C:30 closes the toast when clicked', async () => {
    setup(); const add = button('add'); const viewport = getTestId('viewport');
    click(add); expect(getTestId('title')).not.toBe(null);
    viewport.focus(); flushSync();
    const closeButton = button('close-press'); click(closeButton);
    // Upstream's act/user helpers settle physical exit completion before asserting.
    await Promise.resolve(); flushSync(); await Promise.resolve(); flushSync();
    expect(queryTestId('title')).toBe(null);
  });
});

describe('Toast native parts supplements (zero upstream declaration credit)', () => {
  it('reactively changes explicit IDs, content and type without stale ARIA registration', () => {
    const component = setup({ mode: 'labels' }); const root = getTestId('root'); const generated = getTestId('title').id;
    component.setId('changed-title'); flushSync(); expect(getTestId('title').id).toBe('changed-title'); expect(root.getAttribute('aria-labelledby')).toBe('changed-title');
    component.setId(undefined); flushSync(); expect(getTestId('title').id).toBe(generated);
    component.setDescription(''); flushSync(); expect(queryTestId('description')).toBeNull(); expect(root.hasAttribute('aria-describedby')).toBe(false);
    component.setDescription(0); flushSync(); expect(getTestId('description').textContent).toBe('0'); expect(root.getAttribute('aria-describedby')).toBe(getTestId('description').id);
    component.setToast({id:'test',type:'error'}); flushSync(); expect(getTestId('title').getAttribute('data-type')).toBe('error');
  });
  for (const content of [false, true, '', null]) it(`non-renderable manager content ${String(content)} is absent`, () => {
    setup({ options: { title: content, description: content, actionProps: { children: content } } }); click(button('add'));
    expect(queryTestId('title')).toBeNull(); expect(queryTestId('description')).toBeNull(); expect(queryTestId('action')).toBeNull();
  });
  it('label child override and null fallback follow the pinned nullish precedence', () => {
    const component = setup({mode:'labels'}); expect(getTestId('title').textContent).toBe('Toast title');
    component.setToast({id:'test',title:'manager title'}); component.setTitle(null); flushSync(); expect(getTestId('title').textContent).toBe('manager title');
    component.setTitle(false); flushSync(); expect(queryTestId('title')).toBeNull();
  });
  it('Svelte snippets render semantic children and register label IDs', () => {
    setup({mode:'snippets'}); expect(getTestId('title').querySelector('em')?.textContent).toBe('Snippet title');
    expect(getTestId('description').querySelector('strong')?.textContent).toBe('Snippet description'); expect(getTestId('action').querySelector('span')?.textContent).toBe('Snippet action');
    expect(getTestId('root').getAttribute('aria-labelledby')).toBe(getTestId('title').id);
  });
  it('manager Action props precede component handlers and override content/scalar props; own state class/style compose last', () => {
    const calls: string[] = []; const component = setup({mode:'buttons', log:(channel: string) => calls.push(channel)});
    component.setToast({id:'test',type:'success',actionProps:{children:'Manager action',id:'manager-action',class:'manager',style:'color:blue',onclick:() => calls.push('action-manager')}}); flushSync();
    const action = getTestId('action') as HTMLButtonElement; expect(action.textContent).toBe('Manager action'); expect(action.id).toBe('manager-action'); expect(action.type).toBe('button'); expect(action.className).toBe('own-success manager'); expect(action.style.color).toBe('red');
    click(action); expect(calls).toEqual(['action-manager','action-part']); expect(getTestId('root')).not.toBeNull();
    component.setToast({id:'test',actionProps:{children:'Manager action',onclick:(event) => { calls.push('prevent'); event.preventBaseUIHandler(); }}}); flushSync();
    calls.length=0; click(action); expect(calls).toEqual(['prevent']);
  });
  it('Close native preventDefault alone preserves internal close', () => {
    const onClose = vi.fn(); setup({mode:'list',options:{title:'title',onClose}}); click(button('add'));
    const close = button('close-press'); close.addEventListener('click', event => event.preventDefault()); click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('Close consumer prevention suppresses internal close', () => {
    const preventedOnClose = vi.fn(); const calls: string[] = []; const component = setup({mode:'list',options:{title:'title',onClose:preventedOnClose},preventClose:true,log:(channel:string) => calls.push(channel)});
    click(button('add')); click(button('close-press')); expect(component.getManager().toasts).toHaveLength(1); expect(preventedOnClose).not.toHaveBeenCalled(); expect(calls).toEqual(['close-click']);
  });
  it('Close collapsed focus state toggles aria-hidden and disabled blocks synthetic click handlers', () => {
    const calls: string[] = []; setup({mode:'buttons',disabled:true,log:(channel:string) => calls.push(channel)});
    const close = getTestId('close') as HTMLButtonElement; expect(close.getAttribute('aria-hidden')).toBe('true'); expect(close.disabled).toBe(true);
    close.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})); flushSync(); expect(calls).toEqual([]);
  });
  it('Close exposes itself while it owns focus and hides again after focus leaves', () => {
    setup({mode:'buttons'}); const close = getTestId('close'); expect(close.getAttribute('aria-hidden')).toBe('true');
    close.focus(); flushSync(); expect(document.activeElement).toBe(close); expect(close.getAttribute('aria-hidden')).toBe('false');
    button('clear').focus(); flushSync(); expect(close.getAttribute('aria-hidden')).toBe('true');
  });
  it('Action retains pinned native disabled prop precedence while part-disabled gates all action handlers', () => {
    const calls: string[] = []; const component = setup({mode:'buttons',disabled:true,log:(channel:string) => calls.push(channel)});
    component.setToast({id:'test',actionProps:{children:'enabled attribute',disabled:false,onclick:() => calls.push('manager')}}); flushSync();
    const action = getTestId('action') as HTMLButtonElement; expect(action.disabled).toBe(false); click(action); expect(calls).toEqual([]);
  });
  it('Content owns resize/mutation observers and disconnects both when its element unmounts', () => {
    const disconnectResize = vi.fn(); const disconnectMutation = vi.fn(); const observeResize = vi.fn(); const observeMutation = vi.fn();
    class Resize { observe = observeResize; disconnect = disconnectResize; }
    class Mutation { observe = observeMutation; disconnect = disconnectMutation; }
    vi.stubGlobal('ResizeObserver',Resize); vi.stubGlobal('MutationObserver',Mutation);
    const component = setup({mode:'content'}); expect(observeResize).toHaveBeenCalledWith(getTestId('content')); expect(observeMutation).toHaveBeenCalledWith(getTestId('content'),{childList:true,subtree:true,characterData:true});
    component.removeContent(); flushSync(); expect(disconnectResize).toHaveBeenCalledTimes(1); expect(disconnectMutation).toHaveBeenCalledTimes(1); vi.unstubAllGlobals();
  });
});

it('preserves Action and Close attachments from part and manager props with cleanup', async () => { // local regression, no parity credit
  const action = vi.fn(() => vi.fn());
  const close = vi.fn(() => vi.fn());
  const managerAction = vi.fn(() => vi.fn());
  const component = setup({ mode: 'buttons', actionAttachment: action, closeAttachment: close });
  component.setToast({ id: 'test', actionProps: { children: 'Manager action', [createAttachmentKey()]: managerAction } });
  flushSync();
  expect(action).toHaveBeenCalledWith(getTestId('action'));
  expect(close).toHaveBeenCalledWith(getTestId('close'));
  expect(managerAction).toHaveBeenCalledWith(getTestId('action'));
  await unmount(component);
  mounted.splice(mounted.indexOf(component), 1);
  for (const attachment of [action, close, managerAction]) {
    expect(attachment).toHaveBeenCalledTimes(1);
    expect(attachment.mock.results[0].value).toHaveBeenCalledTimes(1);
  }
});

it.each([
  [{ selected: true, hidden: false }, 'own-success selected'],
  [['manager', ['selected', false], { hidden: false }], 'own-success manager selected'],
])('preserves manager-provided Svelte ClassValue classes (%j)', (classes, expected) => { // local regression, no parity credit
  const component = setup({ mode: 'buttons' });
  component.setToast({ id: 'test', type: 'success', actionProps: { children: 'Act', class: classes } }); flushSync();
  expect(getTestId('action').className).toBe(expected);
  expect(getTestId('action').classList.contains('hidden')).toBe(false);
});
