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
    this.state = this.reactive({
      items: ["clean bedroom", "workout", "gardening", "call Perry"],
      k: "",
    });
  }

  getFilteredItems() {
    if (!this.state.k) return this.state.items;
    return this.state.items.filter((i) => i.includes(this.state.k));
  }

  addItem() {
    const item = prompt("Please enter to do item");
    if (!item) return;
    this.state.items = [...this.state.items, item];
    this.state.k = "";
  }

  removeItem(i) {
    this.state.items = this.state.items.filter((item, index) => i !== index);
  }

  updateK(e) {
    this.state.k = e.target.value;
  }

  render(h) {
    return h`
      <div class="box">
        <h1 class="title">To do</h1>
        <input class="search" placeholder="Search" value=${
          this.state.k
        } data-id=${this.state.k} oninput=${this.updateK} />
        <div class="header">
          <p>Total: ${this.getFilteredItems().length}</p>
          <button class="add" onclick=${this.addItem}>Add to do</button>
        </div>
        ${
          this.getFilteredItems().length
            ? this.getFilteredItems().map(
                (item, i) =>
                  h`<todo-item p:item=${item} p:remove=${() =>
                    this.removeItem(i)}></todo-item>`,
              )
            : "<div>Nothing</div>"
        }
      </div>
    `;
  }
}

Nho.style = `
  * {
    font-family: system-ui, sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .box {
    width: 400px;
    max-width: 100%;
    padding: 16px;
    background-color: #efefef;
    min-height: 100vh;
  }
  
  .title {
    margin-bottom: 8px;
  }
  
  .header, .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header {
    margin-bottom: 16px;
  }
  
  .header p {
    font-size: 14px;
  }
  
  .item {
    margin-bottom: 4px;
  }
  
  .search {
    width: 100%;
    margin-bottom: 4px;
    padding: 4px;
    border-radius: 0;
    outline: none;
    border: 1px solid black;
  }
  
  button {
    padding: 4px 8px;
    background: white;
    border: none;
  }
  
  button.add {
    background: green;
    color: white;
  }
  
  button.remove-button {
    background: red;
    color: white;
  }
  
  .item-text {
    font-weight: 500;
    color: blue;
  }
`;
customElements.define("todo-item", TodoItem);
customElements.define("todo-items", TodoItems);
