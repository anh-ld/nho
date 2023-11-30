## 📌 Nho

Nho (`nhỏ` | `small` in `Vietnamese`) is a tiny JavaScript library for easy Web Component development.

### Why Nho?

- Writing a Web Component (WC) with vanilla JavaScript can be tedious. Alternatively, popular WC libs are overkill and overweighted (4KB+) for writing just a small WC like `a "Buy now" button` or `a cart listing`. `Nho` simplifies by staying lightweight, removing unnecessary APIs, and using a simple DOM diffing algorithm.

### Features

- 1.3KB gzipped.
- Simple API, inspired from `Vue`.


### Example
- [Album list](https://nho-example.netlify.app/) - [source](./example)

### Limitations

- In order to stay small, `Nho` skips advanced features (that popular front-end frameworks do have) like `key`, `Fragments`, `memo`. The DOM diffing algorithm is kinda naive (it's fast enough for small project though). If your components get too complex, consider other options.

### Installation

#### npm
First, run

```
npm install nho
```

then
```js
import { Nho } from 'nho';
class MyCounterChild extends Nho {}
```


#### CDN
First, add `script` to the `html` file
```html
<script src="https://unpkg.com/nho"></script>
```

then

```html
<script>
  let Nho = nho.Nho;
  class MyCounterChild extends Nho {}
</script>
```

### Usage

```js
/* Declare global styles. Styles will be injected to all Nho Elements */
Nho.style = `
  .box {
    background: blue;
    color: yellow;
  }
`

class MyCounterChild extends Nho {
  render(h) {
    /* Bind value from props */
    return h`<div>Child: ${this.props.count}</div>`
  }
}

class MyCounter extends Nho {
  setup() {
    /* This method run before mount */
    
    /* create component state using "this.reactive". state must be an object */
    this.state = this.reactive({ count: 1 });
 
    /* only use ref for storing DOM reference */
    this.pRef = this.ref();
    
    /* effect */
    this.effect(
      // effect value: fn -> value
      () => this.state.count,
      // effect callback: fn(old value, new value)
      (oldValue, newValue) => {
        console.log(oldValue, newValue)
      }
    )
  }
  
  onMounted() {
    /* This method run after mount */
    console.log('Mounted');
  }
  
  onUpdated() {
    /* This method run after each update. */
    console.log('Updated');

    /* P Ref */
    console.log('P Ref', this.pRef?.current);
  }
  
  onUnmounted() {
    /* This method run before unmount */
    console.log('Before unmount');
  }

  addCount() {
    /* Update state by redeclare its key-value. Avoid update the whole state. */
    this.state.count += 1;
  }
  
  render(h) {
    /* This method is used to render */
    
    /*
      SAME AS MODERN FRONT FRAMEWORKS
      - Must have only 1 root element
      - Bind state / event using value in literal string
      - Pass state to child element using props with 'p:' prefix
     */
    return h`
      <div class="box">
        <p ref=${this.pRef}>Name: ${this.state.count}</p>
        <button onclick=${this.addCount}>Add count</button>
        <my-counter-child p:count=${this.state.count + 5}></my-counter-child>
      </div>
    `
  }
}

customElements.define("my-counter", MyCounter);
customElements.define("my-counter-child", MyCounterChild);
```

```html
<my-counter></my-counter>
```

### How it works

- It's better to dive into the code, but here is a quick sketch about how `Nho` works.

![How Nho works](./hiw.webp)
