// Shared utility-only scenario data, derived from pinned upstream tests.
// MIT Copyright (c) 2019 Material-UI SAS; see UPSTREAM_LICENSE.
export type MergeScenario = {
  line: number;
  name: string;
  handlersLeftToRight: ({ log?: string; setsRan?: boolean; preventBaseUIHandler?: boolean } | null)[];
  expectedLog?: string[];
  expectedRan?: boolean;
  upstreamAssertion: string;
};

export const mergeScenarioMetadata = {
  "upstreamCommit": "47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c",
  "source": "packages/react/src/merge-props/mergeProps.test.ts",
  "evidenceKind": "utility-prerequisite-only",
  "license": "UPSTREAM_LICENSE",
  "adapter": "Native adapter uses lowercase onclick and Event('click'); React reference uses onClick and a synthetic wrapper around MouseEvent. No real button or Dialog assertion is represented."
};

export const mergeScenarios: MergeScenario[] = [
  {
    "line": 30,
    "name": "merges multiple event handlers",
    "handlersLeftToRight": [
      {
        "log": "3"
      },
      {
        "log": "2"
      },
      {
        "log": "1"
      }
    ],
    "expectedLog": [
      "1",
      "2",
      "3"
    ],
    "upstreamAssertion": "expect(log).toEqual(['1', '2', '3']);"
  },
  {
    "line": 55,
    "name": "merges undefined event handlers",
    "handlersLeftToRight": [
      {
        "log": "3"
      },
      null,
      {
        "log": "1"
      }
    ],
    "expectedLog": [
      "1",
      "3"
    ],
    "upstreamAssertion": "expect(log).toEqual(['1', '3']);"
  },
  {
    "line": 256,
    "name": "prevents internal handler if event.preventBaseUIHandler() is called",
    "handlersLeftToRight": [
      {
        "setsRan": true
      },
      {
        "setsRan": true
      },
      {
        "preventBaseUIHandler": true
      }
    ],
    "expectedRan": false,
    "upstreamAssertion": "expect(ran).toBe(false);"
  },
  {
    "line": 283,
    "name": "prevents handlers merged after event.preventBaseUIHandler() is called",
    "handlersLeftToRight": [
      {
        "log": "2"
      },
      {
        "preventBaseUIHandler": true,
        "log": "1"
      },
      {
        "log": "0"
      }
    ],
    "expectedLog": [
      "0",
      "1"
    ],
    "upstreamAssertion": "expect(log).toEqual(['0', '1']);"
  }
];
