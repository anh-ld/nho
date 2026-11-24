let MARK = "$n$";

/* capture only; "s" marks a template */
export let html = (s, ...v) => ({ s, v });

/* every element and comment, in document order */
let walk = (root) => {
  let walker = document.createTreeWalker(root, 129);
  let nodes = [];
  let node;

  while ((node = walker.nextNode())) nodes.push(node);

  return nodes;
};

/* parsed per instance, not cached: 1.4 KiB for ~1.8x mount cost. hole in text -> comment anchor, hole in a tag -> attribute sentinel */
let instantiate = (strings) => {
  let markup = "";
  let inTag = false;
  let quote = "";

  strings.forEach((s, index) => {
    /* carry tag and quote state across chunks. a "<" that opens no tag is text; a quoted ">" closes none */
    for (let c of s.replace(/<(?![a-z!/?])/gi, "")) {
      if (quote) quote = c === quote ? "" : quote;
      else if (!inTag) inTag = c === "<";
      else if (c === ">") inTag = false;
      else if (c === '"' || c === "'") quote = c;
    }

    markup += s + (index < strings.length - 1 ? (inTag ? MARK : `<!--${MARK}-->`) : "");
  });

  let t = document.createElement("template");
  t.innerHTML = markup;

  /* one walk, every hole, in hole order */
  let parts = [];
  let hole = 0;

  walk(t.content).forEach((node) => {
    /* only comments carry data */
    if (node.data != null) {
      if (node.data === MARK) parts.push({ i: node, h: hole++ });
      return;
    }

    [...node.attributes].forEach(({ name, value }) => {
      if (!value.includes(MARK)) return;

      /* one attribute, many holes: class="btn ${a} ${b}" */
      let statics = value.split(MARK);

      /* dash in tag = custom element = props, not attributes */
      parts.push({ i: node, n: name, s: statics, h: hole, c: statics.length - 1, o: node.localName.includes("-") });
      hole += statics.length - 1;
      node.removeAttribute(name);
    });
  });

  return { r: t.content, p: parts, l: [], c: [] };
};

/* text hole: text, a nested template, or a list of either */
let setChild = (inst, k, anchor, value, host) => {
  let list = [value].flat();
  let state = inst.c[k] || (inst.c[k] = []);

  /* drop what the new value dropped */
  while (state.length > list.length) state.pop()[2].forEach((node) => node.remove());

  /* child = [strings, instance, nodes]. strings is the identity */
  list.forEach((item, index) => {
    let child = state[index];
    let strings = item && item.s;
    /* null, undefined, true and false render empty */
    let text = item == null || item === !!item ? "" : item;

    /* same identity: patch in place */
    if (child && child[0] === strings) {
      if (strings) return update(child[1], item.v, host);

      child[2][0].data = text;

      return;
    }

    if (child) child[2].forEach((node) => node.remove());

    let nested = strings && instantiate(strings);
    let node = nested ? nested.r : document.createTextNode(text);

    if (nested) update(nested, item.v, host);

    /* inserting empties the fragment, so record its children first; holes are filled, so their nodes count */
    let nodes = nested ? [...nested.r.childNodes] : [node];

    /* the next item has not moved: insert before it */
    (state[index + 1]?.[2][0] ?? anchor).before(node);
    state[index] = [strings, nested, nodes];
  });
};

/* write changed values into the nodes already found */
let update = (inst, values, host) => {
  inst.p.forEach((part, k) => {
    let node = part.i;

    /* text hole */
    if (!part.n) {
      let value = values[part.h];

      /* templates and lists always re-check: their contents change in place */
      if (value === inst.l[part.h] && !value?.s && !Array.isArray(value)) return;

      inst.l[part.h] = value;
      setChild(inst, k, node, value, host);

      return;
    }

    let before = inst.l[part.h];
    let changed = false;
    for (let i = 0; i < part.c; i++) {
      if (values[part.h + i] !== inst.l[part.h + i]) changed = true;
      inst.l[part.h + i] = values[part.h + i];
    }

    /* props always re-write: the same object can hold new contents */
    if (!changed && !part.o) return;

    let name = part.n;

    /* a lone hole keeps the raw value; mixed statics build a string */
    let value =
      part.c === 1 && !part.s[0] && !part.s[1]
        ? values[part.h]
        : part.s.reduce((acc, s, i) => acc + (values[part.h + i - 1] ?? "") + s);

    /* on a custom element every "on*" is a prop, so onClose reaches the child, not HTMLElement's onclose */
    if (name === "ref") {
      if (before && before !== value) before.current = null;
      if (value) value.current = node;
    } else if (part.o) {
      /* bound to the owner, like an inline handler */
      (node.props ??= {})[name] = typeof value === "function" ? value.bind(host) : value;

      /* an object can hold new contents under the same identity, a function cannot */
      if (changed || (value && typeof value === "object")) node._s?.();
    } else if (/^on/.test(name) && name in node) node[name] = value ? value.bind(host) : null;
    else if (value == null || value === false) node.removeAttribute(name);
    else node.setAttribute(name, value);
  });
};

export class Nho extends HTMLElement {
  constructor() {
    super();

    /* value fn -> [callback, last value] */
    this._e = new Map();

    this._sr = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    /* mount once, even when moved in the dom */
    if (!this._m) {
      this._m = 1;

      /* keep props a parent set before upgrade */
      this.props ??= {};

      /* host attributes are props too: <my-el count="5"> */
      [...this.attributes].forEach(({ name, value }) => (this.props[name] = value));

      this.setup?.();
    }

    this._u();
    this.onMounted?.();
  }

  disconnectedCallback() {
    /* drop the pending update: it must not run after unmount */
    this._t = cancelAnimationFrame(this._t);

    this.onUnmounted?.();
  }

  _u() {
    let result = this.render(html);

    /* a different template has different holes: rebuild */
    let first = this._k !== result.s;

    /* the old skeleton is going: clear its refs */
    if (first && this._i) this._i.p.forEach((p) => p.n === "ref" && this._i.l[p.h] && (this._i.l[p.h].current = null));

    if (first) {
      this._sr.innerHTML = Nho.style ? `<style>${Nho.style}</style>` : "";
      this._i = instantiate((this._k = result.s));
    }

    update(this._i, result.v, this);

    if (first) this._sr.append(this._i.r);

    this.onUpdated?.();

    /* run effects whose value changed */
    this._e.forEach((e, valueFn) => {
      let after = valueFn.call(this);

      if (e[1] !== after) e[0].call(this, e[1], after);
      e[1] = after;
    });
  }

  /* one update per frame */
  _s() {
    if (!this._t)
      this._t = requestAnimationFrame(() => {
        this._t = 0;

        /* removed while the frame was pending, or asked by a parent after removal */
        if (this.isConnected) this._u();
      });
  }

  ref(initialValue) {
    return { current: initialValue };
  }

  setState(patch) {
    Object.assign(this.state, patch);
    this._s();
  }

  effect(valueFn, callback) {
    this._e.set(valueFn, [callback, valueFn.call(this)]);
  }

  /* injected into every element */
  static style = "";
}
