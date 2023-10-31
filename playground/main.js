import { Nho } from "@";

class TodoItem extends Nho {
  render(h) {
    return h`
      <div class="item">
        <span class="item-text">${this.props.item}</span>
        <button class="remove-button" onclick=${this.props.remove}>Remove</button>
      </div>
    `;
  }
}

class TodoItems extends Nho {
  setup() {
    this.state = this.reactive({ items: [] });
  }

  addItem() {
    const item = prompt("Please enter to do item");
    if (!item) return;
    this.state.items = [...this.state.items, item];
  }

  removeItem(i) {
    this.state.items = this.state.items.filter((item, index) => i !== index);
  }

  render(h) {
    return h`
      <div class="box">
        <h1 class="title">To do</h1>
        <div class="header">
          <p>Total: ${this.state.items.length}</p>
          <button onclick=${this.addItem}>Add to do</button>
        </div>
        ${this.state.items.map(
          (item, i) =>
            h`<todo-item item=${item} remove=${() =>
              this.removeItem(i)}></todo-item>`,
        )}
      </div>
    `;
  }
}

Nho.style = `
  * {
    font-family: system-ui, sans-serif;
    margin: 0;
    padding: 0;
  }
  
  .box {
    width: 400px;
    max-width: 100%;
    padding: 8px;
    background-color: whitesmoke;
  }
  
  .title {
    margin-bottom: 8px;
  }
  
  .header, .item {
    display: flex;
    justify-content: space-between;
  }
  
  .header {
    margin-bottom: 16px;
  }
  
  .item {
    margin-bottom: 4px;
  }
  
  button {
    padding: 4px 8px;
    background: white;
    border: none;
  }
  
  button.remove-button {
    background: red;
    color: white;
  }
  
  .item-text {
    font-weight: 500;
    color: orange
  }
`;
customElements.define("todo-item", TodoItem);
customElements.define("todo-items", TodoItems);
