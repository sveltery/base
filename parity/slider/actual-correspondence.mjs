// Actual implementation map supplements the immutable pre-code source graph.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const original = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "source-graph.json"), "utf8"),
);
const planned = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "source-correspondence.json"),
    "utf8",
  ),
);
const actual = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "actual-local-graph.json"), "utf8"),
);
const local = new Map(actual.modules.map((module) => [module.local, module]));
const lib = "packages/base/src/lib/";
const nativeParts = [...local.keys()].filter(path => path.includes('/slider/') && path.endsWith('.svelte'));
const specials = {
  "packages/react/src/floating-ui-react/utils/element.ts": [lib + "floating-ui/utils/matchesFocusVisible.ts"],
  "packages/react/src/floating-ui-react/utils.ts": ["packages/utils/src/lib/shadowDom.ts"],
  "packages/react/src/utils/useIsHydrating.ts": [lib + "utils/useIsHydrating.svelte.ts"],
  "packages/react/src/internals/PrehydrationScript.tsx": [lib + "internals/PrehydrationScript.svelte"],
  "packages/react/src/internals/prehydrationScript.stub.ts": [lib + "internals/PrehydrationScript.svelte"],
  "packages/react/src/slider/thumb/prehydrationScript.template.js": [lib + "slider/thumb/prehydrationScript.min.ts"],
  "packages/utils/src/useValueAsRef.ts": [lib + "slider/control/SliderControl.svelte"],
  "packages/utils/src/addEventListener.ts": [lib + "slider/control/SliderControl.svelte"],
  "packages/utils/src/useControlled.ts": ["packages/utils/src/lib/Controlled.svelte.ts"],
  "packages/react/src/internals/useValueChanged.ts": [lib + "internals/ValueChanged.svelte.ts"],
  "packages/react/src/internals/useRenderElement.tsx": [lib + "internals/mergeComponentProps.ts", ...nativeParts],
  "packages/utils/src/useMergedRefs.ts": nativeParts,
  "packages/utils/src/useStableCallback.ts": nativeParts,
  "packages/utils/src/useIsoLayoutEffect.ts": nativeParts,
};
const modules = original.modules.map((module) => {
  const inherited = planned.modules.find(
    (record) => record.source === module.source,
  )?.inherited;
  let candidates =
    inherited?.local?.split("; ").filter((path) => local.has(path)) ?? [];
  let correspondence = inherited?.correspondence;
  if (module.source in specials) {
    candidates = specials[module.source];
    correspondence = module.source.endsWith("/element.ts")
      ? "Exactly matchesFocusVisible is selected and extracted as the one shared canonical leaf; other element functions and their PopupTriggerMap dependencies remain unselected."
      : "Direct native primitive or purposeful leaf boundary; see named function mapping in source-correspondence.md and SL-01.";
  }
  const relative = module.source
    .replace(/^packages\/react\/src\//, "")
    .replace(/^packages\/utils\/src\//, "utils/");
  if (module.source.startsWith("packages/utils/src/")) {
    const utilsRelative = module.source.replace("packages/utils/src/", "packages/utils/src/lib/");
    for (const path of [utilsRelative, utilsRelative.replace(/\.ts$/, ".svelte.ts")])
      if (local.has(path)) candidates.push(path);
  }
  for (const path of [
    relative,
    relative.replace(/\.tsx$/, ".svelte"),
    relative.replace(/\.ts$/, ".svelte.ts"),
  ]) {
    if (local.has(lib + path)) candidates.push(lib + path);
  }
  if (
    module.source.startsWith("packages/react/src/slider/") &&
    module.declarations.some((name) => /(?:Props|State|Event)/.test(name))
  )
    candidates.push(lib + "slider/types.ts");
  candidates = [...new Set(candidates)].filter((path) => local.has(path));
  if (module.source.startsWith("packages/utils/src/platform/")) {
    correspondence =
      "Selected canonical platform module closure imported by SliderThumb through matchesFocusVisible and shared Composite navigation through event.stopEvent. The real canonical event/platform bodies are reused without a second classifier or stub. Accepted PR55 actual main 74f667da is a normal-merge ancestor; all selected bodies and import edges equal that accepted main.";
  } else if (module.source === "packages/react/src/internals/useAnimationsFinished.ts") {
    correspondence =
      "Reuses current main canonical native animation owner wherever actually reached. Native AnimationFrame/onDestroy/effect/flushSync replace framework machinery; Source completion branches remain. Reachability is recorded per used module, and no unrelated Dialog acceptance is inherited.";
  } else if (module.source === "packages/utils/src/useAnimationFrame.ts") {
    correspondence = "Canonical Utils retains the complete Source Scheduler queue, global scheduling, cancellation, exception/reset and AnimationFrame owner bodies. Native onDestroy cancels the actual owner; no parallel RAF scheduler or React lifecycle engine is introduced. The historical field-form scheduler omission is not the current mapping.";
  } else if (module.source === "packages/utils/src/useValueAsRef.ts") {
    correspondence =
      "Source applied pointer cache is immediate; native tick replaces the React per-commit layout snapshot by reading actual accepted values after flush, with disposal guard and pre-effect for external values. SL-03 records the measured plain rejected-push difference and zero unchanged Source credit. Numeric/collision/swap/cancel order is unchanged; no React commit tracking or generic scheduler.";
  } else if (module.source === "packages/utils/src/warn.ts") {
    correspondence =
      "Selected directly by SliderRoot for the original DEV-only min >= max warning. Exact Source warn body reuses the canonical createLogOnce; native esm-env DEV replaces the React/browser process environment boundary.";
  } else if (module.source === "packages/utils/src/owner.ts") {
    correspondence =
      "Selected Slider ownerDocument and canonical ownerWindow helpers for actual control/Thumb focus, styles, ResizeObserver and listener cleanup. Reuses accepted canonical DOM boundary with no private owner lookup.";
  } else if (correspondence?.includes("Radio")) {
    correspondence =
      "Selected Slider dependency at the listed canonical paths. Reuses the existing Source business or accepted native boundary; prior feature correspondence remains provenance in the immutable pre-code mapping and does not determine Slider symbol selection. Full inherited body review remains required.";
  }
  return {
    source: module.source,
    sourceSha256: module.sha256,
    sourceUrl: module.url,
    originalDeclarations: module.declarations,
    local: candidates.map((path) => ({
      path,
      sha256: local.get(path).sha256,
      reachability: local.get(path).reachability,
    })),
    correspondence: candidates.length
      ? (correspondence ??
        "Recognizable original body or selected native public type at the same canonical path; full source/native mapping in source-correspondence.md.")
      : "Unselected conservative barrel/type dependency or React-only representation dependency. No second implementation, runtime stub, dead helper or generic public export is introduced for this module.",
    status: candidates.length
      ? "implemented; independent entire-closure review pending"
      : "unselected; independent symbol-selection audit pending",
  };
});
const output =
  JSON.stringify(
    {
      pin: original.pin,
      preCodeCommit: "e9346ab",
      status:
        "Actual Source/native body correspondence; final independent source/native/maintainability review pending",
      modules,
      nativeBoundaries: [
        {
          path: lib + "slider/thumb/SliderThumbNativeInput.svelte",
          original: "SliderThumb.tsx composed hidden-input onChange/value",
          primitive:
            "Literal native range input, public svelte/events on action before function binding; preserves cancellation/accepted value serialization.",
        },
        {
          path: lib + "internals/field-control-name/FieldControlNameContext.ts",
          original:
            "Accepted optional native-name integration extension, absent from React pin",
          primitive:
            "Existing live native context only affects successful input DOM name; Source registry/callback names unchanged.",
        },
      ],
      ordinaryComponentAssertionCredit: 0,
    },
    null,
    2,
  ) + "\n";
const destination = resolve(
  import.meta.dirname,
  "actual-source-correspondence.json",
);
if (process.argv.includes("--check")) {
  if (!existsSync(destination) || readFileSync(destination, "utf8") !== output)
    throw new Error("Actual Slider correspondence stale");
} else writeFileSync(destination, output);
console.log(
  `${modules.length} original Slider closure modules mapped; ${modules.filter((module) => module.local.length).length} select actual local bodies`,
);
