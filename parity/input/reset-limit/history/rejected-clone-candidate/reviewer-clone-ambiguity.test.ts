import {it,expect} from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import {mount,tick,unmount} from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import {readNativeDirtyValue} from '/tmp/input-clone-reset-proof/readNativeDirtyValue.ts';
import {writeFileSync} from 'node:fs';
import Fixture from './CloneAmbiguityFixture.svelte';
it('stopped reset and completed reset then move have identical final native dirty state after caller writes',async()=>{
 const results=[];
 for(const direction of ['out','in'])for(const when of ['during','after']){
  const target=document.createElement('section');document.body.append(target);const c=mount(Fixture,{target,props:{direction,when}});await tick();
  const input=target.querySelector('input')!;const stages=[];let resetEvent;
  const capture=event=>{resetEvent=event;stages.push({phase:event.eventPhase,form:input.form?.id,dirty:readNativeDirtyValue(input),type:input.type,value:input.value,defaultValue:input.defaultValue});};
  document.addEventListener('reset',capture,true);
  try{input.value='edit';input.dispatchEvent(new InputEvent('input',{bubbles:true}));await tick();await tick();results.push({direction,when,stages,canceled:resetEvent.defaultPrevented,phase:resetEvent.eventPhase,form:input.form?.id,dirty:readNativeDirtyValue(input),type:input.type,value:input.value,defaultValue:input.defaultValue,html:input.outerHTML,actualReset:direction==='out'?when==='after':when==='during'});}
  finally{document.removeEventListener('reset',capture,true);await unmount(c);target.remove();}
 }
 writeFileSync('/tmp/input-independent-review/clone-ambiguity-results.json',JSON.stringify(results,null,2));
 const observable=result=>{const {direction,when,actualReset,...metadata}=result;return metadata;};
 expect(observable(results[0])).toEqual(observable(results[1]));expect(observable(results[2])).toEqual(observable(results[3]));
});
for(const direction of ['out','in'])for(const when of ['during','after'])for(const kind of ['native','current','candidate'])it(`caller write ${direction}/${when}/${kind}`,async()=>{
 const target=document.createElement('section');document.body.append(target);const c=mount(Fixture,{target,props:{direction,when,kind}});await tick();
 try{const input=target.querySelector('input')!;input.value='edit';input.dispatchEvent(new InputEvent('input',{bubbles:true}));await tick();await tick();const actualReset=direction==='out'?when==='after':when==='during';expect(input.value).toBe(kind==='native'||actualReset?'post':'owner');}
 finally{await unmount(c);target.remove();}
});
