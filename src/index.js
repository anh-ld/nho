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

    /* cache hyper function binding */
    this._hb = this._h.bind(this);

    /* reuse template for rendering to avoid extra DOMParser allocations */
    this._tp = document.createElement("template");

    this._sr = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    /* set host attributes to be props */
    this._ga(this._sr.host.attributes);

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

    /* get html fragment */
    this._tp.innerHTML = this.render(this._hb);
    const body = this._tp.content;

    /* reuse style node when possible */
    const styleElement = document.createElement("style");
    styleElement.innerHTML = Nho.style;

    /* run patch */
    this._p(this._sr, body, styleElement);

    /* bind events to dom after patching */
    this._e();

    /* run onUpdated callback if needed */
    this.onUpdated?.();

    /* run effects if needed */
    this._ef.forEach((callback, valueFn) => {
      /* get value before and after update */
      const valueBeforeUpdate = this._ev.get(valueFn);
      const valueAfterUpdate = valueFn.call(this);

      /* run effect if value changed */
      if (valueBeforeUpdate !== valueAfterUpdate) callback.call(this, valueBeforeUpdate, valueAfterUpdate);

      /* update new effect value */
      this._ev.set(valueFn, valueAfterUpdate);
    });
  }

  /* patching, dom diffing */
  _p(current, next, styleNode) {
    const cNodes = this._nm(current.childNodes);
    const nNodes = this._nm(next.childNodes);
    if (styleNode) nNodes.unshift(styleNode);

    /* compare new nodes and old nodes, if number of old nodes > new nodes, then remove the gap */
    let gap = cNodes.length - nNodes.length;
    if (gap > 0) for (; gap > 0; gap--) current.removeChild(current.lastChild);

    /* loop through each new node, compare with it's correlative current node */
    nNodes.forEach((_, i) => {
      const c = cNodes[i];
      const n = nNodes[i];

      /* function to clone new node */
      const clone = () => n.cloneNode(true);

      /* function to replace old node by new node */
      const replace = () => current.replaceChild(clone(), c);

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
        /* remove all attributes of current node */
        while (c.attributes.length > 0) c.removeAttribute(c.attributes[0].name);

        /* add new attributes from new node to current node */
        this._nm(n?.attributes).forEach(({ name, value }) => {
          c.setAttribute(name, value);
        });
      }
    });
  }

  /* hyper script, render html string */
  _h(stringArray, ...valueArray) {
    return stringArray
      .map((s, index) => {
        const currentValue = valueArray[index] || "";
        let valueString = currentValue;

        // if string ends with "=", then it's gonna be a value hereafter
        if (s.endsWith("=")) {
          // if attribute starts with 'p:' or 'on', then cache value
          if (/(p:|on|ref).*$/.test(s))
            valueString = Nho._c.push(typeof currentValue === "function" ? currentValue.bind(this) : currentValue) - 1;
          // else, then stringify
          else valueString = JSON.stringify(currentValue);
        }
        // if value is array, that should be an array of child components, then join it all
        else if (Array.isArray(currentValue)) valueString = currentValue.join("");

        return s + valueString;
      })
      .join("");
  }

  /* events to dom */
  _e() {
    /*
      traverse through the dom tree
      check if dom attribute key is an event name (starts with "on")
      if it's true, then bind cached event handler to that attribute
    */
    this._sr.querySelectorAll("*").forEach((node) => {
      this._nm(node.attributes).forEach(({ name, value }) => {
        const idx = +value;
        if (name.startsWith("on")) node[name] = (e) => Nho._c[idx]?.call(this, e);

        if (name === "ref") Nho._c[idx].current = node;
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
        if (!(key in target) || target[key] !== value) {
          target[key] = value;

          /* batch update after each frame */
          if (this._t) cancelAnimationFrame(this._t);
          this._t = requestAnimationFrame(() => this._u());
        }

        return true;
      },
      get: (target, key) => target[key],
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

    const props = {};
    this._nm(attributes).forEach(({ nodeName, nodeValue }) => {
      props[nodeName.startsWith("p:") ? nodeName.slice(2) : nodeName] = Nho._c[+nodeValue];
    });
    this.props = props;
  }

  /* shallow compare 2 objects */
  _sc(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    return keys1.length !== keys2.length ? false : keys1.every((key) => obj1[key] === obj2[key]);
  }

  /* STATIC */

  /* style */
  static style = "";

  static _c = [];
}

if (typeof globalThis !== "undefined") {
  globalThis.nho = globalThis.nho || {};
  globalThis.nho.Nho = Nho;
}
