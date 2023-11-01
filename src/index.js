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
    const oldProp = this.props;
    this.props = newProp || this._gProp(this.shadowRoot.host.attributes);
    // avoid update when props is not changed (shallow compare)
    if (newProp && this._sC(oldProp, this.props)) return;

    const str = this.render(this._h.bind(this));
    const { body, head } = new DOMParser().parseFromString(str, "text/html");
    this._patch(this.shadowRoot, body, head.childNodes[0]);
    this._event();
    this.onUpdate?.();
  }

  // dom diffing
  _patch(current, next, styleNode) {
    // remove spare nodes
    const cNodes = Array.from(current.childNodes || []);
    const nNodes = Array.from(next.childNodes || []);
    if (styleNode) nNodes.unshift(styleNode);

    const gap = cNodes.length - nNodes.length;
    if (gap > 0) [...cNodes].splice(gap * -1);

    // loop through each new node, compare with current
    nNodes.forEach((_, i) => {
      if (!cNodes[i]) current.appendChild(nNodes[i].cloneNode(true));
      else if (nNodes[i].childNodes.length) this._patch(cNodes[i], nNodes[i]);
      else if (
        cNodes[i].tagName !== nNodes[i].tagName ||
        cNodes[i].textContent !== nNodes[i].textContent
      ) {
        cNodes[i].parentNode.replaceChild(nNodes[i].cloneNode(true), cNodes[i]);
      }
      // if custom elements and same tag, then update props from new node to old node -> update
      else if (cNodes[i]._id) {
        cNodes[i]._update(this._gProp(nNodes[i].attributes));
      }
    });
  }

  // render html string
  _h(str, ...values) {
    return (
      `<style>${Nho.style}</style>` +
      str
        .map((s, index, arr) => {
          if (index === arr.length - 1) values[index] = "";
          else if (s.endsWith("=")) {
            if (/(p:|on).*$/.test(s)) {
              const key = this._gId();
              Nho.cache.set(
                key,
                typeof values[index] === "function"
                  ? values[index].bind(this)
                  : values[index],
              );
              values[index] = key;
            } else {
              values[index] = JSON.stringify(values[index])
            }
          } else if (Array.isArray(values[index])) {
            values[index] = values[index].join("");
          }

          return s + values[index];
        })
        .join("")
    );
  }

  // bind events to dom
  _event() {
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
          if (time) cancelAnimationFrame(time)
          time = requestAnimationFrame(() => this._update())
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
      (acc, { nodeName, nodeValue }) => ({
        ...acc,
        [nodeName.startsWith('p:') ? nodeName.slice(2): nodeName]: Nho.cache.get(nodeValue),
      }),
      {},
    );
  }

  // shallow compare
  _sC(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return (
      keys1.length === keys2.length &&
      keys1.every((key) => obj1[key] === obj2[key])
    );
  }

  /* STATIC */
  static style = "";
  static cache = new Map();
}

if (import.meta.env.DEV) window.Nho = Nho;
