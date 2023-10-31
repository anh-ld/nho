import { Nho } from "@";

class BigDaddy extends Nho {
  setup() {
    this.state = this.reactive({ count: 1 });
  }

  onMounted() {
    console.log("Mounted");
  }

  increase(e) {
    // this.state.count++;
    console.log(1, e, ++this.state.count);
  }

  someNumber() {
    return 30;
  }

  render(h) {
    return h`
      <div>
        <p>Hello ${this.someNumber()}</p>
        <span>Count: ${this.state.count}</span>
        <button on:click="${this.increase}">Increase</button>
      </div>
    `;
  }
}

customElements.define("big-daddy", BigDaddy);

class TodoItem extends Nho {
  render(h) {
    return h`
      <div style="margin-bottom:4px">
        <button onclick=${() => this.props.remove(this.props.item)}>Remove</button>
        <span class="item">${this.props.item}</span>
      </div>
    `;
  }
}

class TodoItems extends Nho {
  setup() {
    this.state = this.reactive({ items: [] });
  }

  addItem() {
    this.state.items = [...this.state.items, Math.random()];
  }

  removeItem(v) {
    this.state.items = this.state.items.filter((item) => item !== v);
    console.log(this.state.items.length);
  }

  render(h) {
    return h`
      <div>
        <h1>To do list</h1>
        <p>Total: ${this.state.items.length}</p>
        <div style="margin-bottom:8px">
          <button onclick=${this.addItem}>Add to do</button>  
        </div>
        ${this.state.items.map(
          (item) =>
            h`<todo-item item=${item} remove=${this.removeItem}></todo-item>`,
        )}
      </div>
    `;
  }
}

Nho.style = `
div {
  background: red;
}

.item {
  color: blue;
}
`;
customElements.define("todo-item", TodoItem);
customElements.define("todo-items", TodoItems);
