# Proposed remote Select ownership and types

This is a separately proposed integration contract, not an implementation lease or an accepted API. Core Select keeps the pinned generic API and ordinary Source business; this adapter proposal earns zero unchanged Original assertion credit. The exact Source is Base UI1.8.0 MIT at `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`. The current SDK witness is the existing patched Kit2.70.3 release `39e8e1fbd4feba7f22dd46bfdf7335362c38de16`; its cancellation/reset patch is unchanged. Bounded files/ranges and exact hashes are in [repair evidence](plan-repair-evidence.json).

## Route and one owner

Keep bare `Field.Root as="select"` / `as="select multiple"` on the existing native `<select>` route. Only an explicitly authored Control render snippet selects the proposed `RemoteSelectControl` route before `RemoteNativeControl`. It does not instantiate Field.Control or a native select behind an authored Select. The consumer renders real Select.Root/Trigger/parts and their source hidden inputs; those parts retain registration, labels, validation, value/open/cancellation and native serialization. No additional selection store, native control registry, synthetic input event or reset listener is added.

An adapter instance chooses its owner once during setup, before descendants and SSR. Test authored values with `!== undefined`, matching Source useControlled; property presence alone is insufficient. Defined authored `value` wins, then defined authored `defaultValue`, then a remote accessor, then ordinary manual-uncontrolled Select. This is an explicit proposed adapter choice. Remount when selecting a different owner mode; changing props does not silently turn manual ownership into remote ownership. The canonical Root still independently chooses its Source controlled/uncontrolled mode.

| First-render authored values | Adapter owner / props sent to Root | Accepted request | Programmatic update / native reset |
| --- | --- | --- | --- |
| `value` absent and `defaultValue` absent | Remote, when an accessor exists: always send a defined current normalized owner/fallback. | Consumer callback first; after cancellation and owner guards, call that accessor's public writer. | Reread the live accessor and descriptor; undefined never changes Root to uncontrolled. |
| Explicit `value={undefined}` and absent/undefined `defaultValue` | Same remote mode; undefined is not an authored controlled override. | Same guarded remote writer. | Same live read; no cached first value or seeded adapter state. |
| Defined scalar `value`, including `''` or `null` | Manual controlled: send current authored value and authored defaultValue exactly. | Consumer callback only; adapter never calls remote `.set`. | Authored prop updates control selection; later undefined follows canonical Root's existing initial-mode/fallback contract, not the remote descriptor. |
| Defined multiple `value`, including `[]` or `null` | Manual controlled, preserving Source's permitted `string[] \| null` prop. | Consumer callback only; multiple callbacks remain `string[]`, never scalar/null. | Same Source owner rule; do not normalize a manual null or install another reset owner. |
| `value` absent/undefined, defined scalar/multiple `defaultValue` | Manual uncontrolled: send `value={undefined}` and the authored default. Multiple null defaults use Source's `defaultValue ?? EMPTY_ARRAY`. | Consumer callback then canonical Root's uncontrolled setter; no remote `.set`. | Later default changes are not a new owner seed. Native reset retains actual Svelte input defaults; it does not create an adapter reset-to-default setter. |
| Both authored values defined | Manual controlled; value wins over defaultValue. | Consumer callback only. | Normal Source controlled/default behavior. |
| No accessor, no defined authored value/default | Manual uncontrolled Source defaults: scalar null; multiple shared EMPTY_ARRAY. | Consumer callback then canonical Root setter. | Normal standalone/external-library Source behavior and native Svelte element defaults. |

“No remote `.set`” describes this adapter's writer, not a patch to Kit's existing form listeners. Named native inputs still participate in real FormData, submit and reset; Kit may update its owner from those native operations even in manual mode. A consumer's own `.set` inside a callback is likewise not rolled back by `details.cancel()`.

For remote mode, read `accessor.value()` first on every evaluation. A defined owner wins over the descriptor. If the owner is undefined, read the **current** descriptor value (including the SDK's current `.as(...)` fallback); if that too is undefined, use scalar null or the shared EMPTY_ARRAY. Scalar owner/fallback null is an empty Source selection; multiple null normalizes to EMPTY_ARRAY at this explicit adapter boundary. Accept only strings for scalar, or an array containing only strings for multiple; never stringify number/boolean/object values into purported typed SDK support. A malformed owner/fallback throws a descriptive adapter error rather than acquiring a second owner.

This live fallback rule applies after programmatic `.set`, field/accessor replacement and reset as well as first mount. When a settled reset leaves the owner absent, a still-present current `.as('select', 'seed')` fallback can become visible again; it is not a cached initial default. With no current fallback, the adapter sends null/EMPTY_ARRAY. Successful native reset, canceled reset, disabled/omitted entries and held submission payload must be witnessed against actual Kit and the actual hidden DOM; this proposal does not assert those future results or make a synthetic reset correction.

Authored defaultValue is deliberately a manual opt-out, rather than an additional remote seed. Developers who want a remote-owned initial fallback use the actual `.as(...)` argument on typed Field.Root, or the real public accessor `.set` before rendering. This prevents an initial local default from silently becoming another live/reset owner. Changing multiple on an existing instance is outside this adapter contract; remount with the matching SDK route. Core Select's own generic multiple contract is unaffected.

## Public writer and cancellation boundary

Current `runtime.ts:RemoteAccessor` has only `.as` and `.value`; it does **not** currently provide the promised writer. The separate lease must add the optional structural method `set?(input: unknown): unknown` (or an equivalent guarded narrow structural interface), preserving existing read-only accessors for all old routes. RemoteSelect remote mode requires a callable writer before rendering a usable selection; a missing/nonfunction `.set` throws a clear “remote Select requires a writable field accessor” error. A defined manual value/default bypasses that requirement. Do not silently fall back to descriptor assignment, path mutation or uncontrolled local state.

At a value request, capture the current accessor object, invoke the consumer with the exact same SelectRootChangeEventDetails object, and stop if canceled. Stop an obsolete request if that object is no longer the current accessor after the consumer callback. Resolve the callable writer from that object and invoke it with `Reflect.apply(writer, accessor, [encodedValue])`, retaining the receiver. Do not detach the method, guess a field path, call a descriptor setter, await a speculative async writer or emit synthetic input. Writer errors propagate normally and cannot justify an independent commit/validation path. Root's canonical controlled setter and actual owner observation remain responsible for normal Source callback→cancel→value-change/dirty/validation order.

The scalar Source callback permits null, but Kit's public string field writer accepts string. The proposed explicit encoding is `null → ''` for an accepted remote scalar request; strings remain strings. Multiple requests remain `string[]`. This is a new remote adapter encoding, not an unchanged Source assertion or a claim that Kit accepts typed `.set(null)`. Remote scalar display subsequently follows the actual `''` owner; standalone/manual Source Select retains its distinct null value. If this encoding is not approved, the remote scalar-clear seam remains blocked instead of claiming an unsupported SDK writer.

## Correlated render and callback types

The existing `control.types.ts` checked-family semantic props and FieldControlChangeEventDetails cannot represent Select's reason/value/multiple relationships. The separate public type lease must preserve existing native/checked render inputs while adding this explicit Select slice. The names below are proposed; SelectRootProps/SelectTriggerProps/SelectRootChangeEventDetails are the future real source-correlated native types, not replacement declarations for a parallel component:

```ts
type RemoteSelectValue<Multiple extends boolean> =
  Multiple extends true ? string[] : string;

type RemoteSelectChange<Multiple extends boolean> = (
  value: RemoteSelectValue<Multiple> | (Multiple extends true ? never : null),
  details: SelectRootChangeEventDetails,
) => void;

type RemoteSelectRootRenderProps<Multiple extends boolean> = Omit<
  SelectRootProps<string, Multiple>,
  'children' | 'multiple' | 'value' | 'onValueChange'
> & {
  multiple: Multiple;
  // Undefined is used only by the manual uncontrolled/fallback Source path.
  value: RemoteSelectValue<Multiple> | null | undefined;
  onValueChange: RemoteSelectChange<Multiple>;
};

type RemoteSelectRenderProps<Multiple extends boolean> = {
  kind: 'select';
  multiple: Multiple;
  rootProps: RemoteSelectRootRenderProps<Multiple>;
  triggerProps: Omit<SelectTriggerProps, 'children' | 'render'>;
};

type RemoteSelectRenderUnion =
  | RemoteSelectRenderProps<false>
  | RemoteSelectRenderProps<true>;

type RemoteSelectRender = Snippet<[
  RemoteSelectRenderUnion,
  RemoteControlState,
  Snippet | undefined,
]>;

type RemoteSelectControlProps<Multiple extends boolean> = Omit<
  ExistingRemoteControlProps,
  'type' | 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'render'
> & {
  type?: (Multiple extends true ? 'select multiple' : 'select') | undefined;
  multiple?: Multiple | undefined;
  value?: RemoteSelectValue<Multiple> | null | undefined;
  defaultValue?: RemoteSelectValue<Multiple> | null | undefined;
  onValueChange?: RemoteSelectChange<Multiple> | undefined;
  render?: Snippet<[
    RemoteSelectRenderProps<Multiple>,
    RemoteControlState,
    Snippet | undefined,
  ]> | undefined;
};

// Existing render payload and state remain their real current types.
// The old branch emits no new kind property; this is a type discriminant only.
type RemoteControlRenderProps =
  | (ExistingRemoteControlRenderProps & { kind?: undefined })
  | RemoteSelectRenderUnion;
```

The Select callback details are the source union `trigger-press | outside-press | escape-key | window-resize | item-press | focus-out | list-navigation | cancel-open | none`, correlated with the existing native event-details type. No Field.Control-only reason substitution is allowed. Root defaultValue retains Source nullable/undefined optional types; manually owned multiple null props remain permitted, but the multiple callback has no null. General nonremote SelectRootProps remains generic in Value and Multiple, including object, number, boolean and arrays-as-scalar values.

Keep the facade's two host boundaries visible: rootProps carries selection/form semantics; triggerProps carries visible-host ID/ARIA, Control class/style, authored attachments and the bindable actual Trigger ref. Root inputRef remains the actual common validation input ref. Root is wrapperless: no Trigger attachment, arbitrary native attributes or Root `ref` is smuggled onto it. Control class/style callbacks use the existing facade state and are resolved at that boundary before passing real Trigger props. Descriptor input-only `type`/value/multiple/defaultValue are not visible Trigger attributes. Compatible native attachments receive the real Trigger HTMLElement and canonical owned cleanup; attachments requiring an HTMLSelectElement require the unchanged bare native-select route.

The illustrative authored snippet is `if (props.kind === 'select')`, then `<Select.Root {...props.rootProps}>` containing `<Select.Trigger {...props.triggerProps}>` and the real remaining parts. Narrow on `props.multiple` when scalar/multiple callback assignment matters. No assertion/cast to unknown erases correlation. The public union implementation must preserve existing native/checked snippets and contextual types; any necessary overload must select this same slice, not make old callbacks unknown.

Types do not flow from an ancestor's runtime Svelte context into a child component's compile-time generic. Existing TypedField narrows Root name/as from real accessor arguments; it does not currently correlate Control to that particular ancestor. Context-only authored Control therefore receives the above honest discriminated union. The proposed explicitly supplied `type="select"` and `type="select multiple"` public overloads use RemoteSelectControlProps<false>/<true>; a broad/absent route exposes the render union, never a falsely inferred scalar payload. Keep existing native/checked callback types on their actual overloads. This does not promise automatic scalar snippet inference solely from the surrounding Root or require duplicating name/as on normal controls. Public installed-consumer compilation must demonstrate contextual union narrowing and preservation of old snippets/callbacks before the separate lease can be accepted. The generic old input `type: string` cannot simply be intersected with these literals and claimed discriminated; actual overload selection and negative consumers remain a type-review gate.

## Actual SDK data limits and future witnesses

Installed Kit2.70.3 `InputTypeMap` maps `select` to string and `select multiple` to string[]. `get_type_prefix` only prefixes number/range, scalar checkbox, and numeric/boolean hidden/submit; it adds **no numeric/boolean prefix for either Select kind**. Consume the descriptor's exact native name, including `[]` for multiple. Logical Field/Form errors and registration stay under the canonical logical name; authored native-name overrides affect serialization only. Do not infer Select schema support from unrelated hidden, number, checkbox or general Select serialization routes.

Required type positives are actual string and string[] fields, accepted `.as(...)` fallback arguments, canonical indexed paths and both string-correlated render branches. Type negatives include number/boolean/number[]/boolean[]/object/File leaves for both Select routes, scalar field as select multiple, array field as select, incompatible authored value/default/callback assignments, multiple callback accepting scalar/null, and incompatible actual Trigger refs. Typed Root name/as continues to derive from the real accessor declarations instead of claiming a second hard-coded SDK type map. The honest context-only Control payload identifies string versus string[]; it does not infer a schema's narrower enum item set from an ancestor context or promise that every string passes server validation. Wrong runtime types arriving through any/structural escape hatches have the explicit failure above. Kit3 remains a distinct actual type consumer; its declarations do not establish Kit3 runtime acceptance or change these witnessed Kit2 limits.

Future runtime witnesses separately cover every ownership-table row, current fallback changes, owner undefined/null/empty after programmatic set and settled reset, descriptor/accessor replacement during callbacks, cancel/consumer prevention, read-only/missing/wrong-receiver writer, scalar null encoding, string[] ordering, Source Field initial/dirty/filled/validation and logical errors, native descriptor/name overrides, actual Trigger/input refs and attachment cleanup. Keep invalid/canceled zero-POST then valid positive-POST, canceled reset and held payload gates. They require real rendered Source Select and actual SDK form listeners; no probe-only shim or new Kit patch supplies acceptance. Existing native/checked/text/file routes retain their established gates.
