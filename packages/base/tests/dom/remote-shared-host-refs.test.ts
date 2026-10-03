import { expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './RemoteSharedHostRefFixture.svelte';

it('actual Kit rendered controls retain shared visible refs and one Form registry through live ownership and native lifetime updates', async () => {
  const target = document.createElement('div'); document.body.append(target);
  const submitted = vi.fn();
  const component = mount(Fixture, { target, props: { submitted } }); flushSync(); await tick();
  try {
    const form = target.querySelector('form')!;
    const switchHost = target.querySelector<HTMLElement>('[data-control="switch"]')!;
    const first = target.querySelector<HTMLElement>('[data-control="first"]')!;
    const second = target.querySelector<HTMLElement>('[data-control="second"]')!;
    function checkRefs(hosts = { switchHost, first, second }) {
      const snapshot = component.snapshot();
      expect([snapshot.switchControl, snapshot.switchRoot]).toEqual([hosts.switchHost, hosts.switchHost]);
      expect([snapshot.firstControl, snapshot.firstRoot]).toEqual([hosts.first, hosts.first]);
      expect([snapshot.secondControl, snapshot.secondRoot]).toEqual([hosts.second, hosts.second]);
      expect(target.querySelectorAll('input')).toHaveLength(3);
    }
    checkRefs();
    expect(switchHost.getAttribute('aria-labelledby')).toBe('enabled-label-initial');
    expect(first.getAttribute('aria-labelledby')).toBe('choice-label-initial');
    expect([...new FormData(form)]).toEqual([['n:choice', '3']]);

    component.replaceValues({ enabled: true, choice: 4 }); flushSync(); await tick();
    checkRefs();
    expect(component.snapshot().owner).toEqual({ enabled: true, choice: 4 });
    expect([...new FormData(form)]).toEqual([['b:enabled', 'on'], ['n:choice', '4']]);
    expect(second.getAttribute('aria-checked')).toBe('true');
    first.click(); switchHost.click(); flushSync(); await tick();
    expect(component.snapshot()).toMatchObject({ owner: { enabled: false, choice: 3 }, checkedChanges: [false], radioChanges: [3] });
    checkRefs();

    component.setDisabled(true); component.renameLabels(); flushSync(); await tick();
    checkRefs();
    expect(switchHost.getAttribute('aria-labelledby')).toBe('enabled-override-updated');
    expect(first.getAttribute('aria-labelledby')).toBe('choice-override-updated');
    expect(second.getAttribute('aria-labelledby')).toBe('choice-override-updated');
    expect([...new FormData(form)]).toEqual([]);
    component.replaceValues({ enabled: true, choice: 4 }); flushSync(); await tick();
    checkRefs();
    component.setDisabled(false); flushSync(); await tick();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.calls[0][0]).toEqual({ enabled: true, choice: 4 });
    expect([...new FormData(form)]).toEqual([['b:enabled', 'on'], ['n:choice', '4']]);

    component.show(false); flushSync(); await tick();
    expect(component.snapshot()).toMatchObject({ switchControl: null, switchRoot: null, firstControl: null, firstRoot: null, secondControl: null, secondRoot: null });
    expect(target.querySelectorAll('input')).toHaveLength(0);
    expect([...new FormData(form)]).toEqual([]);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submitted).toHaveBeenCalledTimes(2);
    expect(submitted.mock.calls[1][0]).toEqual({});
    expect(component.snapshot()).toMatchObject({ checkedChanges: [false], radioChanges: [3] });
    component.show(true); flushSync(); await tick();
    const remounted = {
      switchHost: target.querySelector<HTMLElement>('[data-control="switch"]')!,
      first: target.querySelector<HTMLElement>('[data-control="first"]')!,
      second: target.querySelector<HTMLElement>('[data-control="second"]')!,
    };
    checkRefs(remounted);
    expect(remounted.switchHost).not.toBe(switchHost);
    expect(remounted.first).not.toBe(first);
    expect(remounted.second).not.toBe(second);
    expect([...new FormData(form)]).toEqual([['b:enabled', 'on'], ['n:choice', '4']]);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submitted).toHaveBeenCalledTimes(3);
    expect(submitted.mock.calls[2][0]).toEqual({ enabled: true, choice: 4 });
    expect(component.snapshot()).toMatchObject({ checkedChanges: [false], radioChanges: [3] });
  } finally {
    await unmount(component); target.remove();
  }
});
