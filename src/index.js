export class Nho extends HTMLElement {
  /* NATIVE HTML ELEMENT LIFECYCLE */

  constructor() {
    super();

    /* old props */
    this._op = {};

    /* current props */
    this.props = {};

    /*
      key: effect function, value: effect callback
      e.g: () => this.state.count : (oldValue, newValue) => console.log(oldValue, newValue)
    */
    this._ef = new Map();

    /*
      key: effect function, value: effect function value
      e.g: () => this.state.count : 100
    */
    this._ev = new Map();

    this._sr = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    /* set host attributes to be props */
    this._ga(this.attributes);

    /* run setup before mounting */
    this.setup?.();

    /* update without callback fn */
    this._u();

    /* run onMounted callback if needed */
    this.onMounted?.();
  }

  disconnectedCallback() {
    this.onUnmounted?.();
  }

  /* INTERNAL FUNCTIONS */

  /* update */
  _u(shouldShallowCompareProps = false) {
    /* avoid new update when props is not changed (shallow comparison) */
    if (shouldShallowCompareProps && this._sc(this._op, this.props)) return;

    Nho._d++;

    /* get html fragment */
    let t = document.createElement("template");
    t.innerHTML = this.render(this._h.bind(this));

    /* reuse style node when possible */
    if (!this._s) this._s = document.createElement("style");
    if (this._s.textContent !== Nho.style) this._s.textContent = Nho.style;

    /* run patch */
    this._p(this._sr, t.content, this._s);

    /* bind events to dom after patching */
    this._e();

    /* run onUpdated callback if needed */
    this.onUpdated?.();

    /* run effects if needed */
    this._ef.forEach((callback, valueFn) => {
      /* get value before and after update */
      let valueBeforeUpdate = this._ev.get(valueFn);
      let valueAfterUpdate = valueFn.call(this);

      /* run effect if value changed */
      if (valueBeforeUpdate !== valueAfterUpdate) callback.call(this, valueBeforeUpdate, valueAfterUpdate);

      /* update new effect value */
      this._ev.set(valueFn, valueAfterUpdate);
    });

    /* clear cache after outermost render finishes */
    if (!--Nho._d) {
      Nho._c.clear();
      Nho._i = 0;
    }
  }

  /* patching, dom diffing */
  _p(current, next, styleNode) {
    let cNodes = this._nm(current.childNodes);
    let nNodes = this._nm(next.childNodes);
    if (styleNode) nNodes.unshift(styleNode);

    /* compare new nodes and old (current) nodes, if number of old nodes > new nodes, then remove the gap */
    for (let gap = cNodes.length - nNodes.length; gap > 0; gap--) current.removeChild(current.lastChild);

    /* loop through each new node, compare with it's correlative current node */
    nNodes.forEach((_, i) => {
      let c = cNodes[i];
      let n = nNodes[i];

      /* function to clone new node */
      let clone = () => n.cloneNode(true);

      /* function to replace old node by new node */
      let replace = () => current.replaceChild(clone(), c);

      // if there's no current node, then append new node
      if (!c) current.appendChild(clone());
      // if they have different tags, then replace current node by new node
      else if (c.tagName !== n.tagName) replace();
      // if new node has its children, then recursively patch them
      else if (n.childNodes.length) this._p(c, n);
      // if both current and new nodes are custom elements
      // then update props from new node to current node -> run update fn
      // c._h is a tricky way to check if it's a Nho custom element
      else if (c._h) {
        c._ga(n?.attributes);
        c._u(true);
      }
      // if they have different text contents, then replace current node by new node
      else if (c.textContent !== n.textContent) replace();

      /* update attributes of current node */
      if (c?.attributes) {
        if (!c.attributes.length && !n?.attributes?.length) return;

        /* remove all attributes of current node */
        while (c.attributes.length > 0) c.removeAttribute(c.attributes[0].name);

        /* add new attributes from new node to current node */
        this._nm(n?.attributes).forEach(({ name, value }) => c.setAttribute(name, value));
      }
    });
  }

  /* hyper script, render html string */
  _h(stringArray, ...valueArray) {
    return stringArray
      .map((s, index) => {
        let currentValue = valueArray[index] ?? "";
        let valueString = currentValue;

        // if string ends with "=", then it's gonna be a value hereafter
        if (s[s.length - 1] === "=") {
          // if attribute is prop/event/ref, then cache value
          if (/\s(p:\S+|on\S+|ref)=$/.test(s)) {
            let key = ++Nho._i;
            Nho._c.set(key, typeof currentValue === "function" ? currentValue.bind(this) : currentValue);
            valueString = key;
          }
          // else, then serialize attribute
          else valueString = `"${`${currentValue}`.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)}"`;
        }
        // if value is array, that should be an array of child components, then join it all
        else if (Array.isArray(currentValue)) valueString = currentValue.join("");

        return s + valueString;
      })
      .join("");
  }

  /* events to dom */
  _e() {
    this._sr.querySelectorAll("*").forEach((node) => {
      if (!node.attributes.length) return;

      this._nm(node.attributes).forEach(({ name, value }) => {
        let index = +value;

        if (name.startsWith("on")) node[name] = Nho._c.get(index) || null;
        if (name === "ref") {
          let ref = Nho._c.get(index);
          if (ref) ref.current = node;
        }
      });
    });
  }

  /* API */

  effect(valueFn, callback) {
    this._ef.set(valueFn, callback);
    this._ev.set(valueFn, valueFn.call(this));
  }

  ref(initialValue) {
    return { current: initialValue };
  }

  reactive(state) {
    return new Proxy(state, {
      set: (target, key, value) => {
        if (target[key] !== value) {
          target[key] = value;

          /* batch update after each frame */
          this._t && cancelAnimationFrame(this._t);
          this._t = requestAnimationFrame(() => this._u());
        }

        return true;
      },
    });
  }

  /* HELPER FUNCTIONS */

  /* turn NodeMap to array */
  _nm(attributes) {
    return [...(attributes || [])];
  }

  /* get attributes object */
  _ga(attributes) {
    /* internally cache old props */
    this._op = this.props;

    let props = {};
    this._nm(attributes).forEach(({ nodeName, nodeValue }) => {
      props[nodeName.startsWith("p:") ? nodeName.slice(2) : nodeName] = Nho._c.get(+nodeValue);
    });

    this.props = props;
  }

  _sc(obj1, obj2) {
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
  }

  /* STATIC */

  /* style */
  static style = "";

  /* value cache for props/events/refs */
  static _c = new Map();

  /* cache id counter for props/events/refs */
  static _i = 0;

  /* render depth for safe cache cleanup */
  static _d = 0;
}

if (typeof globalThis !== "undefined") {
  globalThis.nho = globalThis.nho || {};
  globalThis.nho.Nho = Nho;
}
