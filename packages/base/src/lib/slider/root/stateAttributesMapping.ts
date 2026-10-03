// Base UI Slider stateAttributesMapping at 47b40521; MIT.
import type { StateAttributesMapping } from "../../internals/getStateAttributesProps.js";
import type { SliderRootState } from "../types.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
const nullMapping = () => null;
export const sliderStateAttributesMapping: StateAttributesMapping<SliderRootState> =
  {
    activeThumbIndex: nullMapping,
    max: nullMapping,
    min: nullMapping,
    minStepsBetweenValues: nullMapping,
    step: nullMapping,
    values: nullMapping,
    ...fieldValidityMapping,
  };
