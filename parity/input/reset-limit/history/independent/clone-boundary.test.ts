import {it,expect} from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import {readNativeDirtyValue} from '/tmp/input-clone-reset-proof/readNativeDirtyValue.ts';
import {mount,tick,unmount} from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import Fixture from './CloneBoundaryFixture.svelte';
it('dirty state is cleared without reset by a live non-value to value type transition',()=>{
 const input=document.createElement('input');input.defaultValue='seed';input.value='edit';expect(readNativeDirtyValue(input)).toBe(true);
 input.type='hidden';input.type='text';expect(input.value).toBe('edit');expect(readNativeDirtyValue(input)).toBe(false);
});
it('a successful reset followed by same-value assignment is dirty again',()=>{
 const form=document.createElement('form');const input=document.createElement('input');input.defaultValue='seed';input.value='edit';form.append(input);
 form.reset();expect(input.value).toBe('seed');expect(readNativeDirtyValue(input)).toBe(false);
 input.value=input.value;expect(input.value).toBe('seed');expect(readNativeDirtyValue(input)).toBe(true);
});
it('cloning a customized built-in invokes its constructor again',()=>{
 let constructions=0;class Custom extends HTMLInputElement{constructor(){super();constructions++;}}
 customElements.define('independent-clone-input',Custom,{extends:'input'});
 const input=document.createElement('input',{is:'independent-clone-input'});input.value='edit';const before=constructions;
 expect(readNativeDirtyValue(input)).toBe(true);expect(constructions).toBe(before+1);
});
for(const kind of ['native','current','candidate'])for(const scenario of ['same-value-after-reset','unrelated-mode-transition'])it(`actual ${kind} native boundary ${scenario}`,async()=>{
 const target=document.createElement('section');document.body.append(target);const c=mount(Fixture,{target,props:{kind,scenario}});await tick();
 try{const input=target.querySelector('input')!;input.value='edit';input.dispatchEvent(new InputEvent('input',{bubbles:true}));await tick();await tick();expect(input.value).toBe(scenario==='same-value-after-reset'?'seed':kind==='native'?'edit':'owner');}
 finally{await unmount(c);target.remove();}
});
