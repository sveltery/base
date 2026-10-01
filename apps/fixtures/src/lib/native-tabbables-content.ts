// Shared audit fixture topology, independent of either focus implementation.
export function mountNativeTabbables(node: HTMLElement, scenario: string) {
  const details = '<details open><summary id="native-summary">Native summary</summary><summary id="ignored-summary">Ignored summary</summary><button id="details-child">Details child</button></details>';
  if (scenario === 'summary-only') node.innerHTML = '<details open><summary id="native-summary">Native summary</summary>Details text</details>';
  else if (scenario === 'details' || scenario === 'shadow') node.innerHTML = details;
  else if (scenario === 'closed') node.innerHTML = details.replace(' open', '');
  else if (scenario === 'summaryless') node.innerHTML = '<details id="summaryless">Implicit summary</details>';
  else if (scenario === 'editable') node.innerHTML = '<div id="editable-empty" contenteditable="">Empty value</div><div id="editable-true" contenteditable="true">True value</div><div id="editable-plain" contenteditable="plaintext-only">Plain text</div><div id="editable-false" contenteditable="false">Not editable</div>';
  else if (scenario === 'embedded') node.innerHTML = '<iframe id="native-iframe" title="Native frame" srcdoc="<button>Frame button</button>"></iframe><object id="native-object" aria-label="Native object"></object><embed id="native-embed" aria-label="Native embed">';
  else if (scenario === 'audio' || scenario === 'video') node.innerHTML = `<${scenario} id="native-media" controls aria-label="Native media"></${scenario}>`;
  if (scenario === 'shadow') {
    const host = node.ownerDocument.createElement('div');
    node.replaceChildren(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = details + '<slot></slot>';
    const slotted = node.ownerDocument.createElement('div');
    slotted.id = 'slotted-editable'; slotted.contentEditable = 'plaintext-only'; slotted.textContent = 'Slotted editable';
    host.append(slotted);
  }
  return () => { node.replaceChildren(); };
}
