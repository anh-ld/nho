export class Nho extends HTMLElement {
  /* NATIVE HTML ELEMENT LIFECYCLE */

  constructor() {
    super();

    // old props
    this._op = {};

    // current props
    this.props = {};

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // shadow root alias
    this._sr = this.shadowRoot;

    // set host attributes to be props
    this._g(this._sr.host.attributes);

    // run setup before mounting
    this.setup?.();

    // update without callback fn
    this._u(false, false);

    // run onMounted callback if needed
    this.onMounted?.();
  }

  disconnectedCallback() {
    this.onUnmounted?.();
  }

  /* INTERNAL FUNCTIONS */

  // update
  _u(shouldShallowCompareProps = false, callback = this.onUpdate) {
    // avoid new update when props is not changed (shallow comparison)
    if (shouldShallowCompareProps && this._s(this._op, this.props)) return;

    // get html string
    let renderString = this.render(this._h.bind(this));
    let { body } = new DOMParser().parseFromString(renderString, "text/html");

    // create style element
    let styleElement = document.createElement("style");
    styleElement.innerHTML = Nho.style;

    // run patch
    this._p(this._sr, body, styleElement);

    // bind events to dom after patching
    this._e();

    // run onUpdate callback if needed
    callback?.(this._op, this.props);
  }

  // patching, dom diffing
  _p(current, next, styleNode) {
    let cNodes = this._m(current.childNodes);
    let nNodes = this._m(next.childNodes);
    if (styleNode) nNodes.unshift(styleNode);

    // compare new nodes and old nodes, if number of old nodes > new nodes, then remove the gap
    let gap = cNodes.length - nNodes.length;
    if (gap > 0) for (; gap > 0; gap--) current.removeChild(current.lastChild);

    // loop through each new node, compare with it's correlative current node
    nNodes.forEach((_, i) => {
      let c = cNodes[i];
      let n = nNodes[i];

      // cloned new node
      let clonedNewNode = n.cloneNode(true);

      // fn to replace old node by new node
      let replace = () => c.parentNode.replaceChild(clonedNewNode, c);

      // if there's no current node, then append new node
      if (!c) current.appendChild(clonedNewNode);
      // if they have different tags, then replace current node by new node
      else if (c.tagName !== n.tagName) replace();
      // if new node has its children, then recursively patch them
      else if (n.childNodes.length) this._p(c, n);
      // if both current and new nodes are custom elements
      // then update props from new node to current node -> run update fn
      // c._h is a tricky way to check if it's a Nho custom element
      else if (c._h) {
        c._g(n?.attributes);
        c._u(true);
      }
      // if they have different text contents, then replace current node by new node
      else if (c.textContent !== n.textContent) replace();

      // update attributes of current node
      if (c?.attributes) {
        // remove all attributes of current node
        while (c.attributes.length > 0) c.removeAttribute(c.attributes[0].name);

        // add new attributes from new node to current node
        this._m(n?.attributes).forEach(({ name, value }) => {
          c.setAttribute(name, value);
        });
      }
    });
  }

  // hyper script, render html string
  _h(stringArray, ...valueArray) {
    return stringArray
      .map((s, index, array) => {
        let currentValue = valueArray[index];
        let valueString = currentValue;

        // if it's the last index, there is no currentValue, so add "" only
        if (index === array.length - 1) {
          valueString = "";
        }

        // if string ends with "=", then it's gonna be a value hereafter
        else if (s.endsWith("=")) {
          // if attribute starts with 'p:' or 'on', then cache value
          if (/(p:|on).*$/.test(s)) {
            let key = Math.random().toString(36);

            Nho._c[key] =
              typeof currentValue === "function"
                ? currentValue.bind(this)
                : currentValue;

            valueString = key;
          }

          // else, then stringify
          else valueString = JSON.stringify(currentValue);
        }

        // if value is array, that should be an array of child components, then join it all to remove ","
        else if (Array.isArray(currentValue)) {
          valueString = currentValue.join("");
        }

        return s + valueString;
      })
      .join("");
  }

  // bind events to dom
  _e() {
    // traverse through the dom tree
    // check if dom attribute key is an event name (starts with "on")
    // if it's true, then bind cached event handler to that attribute
    this._sr.querySelectorAll("*").forEach((node) => {
      this._m(node.attributes).forEach(({ name, value }) => {
        if (name.startsWith("on")) {
          node[name] = (e) => Nho._c[value].call(this, e);
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

          // batch update after each frame
          if (time) cancelAnimationFrame(time);
          time = requestAnimationFrame(() => this._u());
        }

        return true;
      },
      get: (target, key) => target[key],
    });
  }

  /* HELPER FUNCTIONS */

  // turn NodeMap to array
  _m(attributes) {
    return [...(attributes || [])];
  }

  // get attributes object
  _g(attributes) {
    // internally cache old props
    this._op = this.props;

    let createAttributeObject = (acc, { nodeName, nodeValue }) => ({
      ...acc,
      [nodeName.startsWith("p:") ? nodeName.slice(2) : nodeName]:
        Nho._c[nodeValue],
    });

    // set new props
    this.props = this._m(attributes).reduce(createAttributeObject, {});
  }

  // shallow compare 2 objects
  _s(obj1, obj2) {
    // no length comparison or reference comparison since it's redundant
    return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
  }

  /* STATIC */

  // style
  static style = "";

  // cache
  static _c = {};
}

// FOR DEVELOPMENT PURPOSES ONLY
if (import.meta.env.DEV) window.Nho = Nho;
