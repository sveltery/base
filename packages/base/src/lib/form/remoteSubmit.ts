// Proposed Kit 2.70.3 interoperability boundary. Decision/evidence: parity/field-form/enhancement-proposal.md.
// Read the actual native form and submitter action; never inspect or wrap enhancement internals.
export function isNativeKitRemoteSubmit(event: Event): boolean {
  // Form controls can shadow the instance's action, method, target and DOM methods.
  // Native getter calls both avoid that named-property lookup and brand-check the host.
  // All globals are read at event time; non-form render hosts and malformed URLs fall through.
  try {
    const form = event.currentTarget;
    if (!form || typeof HTMLFormElement === 'undefined') return false;
    const readForm = (name: 'method' | 'action' | 'target'): string =>
      Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, name)!.get!.call(form);
    const nativeMethod = readForm('method');
    const submitter = (event as SubmitEvent).submitter;
    const override = (name: string) => submitter ? Element.prototype.getAttribute.call(submitter, name) : null;
    const methodOverride = override('formmethod');
    // The native enumerated formmethod attribute defaults to GET when empty or invalid.
    const method = methodOverride === null ? nativeMethod : methodOverride.toLowerCase();
    const target = override('formtarget') ?? readForm('target');
    // Kit 2.70.3 itself excludes only this literal target; case variants are characterized separately.
    if (method !== 'post' || target === '_blank') return false;
    const action = override('formaction') ?? readForm('action');
    const baseURI: string = Object.getOwnPropertyDescriptor(Node.prototype, 'baseURI')!.get!.call(form);
    return new URL(action, baseURI).searchParams.has('/remote');
  } catch {
    return false;
  }
}
