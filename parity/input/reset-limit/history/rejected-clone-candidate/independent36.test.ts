import {it,expect} from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import {mount,tick,unmount} from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import Fixture from './IndependentResetFixture.svelte';
for(const move of ['out','in','after'])for(const stop of [false,true,'propagation'])for(const cancel of [false,true])for(const native of [false,true])it(`independent imperative reset ${move}/stop=${stop}/cancel=${cancel}/native=${native}`,async()=>{
 const target=document.createElement('section');document.body.append(target);const c=mount(Fixture,{target,props:{move,stop,cancel,native,imperative:true}});await tick();
 try {const input=target.querySelector('input')!;input.value='edit';input.dispatchEvent(new InputEvent('input',{bubbles:true}));const successful=!cancel&&move!=='out';expect(input.value).toBe(successful?'seed':'edit');await tick();await tick();expect(input.value).toBe(successful?'seed':native?'edit':'owner');expect(input.form!.id).toBe(move==='in'?'first':'second');}
 finally{await unmount(c);target.remove();}
});
