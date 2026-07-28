import { Nho } from "../src/index.js";

Nho.style = `
  :host {
    display: block;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
  }

  .page {
    background: #f6f6f6;
    height: 100vh;
    color: #101010;
    overflow: auto;
  }

  .page,
  .cart-list {
    scrollbar-width: none;
  }

  .page::-webkit-scrollbar,
  .cart-list::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 5;
    background: white;
    border-bottom: 1px solid #e6e6e6;
  }

  .header-inner,
  .product-footer,
  .cart-header,
  .cart-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px 24px;
    gap: 16px;
  }

  .header-inner h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  .cart-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid #111;
  }

  .cart-count {
    background: white;
    color: #111;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
  }

  .grid {
    max-width: 1100px;
    margin: 0 auto;
    padding: 28px 24px 80px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .grid-item {
    display: flex;
  }

  .loading {
    text-align: center;
    padding: 80px 24px;
    color: #7a7a7a;
  }

  .product-card {
    background: white;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 14px;
    cursor: pointer;
  }

  .product-card:hover .product-title {
    text-decoration: underline;
  }

  .product-image {
    height: 160px;
    border-radius: 14px;
  }

  .product-title {
    font-size: 15px;
    font-weight: 600;
  }

  .product-body {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    min-height: 54px;
    flex: 1;
  }

  .product-footer {
    gap: 12px;
  }

  .price {
    font-weight: 700;
    font-size: 20px;
  }

  .cart-button,
  .buy-button,
  .checkout-button {
    background: #111;
    color: white;
    font-weight: 600;
  }

  .buy-button {
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 16px;
  }

  .quick-overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 30;
    padding: 24px;
  }

  .quick-card {
    background: white;
    width: min(780px, 92vw);
    border-radius: 18px;
    display: grid;
    grid-template-columns: minmax(240px, 1fr) minmax(220px, 0.9fr);
    gap: 20px;
    padding: 24px;
    position: relative;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  }

  .quick-media {
    border-radius: 16px;
    min-height: 260px;
  }

  .quick-meta {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .quick-title {
    font-size: 20px;
    font-weight: 700;
  }

  .quick-description {
    color: #666;
    font-size: 13px;
    line-height: 1.5;
  }

  .quick-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .quick-qty {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #666;
  }

  .quick-close {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 22px;
    line-height: 1;
    padding: 4px 8px;
  }

  @media (max-width: 720px) {
    .quick-overlay {
      padding: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .quick-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: 100vh;
      overflow: hidden;
      padding: 48px 16px 16px 16px;
      gap: 10px;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.2);
    }

    .quick-media {
      height: 140px;
    }

    .quick-meta {
      overflow: auto;
      padding-bottom: 4px;
    }

    .quick-title {
      font-size: 18px;
    }

    .quick-actions {
      width: 100%;
    }

    .quick-actions .buy-button {
      width: 100%;
      text-align: center;
    }

    .quick-qty {
      flex-wrap: wrap;
    }

    .quick-close {
      top: 10px;
      right: 12px;
    }
  }

  .cart-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    z-index: 20;
  }

  .cart-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .cart-drawer {
    position: relative;
    width: min(420px, 92vw);
    background: white;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    box-shadow: -12px 0 30px rgba(0, 0, 0, 0.1);
  }

  .cart-header h2 {
    font-size: 20px;
  }

  .icon-button {
    font-size: 22px;
    line-height: 1;
    padding: 4px 8px;
  }

  .cart-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: auto;
    padding-right: 4px;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 12px;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
  }

  .cart-item-image {
    width: 80px;
    height: 80px;
    border-radius: 12px;
  }

  .product-title,
  .cart-item-title,
  .cart-item-price {
    font-weight: 600;
  }

  .cart-item-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .cart-item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .qty-control {
    display: inline-flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .qty-control button {
    padding: 6px 10px;
    background: #f3f3f3;
  }

  .qty-control span {
    padding: 0 10px;
    min-width: 28px;
    text-align: center;
    font-size: 13px;
  }

  .remove-button {
    color: #b00020;
    font-size: 12px;
    text-decoration: underline;
  }

  .cart-item-price {
    white-space: nowrap;
  }

  .cart-summary {
    margin-top: auto;
    border-top: 1px solid #eee;
    padding-top: 16px;
    display: grid;
    gap: 10px;
  }

  .cart-total {
    font-weight: 700;
  }

  .checkout-button {
    padding: 12px 16px;
    border-radius: 12px;
  }

  .empty-cart {
    text-align: center;
    color: #8a8a8a;
    padding: 48px 12px;
  }

  .cart-message {
    background: #f0f7ff;
    color: #0a4b84;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
  }
`;

const formatPrice = (value) => `$${value.toFixed(2)}`;

const priceFromId = (id) => {
  const base = 12 + (id % 7) * 6;
  return Math.round((base + (id % 3) * 0.95) * 100) / 100;
};

const colorFromId = (id) => {
  const hash = (id * 2654435761) % 16777215;
  return hash.toString(16).padStart(6, "0");
};

class ProductCard extends Nho {
  render(h) {
    const { product, onbuy, onquickview } = this.props;

    return h`
      <div class="product-card" onclick=${() => {
        onquickview(product);
      }}>
        <div class="product-image" style="background: #${product.color}"></div>
        <div class="product-title">${product.title}</div>
        <div class="product-body">${product.body}</div>
        <div class="product-footer">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="buy-button" onclick=${(event) => {
            event.stopPropagation();
            onbuy(product);
          }}>Add</button>
        </div>
      </div>
    `;
  }
}

class QuickView extends Nho {
  setup() {
    this.state = { qty: 1 };
    this.closeRef = this.ref();
  }

  onMounted() {
    this.closeRef.current.focus();
  }

  incrementQty() {
    this.setState({ qty: this.state.qty + 1 });
  }

  decrementQty() {
    if (this.state.qty > 1) this.setState({ qty: this.state.qty - 1 });
  }

  handleAdd(product, onbuy, onclose) {
    onbuy(product, this.state.qty);
    onclose();
  }

  render(h) {
    const { product, onclose, onbuy } = this.props;

    return h`
      <div class="quick-overlay" onclick=${onclose}>
        <div class="quick-card" onclick=${(event) => event.stopPropagation()}>
          <button class="quick-close" ref=${this.closeRef} onclick=${onclose}>×</button>
          <div class="quick-media" style="background: #${product.color}"></div>
          <div class="quick-meta">
            <div class="quick-title">${product.title}</div>
            <div class="price">${formatPrice(product.price)}</div>
            <div class="quick-description">${product.body}</div>
            <div class="quick-qty">
              <span>Qty</span>
              <div class="qty-control">
                <button onclick=${this.decrementQty}>-</button>
                <span>${this.state.qty}</span>
                <button onclick=${this.incrementQty}>+</button>
              </div>
            </div>
            <div class="quick-actions">
              <button class="buy-button" onclick=${() => this.handleAdd(product, onbuy, onclose)}>Add</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class CartDrawer extends Nho {
  render(h) {
    const { items, onclose, oninc, ondec, onremove, oncheckout, message } = this.props;
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return h`
      <div class="cart-overlay">
        <div class="cart-backdrop" onclick=${onclose}></div>
        <aside class="cart-drawer">
          <div class="cart-header">
            <h2>Cart</h2>
            <button class="icon-button" onclick=${onclose}>×</button>
          </div>
          ${message ? h`<div class="cart-message">${message}</div>` : ""}
          ${
            items.length
              ? h`
                <div class="cart-list">
                  ${items.map(
                    (item) => h`
                      <div class="cart-item">
                        <div class="cart-item-image" style="background: #${item.color}"></div>
                        <div>
                          <div class="cart-item-title">${item.title}</div>
                          <div class="cart-item-controls">
                            <div class="qty-control">
                              <button onclick=${() => ondec(item.id)}>-</button>
                              <span>${item.qty}</span>
                              <button onclick=${() => oninc(item.id)}>+</button>
                            </div>
                            <button class="remove-button" onclick=${() => onremove(item.id)}>Remove</button>
                          </div>
                        </div>
                        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
                      </div>
                    `,
                  )}
                </div>
              `
              : h`<div class="empty-cart">Your cart is empty.</div>`
          }
          <div class="cart-summary">
            <div class="cart-total">
              <span>Subtotal</span>
              <span>${formatPrice(total)}</span>
            </div>
            <button class="checkout-button" onclick=${oncheckout}>Checkout</button>
          </div>
        </aside>
      </div>
    `;
  }
}

class ShopApp extends Nho {
  setup() {
    this.state = {
      products: [],
      isLoading: true,
      cart: [],
      isCartOpen: false,
      quickViewProduct: null,
      checkoutMessage: "",
    };

    this.pageRef = this.ref();

    /* .page is the scroller, not body, so lock it while an overlay is up */
    this.effect(
      () => this.state.isCartOpen || !!this.state.quickViewProduct,
      (_, locked) => {
        this.pageRef.current.style.overflow = locked ? "hidden" : "auto";
      },
    );
  }

  async onMounted() {
    const posts = await fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .catch(() => []);

    const products = posts.slice(0, 9).map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      price: priceFromId(post.id),
      color: colorFromId(post.id),
    }));
    this.setState({ products, isLoading: false });
  }

  cartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  openCart() {
    this.setState({ isCartOpen: true, checkoutMessage: "" });
  }

  closeCart() {
    this.setState({ isCartOpen: false });
  }

  openQuickView(product) {
    this.setState({ quickViewProduct: product });
  }

  closeQuickView() {
    this.setState({ quickViewProduct: null });
  }

  addToCart(product, qty = 1) {
    const { cart } = this.state;
    const existing = cart.find((item) => item.id === product.id);

    this.setState({
      cart: existing
        ? cart.map((item) => (item === existing ? { ...item, qty: item.qty + qty } : item))
        : [...cart, { ...product, qty }],
    });
    this.openCart();
  }

  incrementItem(id) {
    this.setState({ cart: this.state.cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)) });
  }

  decrementItem(id) {
    const target = this.state.cart.find((item) => item.id === id);
    if (!target) return;
    if (target.qty === 1) {
      this.removeItem(id);
      return;
    }
    this.setState({ cart: this.state.cart.map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item)) });
  }

  removeItem(id) {
    this.setState({ cart: this.state.cart.filter((item) => item.id !== id) });
  }

  checkout() {
    if (!this.state.cart.length) return;
    this.setState({ cart: [], checkoutMessage: "Checkout complete. Thanks for your order." });
  }

  render(h) {
    return h`
      <div class="page" ref=${this.pageRef}>
        <header class="header">
          <div class="header-inner">
            <h1>Nho Commerce</h1>
            <nav class="nav">
              <button class="cart-button" onclick=${this.openCart}>
                Cart
                <span class="cart-count">${this.cartCount()}</span>
              </button>
            </nav>
          </div>
        </header>
        ${
          this.state.isLoading
            ? h`<div class="loading">Loading products...</div>`
            : h`
              <section class="grid">
                ${this.state.products.map(
                  (product) =>
                    h`<product-card
                      class="grid-item"
                      product=${product}
                      onBuy=${this.addToCart}
                      onQuickView=${this.openQuickView}
                    ></product-card>`,
                )}
              </section>
            `
        }
        ${
          this.state.quickViewProduct
            ? h`<quick-view
                product=${this.state.quickViewProduct}
                onClose=${this.closeQuickView}
                onBuy=${this.addToCart}
              ></quick-view>`
            : ""
        }
        ${
          this.state.isCartOpen
            ? h`<cart-drawer
                items=${this.state.cart}
                onClose=${this.closeCart}
                onInc=${this.incrementItem}
                onDec=${this.decrementItem}
                onRemove=${this.removeItem}
                onCheckout=${this.checkout}
                message=${this.state.checkoutMessage}
              ></cart-drawer>`
            : ""
        }
      </div>
    `;
  }
}

customElements.define("shop-app", ShopApp);
customElements.define("product-card", ProductCard);
customElements.define("cart-drawer", CartDrawer);
customElements.define("quick-view", QuickView);
