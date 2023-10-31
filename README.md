## 📌 Nho

Nho (`nhỏ` | `small` in `Vietnamese`) is a tiny JavaScript library for easy Web Component development.

### Why Nho?

Creating Web Components can be tedious if you use vanilla JavaScript. On the other hand, popular frameworks like `Vue`, `React`,
`Minze`, `Lit`, etc are hefty (4KB+) for a small web component. `Nho` keeps it lightweight by stripping advanced APIs
and implementing a very simple DOM diffing algorithm in behind.

### Features

- 1.1KB gzipped.
- Simple API, inspired from `Vue`.


### Example
- [A todo list](https://nho-example.netlify.app/) - [Source](./playground)

### Limitations

Nho skips advanced features (that popular frameworks do have) like `key`, `Fragments`, `watch`, etc to stay small.
The DOM diffing algorithm is naive. If your components get too complex, consider other options.
