// Paired scenario preconditions from pinned useRender/useRenderElement tests (MIT).
import type { RenderElementProps, UseRenderHostProps, UseRenderRef, UseRenderTagName } from '../../../../packages/base/src/lib/use-render/types.js';
import type { PreventableEvent } from '../../../../packages/base/src/lib/merge-props/index.js';
export const publicCases = ['public-class', 'public-refs', 'public-default', 'public-tag', 'public-replacement', 'state-auto', 'state-undefined-value', 'state-merged', 'state-override', 'state-empty', 'state-undefined', 'state-boolean', 'state-number', 'state-map'];
export const internalCases = ['class-function', 'class-undefined', 'style-function', 'style-undefined', 'prevent-object-mousedown', 'prevent-array-mousedown', 'prevent-object-contextmenu', 'prevent-array-contextmenu', 'disabled-getter', 'enabled-toggle', 'ref-shape', 'render-function', 'clone-props', 'forward-ref', 'clone-class', 'clone-class-function', 'clone-style', 'clone-style-function', 'clone-refs', 'minimal-class', 'minimal-style'];
export type State = Record<string, unknown>;
export function createUseRenderCase(scenario: string) {
  const refs = [{ current: null as Element | null }, { current: null as Element | null }, { current: null as Element | null }];
  const calls: string[] = [];
  const renders: { props: { class: unknown; style: unknown; 'data-testid': unknown }; state: State }[] = [];
  const cleanupRef: UseRenderRef = node => { calls.push(node ? `cleanup-attach:${node.tagName}` : 'cleanup-null'); if (node) return () => { calls.push('cleanup'); }; };
  const legacyRef: UseRenderRef = node => { calls.push(node ? `legacy-attach:${node.tagName}` : 'legacy-null'); };
  const emptyClassRef: UseRenderRef = node => {
    if (!node) { calls.push('empty-null'); return; }
    calls.push(`empty-attach:${node.tagName}:${String(node.getAttribute('class'))}`);
    return () => { calls.push(`empty-cleanup:${node.tagName}:${String(node.getAttribute('class'))}`); };
  };
  function attributeRef(label: string, restore = false): UseRenderRef {
    return node => {
      if (!node) return;
      const initial = node.getAttribute('class');
      calls.push(`${label}-attach:${String(initial)}`);
      return () => {
        calls.push(`${label}-cleanup:${String(node.getAttribute('class'))}`);
        if (restore) { if (initial === null) node.removeAttribute('class'); else node.setAttribute('class', initial); }
      };
    };
  }
  const initialAttributeRef = attributeRef('first', scenario === 'ref-update-restore');
  const nextAttributeRef = attributeRef('second');
  const connectionRef: UseRenderRef = node => {
    if (node) {
      calls.push(`connection-attach:${node.tagName}:${node.isConnected}`);
      return () => { calls.push(`connection-cleanup:${node.tagName}:${node.isConnected}`); };
    }
  };
  const callback = (value: string) => () => { calls.push(value); };
  const prevent = (event: PreventableEvent) => { calls.push('prevent'); event.preventBaseUIHandler(); };
  const getter = (previous: UseRenderHostProps) => { calls.push(`getter:${previous.id ?? 'empty'}`); return { id: 'tested-render', 'data-getter': 'replacement' }; };
  function configuration(stage = 0): { options: RenderElementProps<State>; replacement: boolean; owned: UseRenderHostProps; tag: UseRenderTagName; ownRef?: UseRenderRef; outer?: 'span' | 'section' | 'same-span' } {
    const options: RenderElementProps<State> = { props: { id: 'tested-render' } };
    let replacement = false, tag: UseRenderTagName = 'span'; const owned: UseRenderHostProps = {};
    let ownRef: UseRenderRef | undefined;
    let outer: 'span' | 'section' | 'same-span' | undefined;
    if (scenario === 'public-class') { replacement = true; options.props = { id: 'tested-render', class: undefined }; owned.class = 'my-span '; }
    if (scenario === 'public-refs') { replacement = true; options.ref = [refs[0], refs[1]]; }
    if (scenario === 'public-default' || scenario === 'public-tag' || scenario === 'public-replacement') options.props = undefined;
    if (scenario === 'public-tag') options.defaultTagName = stage ? 'span' : 'div';
    if (scenario === 'public-replacement') { replacement = true; options.defaultTagName = stage ? 'a' : 'div'; }
    if (scenario.startsWith('state-')) {
      replacement = true;
      if (scenario === 'state-auto') { options.state = { active: true, index: 42 }; tag = 'button'; owned.type = 'button'; }
      if (scenario === 'state-undefined-value') options.state = { defined: 'value', notDefined: undefined };
      if (scenario === 'state-merged') { options.state = { form: 'login' }; options.props = { id: 'submit-btn', class: 'btn-primary', 'data-existing': 'prop' }; tag = 'button'; owned.type = 'button'; }
      if (scenario === 'state-override') { options.state = { active: true }; options.props = { id: 'tested-render', 'data-active': 'false' }; tag = 'button'; owned.type = 'button'; }
      if (scenario === 'state-empty') { options.state = {}; options.props = { id: 'tested-render', class: 'test-class' }; }
      if (scenario === 'state-undefined') options.props = { id: 'tested-render', class: 'test-class', 'data-from-props': 'value' };
      if (scenario === 'state-boolean') { options.state = { active: true, disabled: false }; tag = 'button'; owned.type = 'button'; }
      if (scenario === 'state-number') options.state = { count: 0, index: 42, percentage: 99.9 };
      if (scenario === 'state-map') { options.state = { isActive: true, itemCount: 5, userName: 'John' }; options.stateAttributesMapping = { isActive: value => value ? { 'data-is-active': '' } : null, itemCount: value => ({ 'data-item-count': String(value) }), userName: value => ({ 'data-user-name': String(value) }) }; tag = 'button'; owned.type = 'button'; }
    }
    const base = { id: 'tested-render', class: 'test-component', style: 'padding:10px' };
    if (['class-function', 'class-undefined', 'style-function', 'style-undefined', 'render-function', 'clone-props', 'clone-class', 'clone-class-function', 'clone-style', 'clone-style-function'].includes(scenario)) options.props = [base];
    if (scenario === 'class-function' || scenario === 'clone-class-function') { options.state = { active: true }; options.class = state => state.active ? 'active-class' : 'inactive-class'; }
    if (scenario === 'class-undefined') options.class = state => state.active ? 'active-class' : undefined;
    if (scenario === 'style-function' || scenario === 'clone-style-function') { options.state = { active: true }; options.style = state => state.active ? 'color:rgb(255,0,0)' : 'color:rgb(0,255,0)'; }
    if (scenario === 'style-undefined') options.style = state => state.active ? 'color:red' : undefined;
    // CSS strings are an accepted syntax substitution; preserve the source's rendered attribute predicate exactly.
    if (scenario === 'style-function') { options.props = [{ ...base, style: 'padding: 10px' }]; options.style = state => state.active ? ' color: rgb(255, 0, 0);' : ' color: rgb(0, 255, 0);'; }
    if (scenario === 'style-undefined') options.props = [{ ...base, style: 'padding: 10px;' }];
    if (scenario.startsWith('prevent-')) {
      const event = scenario.endsWith('contextmenu') ? 'oncontextmenu' : 'onmousedown'; const props = { id: 'tested-render', [event]: prevent };
      options.props = scenario.includes('array') ? [props, { class: 'test-component' }] : props;
    }
    if (scenario === 'disabled-getter') { options.enabled = false; options.props = [getter]; }
    if (scenario === 'enabled-toggle') { options.enabled = stage === 1; options.ref = refs[0]; options.props = [{ id: 'tested-render', onclick: callback('click') }]; }
    if (scenario === 'ref-shape') { options.ref = stage === 0 ? refs[0] : stage === 1 ? [refs[0], refs[1]] : refs[1]; options.props = [{ id: 'tested-render', onclick: callback(stage === 0 ? 'first' : 'second') }]; }
    if (scenario === 'render-function') { replacement = true; options.state = { active: true }; options.props = [base, { 'data-testid': 'custom' }]; owned['data-active'] = 'true'; }
    if (scenario.startsWith('clone-')) { replacement = true; tag = 'div'; }
    if (scenario === 'clone-props') { tag = 'span'; options.state = { active: true }; options.props = [base, { 'data-testid': 'custom' }]; owned['data-active'] = 'true'; }
    if (scenario === 'forward-ref' || scenario === 'clone-refs') { replacement = true; tag = 'div'; options.ref = refs[0]; }
    if (scenario === 'clone-refs') ownRef = refs[2];
    if (scenario === 'clone-class') options.class = 'component-class';
    if (scenario === 'clone-class' || scenario === 'clone-class-function') owned.class = 'render-class';
    if (scenario === 'clone-style') options.style = 'color:rgb(255,0,0)';
    if (scenario === 'clone-style' || scenario === 'clone-style-function') owned.style = 'font-size:16px';
    if (scenario === 'minimal-class') { options.props = undefined; options.state = Object.freeze({}); options.class = 'test-class'; }
    if (scenario === 'minimal-style') { options.props = undefined; options.state = Object.freeze({}); options.style = 'color:red'; }
    if (scenario === 'ref-cleanup') { options.ref = [cleanupRef, legacyRef, refs[0]]; options.defaultTagName = stage === 2 ? 'svg' : 'div'; options.props = { id: 'tested-render', class: stage === 1 ? 'changed' : undefined }; if (stage === 3) options.enabled = false; }
    if (scenario === 'ref-slots') options.ref = stage === 0 ? cleanupRef : stage === 1 ? [cleanupRef] : [cleanupRef, undefined];
    if (scenario === 'live-state') { options.state = { camelCase: stage === 0, inheritedName: stage === 0 ? 'yes' : 'changed', zero: 0, blank: '', no: false }; }
    if (scenario === 'default-button') options.defaultTagName = 'button';
    if (scenario === 'default-img') options.defaultTagName = 'img';
    if (scenario === 'replacement-default') { options.defaultTagName = 'button'; replacement = true; tag = 'button'; }
    if (scenario === 'native-default' || scenario === 'native-base') options.props = [{ id: 'tested-render', onmousedown: callback('internal') }, { onmousedown: (event: PreventableEvent) => { calls.push('consumer'); if (scenario === 'native-default') event.preventDefault(); else event.preventBaseUIHandler(); } }];
    if (scenario === 'getter-replacement') options.props = [{ id: 'old', onclick: callback('old') }, getter];
    if (scenario === 'getter-raw') { options.props = [() => ({ onmousedown: (event: PreventableEvent) => { calls.push(`raw-native:${typeof event.preventBaseUIHandler}`); } }), { id: 'tested-render' }]; options.class = 'component'; options.style = 'color:red'; }
    if (scenario === 'inherited-props') options.props = [stage === 0 ? {} : undefined, Object.create({ id: 'tested-render', 'data-native': 'yes' })];
    if (scenario === 'literal-props') { options.props = { id: 'tested-render', class: stage === 1 ? 'active' : stage === 3 ? undefined : '', onmousedown: undefined }; options.ref = emptyClassRef; options.defaultTagName = stage >= 4 ? 'svg' : 'div'; options.enabled = stage < 5; }
    if (scenario.startsWith('ref-update-')) {
      const before = scenario === 'ref-update-empty' ? '' : 'before';
      const after = scenario === 'ref-update-to-empty' ? '' : scenario === 'ref-update-remove' ? undefined : 'changed';
      options.props = { id: 'tested-render', class: stage === 0 ? before : after };
      options.ref = stage === 0 ? initialAttributeRef : nextAttributeRef;
      options.enabled = stage < 2;
    }
    if (scenario.startsWith('ref-observation-')) {
      options.ref = connectionRef;
      if (scenario === 'ref-observation-unmount') options.enabled = false; // The fixture mounts a separate owner below.
      else {
        options.enabled = stage < 2;
        if (scenario === 'ref-observation-default') options.defaultTagName = stage === 0 ? 'div' : 'svg';
        else { replacement = true; tag = stage === 0 ? 'div' : 'svg'; }
      }
    }
    if (scenario.startsWith('ref-outer-')) {
      outer = scenario === 'ref-outer-default' ? stage === 0 ? undefined : 'span'
        : scenario === 'ref-outer-reverse' ? stage === 0 ? 'span' : undefined
        : scenario === 'ref-outer-stable' || stage === 0 ? 'span' : scenario === 'ref-outer-reuse' ? 'same-span' : 'section';
      replacement = outer !== undefined;
      tag = outer === 'section' ? 'section' : 'span';
      options.props = { id: 'tested-render', class: scenario === 'ref-outer-stable' && stage > 0 ? 'changed' : 'before' };
      if (scenario === 'ref-outer-stable') options.state = { active: stage > 0 };
      options.ref = connectionRef;
      options.enabled = stage < 2;
    }
    if (scenario === 'inherited-ref') options.props = [{}, () => Object.assign(Object.create({ ref: refs[0] }), { id: 'tested-render' })];
    if (scenario === 'accessor-ref') {
      options.enabled = stage === 0; let reads = 0;
      options.props = [{}, () => ({ id: 'tested-render', get ref() { reads += 1; calls.push(`ref-get:${reads}`); return reads === 1 ? refs[0] : refs[1]; } })];
    }
    if (scenario === 'primitive-ref') { options.enabled = stage === 0; options.state = { active: true }; options.stateAttributesMapping = { active: () => ({ ref: 'ignored', 'data-active': '' }) }; }
    if (scenario === 'all-gating') {
      options.enabled = stage === 1; replacement = true;
      options.state = { active: true }; options.stateAttributesMapping = { active: () => { calls.push('mapping'); return { 'data-active': '' }; } };
      options.props = [getter]; options.class = () => { calls.push('class'); return 'active'; }; options.style = () => { calls.push('style'); return 'color:red'; }; options.ref = legacyRef;
    }
    return { options, replacement, owned, tag, ownRef, outer };
  }
  return { refs, calls, renders, configuration, observe: (props: UseRenderHostProps, state: State) => {
    renders.push({ props: { class: props.class, style: props.style, 'data-testid': props['data-testid'] }, state: { ...state } });
    calls.push(`render:${String(state.active)}:${String(props.class)}:${String(props.style)}:${String(props['data-testid'])}`);
  } };
}
