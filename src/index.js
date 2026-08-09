let cache = new WeakMap();
let MARK = "$nho$";

/* capture, parse nothing. "s" marks a template */
export let html = (s, ...v) => ({ s, v });

/* skeleton, once per template. hole in text -> comment anchor, hole in a tag -> attribute sentinel */
let compile = (strings) => {
  let markup = "";
  let inTag = false;

  strings.forEach((s, index) => {
    let open = -1, close = -1;
    let inQ = false, q = null;
    for (let i = 0; i < s.length; i++) {
      let c = s[i];
      if (inQ) {
        if (c === q) inQ = false;
      } else if (c === '"' || c === "'") {
        inQ = true;
        q = c;
      } else if (c === '<') open = i;
      else if (c === '>') close = i;
    }

    if (open !== close) {
      inTag = open > close;
      if (inTag && open !== -1) {
        let next = s[open + 1];
        if (next == null || /\s/.test(next)) inTag = false;
      }
    }
    markup += s + (index < strings.length - 1 ? (inTag ? MARK : `<!--${MARK}-->`) : "");
  });

  let t = document.createElement("template");
  t.innerHTML = markup;

  /* one walk, every hole, in hole order */
  let parts = [];
  let walker = document.createTreeWalker(t.content, 129);
  let index = -1;
  let hole = 0;
  let node;

  while ((node = walker.nextNode())) {
    index++;

    /* only comments carry data */
    if (node.data != null) {
      if (node.data === MARK) parts.push({ i: index, h: hole++ });
      continue;
    }

    [...node.attributes].forEach(({ name, value }) => {
      if (!value.includes(MARK)) return;

      /* one attribute, many holes: class="btn ${a} ${b}" */
      let statics = value.split(MARK);

      /* dash in tag = custom element = props, not attributes */
      parts.push({ i: index, n: name, s: statics, h: hole, c: statics.length - 1, o: node.localName.includes("-") });
      hole += statics.length - 1;
      node.removeAttribute(name);
    });
  }

  return { t: t.content, p: parts };
};

/* clone the skeleton, index its nodes in walk order */
let instantiate = (strings) => {
  let compiled = cache.get(strings);
  if (!compiled) cache.set(strings, (compiled = compile(strings)));

  let root = compiled.t.cloneNode(true);
  let walker = document.createTreeWalker(root, 129);
  let nodes = [];
  let node;

  while ((node = walker.nextNode())) nodes.push(node);

  return { r: root, p: compiled.p, d: nodes, l: [], c: [] };
};

/* text hole: text, a nested template, or a list of either */
let setChild = (inst, k, anchor, value, host) => {
  let list = Array.isArray(value) ? value : [value];
  let state = inst.c[k] || (inst.c[k] = []);

  /* drop what the new value dropped */
  while (state.length > list.length) state.pop()[2].forEach((node) => node.remove());

  /* child = [strings, instance, nodes]. strings is the identity */
  list.forEach((item, index) => {
    let child = state[index];
    let strings = item && item.s;

    /* same identity: patch in place */
    if (child && child[0] === strings) {
      if (strings) return update(child[1], item.v, host);

      child[2][0].data = item == null || item === true || item === false ? "" : item;

      return;
    }

    if (child) child[2].forEach((node) => node.remove());

    let nested = strings && instantiate(strings);
    let node = nested ? nested.r : document.createTextNode(item == null || item === true || item === false ? "" : item);

    /* fragment empties on insert, remember its children first */
    let nodes = nested ? [...nested.r.childNodes] : [node];

    if (nested) update(nested, item.v, host);
    anchor.before(node);
    state[index] = [strings, nested, nodes];
  });
};

/* write changed values into the nodes already found */
let update = (inst, values, host) => {
  inst.p.forEach((part, k) => {
    let node = inst.d[part.i];

    /* text hole */
    if (!part.n) {
      let value = values[part.h];

      /* templates and lists always re-check, contents change in place */
      if (value === inst.l[part.h] && !value?.s && !Array.isArray(value)) return;

      inst.l[part.h] = value;
      setChild(inst, k, node, value, host);

      return;
    }

    let changed = false;
    for (let i = 0; i < part.c; i++) {
      if (values[part.h + i] !== inst.l[part.h + i]) changed = true;
      inst.l[part.h + i] = values[part.h + i];
    }

    /* props always re-write, same object can hold new contents */
    if (!changed && !part.o) return;

    let name = part.n;

    /* lone hole keeps the raw value, mixed statics build a string */
    let value =
      part.c === 1 && !part.s[0] && !part.s[1]
        ? values[part.h]
        : part.s.reduce((acc, s, i) => acc + values[part.h + i - 1] + s);

    /* on a custom element every "on*" is a prop, so onClose reaches the child, not HTMLElement's onclose */
    if (name === "ref") value.current = node;
    else if (part.o) {
      /* bound to the owner, like an inline handler */
      (node.props ??= {})[name] = value instanceof Function ? value.bind(host) : value;

      /* an object can hold new contents under the same identity, a function cannot */
      if (changed || (value && typeof value === "object")) node._s?.();
    } else if (name.startsWith("on") && name in node) node[name] = value ? value.bind(host) : null;
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

      /* a parent may have set props before upgrade, keep them */
      this.props ??= {};

      /* host attributes are props too: <my-el count="5"> */
      [...this.attributes].forEach(({ name, value }) => (this.props[name] = value));

      this.setup?.();
    }

    this._u();
    this.onMounted?.();
  }

  disconnectedCallback() {
    /* drop the pending update, must not run after unmount */
    cancelAnimationFrame(this._t);

    this.onUnmounted?.();
  }

  /* update */
  _u() {
    let result = this.render(html);
    let first = !this._i;

    if (first) this._i = instantiate(result.s);

    update(this._i, result.v, this);

    if (first) {
      if (Nho.style) this._sr.innerHTML = `<style>${Nho.style}</style>`;

      this._sr.append(this._i.r);
    }

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
        this._u();
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
