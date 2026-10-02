// Proposed Kit 2.70.3 interoperability boundary. Decision/evidence: parity/field-form/enhancement-proposal.md.
// Read the actual native form and submitter action; never inspect or wrap enhancement internals.
export function isNativeKitRemoteSubmit(event: Event): boolean {
  const form = event.currentTarget;
  if (!form || !('tagName' in form) || form.tagName !== 'FORM') return false;
  const nativeForm = form as HTMLFormElement;
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | HTMLInputElement | null | undefined;
  const method = submitter?.getAttribute('formmethod') ?? nativeForm.method;
  const target = submitter?.getAttribute('formtarget') ?? nativeForm.target;
  if (method.toLowerCase() !== 'post' || target === '_blank') return false;
  const action = submitter?.getAttribute('formaction') ?? nativeForm.action;
  return new URL(action, nativeForm.ownerDocument.baseURI).searchParams.has('/remote');
}
