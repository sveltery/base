// Original Base UI v1.8.0 business at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { getContext } from 'svelte';
export const PROVIDER = Symbol('Tooltip.Provider');
export interface TooltipProviderContext { readonly delay: number | undefined }
export function useTooltipProviderContext() { return getContext<TooltipProviderContext | undefined>(PROVIDER); }
