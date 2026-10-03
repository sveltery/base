import type { Snippet } from 'svelte';
import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
import type { FieldControlChangeEventDetails, FieldControlProps, FieldRootState } from '../field/types.js';
import type { NativeStyle } from '../internals/nativeProps.js';
import type { HTMLProps } from '../internals/types.js';
import type { SwitchRootProps } from '../switch/types.js';

type NativeInputAttributes = {
  [Key in keyof HTMLInputAttributes as Key extends `on${string}` ? never : Key]: HTMLInputAttributes[Key]
};

export interface RemoteControlState extends FieldRootState {
  checked?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
}

/** Native attributes retain the source open-record contract. Only semantic
 * fields shared with checked families receive a concrete contextual type. */
export type RemoteControlRenderProps = HTMLProps & Pick<SwitchRootProps,
  'checked' | 'defaultChecked' | 'onCheckedChange' | 'name' | 'disabled' | 'required' | 'readOnly' | 'form' | 'inputRef' | 'nativeButton' | 'uncheckedValue'>;

export interface RemoteControlProps extends Omit<SwitchRootProps, 'render' | 'children' | 'value' | 'class' | 'style' | Extract<keyof SwitchRootProps, `on:${string}`>>,
  Omit<NativeInputAttributes, keyof SwitchRootProps | 'children' | 'value' | 'class' | 'style'> {
    value?: FieldControlProps['value'];
    class?: ClassValue | ((state: RemoteControlState) => ClassValue | undefined) | undefined;
    style?: NativeStyle | ((state: RemoteControlState) => NativeStyle | undefined) | undefined;
    children?: Snippet | undefined;
    render?: Snippet<[RemoteControlRenderProps, RemoteControlState, Snippet | undefined]> | undefined;
    onValueChange?: ((value: unknown, details: FieldControlChangeEventDetails) => void) | undefined;
}
