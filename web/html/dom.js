export function appendElement(parent, tag, content = '', attributes={}) {
  const el = document.createElement(tag);
  el.textContent = content;
  Object.entries(attributes).forEach(([k, v])=>el.setAttribute(k, v));
  parent.appendChild(el);
  return el;
}

export function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
