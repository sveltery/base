// Supplemental comparison setup for Base UI v1.8.0; no declaration credit.
export function createPortalContainer(scenario: string) {
  const destination = document.createElement('section'); destination.id = 'portal-destination'; document.body.append(destination);
  const shadow = destination.attachShadow({mode: 'open'});
  const iframe = document.createElement('iframe'); document.body.append(iframe);
  const foreign = iframe.contentDocument!.createElement('section'); foreign.id = 'foreign-destination'; iframe.contentDocument!.body.append(foreign);
  if (scenario === 'element-current') Object.assign(destination, {current: null});
  const container = scenario === 'undefined' ? undefined : scenario === 'null' ? null : scenario === 'null-ref' ? {current: null} : scenario === 'ref-owner-document' ? {current: destination, ownerDocument: undefined} : scenario === 'shadow' ? shadow : scenario === 'iframe' ? foreign : destination;
  return {container, cleanup: () => { destination.remove(); iframe.remove(); }};
}
