export class Nho extends HTMLElement {
  /* NATIVE LIFECYCLE */

  constructor() {
    super();
    this._id = this._genId();
    this.props = {};
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.setup?.();
    this._update();
    this.onMounted?.();
  }

  disconnectedCallback() {
    this.onUnmounted?.();
  }

  /* INTERNAL FUNCTIONS */

  _update() {
    console.log(123)
    this._prop();
    // avoid update when props is not changed (shallow compare)
    let str = this.render(this._h.bind(this));
    let { body } = new DOMParser().parseFromString(str, 'text/html');
    this._patch(this.shadowRoot, body);
    this._event();
    // this.onUpdate?.(changes);
  }

  // dom diffing
  _patch(current, next) {
    // remove spare nodes
    let { childNodes: cNodes = [] } = current;
    let { childNodes: nNodes = [] } = next;
    let gap = cNodes.length - nNodes.length;
    if (gap > 0) [...cNodes].splice(gap * -1);

    // loop through each new node, compare with current
    nNodes.forEach((_, i) => {
      if (!cNodes[i]) current.appendChild(nNodes[i].cloneNode(true));
      else if (nNodes[i].childNodes.length) this._patch(cNodes[i], nNodes[i])
      else if (
        (cNodes[i].tagName !== nNodes[i].tagName) ||
        (cNodes[i].textContent !== nNodes[i].textContent)
      ) {
        cNodes[i].parentNode.replaceChild(nNodes[i].cloneNode(true), cNodes[i]);
      }
      // else if (cNodes[i]._id) {
      //   cNodes[i]._update();
      //   console.log(1223, nNodes[i]);
      // }
    })
  }

  // bind props to 'this'
  _prop() {
    [...this.shadowRoot.host.attributes].forEach(({ nodeName, nodeValue }) => {
      this.props[nodeName] = Nho.cache.get(nodeValue);
    })
  }

  // render html string
  _h(str, ...values) {
    return str.map((s, index, arr) => {
      if (index === arr.length - 1) values[index] = '';
      else if (s.endsWith('=')) {
        let key = this._genId();
        Nho.cache.set(key, typeof values[index] === 'function' ? values[index].bind(this) : values[index]);
        values[index] = key;
      }
      else if (values[index] instanceof Array) {
        values[index] = values[index].join('')
      }

      return s + values[index];
    }).join('');
  }

  // bind events to dom
  _event() {
    this.shadowRoot.querySelectorAll("*").forEach(node => {
      [...node.attributes].forEach(({ name, value }) => {
        if (name.startsWith('on')) {
          node[name] = e => Nho.cache.get(value).call(this, e);;
        }
      });
    });
  }

  /* API */

  reactive(state) {
    return new Proxy(state, {
      set: (target, key, value) => {
        // avoid update when state is not changed (shallow compare)
        if (target.hasOwnProperty(key) && target[key] === value) return true;
        target[key] = value;
        this._update();
        return true;
      },
      get: (target, key) => target[key]
    })
  }

  nextTick() {
    return new Promise(r => requestAnimationFrame(r));
  }

  /* HELPER FUNCTIONS */
  _genId() {
    return Math.random().toString(36).slice(2);
  }

  /* STATIC */
  static style = function () {}
  static cache = new Map();
}

window.Nho = Nho;
