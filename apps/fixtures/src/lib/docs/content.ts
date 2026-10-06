export interface Section {
  id: string;
  title: string;
  paragraphs: string[];
  code?: string;
  links?: { label: string; href: string }[];
}
export interface Doc {
  slug: string;
  group: string;
  title: string;
  description: string;
  sections: Section[];
}
export const docs: Doc[] = [
  {
    slug: '',
    group: 'Overview',
    title: 'Build on a thoughtful base.',
    description: 'Unstyled building blocks for Svelte 5. Familiar parts, room for your own design.',
    sections: [
      {
        id: 'introduction',
        title: 'Svelte, with familiar foundations',
        paragraphs: [
          'Sveltery Base is an experimental, independent Svelte port of Base UI. It brings the part-based component model into Svelte snippets, bindings, and native events. You supply the visual design.',
          'These docs take inspiration from Base UI’s overview, handbook, anatomy, and API reference, and from shadcn/ui’s example-first component pages. Our examples and prose are written for Sveltery.',
        ],
        links: [
          {
            label: 'Start with the local workspace →',
            href: '/docs/getting-started',
          },
          { label: 'Try Dialog →', href: '/docs/components/dialog' },
        ],
      },
      {
        id: 'status',
        title: 'A foundation in progress',
        paragraphs: [
          'The current catalog has 26 bounded modules, 6 available native modules awaiting acceptance, 9 unimplemented modules, and 1 retired standalone renderer API. Field, Form, Fieldset, Checkbox, CheckboxGroup, Switch, Radio and RadioGroup are available alongside native render snippets and the earlier components. Remote Form exposes typed Field children and control descriptors. Complete upstream compatibility remains unfinished; the catalog ledger records each exported scope and its limits.',
          'The package is private and unpublished. APIs may change. Use this workspace to evaluate the current slice; check the repository contracts before depending on a behavior.',
        ],
        links: [
          {
            label: 'Read the compatibility limits',
            href: '/docs/handbook/compatibility',
          },
        ],
      },
    ],
  },
  {
    slug: 'getting-started',
    group: 'Getting started',
    title: 'Getting started',
    description: 'Run the source, explore a component, and understand what is available today.',
    sections: [
      {
        id: 'workspace',
        title: 'Run this workspace',
        paragraphs: [
          'Use Node 24.x and the pinned pnpm 12.6.0 toolchain. Clone the repository, then run these commands from its root. The bootstrap script installs the committed lockfile; build the library before running the app.',
          'Open http://localhost:5173/docs. The docs and browser fixtures use the same SvelteKit app and consume the real local package. No npm release of @sveltery/base is available.',
        ],
        code: 'git clone https://github.com/sveltery/base.git\ncd base\nbash scripts/bootstrap.sh\n# Select the pinned pnpm launcher when using Corepack:\nsource scripts/toolchain.sh\npnpm --filter @sveltery/base build\npnpm --filter @sveltery/fixtures dev',
      },
      {
        id: 'dependency',
        title: 'Use the existing local dependency',
        paragraphs: [
          'apps/fixtures already depends on @sveltery/base through workspace:*. Its source examples import the package namespace shown below. This dependency is for packages in this pnpm workspace; it is not a registry installation command.',
          'For a separate application, first evaluate a source checkout and its package build. Packaging and release support remain experimental; these docs do not promise a published version or a drop-in installer.',
        ],
        code: "import { Dialog } from '@sveltery/base';\n// Types and individual parts also exist at:\nimport type { RootProps } from '@sveltery/base/dialog';",
      },
      {
        id: 'assemble',
        title: 'Assemble, then style',
        paragraphs: [
          'Keep Root around its Trigger and Portal. Inside Portal, pair Popup with Title, Description, and a Close button. Add your CSS through class; the library provides behavior rather than a stylesheet.',
          'Portal content is absent during server rendering and mounts on the client. Keep browser-only work out of module initialization.',
        ],
        links: [
          {
            label: 'Dialog anatomy and live source',
            href: '/docs/components/dialog',
          },
          { label: 'Styling handbook', href: '/docs/handbook/styling' },
        ],
      },
    ],
  },
  {
    slug: 'handbook/styling',
    group: 'Handbook',
    title: 'Styling',
    description: 'Own the visual layer without losing the behavior underneath.',
    sections: [
      {
        id: 'classes',
        title: 'Start with class and native CSS',
        paragraphs: [
          'Parts accept a class string; Popup and Backdrop also accept a callback that receives PopupState. Styles can be strings or callbacks returning CSS strings. React style objects are unsupported.',
          'Portal moves its content outside the page container. In a Svelte style block, use explicit :global selectors for classes assigned to portaled parts. Keep these selectors namespaced to your example or application.',
        ],
        code: '<Dialog.Popup class="my-dialog">\n  <Dialog.Title>Project settings</Dialog.Title>\n  <Dialog.Close>Done</Dialog.Close>\n</Dialog.Popup>\n\n<style>\n  :global(.my-dialog) {\n    position: fixed;\n    inset: 15vh auto auto 50%;\n    transform: translateX(-50%);\n    width: min(420px, calc(100vw - 40px));\n    padding: 24px;\n    background: white;\n  }\n</style>',
      },
      {
        id: 'state',
        title: 'Style observable state',
        paragraphs: [
          'Popup and Backdrop expose data-open, data-closed, data-starting-style, and data-ending-style. Popup also exposes data-nested, data-nested-dialog-open, and --nested-dialogs. Trigger exposes data-popup-open and data-disabled.',
          'When adding transitions, make closing and reduced-motion states usable. A retained closing popup must not become an interactive obstacle. Broader animation equivalence remains unverified.',
        ],
        links: [
          {
            label: 'Local Dialog type reference',
            href: '/docs/components/dialog#api-reference',
          },
          {
            label: 'Base UI styling reference',
            href: 'https://base-ui.com/react/handbook/styling',
          },
        ],
      },
    ],
  },
  {
    slug: 'handbook/composition',
    group: 'Handbook',
    title: 'Composition',
    description: 'Translate the part model into Svelte’s own tools.',
    sections: [
      {
        id: 'snippets',
        title: 'Children and replacement snippets',
        paragraphs: [
          'Svelte children are snippets. The render snippet receives native props, state, and the children snippet. Spread all supplied props onto the replacement DOM element: attachment props carry ref and lifecycle behavior.',
          'Render the third argument to preserve child content. When adding event props to a replacement, compose them with mergeProps instead of overwriting the supplied handlers. Automatic inspection of a replacement element is not supported.',
        ],
        code: '<Dialog.Trigger nativeButton={false}>\n  {#snippet render(props, state, children)}\n    <span {...props} data-example-open={state.open}>\n      {@render children?.()}\n    </span>\n  {/snippet}\n  Open settings\n</Dialog.Trigger>',
      },
      {
        id: 'state',
        title: 'Controlled state',
        paragraphs: [
          'Without open, Root owns its state; defaultOpen supplies the initial value. With open, the application owns the value and must update it in onOpenChange. A held controlled input does not change just because the component requests a change.',
          'The event details object includes a reason, the native event, and cancel(). Cancellation prevents the internal change. actions uses bind:actions rather than React’s actionsRef. DOM references use bind:ref.',
        ],
        code: '<script lang="ts">\n  import { Dialog } from \'@sveltery/base\';\n  let open = $state(false);\n</script>\n\n<Dialog.Root {open} onOpenChange={(next, details) => {\n  if (!details.isCanceled) open = next;\n}}>\n  <!-- Trigger and Portal parts go here. -->\n</Dialog.Root>',
        links: [
          {
            label: 'Dialog reference',
            href: '/docs/components/dialog#api-reference',
          },
        ],
      },
      {
        id: 'host',
        title: 'Use the native default host',
        paragraphs: [
          'Each component renders its own native element. Button renders a button; Input delegates to Field.Control and renders an input. State, event handlers and attributes remain owned by that component.',
        ],
        code: '<script lang="ts">\n  import { Button } from "@sveltery/base";\n</script>\n<Button class="action">Action</Button>',
      },
      {
        id: 'compose',
        title: 'Compose a snippet',
        paragraphs: [
          'A render snippet receives merged props, component state and the children snippet. Spread the supplied props onto the actual host to preserve business attachments, focus and registration. Use mergeProps to add native props with source class, style and event precedence.',
        ],
        code: '<script lang="ts">\n  import { Toggle, mergeProps } from "@sveltery/base";\n</script>\n<Toggle nativeButton={false}>\n  {#snippet render(props, state, children)}\n    <span {...mergeProps(props, { class: "owned" })} data-selected={state.pressed}>\n      {@render children?.()}\n    </span>\n  {/snippet}\n  Content\n</Toggle>',
      },
      {
        id: 'bindings',
        title: 'Observe the actual element',
        paragraphs: [
          'Use bind:ref for the actual component host and bind:inputRef for Checkbox, Switch, Radio.Root or RadioGroup native inputs. Native attachments belong on the host you render and clean up with Svelte’s attachment lifetime.',
        ],
        code: '<script lang="ts">\n  import { Checkbox } from "@sveltery/base";\n  let input = $state<HTMLInputElement | null>();\n</script>\n<Checkbox.Root bind:inputRef={input} />',
      },
      {
        id: 'identity',
        title: 'Keep snippet identity stable',
        paragraphs: [
          'Reactive snippet arguments update a retained host. A changed snippet identity or branch can replace it. Native attachments observe actual Svelte update and removal timing.',
        ],
        links: [
          {
            label: 'Read native component composition',
            href: 'https://github.com/sveltery/base/blob/main/docs/rendering.md',
          },
        ],
      },
    ],
  },
  {
    slug: 'handbook/accessibility',
    group: 'Handbook',
    title: 'Accessibility',
    description: 'Treat names, focus, and keyboard behavior as part of the design.',
    sections: [
      {
        id: 'names',
        title: 'Give the dialog a name',
        paragraphs: [
          'Use Title inside Popup to establish its accessible name. Description provides a short explanation. Label each form control separately and use a real Close button. The live example keeps all of these relationships visible in its source.',
          'Do not remove focus outlines or replace button semantics with an unlabeled decorative element. Replacement snippets must retain the supplied native props and attachment behavior.',
        ],
      },
      {
        id: 'keyboard',
        title: 'Exercise the complete interaction',
        paragraphs: [
          'In the contained modal example, Enter or Space activates the trigger, Tab and Shift+Tab move among dialog controls, Escape requests dismissal, and closing returns focus to the trigger. Try both keyboard and pointer entry.',
          'Check the experience with your content, viewport sizes, and assistive technology. Existing secured Chromium tests cover bounded cases; they do not certify complete screen-reader support, all shadow DOM combinations, or the full upstream behavior inventory.',
        ],
        links: [
          {
            label: 'Try the keyboard example',
            href: '/docs/components/dialog#examples',
          },
          {
            label: 'Base UI accessibility guidance',
            href: 'https://base-ui.com/react/overview/accessibility',
          },
        ],
      },
    ],
  },
  {
    slug: 'handbook/compatibility',
    group: 'Handbook',
    title: 'Compatibility',
    description:
      'The local source is the contract. Upstream docs explain the model, not a promise of parity.',
    sections: [
      {
        id: 'available',
        title: 'Current documented surface',
        paragraphs: [
          'Dialog exports Root, Trigger, Portal, Backdrop, Popup, Title, Description, and Close. Only selected upstream cases have acceptance evidence. The docs describe this partial surface, rather than claiming complete 1:1 compatibility.',
          'Drawer and Toast are pending in this docs baseline. Other Base UI components are unsupported. This site includes no placeholder APIs or installation commands for them.',
        ],
      },
      {
        id: 'gaps',
        title: 'Known boundaries',
        paragraphs: [
          'Dialog.Viewport, detached handles and payload children, forced unmount while open, and multiple popups per Root are unsupported. Complete per-part composition/ref conformance, cross-component overlays, deep shadow-root traversal, touch dismissal, and portal relocation acceptance remain unfinished or unverified.',
          'React style objects and automatic replacement-element prop inspection are unsupported. Native lowercase event props, snippets, bind:ref, and bind:actions are deliberate Svelte adaptations. The canonical repository documents contain the detailed limitations and acceptance inventory.',
        ],
        links: [
          {
            label: 'Detailed Dialog slice and limitations',
            href: 'https://github.com/sveltery/base/blob/main/docs/dialog-first-slice.md',
          },
          {
            label: 'Pinned upstream contracts',
            href: 'https://github.com/sveltery/base/blob/main/docs/upstream-contracts.md',
          },
          {
            label: 'Parity evidence',
            href: 'https://github.com/sveltery/base/tree/main/parity',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/otp-field',
    group: 'Components',
    title: 'OTP Field',
    description: 'Enter a verification code across individual character inputs.',
    sections: [
      {
        id: 'code',
        title: 'Enter a code',
        paragraphs: [
          'OTPField.Root owns the complete string and requires length to match the number of OTPField.Input parts. Inputs derive their index from render and DOM order; Separator supports grouped layouts.',
        ],
        code: '<script lang="ts">\n  import { OTPField, Field } from "@sveltery/base";\n  let code = $state("");\n</script>\n<Field.Root name="code">\n  <Field.Label>Verification code</Field.Label>\n  <OTPField.Root length={6} value={code} onValueChange={(value) => code = value} required>\n    {#each [0, 1, 2, 3, 4, 5] as slot (slot)}<OTPField.Input />{/each}\n  </OTPField.Root>\n  <Field.Error />\n</Field.Root>',
      },
      {
        id: 'validation',
        title: 'Validation and completion',
        paragraphs: [
          'Numeric validation is the default. Alpha, alphanumeric and none are also supported; normalizeValue runs after filtering and should be idempotent. Root supplies complete-code form serialization and validation while Field supplies labels, errors and metadata. onValueChange supports cancellation; onValueComplete follows the applied update. autoSubmit requests the owning or explicitly associated form.',
        ],
      },
      {
        id: 'composition',
        title: 'Compose the inputs',
        paragraphs: [
          'Use native Svelte event props, class callbacks and CSS strings or callbacks returning CSS strings, bindable actual-element refs and render snippets. Input uses native readonly and inputmode attributes; Root owns readOnly and inputMode for all slots. A Root replacement snippet forwards props into its group host; an Input snippet forwards props into its native input.',
        ],
      },
      {
        id: 'limits',
        title: 'Compatibility limits',
        paragraphs: [
          'The complete Root/Input business algorithms use the real shared Field/Form and Composite helpers. Default native inputs settle canceled edits to the authoritative code through binding; caller input snippets own their native value behavior. Native focus and blur require preventBaseUIHandler to suppress internal handlers. Original UTF16 slot/completion quirks remain. Use a manual complete-string Root value/onValueChange for an external remote owner; automatic typed remote routing is unchanged. Full unchanged assertion parity remains incomplete. Provided Field support remains pending complete source/native acceptance.',
        ],
        links: [
          {
            label: 'Read the OTP Field contract and evidence',
            href: 'https://github.com/sveltery/base/blob/main/docs/otp-field.md',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/csp-provider',
    group: 'Components',
    title: 'CSP Provider',
    description: 'Share optional CSP settings with descendant components as they gain support.',
    sections: [
      {
        id: 'provide',
        title: 'Provide settings',
        paragraphs: [
          'CSPProvider renders its children without a wrapper element. It accepts an optional string nonce and optional boolean disableStyleElements.',
        ],
        code: '<script lang="ts">\n  import { CSPProvider } from "@sveltery/base/csp-provider";\n</script>\n<CSPProvider nonce="server-provided-nonce" disableStyleElements>\n  <Content />\n</CSPProvider>',
      },
      {
        id: 'defaults',
        title: 'Defaults and nesting',
        paragraphs: [
          'Without a provider, the internal default has disableStyleElements=false. A provider supplies its own optional values, including undefined when omitted. Nested providers replace outer settings, and prop updates reach existing descendants.',
        ],
      },
      {
        id: 'imports',
        title: 'Imports and types',
        paragraphs: [
          'Import CSPProvider from @sveltery/base or @sveltery/base/csp-provider. CSPProviderProps and CSPProviderState are named type exports from either entry. CSPProvider.Props and CSPProvider.State preserve the pinned type-only aliases without runtime properties. Children use a Svelte snippet; the provider has no native host attributes or public context reader.',
        ],
      },
      {
        id: 'limits',
        title: 'Current support',
        paragraphs: [
          'This release provides the context foundation. No downstream style or script consumer is implemented yet: ScrollArea, Select and prehydration scripts remain future work. Passing a nonce does not currently establish nonce application or style-tag suppression. The provider does not generate a nonce or set response headers. Four dependent upstream declarations remain deferred and uncredited.',
        ],
        links: [
          {
            label: 'Read the CSPProvider contract and evidence',
            href: 'https://github.com/sveltery/base/blob/main/docs/csp-provider.md',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/direction-provider',
    group: 'Components',
    title: 'Direction Provider',
    description: 'Share a text reading direction with descendant components.',
    sections: [
      {
        id: 'provide',
        title: 'Provide a direction',
        paragraphs: [
          'Wrap content in DirectionProvider with direction="rtl" or direction="ltr". It supplies context without adding an element or setting dir on your document.',
        ],
        code: '<DirectionProvider direction="rtl"><Content /></DirectionProvider>',
      },
      {
        id: 'read',
        title: 'Read reactive direction',
        paragraphs: [
          'In a descendant component, call useDirection once during initialization. Retain the returned reader and call it in markup, $derived or event handlers. Reading once during initialization captures only that value.',
        ],
        code: '<script lang="ts">\n  import { useDirection } from "@sveltery/base/direction-provider";\n  const direction = useDirection();\n  let isRTL = $derived(direction() === "rtl");\n</script>\n<span dir={direction()}>{isRTL ? "RTL content" : "LTR content"}</span>',
      },
      {
        id: 'defaults',
        title: 'Defaults and nesting',
        paragraphs: [
          'Readers outside a provider return ltr. An omitted or undefined provider direction also defaults to ltr. A nested provider owns its direction and defaults to ltr rather than inheriting its parent. Prop updates reach its existing descendants.',
        ],
      },
      {
        id: 'imports',
        title: 'Imports and types',
        paragraphs: [
          'Import DirectionProvider and useDirection from @sveltery/base or @sveltery/base/direction-provider. DirectionProviderProps and TextDirection are named types; DirectionProvider.Props and the empty DirectionProvider.State are type-only aliases. The hook takes no override argument.',
        ],
      },
      {
        id: 'limits',
        title: 'Compatibility limits',
        paragraphs: [
          'The reader is a callable Svelte API. It reads live owner changes, including inside the same event handler. Existing controls are not automatically connected to this context, and full directional interaction compatibility remains unfinished.',
        ],
        links: [
          {
            label: 'Read the DirectionProvider contract and evidence',
            href: 'https://github.com/sveltery/base/blob/main/docs/direction-provider.md',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/avatar',
    group: 'Components',
    title: 'Avatar',
    description: 'A profile image with initials or a fallback icon while it loads.',
    sections: [
      {
        id: 'anatomy',
        title: 'Assemble the parts',
        paragraphs: [
          'Root owns the image loading status. Image loads a source and Fallback displays initials until it is ready.',
        ],
        code: '<Avatar.Root><Avatar.Image src="/avatar.png" alt="Jane Doe" /><Avatar.Fallback>JD</Avatar.Fallback></Avatar.Root>',
      },
      {
        id: 'loading',
        title: 'Load the image',
        paragraphs: [
          'The default mode preloads the source and mounts the image when loaded. Set keepMounted to load in the rendered image, including lazy images and replacement image snippets. Pass native srcset and sizes for responsive images. onLoadingStatusChange reports loading, loaded and error.',
        ],
      },
      {
        id: 'fallback',
        title: 'Delay the fallback',
        paragraphs: [
          'Set delay in milliseconds to wait before showing the fallback. Once shown, later delay changes keep it available until the image loads.',
        ],
      },
      {
        id: 'motion',
        title: 'Style loading and motion',
        paragraphs: [
          'Image exposes data-starting-style and, in default mode, data-ending-style while exiting. The keepMounted mode exposes data-loading and data-error and hides an unready image from assistive technology. Root and Fallback expose imageLoadingStatus to class, style and render callbacks.',
        ],
      },
      {
        id: 'limits',
        title: 'Compatibility limits',
        paragraphs: [
          'The bounded Root, Image and Fallback port uses native Svelte props, snippets, bindings and CSS strings. Ordinary assertions, conformance, types and supplemental evidence are separate; complete library and assistive-technology compatibility remain unclaimed.',
        ],
        links: [
          {
            label: 'Read compatibility limits',
            href: '/docs/handbook/compatibility',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/accordion',
    group: 'Components',
    title: 'Accordion',
    description:
      'Compose labelled, collapsible sections with array values and cancellable requests.',
    sections: [
      {
        id: 'anatomy',
        title: 'Assemble the parts',
        paragraphs: [
          'Root groups Items. Each Item pairs Header and Trigger with a Panel. Values are arrays; use defaultValue for initial uncontrolled selection or value and onValueChange for controlled selection. multiple allows more than one selected item.',
        ],
        code: '<Accordion.Root defaultValue={[\'details\']}><Accordion.Item value="details"><Accordion.Header><Accordion.Trigger>Details</Accordion.Trigger></Accordion.Header><Accordion.Panel>Panel content</Accordion.Panel></Accordion.Item></Accordion.Root>',
      },
      {
        id: 'interaction',
        title: 'Requests and keyboard',
        paragraphs: [
          'Item onOpenChange runs before Root onValueChange; either can cancel the request through details.cancel(). Item cancellation stops the Root callback. Disabled state combines with ancestors. Enter and Space activate Triggers; deprecated orientation and loopFocus do not provide roving focus.',
        ],
      },
      {
        id: 'motion',
        title: 'Style and retain panels',
        paragraphs: [
          'Use --accordion-panel-height and --accordion-panel-width, and open/closed/starting/ending attributes on Panel. Panel overrides Root keepMounted and hiddenUntilFound defaults. hiddenUntilFound retains hidden contents for browser search.',
        ],
      },
      {
        id: 'api-reference',
        title: 'Local API reference',
        paragraphs: [
          'The signatures below are extracted from local declarations. Root props and state retain generic value arrays and the permissive upstream default. Explicit generic props constrain values and callback arrays.',
        ],
      },
      {
        id: 'limits',
        title: 'Compatibility limits',
        paragraphs: [
          'The immutable v1.8.0 inventory has 39 ordinary declaration sites / 43 variants. Portable scope is 38 / 42; one React.Activity Panel declaration remains deferred. Parameterized disabled, conformance, types and supplements are separate evidence. Final-head package, browser and review acceptance remain required.',
        ],
        links: [
          {
            label: 'Base UI Accordion reference',
            href: 'https://base-ui.com/react/components/accordion',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/collapsible',
    group: 'Components',
    title: 'Collapsible',
    description: 'A button and a panel that opens and closes with your CSS motion.',
    sections: [
      {
        id: 'anatomy',
        title: 'Assemble the parts',
        paragraphs: [
          'Root groups a Trigger and Panel. Root defaults to closed and enabled. Set defaultOpen for an uncontrolled initial value, or open and onOpenChange for an owner-controlled panel.',
        ],
        code: '<Collapsible.Root><Collapsible.Trigger>Details</Collapsible.Trigger><Collapsible.Panel>Panel content</Collapsible.Panel></Collapsible.Root>',
      },
      {
        id: 'motion',
        title: 'Style the panel',
        paragraphs: [
          'Use --collapsible-panel-height and --collapsible-panel-width for measured dimensions. State attributes expose open, closed, starting and ending phases. Initially open panels suppress entrance keyframes; later close and reopen cycles follow authored CSS.',
        ],
      },
      {
        id: 'presence',
        title: 'Keep content available',
        paragraphs: [
          'keepMounted retains a hidden closed panel. hiddenUntilFound overrides keepMounted and allows browser find-in-page to reveal its contents. Cancel onOpenChange through details.cancel() to keep the current state.',
        ],
      },
      {
        id: 'limits',
        title: 'Compatibility limits',
        paragraphs: [
          'The bounded Root, Trigger and Panel port uses Svelte snippets, native events, bindings and CSS strings. Six external React.Activity cases remain deferred. The source ledger separates ordinary assertions from helper, type and supplemental evidence; complete compatibility is unclaimed.',
        ],
        links: [
          {
            label: 'Read compatibility limits',
            href: '/docs/handbook/compatibility',
          },
        ],
      },
    ],
  },
  {
    slug: 'components/dialog',
    group: 'Components',
    title: 'Dialog',
    description: 'A focused space for a short task. Composable parts, with experimental behavior.',
    sections: [
      {
        id: 'anatomy',
        title: 'Anatomy',
        paragraphs: [
          'Root shares state with its parts. Trigger requests opening. Portal relocates client content; Backdrop provides a visual overlay. Popup owns the dialog semantics, while Title and Description establish its accessible relationships. Close requests dismissal.',
          'This is Sveltery’s eight-part slice. The upstream Viewport and detached-handle APIs are not implemented.',
        ],
        code: 'Dialog.Root\n├── Dialog.Trigger\n└── Dialog.Portal\n    ├── Dialog.Backdrop\n    └── Dialog.Popup\n        ├── Dialog.Title\n        ├── Dialog.Description\n        └── Dialog.Close',
      },
      {
        id: 'examples',
        title: 'Live example',
        paragraphs: [
          'Open the dialog below. Navigate using Tab and Shift+Tab, then close with Escape or the button. The source shown here is the actual rendered example, including its CSS. The note is a local demonstration and is not saved.',
        ],
      },
      {
        id: 'api-reference',
        title: 'API reference',
        paragraphs: [
          'The reference below is extracted from this checkout’s public TypeScript declarations and component $props annotations. It describes the local experimental API. Root does not render a DOM element; native element props belong to the other parts.',
          'Root defaults to uncontrolled closed state, modal=true, and disablePointerDismissal=false. Portal defaults keepMounted=false; container=undefined resolves to the parent portal or document body, while explicit null waits. Backdrop defaults forceRender=false. Trigger and Close default disabled=false and nativeButton=true. Popup uses default focus behavior when initialFocus or finalFocus is omitted.',
          'onInternalOpenChange is an acceptance observation seam, not a recommended application event. FocusTarget supports booleans, { current: element }, or an interaction callback; a callback returning undefined requests no movement and null requests the default. Shared declarations below show the local state and focus types. ChangeEventDetails inherits its event fields from the separately linked base event declaration.',
        ],
        links: [
          {
            label: 'Inherited event details (baseline source)',
            href: 'https://github.com/sveltery/base/blob/318020c3476523e11802d9f4b1ada96369f1641a/packages/base/src/lib/internals/createBaseUIEventDetails.ts',
          },
          {
            label: 'Upstream Dialog model (React)',
            href: 'https://base-ui.com/react/components/dialog',
          },
          {
            label: 'shadcn/ui Dialog examples (React)',
            href: 'https://ui.shadcn.com/docs/components/base/dialog',
          },
        ],
      },
      {
        id: 'limitations',
        title: 'Before you depend on it',
        paragraphs: [
          'This example exercises a contained modal dialog. It does not establish parity for detached triggers, touch movement, every screen-reader isolation case, or cross-component overlays. API shape alone is not behavior acceptance.',
        ],
        links: [
          {
            label: 'Read all current compatibility limits',
            href: '/docs/handbook/compatibility',
          },
        ],
      },
    ],
  },
  {
    slug: 'about',
    group: 'Overview',
    title: 'About & credits',
    description: 'An independent project, with a clear debt to its foundations.',
    sections: [
      {
        id: 'originals',
        title: 'Credit to the originals',
        paragraphs: [
          'Base UI by the MUI contributors provides the upstream component model, names, anatomy, and behavior contracts. shadcn/ui by shadcn and its contributors informs the recognizable documentation flow: getting started, browse a component, try an example, then inspect its API.',
          'Sveltery is unofficial and independent. It is not affiliated with or endorsed by MUI, Base UI, shadcn, or shadcn/ui. The identity, prose, layout implementation, and live Svelte example on this site are original Sveltery work.',
        ],
        links: [
          { label: 'Base UI documentation', href: 'https://base-ui.com/' },
          { label: 'Base UI source', href: 'https://github.com/mui/base-ui' },
          {
            label: 'shadcn/ui documentation',
            href: 'https://ui.shadcn.com/docs',
          },
          {
            label: 'shadcn/ui source',
            href: 'https://github.com/shadcn-ui/ui',
          },
        ],
      },
      {
        id: 'licenses',
        title: 'Licenses & source',
        paragraphs: [
          'Both upstream repositories use the MIT license. We inspected those notices before implementing this docs foundation. No upstream docs prose, stylesheet, or substantial example code was copied into this site. Existing upstream-derived library code retains its original notices.',
          'If future docs changes copy substantial upstream code, include its original copyright and MIT permission notice with that material. Documentation inspiration does not make this an official upstream site.',
        ],
        links: [
          {
            label: 'Base UI MIT license',
            href: 'https://github.com/mui/base-ui/blob/master/LICENSE',
          },
          {
            label: 'shadcn/ui MIT license',
            href: 'https://github.com/shadcn-ui/ui/blob/main/LICENSE.md',
          },
          {
            label: 'Sveltery MIT license',
            href: 'https://github.com/sveltery/base/blob/main/LICENSE',
          },
          {
            label: 'Retained third-party notices',
            href: 'https://github.com/sveltery/base/blob/main/packages/base/THIRD_PARTY_NOTICES.md',
          },
        ],
      },
    ],
  },
];
export const groups = ['Overview', 'Getting started', 'Handbook', 'Components'];
