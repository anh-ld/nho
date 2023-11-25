## 📌 Nho

Nho (`nhỏ` | `small` in `Vietnamese`) is a tiny JavaScript library for easy Web Component development.

### Why Nho?

- Creating Web Components can be tedious if you use vanilla JavaScript. On the other hand, popular frameworks are hefty
(4KB+) for writing just a small web component. `Nho` keeps it lightweight by stripping advanced (but unused usually) API sand implementing a very simple DOM diffing algorithm in behind.

### Features

- 1.2KB gzipped.
- Simple API, inspired from `Vue`.


### Example
- [album list](https://nho-example.netlify.app/) - [source](./example)

### Limitations

- `Nho` skips advanced features (that popular frameworks do have) like `key`, `Fragments`, `memo`, etc to stay small.
The DOM diffing algorithm is kinda naive (it's fast enough for small project).
If your components get too complex, consider other options.

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
        <p>Name: ${this.state.count}</p>
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
