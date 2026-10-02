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
    const override = (attribute: string, property: 'formMethod' | 'formAction' | 'formTarget', fallback: string): string => {
      if (!submitter || !Element.prototype.hasAttribute.call(submitter, attribute)) return fallback;
      // Calling a native getter brands either actual submitter type, including another document's
      // controls. A synthetic DIV submitter and unavailable DOM implementations safely fall through.
      for (const prototype of [HTMLButtonElement.prototype, HTMLInputElement.prototype]) {
        const getter = Object.getOwnPropertyDescriptor(prototype, property)?.get;
        if (!getter) continue;
        try { return getter.call(submitter); } catch { /* Try the other native control brand. */ }
      }
      throw new TypeError('No native submitter property');
    };
    const method = override('formmethod', 'formMethod', nativeMethod);
    if (method !== 'post') return false;
    // Native action getters already resolve relative URLs. In particular, empty formaction reads
    // the submitter document URL rather than its baseURI when a <base> is present.
    const action = new URL(override('formaction', 'formAction', readForm('action')));
    const target = override('formtarget', 'formTarget', readForm('target'));
    // Kit 2.70.3 itself excludes only this literal target; case variants are characterized separately.
    if (target === '_blank') return false;
    return action.searchParams.has('/remote');
  } catch {
    return false;
  }
}
