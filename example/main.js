import { Nho } from "../src/index.js";
/* local data, so the demo works offline */
import products from "./products.json" with { type: "json" };
import style from "./style.js";

Nho.style = style;

/* HTML lowercases attribute names, so props are written lowercase: onbuy=, not onBuy= */

const money = (value, currency) => `${currency}${value.toFixed(2)}`;
const countOf = (cart) => cart.reduce((sum, item) => sum + item.qty, 0);

class ShopApp extends Nho {
  setup() {
    this.state = { query: "", cart: [], cartOpen: false, message: "" };

    /* lock the page behind the open cart */
    this.effect(
      () => this.state.cartOpen,
      (_, open) => (document.body.style.overflow = open ? "hidden" : ""),
    );
  }

  /* runs after every render */
  onUpdated() {
    const count = countOf(this.state.cart);
    document.title = count ? `(${count}) Nho shop` : "Nho shop";
  }

  search(event) {
    this.setState({ query: event.target.value });
  }

  add(product) {
    const { cart } = this.state;
    const inCart = cart.some((item) => item.id === product.id);

    if (inCart) return this.changeQty(product.id, 1);

    this.setState({ cart: [...cart, { ...product, qty: 1 }] });
  }

  /* zero removes the line */
  changeQty(id, delta) {
    const cart = this.state.cart.map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item));
    this.setState({ cart: cart.filter((item) => item.qty > 0) });
  }

  checkout() {
    this.setState({ cart: [], message: "Order placed. Thanks!" });
  }

  openCart() {
    this.setState({ cartOpen: true });
  }

  closeCart() {
    this.setState({ cartOpen: false, message: "" });
  }

  render(h) {
    const { query, cart, cartOpen, message } = this.state;
    const currency = this.props.currency ?? "$";
    const shown = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
    const count = countOf(cart);
    const qtyOf = (id) => cart.find((item) => item.id === id)?.qty ?? 0;

    const rows = shown.map(
      (product) => h`<li>
        <product-row product=${product} currency=${currency} qty=${qtyOf(product.id)} onbuy=${this.add}></product-row>
      </li>`,
    );

    const list = shown.length
      ? h`<ul class="list">${rows}</ul>`
      : h`<p class="empty muted">No products match "${query}".</p>`;

    const drawer = cartOpen
      ? h`<cart-drawer
          items=${cart}
          currency=${currency}
          message=${message}
          onqty=${this.changeQty}
          oncheckout=${this.checkout}
          onclose=${this.closeCart}
        ></cart-drawer>`
      : "";

    return h`
      <div class="page">
        <header class="header">
          <div>
            <h1>Nho shop</h1>
            <p class="muted">1.4 KB · no build step</p>
          </div>
          <button class="cart-button" onclick=${this.openCart}>Cart <span class="badge">${count}</span></button>
        </header>

        <input class="search" type="search" name="q" placeholder="Search products" aria-label="Search products" oninput=${this.search} />

        ${list}

        <footer class="footnote muted">
          A demo of <a href="https://github.com/anh-ld/nho" target="_blank" rel="noopener">Nho</a>, reactive Web
          Components in 1.4 KB with no build step. The whole shop is three components:
          <a href="https://github.com/anh-ld/nho/tree/main/example" target="_blank" rel="noopener">read the source</a>.
        </footer>
      </div>

      ${drawer}
    `;
  }
}

class ProductRow extends Nho {
  render(h) {
    const { product, currency, qty, onbuy } = this.props;
    const buttonClass = qty ? "add added" : "add";
    const label = qty ? `In cart · ${qty}` : "Add";

    return h`
      <div class="row">
        <span class="swatch" style="background: ${product.color}"></span>
        <span class="name">${product.name}</span>
        <span class="price">${money(product.price, currency)}</span>
        <button class=${buttonClass} onclick=${() => onbuy(product)}>${label}</button>
      </div>
    `;
  }
}

class CartDrawer extends Nho {
  setup() {
    this.closeRef = this.ref();
    this.onKey = (event) => event.key === "Escape" && this.props.onclose();
  }

  onMounted() {
    this.closeRef.current.focus();
    document.addEventListener("keydown", this.onKey);
  }

  onUnmounted() {
    document.removeEventListener("keydown", this.onKey);
  }

  render(h) {
    const { items, currency, message, onqty, oncheckout, onclose } = this.props;
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const lines = items.map(
      (item) => h`
        <li class="line">
          <span class="swatch" style="background: ${item.color}"></span>
          <span class="name">${item.name}</span>
          <span class="stepper">
            <button onclick=${() => onqty(item.id, -1)} aria-label="Fewer">−</button>
            <span>${item.qty}</span>
            <button onclick=${() => onqty(item.id, 1)} aria-label="More">+</button>
          </span>
          <span class="price line-total">${money(item.price * item.qty, currency)}</span>
        </li>
      `,
    );

    const content = items.length ? lines : h`<li class="muted empty-cart">Your cart is empty.</li>`;
    const notice = message ? h`<p class="message">${message}</p>` : "";

    return h`
      <div class="backdrop" onclick=${onclose}></div>
      <aside class="drawer" aria-label="Cart">
        <header class="drawer-head">
          <h2>Cart</h2>
          <button class="close" ref=${this.closeRef} onclick=${onclose} aria-label="Close cart">×</button>
        </header>
        ${notice}
        <ul class="lines">${content}</ul>
        <footer class="drawer-foot">
          <div class="total">
            <span>Total</span>
            <span class="cart-total">${money(total, currency)}</span>
          </div>
          <button class="checkout" onclick=${oncheckout} disabled=${!items.length}>Checkout</button>
        </footer>
      </aside>
    `;
  }
}

customElements.define("shop-app", ShopApp);
customElements.define("product-row", ProductRow);
customElements.define("cart-drawer", CartDrawer);
