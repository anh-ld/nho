export class Nho extends HTMLElement {
  /* NATIVE LIFECYCLE */

  constructor() {
    super();
    this.props = {};
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.setup?.();
    this._u();
    this.onMounted?.();
  }

  disconnectedCallback() {
    this.onUnmounted?.();
  }

  /* INTERNAL FUNCTIONS */

  // update
  _u(newProps) {
    let oldProps = { ...this.props };
    this.props = newProps || this._gA(this.shadowRoot.host.attributes);

    // avoid update when props is not changed (shallow compare)
    if (newProps && this._sC(oldProps, this.props)) return;

    let renderString = this.render(this._h.bind(this));
    let { body } = new DOMParser().parseFromString(renderString, "text/html");

    // create style element
    let styleElement = document.createElement("style");
    styleElement.innerHTML = Nho.style;

    this._p(this.shadowRoot, body, styleElement);
    this._e();
    this.onUpdate?.();
  }

  // patching, dom diffing
  _p(current, next, styleNode) {
    let cNodes = [...(current.childNodes || [])];
    let nNodes = [...(next.childNodes || [])];
    if (styleNode) nNodes.unshift(styleNode);

    // compare new nodes and old nodes, if old nodes > new nodes, then remove the gap
    let gap = cNodes.length - nNodes.length;
    if (gap > 0) for (; gap > 0; gap--) current.removeChild(current.lastChild);

    // loop through each new node, compare with current
    nNodes.forEach((_, i) => {
      let c = cNodes[i];
      let n = nNodes[i];

      // cloned new node
      let clonedNewNode = n.cloneNode(true);

      // replace old node by new node
      let replace = () => c.parentNode.replaceChild(clonedNewNode, c);

      if (!c) current.appendChild(clonedNewNode);
      else if (c.tagName !== n.tagName) replace();
      else if (n.childNodes.length) this._p(c, n);
      // if custom elements and same tag, then update props from new node to old node -> update
      // c._h is a tricky way to check if it's custom element
      else if (c._h) c._u(this._gA(n?.attributes));
      else if (c.textContent !== n.textContent) replace();

      // compare attributes
      if (c?.attributes) {
        for (let { name, value } of [...(n?.attributes || [])]) {
          c.setAttribute(name, value);
          c[name] = value;
        }
      }
    });
  }

  // hyper script, render html string
  _h(stringArray, ...valueArray) {
    return stringArray
      .map((s, index, array) => {
        let currentValue = valueArray[index];
        let valueString = currentValue;

        // if it's the last index, there is no currentValue
        if (index === array.length - 1) valueString = "";
        // if string ends with "=", then it's gonna be a value hereafter
        else if (s.endsWith("=")) {
          // if attribute starts with 'p:' or 'on', then cache value
          if (/(p:|on).*$/.test(s)) {
            let key = this._gId();
            Nho.cache.set(
              key,
              typeof currentValue === "function"
                ? currentValue.bind(this)
                : currentValue,
            );
            valueString = key;
          }

          // else, then stringify
          else valueString = JSON.stringify(currentValue);
        }

        // if value is array, then turn it into string
        else if (Array.isArray(currentValue)) {
          valueString = currentValue.join("");
        }

        return s + valueString;
      })
      .join("");
  }

  // bind events to dom
  _e() {
    this.shadowRoot.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach(({ name, value }) => {
        if (name.startsWith("on")) {
          node[name] = (e) => Nho.cache.get(value).call(this, e);
        }
      });
    });
  }

  /* API */

  reactive(state) {
    let time;

    return new Proxy(state, {
      set: (target, key, value) => {
        if (!(key in target) || target[key] !== value) {
          target[key] = value;

          // batch update each requestAnimationFrame;
          if (time) cancelAnimationFrame(time);
          time = requestAnimationFrame(() => this._u());
        }

        return true;
      },
      get: (target, key) => target[key],
    });
  }

  nextTick() {
    return new Promise((r) => requestAnimationFrame(r));
  }

  /* HELPER FUNCTIONS */

  // generate unique id
  _gId() {
    return Math.random().toString(36);
  }

  // get attributes object
  _gA(attributes = []) {
    let createAttributeObject = (acc, { nodeName, nodeValue }) => ({
      ...acc,
      [nodeName.startsWith("p:") ? nodeName.slice(2) : nodeName]:
        Nho.cache.get(nodeValue),
    });

    return [...attributes].reduce(createAttributeObject, {});
  }

  // shallow compare 2 objects
  _sC(obj1, obj2) {
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    let isSameLength = keys1.length === keys2.length;
    let isSameKeyValue = keys1.every((key) => obj1[key] === obj2[key]);

    return isSameLength && isSameKeyValue;
  }

  /* STATIC */
  static style = "";
  static cache = new Map();
}

// FOR DEVELOPMENT PURPOSES
if (import.meta.env.DEV) window.Nho = Nho;
