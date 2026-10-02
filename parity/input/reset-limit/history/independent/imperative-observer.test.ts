import {it,expect} from '/workspace/base/packages/base/node_modules/vitest/dist/index.js';
import {mount,tick,unmount} from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
import Fixture from './FinalResetFixture.svelte';
import {writeFileSync} from 'node:fs';
it('passive attribute records cannot distinguish stopped in-reset move from completed-reset move in one script stack',async()=>{
 const results=[];
 for(const move of ['out','after']){
  const target=document.createElement('section');document.body.append(target);const c=mount(Fixture,{target,props:{move,stop:true,native:true,imperative:true}});await tick();
  const input=target.querySelector('input')!;let resetEvent;const stages=[];const mutations=[];
  const capture=event=>{resetEvent=event;stages.push({stage:'capture',phase:event.eventPhase,form:input.form?.id});queueMicrotask(()=>stages.push({stage:'queued',phase:event.eventPhase,form:input.form?.id}));};
  const bubble=event=>stages.push({stage:'bubble',phase:event.eventPhase,form:input.form?.id});
  document.addEventListener('reset',capture,true);document.addEventListener('reset',bubble);
  const observer=new MutationObserver(records=>mutations.push(...records.map(record=>({attribute:record.attributeName,old:record.oldValue,current:input.getAttribute('form'),phase:resetEvent?.eventPhase}))));observer.observe(input,{attributes:true,attributeFilter:['form'],attributeOldValue:true});
  try{input.value='edit';input.dispatchEvent(new InputEvent('input',{bubbles:true}));await tick();await tick();results.push({stages,mutations,canceled:resetEvent.defaultPrevented,settledForm:input.form?.id,nativeValue:input.value});}
  finally{observer.disconnect();document.removeEventListener('reset',capture,true);document.removeEventListener('reset',bubble);await unmount(c);target.remove();}
 }
 writeFileSync('/tmp/input-independent-review/imperative-observer-results.json',JSON.stringify(results,null,2));expect(results[0].nativeValue).toBe('edit');expect(results[1].nativeValue).toBe('seed');
 const withoutValue=result=>{const {nativeValue,...metadata}=result;return metadata;};expect(withoutValue(results[0])).toEqual(withoutValue(results[1]));
});
