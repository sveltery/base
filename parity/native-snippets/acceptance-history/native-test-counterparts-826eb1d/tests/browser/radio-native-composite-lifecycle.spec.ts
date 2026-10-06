// One native measurement in the existing Radio lane; zero unchanged Original credit.
// Pinned source/assertions: parity/radio/UPSTREAM_LICENSE; existing radio.spec.ts stays unchanged.
import { expect, test, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

type Metadata = Record<string, unknown> & { index: number };
type Host =
  | { value: 'undefined' | 'null' }
  | {
      value: 'element';
      identity: number;
      id: string;
      testId: string | null;
      tag: string;
      connected: boolean;
      tabindex: string | null;
      text: string | null;
    };
type Entry = { host: Host; metadata: Metadata };
type Snapshot = {
  time: number;
  hydrated: boolean;
  revision: number;
  visible: boolean;
  rootVisible: boolean;
  hostTag: string;
  innerMetadata: Record<string, unknown>;
  publishedMap: Entry[];
  publications: Entry[][];
  refs: Record<string, Host>;
  dom: Host[];
  focus: Host;
  literal: {
    refs: Record<string, Host>;
    events: { phase: 'attach' | 'cleanup'; host: Host; metadata: Record<string, unknown> }[];
  };
  retainedHosts: Host[];
};
type FixtureRead = {
  hydrated: boolean;
  revision: number;
  visible: boolean;
  rootVisible: boolean;
  hostTag: string;
  innerMetadata: Record<string, unknown>;
  publishedMap: [Element, Metadata][];
  publications: [Element, Metadata][][];
  refs: Record<string, Element | null | undefined>;
  literal: {
    refs: Record<string, Element | null | undefined>;
    events: { phase: 'attach' | 'cleanup'; host: Element; metadata: Record<string, unknown> }[];
  };
};
declare global {
  interface Window {
    compositeNestedDiagnostic?: { read(): FixtureRead };
    readNativeCompositeObservation?: () => Snapshot;
  }
}

async function read(page: Page) {
  return page.evaluate(() => window.readNativeCompositeObservation!());
}

async function capture(page: Page, phase: string, observations: unknown[]) {
  // One native frame checkpoint; no flush adapter or expected metadata/navigation wait.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const snapshot = await read(page);
  observations.push({ phase, snapshot });
  return snapshot;
}

async function assertMembership(page: Page, expected: string[], afterRootRemoval = false) {
  await expect
    .poll(async () => {
      const snapshot = await read(page);
      const entries = afterRootRemoval
        ? snapshot.publishedMap.filter(({ host }) => host.value === 'element' && host.connected)
        : snapshot.publishedMap;
      return {
        members: entries
          .map(({ host, metadata }) => {
            if (host.value !== 'element') throw new Error('A published key is not an Element');
            return {
              testId: host.testId,
              index: metadata.index,
              connected: host.connected,
              sameDOM: snapshot.dom.some(
                (node) => node.value === 'element' && node.identity === host.identity,
              ),
            };
          })
          .sort((a, b) => a.index - b.index),
        dom: snapshot.dom.map((node) => (node.value === 'element' ? node.testId : node.value)),
      };
    })
    .toEqual({
      members: expected.map((testId, index) => ({ testId, index, connected: true, sameDOM: true })),
      dom: expected,
    });
}

test('svelte native Composite full lifecycle observation', async ({ page }, info) => {
  const observations: unknown[] = [];
  const consoleMessages: { type: string; text: string; location: unknown }[] = [];
  const pageErrors: { message: string; stack?: string }[] = [];
  let completedVector = false;
  page.on('console', (message) => {
    const record = { type: message.type(), text: message.text(), location: message.location() };
    consoleMessages.push(record);
    if (record.type === 'warning' || record.type === 'error') console.error(JSON.stringify(record));
  });
  page.on('pageerror', (error) => {
    const record = { message: error.message, stack: error.stack };
    pageErrors.push(record);
    console.error(JSON.stringify(record));
  });
  await page.addInitScript(() => {
    const identities = new WeakMap<Element, number>();
    const retained = new Set<Element>();
    let nextIdentity = 0;
    const describe = (node: Element | null | undefined): Host => {
      if (node === undefined) return { value: 'undefined' };
      if (node === null) return { value: 'null' };
      if (!identities.has(node)) identities.set(node, ++nextIdentity);
      retained.add(node);
      return {
        value: 'element',
        identity: identities.get(node)!,
        id: node.id,
        testId: node.getAttribute('data-testid'),
        tag: node.tagName,
        connected: node.isConnected,
        tabindex: node.getAttribute('tabindex'),
        text: node.textContent,
      };
    };
    const describeEntries = (entries: [Element, Metadata][]) =>
      entries.map(([node, metadata]) => ({ host: describe(node), metadata: { ...metadata } }));
    const describeRefs = (refs: Record<string, Element | null | undefined>) =>
      Object.fromEntries(Object.entries(refs).map(([name, node]) => [name, describe(node)]));
    window.readNativeCompositeObservation = () => {
      const diagnostic = window.compositeNestedDiagnostic;
      if (!diagnostic) throw new Error('The living native fixture diagnostic is absent');
      const actual = diagnostic.read();
      const publishedMap = describeEntries(actual.publishedMap);
      const publications = actual.publications.map(describeEntries);
      const refs = describeRefs(actual.refs);
      const literal = {
        refs: describeRefs(actual.literal.refs),
        events: actual.literal.events.map(({ phase, host, metadata }) => ({
          phase,
          host: describe(host),
          metadata: { ...metadata },
        })),
      };
      const dom = [
        ...document.querySelectorAll(
          'main [data-testid="first"], main [data-testid="shared"], main [data-testid="last"]',
        ),
      ].map(describe);
      const focus = describe(document.activeElement);
      return {
        time: performance.now(),
        hydrated: actual.hydrated,
        revision: actual.revision,
        visible: actual.visible,
        rootVisible: actual.rootVisible,
        hostTag: actual.hostTag,
        innerMetadata: { ...actual.innerMetadata },
        publishedMap,
        publications,
        refs,
        dom,
        focus,
        literal,
        retainedHosts: [...retained].map(describe),
      };
    };
  });

  const observePhase = async (phase: string, members: string[]) => {
    await capture(page, `${phase}:before-membership`, observations);
    await assertMembership(page, members);
    await page.getByTestId('first').focus();
    await expect(page.getByTestId('first')).toBeFocused();
    await capture(page, `${phase}:focused-first`, observations);
    await page.keyboard.press('ArrowRight');
    await capture(page, `${phase}:arrow-right-1`, observations);
    await page.keyboard.press('ArrowRight');
    await capture(page, `${phase}:arrow-right-2`, observations);
    await page.keyboard.press('ArrowLeft');
    await capture(page, `${phase}:arrow-left`, observations);
    await assertMembership(page, members);
  };

  try {
    await page.goto('/composite-nested');
    await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
    await observePhase('mount', ['first', 'shared', 'last']);
    for (let revision = 1; revision <= 3; revision += 1) {
      await page.locator('#update-inner').click();
      await expect.poll(async () => (await read(page)).revision).toBe(revision);
      await observePhase(`inner-update-${revision}`, ['first', 'shared', 'last']);
    }
    await page.locator('#toggle-shared').click();
    await expect(page.getByTestId('shared')).toHaveCount(0);
    await expect(page.locator('#literal-shared')).toHaveCount(0);
    await observePhase('shared-removed', ['first', 'last']);
    await page.locator('#toggle-shared').click();
    await expect(page.locator('#literal-shared')).toHaveCount(1);
    await observePhase('shared-reinserted', ['first', 'shared', 'last']);
    await page.locator('#replace-host').click();
    await expect(page.getByTestId('shared')).toHaveJSProperty('tagName', 'SPAN');
    await expect(page.locator('#literal-shared')).toHaveJSProperty('tagName', 'SPAN');
    await observePhase('host-replaced', ['first', 'shared', 'last']);
    await page.locator('#remove-root').click();
    await capture(page, 'root-cleanup:before-membership', observations);
    // The living fixture may retain its last published map after Root disposal.
    // Record the raw snapshot; require zero connected members and real hosts.
    await assertMembership(page, [], true);
    await expect(page.locator('#nested-root, #literal-shared')).toHaveCount(0);
    await capture(page, 'root-cleanup:stable', observations);
    completedVector = true;
  } finally {
    const body = JSON.stringify(
      {
        purpose: 'Actual native vector; no expected metadata owner, navigation or attachment order',
        unchangedOriginalCredit: 0,
        completedVector,
        observations,
        consoleMessages,
        pageErrors,
      },
      null,
      2,
    );
    writeFileSync(info.outputPath('native-composite-lifecycle.json'), `${body}\n`);
    await info.attach('actual-native-composite-full-vector', {
      body,
      contentType: 'application/json',
    });
  }
  expect(pageErrors, 'unsuppressed native browser exceptions').toEqual([]);
  expect(
    consoleMessages.filter(({ type }) => type === 'warning' || type === 'error'),
    'unsuppressed native warnings/errors',
  ).toEqual([]);
});
