import { Nho } from "../src/index.js";

/* exit timings live here and are interpolated into the CSS, so the unmount timer can never drift */
const QUICK_EXIT = 200;
const CART_EXIT = 240;

Nho.style = `
  :host {
    display: block;

    --page: #ffffff;
    --tile: #f2f1ef;
    --ink: #1c1b1a;
    --muted: #767470;
    --accent: #e2622c;
    --mint: #6fbfa4;
    --sky: #4a90d9;
    --radius: 18px;
    --radius-sm: 12px;
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
    --fast: 140ms;
    --hover: 150ms;
    --enter: 280ms;
    --exit: ${QUICK_EXIT}ms;
    --drawer-in: 380ms;
    --drawer-out: ${CART_EXIT}ms;

    /* distances, zeroed under reduced motion so every leave becomes a plain fade */
    --rise-y: 16px;
    --pop-y: 18px;
    --slide-x: 100%;

    color: var(--ink);
    font-weight: 450;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2 { text-wrap: balance; }
  p, .quick-description { text-wrap: pretty; }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    transition-property: background-color, color, opacity, translate;
    transition-duration: var(--fast);
    transition-timing-function: ease;
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 4px;
  }

  .price,
  .cart-total span,
  .cart-item-price,
  .qty-control span {
    font-variant-numeric: tabular-nums;
  }

  /* ---------- shell ---------- */

  .page {
    background: var(--page);
    height: 100vh;
    overflow: auto;
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
    background: var(--page);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 28px;
    height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .wordmark {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--accent);
  }

  .cart-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--page);
    font-size: 14px;
    font-weight: 600;
  }

  .cart-button:hover { background: var(--accent); }

  .cart-count {
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: var(--page);
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
  }

  /* two identical animations, alternated on every cart change, so the count always re-fires */
  .cart-count.a { animation: count-a 220ms var(--ease-out); }
  .cart-count.b { animation: count-b 220ms var(--ease-out); }

  @keyframes count-a {
    from { opacity: 0; translate: 0 -5px; }
  }

  @keyframes count-b {
    from { opacity: 0; translate: 0 -5px; }
  }

  /* ---------- hero ---------- */

  .shell {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px 28px 96px;
  }

  .hero {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 16px;
    margin-bottom: 72px;
  }

  .hero-main,
  .hero-side {
    border-radius: var(--radius);
    padding: 44px 40px;
    display: flex;
    flex-direction: column;
  }

  .hero-main {
    background: var(--accent);
    color: #fff;
    min-height: 380px;
    justify-content: center;
    gap: 20px;
  }

  .hero-eyebrow {
    font-size: 14px;
    font-weight: 600;
    opacity: 0.85;
  }

  .hero-main h1 {
    font-size: clamp(38px, 5vw, 60px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.02;
    max-width: 12ch;
  }

  .hero-side {
    background: var(--tile);
    justify-content: flex-end;
    gap: 6px;
  }

  .hero-side h2 {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .hero-side p {
    color: var(--muted);
    font-size: 15px;
    margin-bottom: 18px;
  }

  .pill {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px 12px 22px;
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 15px;
    font-weight: 600;
  }

  .pill:hover { translate: 3px 0; }

  .pill .dot {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: var(--ink);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 13px;
  }

  /* ---------- shelf ---------- */

  .shelf-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }

  .shelf-head h2 {
    font-size: clamp(26px, 3.6vw, 40px);
    font-weight: 700;
    letter-spacing: -0.035em;
  }

  .shelf-head span {
    font-size: 14px;
    color: var(--muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    gap: 36px 20px;
  }

  /* ---------- card ---------- */

  .card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    animation: rise var(--enter) var(--ease-out) backwards;
  }

  @keyframes rise {
    from { opacity: 0; translate: 0 var(--rise-y); }
  }

  .swatch {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: var(--radius);
    padding: 18px;
    overflow: hidden;
  }

  .swatch-fill {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-sm);
    transition: opacity var(--hover) ease;
  }

  .card:hover .swatch-fill { opacity: 0.88; }

  .badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    padding: 5px 12px;
    border-radius: 999px;
    background: var(--mint);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }

  .badge.hot { background: var(--sky); }

  /* the pill lives inside the colour block's padding, so it never overhangs the tile */
  .card-add {
    position: absolute;
    left: 28px;
    right: 28px;
    bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 13px 16px;
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(28, 27, 26, 0.16);
    opacity: 0;
    translate: 0 8px;
    transition-property: background-color, color, opacity, translate, box-shadow;
    transition-duration: var(--hover);
  }

  .card:hover .card-add,
  .card-add:focus-visible {
    opacity: 1;
    translate: 0 0;
  }

  /* touch has no hover, so the pill is always there */
  @media (hover: none) {
    .card-add { opacity: 1; translate: 0 0; }
  }

  .card-add:hover { background: var(--ink); color: #fff; }

  .card-add.added,
  .card-add.added:hover {
    background: var(--mint);
    color: #fff;
    opacity: 1;
    translate: 0 0;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
  }

  .price {
    font-size: 15px;
    font-weight: 700;
  }

  /* ---------- skeleton ---------- */

  .skeleton {
    background: var(--tile);
    border-radius: var(--radius);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .skeleton-swatch { aspect-ratio: 1 / 1; }
  .skeleton-line { height: 12px; width: 60%; border-radius: 6px; }

  @keyframes pulse {
    50% { opacity: 0.5; }
  }

  /* ---------- quick view ---------- */

  .quick-overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(28, 27, 26, 0.42);
    z-index: 30;
    padding: 24px;
    opacity: 1;
    transition: opacity var(--enter) var(--ease-out);
  }

  /* transitions, not keyframes: closing mid-open retargets instead of restarting */
  @starting-style {
    .quick-overlay { opacity: 0; }
  }

  .quick-card {
    position: relative;
    background: var(--page);
    width: min(880px, 94vw);
    border-radius: 24px;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    opacity: 1;
    translate: 0 0;
    transition: opacity var(--enter) var(--ease-out), translate var(--enter) var(--ease-out);
  }

  @starting-style {
    .quick-card { opacity: 0; translate: 0 var(--pop-y); }
  }

  /* leaving is quicker than arriving */
  .quick-overlay.closing {
    opacity: 0;
    transition-duration: var(--exit);
  }

  .quick-overlay.closing .quick-card {
    opacity: 0;
    translate: 0 var(--pop-y);
    transition-duration: var(--exit);
  }

  .quick-overlay.closing .quick-meta > * { animation: none; }

  /* the panel arrives first, its content follows one beat later */
  .quick-meta > * {
    animation: rise 250ms var(--ease-out) backwards;
  }

  .quick-meta > *:nth-child(2) { animation-delay: 0.03s; }
  .quick-meta > *:nth-child(3) { animation-delay: 0.06s; }
  .quick-meta > *:nth-child(4) { animation-delay: 0.09s; }
  .quick-meta > *:nth-child(5) { animation-delay: 0.12s; }

  .quick-swatch {
    background: var(--tile);
    min-height: 420px;
    display: grid;
    place-items: center;
    padding: 40px;
  }

  .quick-swatch div {
    width: 100%;
    height: 100%;
    border-radius: var(--radius);
  }

  .quick-meta {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 44px 40px 36px;
  }

  .quick-badge {
    align-self: flex-start;
    padding: 6px 13px;
    border-radius: 999px;
    background: var(--tile);
    font-size: 12px;
    font-weight: 600;
  }

  .quick-title {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1.08;
  }

  .quick-price {
    font-size: 22px;
    font-weight: 700;
  }

  .quick-description {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
  }

  .quick-actions {
    margin-top: auto;
    padding-top: 18px;
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .buy-button {
    flex: 1;
    padding: 15px 20px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--page);
    font-size: 15px;
    font-weight: 600;
  }

  .buy-button:hover { background: var(--accent); }

  .quick-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(28, 27, 26, 0.14);
    font-size: 17px;
    line-height: 1;
  }

  .quick-close:hover { background: var(--tile); }

  .qty-control {
    display: inline-flex;
    align-items: center;
    background: var(--tile);
    border-radius: 999px;
  }

  .qty-control button {
    padding: 0 16px;
    align-self: stretch;
    font-size: 16px;
    color: var(--muted);
  }

  .qty-control button:hover { color: var(--ink); }

  .qty-control span {
    padding: 0 4px;
    min-width: 24px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
  }

  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; }
    .hero-main { min-height: 300px; padding: 34px 28px; }
    .hero-side { padding: 34px 28px; }
  }

  @media (max-width: 760px) {
    .quick-overlay { padding: 0; align-items: end; }

    .quick-card {
      grid-template-columns: 1fr;
      width: 100%;
      max-height: 92vh;
      overflow: auto;
      border-radius: 24px 24px 0 0;
    }

    .quick-swatch { min-height: 0; height: 190px; padding: 24px; }
    .quick-meta { padding: 26px 22px 30px; }
    .quick-title { font-size: 26px; }
  }

  /* ---------- cart ---------- */

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
    background: rgba(28, 27, 26, 0.4);
    opacity: 1;
    transition: opacity var(--drawer-in) var(--ease-out);
  }

  .cart-drawer {
    position: relative;
    width: min(430px, 94vw);
    background: var(--page);
    display: flex;
    flex-direction: column;
    padding: 26px 26px 28px;
    gap: 22px;
    translate: 0 0;
    transition: translate var(--drawer-in) var(--ease-drawer);
  }

  @starting-style {
    .cart-backdrop { opacity: 0; }
    .cart-drawer { translate: var(--slide-x) 0; }
  }

  .cart-overlay.closing .cart-backdrop {
    opacity: 0;
    transition-duration: var(--drawer-out);
  }

  .cart-overlay.closing .cart-drawer {
    translate: var(--slide-x) 0;
    transition-duration: var(--drawer-out);
  }

  .cart-overlay.closing .cart-drawer * { animation: none; }

  /* drawer arrives, then its rows land in sequence */
  .cart-header,
  .cart-message,
  .cart-list > *,
  .cart-summary,
  .empty-cart {
    animation: rise 250ms var(--ease-out) backwards;
    animation-delay: 0.1s;
  }

  .cart-list > *:nth-child(2) { animation-delay: 0.14s; }
  .cart-list > *:nth-child(3) { animation-delay: 0.18s; }
  .cart-list > *:nth-child(n + 4) { animation-delay: 0.22s; }
  .cart-summary { animation-delay: 0.16s; }

  .cart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cart-header h2 {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .icon-button {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: var(--tile);
    font-size: 16px;
    line-height: 1;
  }

  .icon-button:hover { background: #e6e4e1; }

  .cart-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: auto;
    scrollbar-width: none;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 68px 1fr auto;
    gap: 14px;
    align-items: center;
    transition: opacity var(--exit) var(--ease-out), translate var(--exit) var(--ease-out);
  }

  .cart-item.leaving {
    opacity: 0;
    translate: 24px 0;
    pointer-events: none;
  }

  .cart-item-swatch {
    height: 68px;
    border-radius: var(--radius-sm);
  }

  .cart-item-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .cart-item-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cart-item .qty-control button { padding: 4px 11px; font-size: 14px; }

  .remove-button {
    font-size: 12px;
    color: var(--muted);
  }

  .remove-button:hover { color: var(--accent); }

  .cart-item-price { font-size: 14px; font-weight: 700; }

  .cart-summary {
    margin-top: auto;
    background: var(--tile);
    border-radius: var(--radius);
    padding: 20px;
    display: grid;
    gap: 10px;
  }

  .cart-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--muted);
  }

  .cart-total {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 700;
  }

  .checkout-button {
    margin-top: 6px;
    padding: 15px 16px;
    border-radius: 999px;
    background: var(--ink);
    color: var(--page);
    font-weight: 600;
    font-size: 15px;
  }

  .checkout-button:hover { background: var(--accent); }
  .checkout-button:disabled { opacity: 0.35; cursor: not-allowed; background: var(--ink); }

  .empty-cart {
    color: var(--muted);
    font-size: 14px;
    padding: 48px 0;
    text-align: center;
  }

  .cart-message {
    background: var(--mint);
    color: #fff;
    padding: 13px 16px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-weight: 600;
  }

  /* ---------- footnote ---------- */

  .footnote {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 28px 56px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .footnote a {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    transition: color var(--fast) ease;
  }

  .footnote a:hover { color: var(--accent); }

  /* reduced motion drops movement, not feedback: distances go to zero, opacity still animates */
  @media (prefers-reduced-motion: reduce) {
    :host {
      --rise-y: 0px;
      --pop-y: 0px;
      --slide-x: 0%;
    }

    .card,
    .quick-meta > *,
    .cart-header,
    .cart-message,
    .cart-list > *,
    .cart-summary,
    .empty-cart {
      animation-delay: 0s;
    }

    /* the drawer only slides, so give it something to fade instead */
    .cart-drawer { opacity: 1; transition-property: opacity; }
    @starting-style { .cart-drawer { opacity: 0; } }
    .cart-overlay.closing .cart-drawer { opacity: 0; }

    .card-add { translate: 0 0; }
    .pill:hover { translate: 0 0; }
  }
`;

/* products are colour, not photography */
const COLORS = ["#e2622c", "#3f6f5c", "#e8b93f", "#3c5aa6", "#c9cbbd", "#dd8fa0", "#8a6bbf", "#4a90d9", "#d8452a"];

const formatPrice = (value) => `$${value.toFixed(2)}`;

const priceFromId = (id) => {
  const base = 12 + (id % 7) * 6;
  return Math.round((base + (id % 3) * 0.95) * 100) / 100;
};

const nameFromTitle = (title) =>
  title
    .split(" ")
    .slice(0, 3)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

class ProductCard extends Nho {
  setup() {
    this.state = { added: false };
  }

  onUnmounted() {
    clearTimeout(this.timer);
  }

  /* the drawer opens too, but the card should confirm the click on its own */
  add(product, onbuy) {
    onbuy(product);
    this.setState({ added: true });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.setState({ added: false }), 1400);
  }

  render(h) {
    const { product, onbuy, onquickview } = this.props;

    return h`
      <article class="card" style="animation-delay: ${product.index * 60}ms" onclick=${() => onquickview(product)}>
        <div class="swatch" style="background: var(--tile)">
          <div class="swatch-fill" style="background: ${product.color}"></div>
          ${product.badge ? h`<span class=${product.badge === "Hot" ? "badge hot" : "badge"}>${product.badge}</span>` : ""}
          <button class=${this.state.added ? "card-add added" : "card-add"} onclick=${(event) => {
            event.stopPropagation();
            this.add(product, onbuy);
          }}>${this.state.added ? "Added" : "Add to cart"}</button>
        </div>
        <div class="card-title">${product.name}</div>
        <div class="price">${formatPrice(product.price)}</div>
      </article>
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
      <div class=${this.props.closing ? "quick-overlay closing" : "quick-overlay"} onclick=${onclose}>
        <div class="quick-card" onclick=${(event) => event.stopPropagation()}>
          <button class="quick-close" ref=${this.closeRef} onclick=${onclose} aria-label="Close">×</button>
          <div class="quick-swatch">
            <div style="background: ${product.color}"></div>
          </div>
          <div class="quick-meta">
            <span class="quick-badge">${product.badge || "In stock"}</span>
            <div class="quick-title">${product.name}</div>
            <div class="quick-price">${formatPrice(product.price)}</div>
            <div class="quick-description">${product.body}</div>
            <div class="quick-actions">
              <div class="qty-control">
                <button onclick=${this.decrementQty} aria-label="Decrease quantity">-</button>
                <span>${this.state.qty}</span>
                <button onclick=${this.incrementQty} aria-label="Increase quantity">+</button>
              </div>
              <button class="buy-button" onclick=${() => this.handleAdd(product, onbuy, onclose)}>
                Add to cart
              </button>
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
      <div class=${this.props.closing ? "cart-overlay closing" : "cart-overlay"}>
        <div class="cart-backdrop" onclick=${onclose}></div>
        <aside class="cart-drawer">
          <div class="cart-header">
            <h2>Your cart</h2>
            <button class="icon-button" onclick=${onclose} aria-label="Close cart">×</button>
          </div>
          ${message ? h`<div class="cart-message">${message}</div>` : ""}
          ${
            items.length
              ? h`
                <div class="cart-list">
                  ${items.map(
                    (item) => h`
                      <div class=${item.id === this.props.removingid ? "cart-item leaving" : "cart-item"}>
                        <div class="cart-item-swatch" style="background: ${item.color}"></div>
                        <div>
                          <div class="cart-item-title">${item.name}</div>
                          <div class="cart-item-controls">
                            <div class="qty-control">
                              <button onclick=${() => ondec(item.id)} aria-label="Decrease quantity">-</button>
                              <span>${item.qty}</span>
                              <button onclick=${() => oninc(item.id)} aria-label="Increase quantity">+</button>
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
            <div class="cart-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="cart-total">
              <span>Total</span>
              <span>${formatPrice(total)}</span>
            </div>
            <button class="checkout-button" onclick=${oncheckout} disabled=${!items.length}>Checkout</button>
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
      isCartClosing: false,
      quickViewProduct: null,
      isQuickViewClosing: false,
      removingId: null,
      beat: 0,
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

    const products = posts.slice(0, 8).map((post, index) => ({
      id: post.id,
      index,
      name: nameFromTitle(post.title),
      body: post.body.replace(/\n/g, " "),
      price: priceFromId(post.id),
      color: COLORS[index % COLORS.length],
      badge: index === 0 ? "Best seller" : index === 1 ? "Hot" : "",
    }));
    this.setState({ products, isLoading: false });
  }

  cartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  openCart() {
    this.setState({ isCartOpen: true, isCartClosing: false, checkoutMessage: "" });
  }

  /* keep the overlay mounted long enough to play its leave animation */
  closeCart() {
    if (this.state.isCartClosing) return;
    this.setState({ isCartClosing: true });
    setTimeout(() => this.setState({ isCartOpen: false, isCartClosing: false }), CART_EXIT);
  }

  openQuickView(product) {
    this.setState({ quickViewProduct: product, isQuickViewClosing: false });
  }

  closeQuickView() {
    if (this.state.isQuickViewClosing) return;
    this.setState({ isQuickViewClosing: true });
    setTimeout(() => this.setState({ quickViewProduct: null, isQuickViewClosing: false }), QUICK_EXIT);
  }

  /* every cart write goes through here, so the badge beat flips exactly once per change */
  setCart(cart, patch) {
    this.setState({ cart, beat: this.state.beat + 1, ...patch });
  }

  addToCart(product, qty = 1) {
    const { cart } = this.state;
    const existing = cart.find((item) => item.id === product.id);

    this.setCart(
      existing
        ? cart.map((item) => (item === existing ? { ...item, qty: item.qty + qty } : item))
        : [...cart, { ...product, qty }],
    );
    this.openCart();
  }

  incrementItem(id) {
    this.setCart(this.state.cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  }

  decrementItem(id) {
    const target = this.state.cart.find((item) => item.id === id);
    if (!target) return;
    if (target.qty === 1) {
      this.removeItem(id);
      return;
    }
    this.setCart(this.state.cart.map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item)));
  }

  /* let the row fade out before the list closes the gap */
  removeItem(id) {
    this.setState({ removingId: id });
    setTimeout(() => {
      this.setCart(
        this.state.cart.filter((item) => item.id !== id),
        { removingId: null },
      );
    }, QUICK_EXIT);
  }

  checkout() {
    if (!this.state.cart.length) return;
    this.setCart([], { checkoutMessage: "Order placed. Thanks!" });
  }

  render(h) {
    const count = this.cartCount();

    return h`
      <div class="page" ref=${this.pageRef}>
        <header class="header">
          <div class="header-inner">
            <div class="wordmark">Nho</div>
            <button class="cart-button" onclick=${this.openCart}>
              Cart
              <span class=${this.state.beat % 2 ? "cart-count a" : "cart-count b"}>${count}</span>
            </button>
          </div>
        </header>
        <div class="shell">
          <section class="hero">
            <div class="hero-main">
              <span class="hero-eyebrow">New arrivals</span>
              <h1>Colour, boxed and shipped</h1>
              <button class="pill" onclick=${this.openCart}>
                View cart
                <span class="dot">→</span>
              </button>
            </div>
            <div class="hero-side">
              <h2>Free delivery</h2>
              <p>On every order, no minimum.</p>
            </div>
          </section>
          <div class="shelf-head">
            <h2>We love these for you</h2>
            <span>${this.state.isLoading ? "Loading" : `${this.state.products.length} products`}</span>
          </div>
          <div class="grid">
            ${
              this.state.isLoading
                ? [0, 1, 2, 3].map(
                    () => h`
                      <div class="card">
                        <div class="skeleton skeleton-swatch"></div>
                        <div class="skeleton skeleton-line"></div>
                      </div>
                    `,
                  )
                : this.state.products.map(
                    (product) =>
                      h`<product-card
                        product=${product}
                        onBuy=${this.addToCart}
                        onQuickView=${this.openQuickView}
                      ></product-card>`,
                  )
            }
          </div>
        </div>
        <footer class="footnote">
          This is a demo store for
          <a href="https://github.com/anh-ld/nho" target="_blank" rel="noopener">Nho</a>, a 1.4KB reactive Web
          Component library. Products and prices are placeholder data.
          <a href="https://github.com/anh-ld/nho/tree/main/example" target="_blank" rel="noopener">Read the source</a>.
        </footer>
        ${
          this.state.quickViewProduct
            ? h`<quick-view
                product=${this.state.quickViewProduct}
                closing=${this.state.isQuickViewClosing}
                onClose=${this.closeQuickView}
                onBuy=${this.addToCart}
              ></quick-view>`
            : ""
        }
        ${
          this.state.isCartOpen
            ? h`<cart-drawer
                items=${this.state.cart}
                closing=${this.state.isCartClosing}
                removingId=${this.state.removingId}
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
