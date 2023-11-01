export class Nho extends HTMLElement {
  /* NATIVE LIFECYCLE */

  constructor() {
    super();
    this.props = {};
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.setup?.();
    this._update();
    this.onMounted?.();
  }

  disconnectedCallback() {
    this.onUnmounted?.();
  }

  /* INTERNAL FUNCTIONS */

  _update(newProp) {
    let oldProp = { ...this.props };
    this.props = newProp || this._gProp(this.shadowRoot.host.attributes);
    // avoid update when props is not changed (shallow compare)
    if (newProp && this._sC(oldProp, this.props)) return;

    let str = this.render(this._h.bind(this));
    let { body } = new DOMParser().parseFromString(str, "text/html");
    let styleElement = document.createElement("style");
    styleElement.innerHTML = Nho.style;
    this._patch(this.shadowRoot, body, styleElement);
    this._event();
    this.onUpdate?.();
  }

  // dom diffing
  _patch(current, next, styleNode) {
    let cNodes = Array.from(current.childNodes || []);
    let nNodes = Array.from(next.childNodes || []);
    if (styleNode) nNodes.unshift(styleNode);

    // compare new nodes and old nodes, if old nodes > new nodes, then remove the gap
    let gap = cNodes.length - nNodes.length;
    if (gap > 0) for (; gap > 0; gap--) current.removeChild(current.lastChild);

    // loop through each new node, compare with current
    nNodes.forEach((_, i) => {
      let c = cNodes[i];
      let n = nNodes[i];

      // replace old node by new node
      let replace = () => c.parentNode.replaceChild(n.cloneNode(true), c);

      if (!c) current.appendChild(n.cloneNode(true));
      else if (c.tagName !== n.tagName) replace();
      else if (n.childNodes.length) this._patch(c, n);
      // if custom elements and same tag, then update props from new node to old node -> update
      // c._h is a tricky way to check if it's custom element
      else if (c._h) c._update(this._gProp(n.attributes));
      else if (c.textContent !== n.textContent) replace();
      // compare attributes
      else if (n?.attributes) {
        for (let { name, value } of Array.from(n.attributes)) {
          c.setAttribute(name, value);
          c[name] = value;
        }
      }
    });
  }

  // render html string
  _h(str, ...values) {
    return str
      .map((s, index, arr) => {
        let currentValue = values[index];
        let valueString = currentValue;

        // if last index, there is no currentValue
        if (index === arr.length - 1) valueString = "";
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
  _event() {
    this.shadowRoot.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach(({ name, value }) => {
        if (name.startsWith("on"))
          node[name] = (e) => Nho.cache.get(value).call(this, e);
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
          time = requestAnimationFrame(() => this._update());
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
  _gId() {
    return Math.random().toString(36).slice(2);
  }

  // get props object
  _gProp(attrs) {
    return [...attrs].reduce(
      (acc, { nodeName: n, nodeValue }) => ({
        ...acc,
        [n.startsWith("p:") ? n.slice(2) : n]: Nho.cache.get(nodeValue),
      }),
      {},
    );
  }

  // shallow compare
  _sC(obj1, obj2) {
    let k1 = Object.keys(obj1);
    let k2 = Object.keys(obj2);
    return (
      k1.length === k2.length && k1.every((key) => obj1[key] === obj2[key])
    );
  }

  /* STATIC */
  static style = "";
  static cache = new Map();
}

// FOR DEVELOPMENT PURPOSES
if (import.meta.env.DEV) window.Nho = Nho;
